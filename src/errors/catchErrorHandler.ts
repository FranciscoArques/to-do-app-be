export const catchErrorHandler = (error: unknown, functionName: string): object => {
  if (error instanceof Error) {
    const code = (error as any).code;
    const message = error.message;
    return { code, message }
  }
  return { code: -1, message: `${functionName}: Catch Error` }
};