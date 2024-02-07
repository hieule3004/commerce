import { register } from 'tsconfig-paths';
import { compilerOptions } from '../../tsconfig.json';

register({ baseUrl: compilerOptions.outDir, paths: compilerOptions.paths });
