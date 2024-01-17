import { StatusCodes } from '@src/utils/http';

class HttpException extends Error {
  constructor(
    readonly status: number,
    readonly response?: string | object,
    readonly cause?: Error,
  ) {
    super(typeof response === 'string' ? response : StatusCodes[status], { cause });
  }

  getStatus() {
    return this.status;
  }

  getResponse() {
    return this.response;
  }
}

export default HttpException;