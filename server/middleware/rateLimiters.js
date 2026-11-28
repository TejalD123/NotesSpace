const rateLimit = require('express-rate-limit');

const base = { standardHeaders: true, legacyHeaders: false };

// Chukicha password: 15 vela / 15 min (successful login count hot nahit)
exports.loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 15,
  skipSuccessfulRequests: true,
  message: { message: 'Too many login attempts. Please try again in a few minutes.' },
});

// Fake accounts spam rokayla: 10 signups / taas / IP
exports.registerLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { message: 'Too many sign-ups from this network. Please try again later.' },
});

// AI quota vachvayla: 8 generations / minute / user
exports.generateLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 8,
  keyGenerator: (req) => req.user.id,
  message: { message: 'You are generating notes too fast. Please wait a minute and try again.' },
});
