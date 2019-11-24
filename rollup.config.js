import commonjs from 'rollup-plugin-commonjs';
import copier from 'rollup-plugin-copier';
import resolveModule from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const copy = copier({
  items: [{
    src: 'src/geofirestoretypes.ts',
    dest: 'dist/geofirestoretypes.ts',
    createPath: true
  }]
});

const onwarn = (warning, rollupWarn) => {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    rollupWarn(warning)
  }
};

const plugins = [
  resolveModule(),
  typescript({
    tsconfig: 'tsconfig.json',
    tsconfigOverride: {
      compilerOptions: {
        module: 'ESNext'
      }
    }
  }),
  commonjs(),
  copy
];

export default [{
    input: 'src/index.ts',
    output: [{
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'es'
      }
    ],
    plugins,
    onwarn
  },
  {
    input: 'src/index.ts',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'window',
      extend: true
    },
    plugins: [
      ...plugins,
      terser()
    ],
    onwarn
  }
];
