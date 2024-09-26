import tweenode from "tweenode";
import chokidar from 'chokidar'
import { rollupConfig } from "./rollup_config";
import { rollup, watch } from "rollup";
import { relative } from "path";
import './dev_server'

const mode = process.env.NODE_ENV || 'development';

const runTweego = async () => {
  await tweenode({
    input: './src/story',
    output: './.prebuild/game.html',
    head: './src/head_content.html',
    module: './.prebuild/styles.bundle.css',
    scripts: './.prebuild/scripts.bundle.js'
  })
}
const runRollup = async () => {
  const rl = await rollup(rollupConfig)
  rl.write({
    format: 'esm',
    file: './.prebuild/scripts.bundle.js',
    sourcemap: mode === 'development'
  },)
  return { rollupObj: rl, duration: Math.round(rl.getTimings!()["# BUILD"][0]) }
}

chokidar.watch('./src/', {
  persistent: true,
  interval: 1000,
  ignoreInitial: true
})
  .on('all', async (event, path) => {

    const rollup = await runRollup()
    console.log(`Rollup finished in ${rollup.duration}ms`)
    await runTweego()
    console.log('BUILD!')
  })
