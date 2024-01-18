import random from '@src/utils/random';
import { redact } from '@src/utils/serialisation';

describe('serialisation', () => {
  const data = { name: random.name(), value: random.integer() };
  it('can redact key', () => {
    const replacer = redact((k) => k === 'name');
    const str = JSON.stringify(data, replacer);
    const value = JSON.parse(str) as typeof data;
    expect(value.name).toBeUndefined();
  });
});
