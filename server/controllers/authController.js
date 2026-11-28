const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// User nasel tarihi compare karto, mhanje response time varun email ahe ki nahi kalat nahi
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const fail = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email });

const signToken = (u) =>
  jwt.sign({ sub: String(u._id) }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });

// POST /api/auth/register  { name, email, password }
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    // string check: { "$gt": "" } sarkhe NoSQL injection payloads rokayla
    if ([name, email, password].some((v) => typeof v !== 'string')) {
      throw fail(400, 'Name, email and password are required.');
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length > 60) throw fail(400, 'Enter your name (max 60 characters).');
    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 254) throw fail(400, 'Enter a valid email address.');
    if (password.length < 8) throw fail(400, 'Password must be at least 8 characters.');
    if (Buffer.byteLength(password) > 72) throw fail(400, 'Password is too long (max 72 characters).');

    if (await User.findOne({ email: cleanEmail })) {
      throw fail(409, 'An account with this email already exists. Try logging in.');
    }

    let user;
    try {
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        passwordHash: await bcrypt.hash(password, 10),
      });
    } catch (e) {
      if (e.code === 11000) throw fail(409, 'An account with this email already exists. Try logging in.');
      throw e;
    }

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login  { email, password }
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw fail(400, 'Email and password are required.');
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

    // Same message donhi case madhe (email chukicha ki password chukicha te sangat nahi)
    if (!user || !ok) throw fail(401, 'Invalid email or password.');

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw fail(401, 'Account not found. Please log in again.');
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};
