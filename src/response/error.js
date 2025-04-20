// Base API Error Class
class GenericError extends Error {
  constructor({
    data = null,
    error = null,
    status = 500,
    message = 'Internal Server Error',
    origin = 'rebar'
  }) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
    this.success = false;
    this.data = data;
    this.error = error;
    this.status = status;
    this.message = message;
    this.origin = origin;
  }

  toJSON() {
    return {
      success: false,
      data: this.data,
      error: this.error,
      status: this.status,
      message: this.message,
      origin: this.origin
    };
  }
}

// Validation Errors
class ValidationError extends GenericError {
  constructor(message = 'Validation Error', error = null) {
    super({
      status: 400,
      message,
      error
    });
  }
}

// Authentication Errors
class AuthenticationError extends GenericError {
  constructor(message = 'Authentication Failed') {
    super({
      status: 401,
      message
    });
  }
}

// Authorization Errors
class AuthorizationError extends GenericError {
  constructor(message = 'Not Authorized') {
    super({
      status: 403,
      message
    });
  }
}

// Not Found Errors
class NotFoundError extends GenericError {
  constructor(resource = 'Resource') {
    super({
      status: 404,
      message: `${resource} not found`
    });
  }
}

// Conflict Errors
class ConflictError extends GenericError {
  constructor(message = 'Resource Conflict') {
    super({
      status: 409,
      message
    });
  }
}

// Database Errors
class DatabaseError extends GenericError {
  constructor(error) {
    super({
      status: 500,
      message: 'Database Error',
      error: error?.message || error
    });
  }
}

// Hasn't been implented yet Errors
class TeapotError extends GenericError {
  constructor(error) {
    super({
      status: 418,
      message: 'Teapot Error',
      error: error?.message || error
    });
  }
}

// Error Factory
const ErrorFactory = {
  create: (type, ...args) => {
    switch (type) {
      case 'validation':
        return new ValidationError(...args);
      case 'authentication':
        return new AuthenticationError(...args);
      case 'authorization':
        return new AuthorizationError(...args);
      case 'notFound':
        return new NotFoundError(...args);
      case 'conflict':
        return new ConflictError(...args);
      case 'database':
        return new DatabaseError(...args);
      case 'teapot':
        return new TeapotError(...args);
      default:
        return new GenericError({ message: args[0] });
    }
  }
};

// Usage Examples
const errorHandler = {
  // In your routes/controllers
  handleUserNotFound: () => {
    throw new NotFoundError('User');
  },

  handleInvalidInput: (validationErrors) => {
    throw new ValidationError('Invalid input data', validationErrors);
  },

  handleDatabaseError: (error) => {
    throw new DatabaseError(error);
  },

  // Using the factory pattern
  handleGenericError: (type, ...args) => {
    throw ErrorFactory.create(type, ...args);
  }
};

export {
  GenericError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  TeapotError,
  ErrorFactory,
  errorHandler
};