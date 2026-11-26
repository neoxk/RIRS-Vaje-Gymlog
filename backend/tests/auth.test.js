const request = require('supertest');
const User = require('../src/models/User');
const { GESLO, createApp, ustvariUporabnika } = require('./pomocniki');

describe('US-01 registracija', () => {
  it('ustvari člana in gesla ne shrani kot navaden tekst', async () => {
    const res = await request(createApp())
      .post('/api/auth/register')
      .send({ ime: 'Ana', email: 'Ana@Test.si', geslo: 'dolgogeslo', vloga: 'admin' })
      .expect(201);

    expect(res.body.vloga).toBe('clan');
    const user = await User.findOne({ email: 'ana@test.si' });
    expect(user.passwordHash).not.toBe('dolgogeslo');
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('zavrne neveljavne podatke in vrne napake po poljih', async () => {
    const res = await request(createApp())
      .post('/api/auth/register')
      .send({ ime: '', email: 'ni-email', geslo: 'kratko' })
      .expect(400);

    expect(res.body.polja).toEqual({
      ime: 'Ime je obvezno',
      email: 'E-poštni naslov ni veljaven',
      geslo: 'Geslo mora imeti vsaj 8 znakov',
    });
    expect(await User.countDocuments()).toBe(0);
  });

  it('zavrne že registriran e-poštni naslov', async () => {
    const obstojeci = await ustvariUporabnika('clan');
    const res = await request(createApp())
      .post('/api/auth/register')
      .send({ ime: 'Bine', email: obstojeci.email, geslo: 'dolgogeslo' })
      .expect(409);

    expect(res.body.napaka).toBe('E-poštni naslov je že registriran');
  });
});

describe('US-02 prijava in odjava', () => {
  it('napačno geslo in neobstoječ račun vrneta isto sporočilo', async () => {
    const user = await ustvariUporabnika('clan');
    const app = createApp();

    const napacnoGeslo = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, geslo: 'napacno-geslo' })
      .expect(401);
    const neobstojec = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nihce@test.si', geslo: GESLO })
      .expect(401);

    expect(napacnoGeslo.body.napaka).toBe('Napačen e-poštni naslov ali geslo');
    expect(neobstojec.body.napaka).toBe(napacnoGeslo.body.napaka);
  });

  it('blokiran uporabnik se ne more prijaviti', async () => {
    const user = await ustvariUporabnika('clan', { blokiran: true });
    const res = await request(createApp())
      .post('/api/auth/login')
      .send({ email: user.email, geslo: GESLO })
      .expect(403);

    expect(res.body.napaka).toBe('Račun je blokiran');
  });

  it('po odjavi seja ne velja več', async () => {
    const user = await ustvariUporabnika('trener');
    const agent = request.agent(createApp());

    await agent.post('/api/auth/login').send({ email: user.email, geslo: GESLO }).expect(200);
    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.vloga).toBe('trener');

    await agent.post('/api/auth/logout').expect(200);
    await agent.get('/api/auth/me').expect(401);
  });
});
