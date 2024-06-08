export interface HttpError {
  status: number;
  message: string;
  name: string;
  stack?: string;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
