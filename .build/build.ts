import postcss from 'rollup-plugin-postcss';
import { rollup, type RollupOptions } from 'rollup';
import swc from '@rollup/plugin-swc';
import resolve from '@rollup/plugin-node-resolve'; // Import the node resolve plugin
import postcssConfig from "./postcss_config";
import swcOptions from './swc_config';

// Set the environment mode
const mode = process.env.NODE_ENV || 'development';

const rollupConfig: RollupOptions = {
  input: './src/assets/index.ts',
  plugins: [
    resolve({
      extensions: ['.ts', '.js'],
    }),
    // Extract CSS and apply PostCSS transformations
    postcss({
      plugins: postcssConfig.options.postcssOptions.plugins,
      extract: 'styles.bundle.css',
      sourceMap: mode === 'development',
      modules: true,
      autoModules: true,
      use: []
    }),
    // Use SWC for transpiling TypeScript
    swc({
      swc: swcOptions
    }),
  ],
  // Clean output directory before each build
  watch: {
    clearScreen: true,
  }
}

const bundle = await rollup(rollupConfig)
bundle.write({
  format: 'esm',
  file: './.prebuild/scripts.bundle.js',
  sourcemap: mode === 'development'
})