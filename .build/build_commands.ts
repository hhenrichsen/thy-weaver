import { rollup } from 'rollup'

import { rollupConfig } from './rollup_config'
import { loadConfig } from './handle_config'
import { move, open, opendir, openSync, rm } from 'fs-extra'
import ora from 'ora'
import pico from 'picocolors'

const config = await loadConfig()
const mode = process.env.NODE_ENV || 'development'

export const getSpinner = () => {
  return ora({
    prefixText: pico.bgBlue(pico.bold(' BUILDER ')),
  })
}

const getBuilderError = (error: string) => {
  console.log(`${pico.bgRed(pico.bold(' ERROR '))} ${error}`)
}

export const runRollup = async () => {
  const spinner = getSpinner()
  spinner.start('Running Rollup...')
  const rl = await rollup(rollupConfig)
  rl.write({
    format: 'esm',
    file: `${config.builder!.prebuilding!.prebuilding_dir}/${
      config.builder!.prebuilding!.app.output_file
    }`,
    sourcemap: mode === 'development',
  })
  const duration = Math.round(rl.getTimings!()['# BUILD'][0])
  spinner.succeed(`Rollup finished in ${pico.yellow(`${duration}ms`)}`)
  return { rollupObj: rl, duration: duration }
}

export const moveFiles = async () => {
  const spinner = getSpinner()
  const prebuildConfig = config.builder!.prebuilding!
  const distConfig = config.builder!.dist!

  try {
    spinner.start('Cleaning up ./dist...')

    await rm(distConfig.output_dir, { recursive: true })
    spinner.succeed('./dist clean')
  } catch (error) {
    spinner.fail(
      ` ${pico.bgRed(pico.bold(' ERROR '))} Failed cleanup dist:\n${error}\n`
    )
  }

  try {
    const duration = Date.now()
    spinner.start('Moving media files...')

    await move(
      `${prebuildConfig.prebuilding_dir}/${distConfig.media.input_dir}`,
      `${distConfig.output_dir}/${distConfig.media.output_dir}`
    )
    spinner.succeed(
      `Media files moved in ${pico.yellow(`${Date.now() - duration}ms`)}`
    )
  } catch (error) {
    spinner.fail(
      ` ${pico.bgRed(
        pico.bold(' ERROR ')
      )} Failed to move media files:\n${error}\n`
    )
  }

  try {
    spinner.start('Moving stylesheets...')

    await move(
      `${prebuildConfig.prebuilding_dir}/${distConfig.styles.input_dir}`,
      `${distConfig.output_dir}/${distConfig.styles.output_dir}`
    )
    spinner.succeed('Stylesheets moved')
  } catch (error) {
    spinner.fail(
      ` ${pico.bgRed(
        pico.bold(' ERROR ')
      )} Failed to move stylesheets:\n${error}\n`
    )
  }

  try {
    spinner.start('Moving scripts...')

    await move(
      `${prebuildConfig.prebuilding_dir}/${distConfig.scripts.input_dir}`,
      `${distConfig.output_dir}/${distConfig.scripts.output_dir}`
    )
    spinner.succeed('Scripts moved')
  } catch (error) {
    spinner.fail(
      ` ${pico.bgRed(pico.bold(' ERROR '))} Failed to move scripts:\n${error}\n`
    )
  }
}
