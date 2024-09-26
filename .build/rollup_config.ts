import postcss from 'rollup-plugin-postcss';
import { type Plugin, type RollupOptions } from 'rollup';
import swc from '@rollup/plugin-swc';
import resolve from '@rollup/plugin-node-resolve'; // Import the node resolve plugin
import postcssConfig from "./postcss_config";
import swcOptions from './swc_config';
import { watch as chokidarWatch } from "chokidar";
import path from 'path'
// Set the environment mode
const mode = process.env.NODE_ENV || 'development';
import { glob } from "fast-glob";

const tweego = () => {
  return <Plugin>{
    name: 'tweegoPlugin',
    // async buildStart() {
    //   const files = await glob('./src/story/**')

    //   this.addWatchFile(path.resolve(__dirname, './src/story'))
    //   files.forEach(file => {
    //     this.addWatchFile(path.resolve(__dirname, file))
    //   })
    // }
    buildEnd() {
      setInterval(() => {
        this.emitFile({
          type: 'asset',
        })

      }, 1000)
    }
  }
}


export const rollupConfig: RollupOptions = {
  input: './src/assets/index.ts',
  output: {
    format: 'esm',
    file: './.prebuild/scripts.bundle.js',
    sourcemap: mode === 'development'
  },
  perf: true,
  plugins: [
    resolve({
      extensions: ['.ts', '.js'],
    }),
    // Extract CSS and apply PostCSS transformations
    postcss({
      plugins: postcssConfig.options.postcssOptions.plugins,
      extract: 'styles.bundle.css',
      sourceMap: mode === 'development',
      modules: false,
      autoModules: false,
      use: []
    }),
    // Use SWC for transpiling TypeScript
    swc({
      swc: swcOptions
    }),
    //tweego()
  ],
  // Clean output directory before each build
  // watch: {
  //   clearScreen: true,
  //   include: 'src/**',
  // }
}


// // Create a watcher instance
// const watcher = rollup.watch(rollupConfig);

// // Handle various events from the watcher
// watcher.on('event', event => {
//   switch (event.code) {
//     case 'START':
//       console.log('Watcher is starting or restarting...');
//       break;
//     case 'BUNDLE_START':
//       console.log(`Building bundle...`);
//       break;
//     case 'BUNDLE_END':
//       console.log(`Finished building bundle in ${event.duration}ms`);
//       if (event.result) {
//         // Close the bundle to allow plugins to clean up resources
//         event.result.close();
//       }
//       break;
//     case 'ERROR':
//       console.error('Error during build:', event.error);
//       if (event.result) {
//         // If there was an error, close the bundle (if it exists)
//         event.result.close();
//       }
//       break;
//     case 'END':
//       console.log('Finished building all bundles.');
//       break;
//     default:
//       console.log(`Unhandled event: ${event.code}`);
//   }
// });

// // Handle when a file change triggers the watcher
// watcher.on('change', id => {
//   console.log(`File changed: ${path.relative(process.cwd(), id)}`);
// });

// // Handle restart event
// watcher.on('restart', () => {
//   console.log('Watcher is restarting...');
// });

// // Handle when the watcher is closed
// watcher.on('close', () => {
//   console.log('Watcher has been closed.');
// });