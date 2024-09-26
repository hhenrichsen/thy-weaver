import tweenode from "tweenode";
import chokidar from 'chokidar'
import { rollupConfig } from "./rollup_config";
import { rollup } from "rollup";
import './dev_server'
import { move } from "fs-extra/esm";
import { rm } from "node:fs/promises";
import { getBuildToml } from "./configuration";
const config = getBuildToml()!
import { resolve } from "node:path";
const mode = process.env.NODE_ENV || 'development';


const runTweego = async () => {
  await tweenode({
    input: config.rollup_dist.index.input,
    output: `${config.rollup_dist.output_dir}/${config.rollup_dist.index.output}`,
    //head: resolve(process.cwd(), config.rollup_dist.index.input_head),
    module: `${config.rollup_dist.output_dir}/${config.rollup_dist.styles.output}`,
    scripts: `${config.rollup_dist.output_dir}/${config.rollup_dist.scripts.output}`
  })
}
const runRollup = async () => {
  const rl = await rollup(rollupConfig)
  rl.write({
    format: 'esm',
    file: `${config.rollup.output_dir}/${config.rollup.app.output}`,
    sourcemap: mode === 'development'
  },)
  return { rollupObj: rl, duration: Math.round(rl.getTimings!()["# BUILD"][0]) }
}

const moveFiles = async () => {
  await rm(config.rollup_dist.output_dir, { recursive: true })

  try {
    await move(
      `${config.rollup.output_dir}/${config.rollup_dist.media.input}`,
      `${config.rollup_dist.output_dir}/${config.rollup_dist.media.output}`,
    )
  } catch (error) {
    console.log(error)

  }

  try {
    await move(
      `${config.rollup.output_dir}/${config.rollup_dist.styles.input}`,
      `${config.rollup_dist.output_dir}/${config.rollup_dist.styles.output}`,
    )
  } catch (error) {
    console.log(error)

  }

  try {
    await move(
      `${config.rollup.output_dir}/${config.rollup_dist.scripts.input}`,
      `${config.rollup_dist.output_dir}/${config.rollup_dist.scripts.output}`,
    )
  } catch (error) {
    console.log(error)
  }
}

const build = async () => {
  const rollup = await runRollup()
  await moveFiles()
  await runTweego()

  return new Promise(resolve => {
    console.log(`Rollup finished in ${rollup.duration}ms`)
    console.log('BUILD!')
    return resolve('')
  })
}

build().then(() => {

  chokidar.watch('./src/', {
    interval: 1000,
    ignoreInitial: true
  })
    .on('all', async (event, path) => {
      await build()
    })
})
