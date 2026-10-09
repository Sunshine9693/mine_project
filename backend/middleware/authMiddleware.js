const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('[AURA Auth Middleware Error]: JWT_SECRET is not configured.');
    return res.status(500).json({ message: 'Authentication is not configured on this server.' });
  }

  // 1. Check for token in cookies (preferred)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check for token in Authorization header as fallback
  else if (req.headers.authorization && /^Bearer\s+/i.test(req.headers.authorization)) {
    token = req.headers.authorization.replace(/^Bearer\s+/i, '').trim();
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Add user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[AURA Auth Middleware Error]:', error.message);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };
