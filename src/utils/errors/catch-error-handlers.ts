import { HttpError } from './http-error';

export const catchErrorHandler = (functionName: string, error?: unknown) => {
  if (error && error instanceof Error) {
    const code = (error as any).status ? (error as any).status : 500;
    const message = error.message ? error.message : `${functionName}: Catch Error.`;
    throw new HttpError(code, message);
  }
  throw new HttpError(500, `${functionName}: Catch Error.`);
};

export const catchErrorHandlerController = (error: unknown) => {
  if (error && error instanceof HttpError) {
    return new HttpError(error.status, error.message);
  }
  if (error && error instanceof Error) {
    const code = (error as any).status ? (error as any).status : 500;
    const message = error.message ? error.message : 'Internal Server Error.';
    return new HttpError(code, message);
  }
  return new HttpError(500, 'Internal Server Error.');
};
