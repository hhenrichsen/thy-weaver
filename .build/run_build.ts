import { setupTweego, Tweenode } from 'tweenode'

import { loadConfig } from './handle_config'
import { moveFiles, runRollup } from './build_commands'

const mode = process.env.NODE_ENV || 'development'
const config = await loadConfig()

await setupTweego()
const tweego = new Tweenode()

const runTweego = async () => {
  const distPath = config.builder!.dist!.output_dir

  await tweego.process({
    input: {
      storyDir: config.builder!.dist!.story.input_dir,
      head: config.builder!.dist!.story.html_head,
      modules: `${distPath}/${config.builder!.dist!.styles.output_dir}`,
      additionalFlags: [
        `${distPath}/${config.builder!.dist!.scripts.output_dir}`,
      ],
    },
    output: {
      mode: 'file',
      fileName: `${distPath}/${config.builder!.dist!.story.output_file}`,
    },
  })
}

const build = async (): Promise<string> => {
  const duration = Date.now()
  const rollup = await runRollup()
  await moveFiles()
  await runTweego()

  return new Promise(resolve => {
    console.log(`Rollup finished in ${rollup.duration}ms`)
    console.log('BUILD!')

    console.log(`Build took ${Date.now() - duration}ms`)
    return resolve
  })
}

build().then(() => {
  process.exit()
})
