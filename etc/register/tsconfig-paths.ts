import * as tsConfigPaths from 'tsconfig-paths';
import tsConfig from '../../tsconfig.json';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cleanup = tsConfigPaths.register({
  baseUrl: './dist',
  paths: tsConfig.compilerOptions.paths,
});
