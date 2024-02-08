import { ErrorRequestHandler } from '@src/utils/application';
import { HttpException } from '@src/utils/http/exception';

const exceptionFilter: ErrorRequestHandler = (err: string | object, _, res, next) => {
  const exception = err instanceof HttpException ? err : new HttpException(500, err);
  const e = buildErrorResponse(exception);
  res.status(exception.getStatus()).json(e);
  next();
};

function buildErrorResponse(exception: HttpException) {
  const code = exception.getStatus();
  const descOrErr = exception.getResponse();

  const message = typeof descOrErr === 'string' ? descOrErr : (descOrErr as Error).message;
  const meta = descOrErr instanceof Error ? descOrErr : exception.cause;

  return { error: { code, message, meta } };
}

export { exceptionFilter };
