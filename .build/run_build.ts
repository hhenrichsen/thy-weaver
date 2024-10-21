import { setupTweego, Tweenode } from 'tweenode'
import pico from 'picocolors'

import { loadConfig } from './handle_config'
import { getSpinner, moveFiles, runRollup } from './build_commands'

const mode = process.env.NODE_ENV || 'development'
const config = await loadConfig()

console.log(
  `\n${pico.bgMagenta(pico.bold(' ThyWeaver - Running in prod mode '))}\n`
)

const handleTweegoSetup = async () => {
  const spinner = getSpinner()
  spinner.start('Setting-up Tweego')
  try {
    await setupTweego()
    spinner.succeed('Tweego installed')
  } catch (error) {
    spinner.fail(
      ` ${pico.bgRed(pico.bold(' ERROR '))} Failed to setup Tweego:\n${error}\n`
    )
  }
}

const tweego = new Tweenode()

const runTweego = async () => {
  const distPath = config.builder!.dist!.output_dir

  const spinner = getSpinner()
  const duration = Date.now()

  spinner.start('Compiling story')

  try {
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
    spinner.succeed(
      `Story compiled in ${pico.yellow(`${Date.now() - duration}ms`)}`
    )
  } catch (error) {
    spinner.fail(
      ` ${pico.bgRed(pico.bold(' ERROR '))} Failed build story:\n${error}\n`
    )
  }
}

const build = async (): Promise<string> => {
  const duration = Date.now()
  await runRollup()
  await moveFiles()
  await runTweego()

  return new Promise(resolve => {
    console.log(
      `\n${pico.bgGreen(
        pico.bold(` Build finished in ${Date.now() - duration}ms`)
      )}ㅤ\n`
    )
    return resolve
  })
}

build().then(() => {
  process.exit()
})
