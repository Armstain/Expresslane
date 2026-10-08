class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Express 4 does not catch rejected promises; route them to the error handler
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const notFound = (req, res) => {
  res.status(404).send({ message: `Not found: ${req.method} ${req.path}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).send({ message: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).send({ message: 'Malformed JSON body' });
  // Prisma error codes: unique violation, foreign-key violation, record not found
  if (err.code === 'P2002') return res.status(409).send({ message: 'This record already exists' });
  if (err.code === 'P2003') return res.status(409).send({ message: 'This record is still in use' });
  if (err.code === 'P2025') return res.status(404).send({ message: 'Not found' });
  console.error(err);
  return res.status(500).send({ message: 'Something went wrong' });
};

module.exports = { HttpError, asyncHandler, notFound, errorHandler };
