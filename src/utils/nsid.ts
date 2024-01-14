import { decodeTime, isValid, ulid } from 'ulidx';


/** nearly-sorted identifier */
const nsid = (input?: string) => {
  if (!input) return ulid();
  if (isValid(input)) return input;
  throw new TypeError(`Invalid id: ${input}`);
};

export { decodeTime, isValid, nsid };