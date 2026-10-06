const { ObjectId } = require('mongodb');
const { HttpError } = require('./http');

const toObjectId = (id, label = 'id') => {
  if (!ObjectId.isValid(id) || String(new ObjectId(id)) !== String(id)) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return new ObjectId(id);
};

// Trimmed string within a length limit; undefined when absent or empty
const optionalString = (value, field, max = 200) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be text`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new HttpError(400, `${field} is too long`);
  return trimmed || undefined;
};

const requiredString = (value, field, max = 200) => {
  const result = optionalString(value, field, max);
  if (!result) throw new HttpError(400, `${field} is required`);
  return result;
};

const optionalNumber = (value, field, { min = -Infinity, max = Infinity } = {}) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(400, `${field} is out of range`);
  return n;
};

const requiredDate = (value, field) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new HttpError(400, `${field} must be a valid date`);
  return value;
};

module.exports = { toObjectId, optionalString, requiredString, optionalNumber, requiredDate };
