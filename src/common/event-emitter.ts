import * as events from 'events';
import { Request, Response } from '@src/utils/application';

const EventEmitter: EventEmitter = new events.EventEmitter();
type EventEmitter = Omit<events.EventEmitter, 'on'> & {
  on: (
    event: string,
    listener: (data: { req: Request; res: Response }) => void,
  ) => events.EventEmitter;
};

export { EventEmitter };
