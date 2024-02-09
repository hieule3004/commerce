import { register } from 'tsconfig-paths';
import { compilerOptions } from '../../tsconfig.json';

/** resolve path mappings for tsc-compiled code */
register({ baseUrl: compilerOptions.outDir, paths: compilerOptions.paths });
