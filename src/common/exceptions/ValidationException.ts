import HttpException from '@src/common/exceptions/HttpException';
import { HttpStatus } from '@src/utils/http';

export class ValidationException<E extends Error> extends HttpException {
  constructor(cause: E) {
    super(HttpStatus.BAD_REQUEST.status, 'Validation failed', cause);
  }
}
