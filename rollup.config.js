import commonjs from 'rollup-plugin-commonjs';
import copier from 'rollup-plugin-copier';
import resolveModule from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import pkg from './package.json';

const copy = copier({
  items: [{
    src: 'src/GeoFirestoreTypes.ts',
    dest: 'dist/GeoFirestoreTypes.ts',
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
    typescript: require('typescript')
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
      uglify()
    ],
    onwarn
  }
];
