export interface RestError {
  name: 'RestError';
  code: string;
  statusCode: number;
  message: string;
}

export class Azure {
  isRestError(error: unknown): error is RestError {
    return error instanceof Error && error.name === 'RestError';
  }
}
