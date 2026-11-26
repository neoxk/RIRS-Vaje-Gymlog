const request = require('supertest');
const { createApp, prijavljen, ustvariVaje } = require('./pomocniki');

describe('US-03 knjižnica vaj', () => {
  it('neprijavljen uporabnik ne vidi vaj', async () => {
    await request(createApp()).get('/api/vaje').expect(401);
  });

  it('filtrira vaje po mišični skupini', async () => {
    await ustvariVaje();
    const { agent } = await prijavljen('clan');

    const vse = await agent.get('/api/vaje').expect(200);
    expect(vse.body).toHaveLength(3);

    const noge = await agent.get('/api/vaje?misicnaSkupina=noge').expect(200);
    expect(noge.body.map((v) => v.naziv)).toEqual(['Počep']);
  });

  it('zavrne neznano mišično skupino', async () => {
    const { agent } = await prijavljen('clan');
    await agent.get('/api/vaje?misicnaSkupina=vrat').expect(400);
  });
});
