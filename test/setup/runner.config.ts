import DefaultJestRunner from 'jest-runner';
import { Writable } from '@src/utils/type';


/**---- simulate --runInBand option ----**/
class SerialJestRunner extends DefaultJestRunner {
  constructor(...args: ConstructorParameters<typeof DefaultJestRunner>) {
    super(...args);
    (this as Writable<DefaultJestRunner>).isSerial = true;
  }
}

module.exports = SerialJestRunner;
