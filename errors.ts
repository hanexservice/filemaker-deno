export class FilemakerError extends Error {
  public response;
  public statusCode;

  constructor(message: string, response: Record<never, never>, statusCode: number) {
    super(message);
    this.response = response;
    this.statusCode = statusCode;
  }
}

export class LoginError extends FilemakerError {
  constructor(response: Record<never, never>) {
    super("Invalid username or password!", response, 401);
  }
}

export class StatusCodeError extends FilemakerError {
  constructor(response: Record<never, never>) {
    super("Unexpected filemaker statuscode", response, 502);
  }
}

export class MissingRecord extends FilemakerError {
  constructor(response: Record<never, never>) {
    super("No matching records", response, 404);
  }
}
