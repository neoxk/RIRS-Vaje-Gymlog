const Nacrt = require('../src/models/Nacrt');
const { prijavljen, ustvariVaje } = require('./pomocniki');

function trening(vaja, teze, datum = '2026-11-01') {
  return {
    datum,
    zapisi: [{ vajaId: String(vaja._id), serije: teze.map((teza) => ({ teza, ponovitve: 5 })) }],
  };
}

describe('US-07 vnos treninga', () => {
  it('zavrne trening brez vaj in serije zunaj razpona', async () => {
    const [vaja] = await ustvariVaje();
    const { agent } = await prijavljen('clan');

    const brezVaj = await agent.post('/api/treningi').send({ datum: '2026-11-01', zapisi: [] }).expect(400);
    expect(brezVaj.body.napake).toContain('Trening mora imeti vsaj eno vajo');

    const pretezko = await agent.post('/api/treningi').send(trening(vaja, [501])).expect(400);
    expect(pretezko.body.napake).toEqual([
      'Vaja 1, serija 1: teža mora biti večja od 0 in največ 500 kg',
    ]);
  });

  it('trening je mogoče povezati samo z aktivnim načrtom', async () => {
    const [vaja] = await ustvariVaje();
    const { agent, user } = await prijavljen('clan');
    const trener = await prijavljen('trener');
    const nacrt = await Nacrt.create({
      naziv: 'Dodeljen, ne sprejet',
      trenerId: trener.user._id,
      clanId: user._id,
      stanje: 'dodeljen',
    });

    await agent
      .post('/api/treningi')
      .send({ ...trening(vaja, [50]), nacrtId: String(nacrt._id) })
      .expect(409);
  });
});

describe('US-08 zaznavanje osebnih rekordov', () => {
  it('prvi vnos je izhodišče, enaka teža ni rekord, višja teža je rekord', async () => {
    const [vaja] = await ustvariVaje();
    const { agent } = await prijavljen('clan');

    const prvi = await agent.post('/api/treningi').send(trening(vaja, [60, 70], '2026-11-01')).expect(201);
    expect(prvi.body.rekordi).toEqual([]);

    const enak = await agent.post('/api/treningi').send(trening(vaja, [70], '2026-11-03')).expect(201);
    expect(enak.body.rekordi).toEqual([]);

    const visji = await agent.post('/api/treningi').send(trening(vaja, [65, 72.5], '2026-11-05')).expect(201);
    expect(visji.body.rekordi).toEqual([{ vajaId: String(vaja._id), teza: 72.5 }]);
  });

  it('rekordi drugih članov se ne štejejo', async () => {
    const [vaja] = await ustvariVaje();
    const ana = await prijavljen('clan');
    const bine = await prijavljen('clan');

    await ana.agent.post('/api/treningi').send(trening(vaja, [100])).expect(201);
    await bine.agent.post('/api/treningi').send(trening(vaja, [40], '2026-11-02')).expect(201);
    const res = await bine.agent.post('/api/treningi').send(trening(vaja, [50], '2026-11-03')).expect(201);

    expect(res.body.rekordi).toEqual([{ vajaId: String(vaja._id), teza: 50 }]);
  });

  it('član ne more odpreti treninga drugega člana', async () => {
    const [vaja] = await ustvariVaje();
    const ana = await prijavljen('clan');
    const bine = await prijavljen('clan');
    const { body } = await ana.agent.post('/api/treningi').send(trening(vaja, [80]));

    await bine.agent.get(`/api/treningi/${body._id}`).expect(403);
  });
});
