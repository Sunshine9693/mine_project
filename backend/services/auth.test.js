const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../models/User');
const { login } = require('../controllers/authController');

test('login returns a clear service unavailable response when MongoDB is disconnected', async () => {
  const originalReadyState = mongoose.connection.readyState;
  const originalFindOne = User.findOne;

  Object.defineProperty(mongoose.connection, 'readyState', {
    configurable: true,
    get: () => 0,
  });

  User.findOne = async () => {
    throw new Error('Database unavailable');
  };

  try {
    const req = { body: { email: 'user@example.com', password: 'Password123' } };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.payload = payload;
        return this;
      }
    };

    await login(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res.payload.success, false);
    assert.match(res.payload.message, /temporarily unavailable|try again/i);
  } finally {
    User.findOne = originalFindOne;
    Object.defineProperty(mongoose.connection, 'readyState', {
      configurable: true,
      get: () => originalReadyState,
    });
  }
});
