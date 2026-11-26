const bcrypt = require('bcryptjs');
const request = require('supertest');
const createApp = require('../src/app');
const User = require('../src/models/User');
const Vaja = require('../src/models/Vaja');

const GESLO = 'Geslo123!';

async function ustvariUporabnika(vloga, podatki = {}) {
  return User.create({
    ime: `Test ${vloga}`,
    email: `${vloga}-${Math.random().toString(36).slice(2)}@test.si`,
    passwordHash: await bcrypt.hash(GESLO, 4),
    vloga,
    ...podatki,
  });
}

// vrne supertest agenta s piškotkom seje prijavljenega uporabnika
async function prijavljen(vloga, podatki) {
  const user = await ustvariUporabnika(vloga, podatki);
  const agent = request.agent(createApp());
  await agent.post('/api/auth/login').send({ email: user.email, geslo: GESLO }).expect(200);
  return { agent, user };
}

async function ustvariVaje() {
  return Vaja.create([
    { naziv: 'Potisk s prsi', misicnaSkupina: 'prsa', oprema: 'drog' },
    { naziv: 'Počep', misicnaSkupina: 'noge', oprema: 'drog' },
    { naziv: 'Zgib', misicnaSkupina: 'hrbet', oprema: 'drog za zgibe' },
  ]);
}

module.exports = { GESLO, createApp, ustvariUporabnika, prijavljen, ustvariVaje };
