import postcss from 'rollup-plugin-postcss';
import { rollup, type RollupOptions } from 'rollup';
import swc from '@rollup/plugin-swc';
import resolve from '@rollup/plugin-node-resolve';
import postcssConfig from "./postcss_config";
import swcOptions from './swc_config';
import { getBuildToml } from './configuration';
import copy, { type CopyOptions } from 'rollup-plugin-copy'
import { handleVendorFiles } from "./handle_vendor_files";
const config = getBuildToml()!
const mode = process.env.NODE_ENV || 'development';

const copyOptions: CopyOptions = {
  targets: [
    {
      src: `${config.rollup.project_root}/${config.rollup.media.input}/**`,
      dest: `${config.rollup.output_dir}/${config.rollup.media.output}`,
    },
    {
      src: `${config.rollup.project_root}/${config.rollup.fonts.input}/**`,
      dest: `${config.rollup.output_dir}/${config.rollup.fonts.output}`,
    }
  ]
}

export const rollupConfig: RollupOptions = {
  input: `${config.rollup.project_root}/${config.rollup.app.input}`,
  output: {
    format: 'esm',
    file: `${config.rollup.output_dir}/${config.rollup.app.output}`,
    sourcemap: mode === 'development',
  },
  perf: true,
  plugins: [
    resolve({
      extensions: ['.ts', '.js'],
    }),
    //handleVendorFiles(),
    // Extract CSS and apply PostCSS transformations
    postcss({
      plugins: postcssConfig.options.postcssOptions.plugins,
      extract: config.rollup.styles.output,
      sourceMap: mode === 'development',
      modules: false,
      autoModules: false,
      use: []
    }),
    copy(copyOptions),
    // Use SWC for transpiling TypeScript
    swc({
      swc: swcOptions
    }),
  ],
}