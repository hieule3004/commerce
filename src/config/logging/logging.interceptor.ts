import { JsonDto, JsonErrorDto } from '@src/common/dtos/json.dto';
import { X_REQUEST_ID } from '@src/config/http/http.constant';
import { ApplicationLogger } from '@src/config/logging/logging.utils';
import { RequestHandler } from '@src/utils/application';

const logData: RequestHandler = function (req, res, next) {
  const logger = req.app.get('LoggerService') as ApplicationLogger;
  const id = req.headers[X_REQUEST_ID] as string;
  const sid = req.sessionID;

  const $ = res.json;
  res.json = function (data: object) {
    if ('error' in data) logger.debug({ id, sid, type: 'error', ...data } as JsonErrorDto);
    else logger.debug({ id, sid, type: 'data', data } as JsonDto);

    return $.call(this, data);
  };

  next();
};

export default logData;
