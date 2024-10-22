import { setupTweego, Tweenode } from 'tweenode'
import chokidar from 'chokidar'
import spinner from 'ora'
import { loadConfig } from './handle_config'
import { devEvents, updateState } from './dev_state'
import { getSpinner, moveFiles, runRollup } from './build_commands'
import pico from 'picocolors'

const mode = process.env.NODE_ENV || 'development'
const config = await loadConfig()
console.log(
  `\n${pico.bgMagenta(pico.bold(' ThyWeaver - Running in dev mode '))}ㅤ\n`
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

await handleTweegoSetup()
const tweego = new Tweenode()

const runTweego = async () => {
  const spinner = getSpinner()
  const distPath = config.builder!.dist!.output_dir
  const duration = Date.now()

  spinner.start('Compiling story')
  let result: string | undefined

  try {
    result = await tweego.process({
      input: {
        storyDir: config.builder!.dist!.story.input_dir,
        head: config.builder!.dist!.story.html_head,
        modules: `${distPath}/${config.builder!.dist!.styles.output_dir}`,
        additionalFlags: [
          `${distPath}/${config.builder!.dist!.scripts.output_dir}`,
          config.dev_server!.twine_debug ? '--test' : '',
        ],
      },
      output: {
        mode: 'string',
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

  return result
}

const build = async (): Promise<string> => {
  const duration = Date.now()
  await runRollup()
  await moveFiles()
  const code = await runTweego()

  return new Promise(resolve => {
    console.log(
      `\n${pico.bgGreen(
        pico.bold(` Build finished in ${Date.now() - duration}ms `)
      )}ㅤ\n`
    )
    return resolve(code!)
  })
}

build().then(async firstResult => {
  updateState(firstResult)
  const { server } = await import('./dev_server')

  console.log(pico.yellow(pico.bold('Waiting for file changes...')))
  console.log(
    `${pico.yellow(
      pico.bold(`Dev Server available at ${pico.cyan(server.url.href)}`)
    )}\n`
  )
  chokidar
    .watch(config.builder!.prebuilding!.project_root, {
      interval: config.builder!.watcherDelay,
      ignoreInitial: true,
      awaitWriteFinish: {
        pollInterval: 50,
      },
    })
    .on('all', async (event, path) => {
      process.stdout.write('\x1Bc')
      console.log(
        `\n${pico.bgMagenta(pico.bold(' ThyWeaver - Running in dev mode '))}ㅤ`
      )
      console.log(
        `${pico.yellow(
          pico.bold(`Dev Server available at ${pico.cyan(server.url.href)}`)
        )}\n`
      )

      const result = await build()
      updateState(result)
      devEvents.emit('builded')

      console.log(pico.yellow(pico.bold('Waiting for file changes...')), '\n')
    })
})
