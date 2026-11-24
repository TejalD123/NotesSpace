const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  let status = err.status || res.statusCode;
  if (!status || status < 400) status = 500;

  if (err.name === 'MulterError') status = 400;
  if (err.name === 'CastError') status = 400;

  res.status(status).json({ message: err.message || 'Server error' });
};

module.exports = { notFound, errorHandler };
