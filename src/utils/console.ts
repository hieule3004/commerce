import util from 'node:util';

const options = { showHidden: false, depth: null, colors: true };

const log = (message?: unknown, ...params: unknown[]) => {
  console.log(util.formatWithOptions(options, message, ...params));
};

export default { ...console, log };
