import { setupTweego, Tweenode } from 'tweenode'
import chokidar from 'chokidar'
import { rollupConfig } from './rollup_config'
import { rollup } from 'rollup'
import './dev_server'
import { move } from 'fs-extra/esm'
import { rm } from 'node:fs/promises'
import { getBuildToml } from './configuration'
const config = getBuildToml()!
import { resolve } from 'node:path'
const mode = process.env.NODE_ENV || 'development'
import { devEvents, updateState } from './dev_store'

await setupTweego()
const tweego = new Tweenode()

const runTweego = async () => {
  const result = await tweego.process({
    input: {
      storyDir: config.rollup_dist.index.input,
      head: config.rollup_dist.index.input_head,
      modules: `${config.rollup_dist.output_dir}/${config.rollup_dist.styles.output}`,
      additionalFlags: [
        `${config.rollup_dist.output_dir}/${config.rollup_dist.scripts.output}`,
      ],
    },
    output: {
      mode: 'string',
    },
  })

  return result
}
const runRollup = async () => {
  const rl = await rollup(rollupConfig)
  rl.write({
    format: 'esm',
    file: `${config.rollup.output_dir}/${config.rollup.app.output}`,
    sourcemap: mode === 'development',
  })
  return { rollupObj: rl, duration: Math.round(rl.getTimings!()['# BUILD'][0]) }
}

const moveFiles = async () => {
  await rm(config.rollup_dist.output_dir, { recursive: true })

  try {
    await move(
      `${config.rollup.output_dir}/${config.rollup_dist.media.input}`,
      `${config.rollup_dist.output_dir}/${config.rollup_dist.media.output}`
    )
  } catch (error) {
    console.log(error)
  }

  try {
    await move(
      `${config.rollup.output_dir}/${config.rollup_dist.styles.input}`,
      `${config.rollup_dist.output_dir}/${config.rollup_dist.styles.output}`
    )
  } catch (error) {
    console.log(error)
  }

  try {
    await move(
      `${config.rollup.output_dir}/${config.rollup_dist.scripts.input}`,
      `${config.rollup_dist.output_dir}/${config.rollup_dist.scripts.output}`
    )
  } catch (error) {
    console.log(error)
  }
}

const build = async (): Promise<string> => {
  const duration = Date.now()
  const rollup = await runRollup()
  await moveFiles()
  const code = await runTweego()

  return new Promise(resolve => {
    console.log(`Rollup finished in ${rollup.duration}ms`)
    console.log('BUILD!')

    console.log(`Build took ${Date.now() - duration}ms`)
    return resolve(code!)
  })
}

build().then(firstResult => {
  updateState(firstResult)

  chokidar
    .watch('./src/', {
      ignoreInitial: true,
      awaitWriteFinish: {
        pollInterval: 50,
      },
    })
    .on('all', async (event, path) => {
      const result = await build()
      updateState(result)
      devEvents.emit('builded')
    })
})
