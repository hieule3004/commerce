// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { decodeTime, isValid, ulid } from 'ulidx';


/** nearly-sorted identifier */
const nsid = (input?: string) => {
  if (!input) return ulid();
  if (isValid(input)) return input;
  throw new TypeError(`Invalid id: ${input}`);
};

export { decodeTime, isValid, nsid };
