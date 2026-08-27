const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: Object.values(error.errors).map((item) => item.message).join(', ') });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource id.' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with those details already exists.' });
  }

  console.error('[AURA API Error]:', error.message);
  return res.status(error.status || 500).json({
    success: false,
    message: error.status ? error.message : 'Something went wrong.',
  });
};

module.exports = errorMiddleware;