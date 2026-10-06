export class AuthError extends Error {
  constructor(message = "Please sign in to continue.") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have access to this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "We couldn't find that.") {
    super(message);
    this.name = "NotFoundError";
  }
}
