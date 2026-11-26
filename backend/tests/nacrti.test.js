const Nacrt = require('../src/models/Nacrt');
const { prijavljen, ustvariVaje } = require('./pomocniki');

function nacrtZaVajo(vaja, spremembe = {}) {
  return {
    naziv: 'Začetni program',
    dnevi: [{ naziv: 'Dan A', postavke: [{ vajaId: String(vaja._id), serije: 3, ponovitve: 10, ...spremembe }] }],
  };
}

describe('US-04 sestavljanje načrta', () => {
  it('trener shrani načrt kot osnutek', async () => {
    const [vaja] = await ustvariVaje();
    const { agent, user } = await prijavljen('trener');

    const res = await agent.post('/api/nacrti').send(nacrtZaVajo(vaja)).expect(201);

    expect(res.body.stanje).toBe('osnutek');
    expect(res.body.trenerId).toBe(String(user._id));
  });

  it('zavrne serije in ponovitve zunaj razpona', async () => {
    const [vaja] = await ustvariVaje();
    const { agent } = await prijavljen('trener');

    const res = await agent
      .post('/api/nacrti')
      .send(nacrtZaVajo(vaja, { serije: 11, ponovitve: 0 }))
      .expect(400);

    expect(res.body.napake).toEqual([
      'Dan 1, vaja 1: serije morajo biti od 1 do 10',
      'Dan 1, vaja 1: ponovitve morajo biti od 1 do 50',
    ]);
    expect(await Nacrt.countDocuments()).toBe(0);
  });

  it('član ne more sestaviti načrta', async () => {
    const [vaja] = await ustvariVaje();
    const { agent } = await prijavljen('clan');
    await agent.post('/api/nacrti').send(nacrtZaVajo(vaja)).expect(403);
  });
});

describe('US-05 in US-06 dodelitev in sprejem načrta', () => {
  it('osnutek → dodeljen → aktiven', async () => {
    const [vaja] = await ustvariVaje();
    const trener = await prijavljen('trener');
    const clan = await prijavljen('clan');

    const { body: nacrt } = await trener.agent.post('/api/nacrti').send(nacrtZaVajo(vaja));

    const dodeljen = await trener.agent
      .post(`/api/nacrti/${nacrt._id}/dodeli`)
      .send({ clanId: String(clan.user._id) })
      .expect(200);
    expect(dodeljen.body.stanje).toBe('dodeljen');

    const seznam = await clan.agent.get('/api/nacrti').expect(200);
    expect(seznam.body.map((n) => n._id)).toEqual([nacrt._id]);

    const sprejet = await clan.agent.post(`/api/nacrti/${nacrt._id}/sprejmi`).expect(200);
    expect(sprejet.body.stanje).toBe('aktiven');
  });

  it('dodeliti je mogoče samo osnutek', async () => {
    const [vaja] = await ustvariVaje();
    const trener = await prijavljen('trener');
    const clan = await prijavljen('clan');
    const { body: nacrt } = await trener.agent.post('/api/nacrti').send(nacrtZaVajo(vaja));
    const dodeli = () =>
      trener.agent.post(`/api/nacrti/${nacrt._id}/dodeli`).send({ clanId: String(clan.user._id) });

    await dodeli().expect(200);
    const res = await dodeli().expect(409);
    expect(res.body.napaka).toBe('Dodeliti je mogoče samo osnutek načrta');
  });

  it('trener ne more dodeliti načrta drugega trenerja', async () => {
    const [vaja] = await ustvariVaje();
    const avtor = await prijavljen('trener');
    const drugi = await prijavljen('trener');
    const clan = await prijavljen('clan');
    const { body: nacrt } = await avtor.agent.post('/api/nacrti').send(nacrtZaVajo(vaja));

    await drugi.agent
      .post(`/api/nacrti/${nacrt._id}/dodeli`)
      .send({ clanId: String(clan.user._id) })
      .expect(403);
  });

  it('član ne more sprejeti načrta, dodeljenega drugemu članu', async () => {
    const [vaja] = await ustvariVaje();
    const trener = await prijavljen('trener');
    const ana = await prijavljen('clan');
    const bine = await prijavljen('clan');
    const { body: nacrt } = await trener.agent.post('/api/nacrti').send(nacrtZaVajo(vaja));
    await trener.agent
      .post(`/api/nacrti/${nacrt._id}/dodeli`)
      .send({ clanId: String(ana.user._id) })
      .expect(200);

    await bine.agent.post(`/api/nacrti/${nacrt._id}/sprejmi`).expect(403);
  });
});
