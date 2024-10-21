import { setupTweego, Tweenode } from 'tweenode'
import chokidar from 'chokidar'
import { rollup } from 'rollup'
import { move } from 'fs-extra/esm'
import { rm } from 'node:fs/promises'

import { loadConfig } from './handle_config'
import { rollupConfig } from './rollup_config'
import { devEvents, updateState } from './dev_state'

const mode = process.env.NODE_ENV || 'development'
const config = await loadConfig()

await setupTweego()
const tweego = new Tweenode()

const runTweego = async () => {
  const distPath = config.builder!.dist!.output_dir

  const result = await tweego.process({
    input: {
      storyDir: config.builder!.dist!.story.input_dir,
      head: config.builder!.dist!.story.html_head,
      modules: `${distPath}/${config.builder!.dist!.styles.output_dir}`,
      additionalFlags: [
        `${distPath}/${config.builder!.dist!.scripts.output_dir}`,
      ],
    },
    output: {
      mode: 'string',
    },
  })

  return result
}
const runRollup = async () => {
  //console.log(config)
  const rl = await rollup(rollupConfig)
  rl.write({
    format: 'esm',
    file: `${config.builder!.prebuilding!.prebuilding_dir}/${
      config.builder!.prebuilding!.app.output_file
    }`,
    sourcemap: mode === 'development',
  })
  return { rollupObj: rl, duration: Math.round(rl.getTimings!()['# BUILD'][0]) }
}

const moveFiles = async () => {
  const prebuildConfig = config.builder!.prebuilding!
  const distConfig = config.builder!.dist!

  await rm(distConfig.output_dir, { recursive: true })

  try {
    await move(
      `${prebuildConfig.prebuilding_dir}/${distConfig.media.input_dir}`,
      `${distConfig.output_dir}/${distConfig.media.output_dir}`
    )
  } catch (error) {
    console.log(`Failed to move media:\n${error}`)
  }

  try {
    await move(
      `${prebuildConfig.prebuilding_dir}/${distConfig.styles.input_dir}`,
      `${distConfig.output_dir}/${distConfig.styles.output_dir}`
    )
  } catch (error) {
    console.log(`Failed to move styles:\n${error}`)
  }

  try {
    await move(
      `${prebuildConfig.prebuilding_dir}/${distConfig.scripts.input_dir}`,
      `${distConfig.output_dir}/${distConfig.scripts.output_dir}`
    )
  } catch (error) {
    console.log(`Failed to move scripts:\n${error}`)
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

build().then(async firstResult => {
  updateState(firstResult)
  await import('./dev_server')

  chokidar
    .watch(config.builder!.prebuilding!.project_root, {
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
