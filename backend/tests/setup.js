const mongoose = require('mongoose');

// Testi tečejo na pravi MongoDB. V CI je to servis mongo, lokalno pa
// MONGODB_TEST_URI (npr. ločena baza gymlog-test).
process.env.MONGODB_URI =
  process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/gymlog-test';
process.env.SESSION_SECRET = 'testna-skrivnost';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

beforeEach(async () => {
  const kolekcije = await mongoose.connection.db.collections();
  await Promise.all(kolekcije.map((k) => k.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});
