import { HttpError } from "./http-error";

export const catchErrorHandler = (error: unknown, functionName: string) => {
  if (error instanceof Error) {
    const code = (error as any).code ? (error as any).code : 500;
    const message = error.message;
    throw new HttpError(code, message);
  }
  throw new HttpError(500, `${functionName}: Catch Error.`);
};
