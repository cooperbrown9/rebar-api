import { GenericError, ValidationError } from './error.js';


export default (err, res) => {

  // rebar
  if (err.origin === 'rebar') {
    return res.status(err.status || 500).json(err)
  }

  //joi valadation errors
  if (err.isJoi) {
    const e = new ValidationError(
      err.details?.map(detail => detail.message).join(', ') || err.message,
      {
        original: err._original,
        details: err.details,
      }
    );
    return res.status(e.status || 400).json(e);
  }

  //valadation errors
  if (err instanceof Error) {
    const e = new GenericError({
      status: err.status || 500,
      message: err.message || 'An unknown error occurred',
      error: err,
      origin: 'external',
    });
    return res.status(e.status || 500).json(e);
  }

  // default for other errors
  const e = new GenericError({
    message: 'An unexpected error occurred',
    error: err,
    origin: 'unknown',
  });
  return res.status(e.status || 500).json(e);
}