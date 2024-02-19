
import { HttpStatus, HttpException } from '@src/utils/http/http';

export class ValidationException<E extends Error> extends HttpException {
  constructor(cause: E) {
    super(HttpStatus.BAD_REQUEST.status, 'Validation failed', cause);
  }
}
