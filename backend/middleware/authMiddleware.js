const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in cookies (preferred)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check for token in Authorization header as fallback
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'aura-default-development-secret-key-987654'
    );

    // Add user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[AURA Auth Middleware Error]:', error.message);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };
