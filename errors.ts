export class FilemakerError extends Error {
  public response;

  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}

export class StatusCodeError extends FilemakerError {
  constructor(response: Response) {
    super("Unexpected filemaker statuscode", response);
  }
}

export class MissingRecord extends FilemakerError {
  constructor(response: Response) {
    super("No matching records", response);
  }
}
