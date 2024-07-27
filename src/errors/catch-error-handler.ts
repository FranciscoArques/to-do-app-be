export const catchErrorHandler = (error: unknown, functionName: string): object => {
  if (error instanceof Error) {
    const code = (error as any).code ? (error as any).code : 500;
    const message = error.message;
    return { error: true, code, message };
  }
  return { error: true, code: 500, message: `${functionName}: Catch Error.` };
};
