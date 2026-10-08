const { HttpError } = require('./http');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toUuid = (id, label = 'id') => {
  if (typeof id !== 'string' || !UUID_RE.test(id)) throw new HttpError(400, `Invalid ${label}`);
  return id.toLowerCase();
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

// Returns a Date; date-only strings like "2026-10-10" become midnight UTC
const requiredDate = (value, field) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new HttpError(400, `${field} must be a valid date`);
  return date;
};

module.exports = { toUuid, optionalString, requiredString, optionalNumber, requiredDate };
