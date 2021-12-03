export class FilemakerError extends Error {
  public response;

  constructor(message: string, response: Record<never, never>) {
    super(message);
    this.response = response;
  }
}

export class LoginError extends FilemakerError {
  constructor(response: Record<never, never>) {
    super("Invalid username or password!", response);
  }
}

export class StatusCodeError extends FilemakerError {
  constructor(response: Record<never, never>) {
    super("Unexpected filemaker statuscode", response);
  }
}

export class MissingRecord extends FilemakerError {
  constructor(response: Record<never, never>) {
    super("No matching records", response);
  }
}
