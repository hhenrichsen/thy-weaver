import { rollup } from 'rollup'

import { rollupConfig } from './rollup_config'
import { loadConfig } from './handle_config'
import { move, rm } from 'fs-extra'

const config = await loadConfig()
const mode = process.env.NODE_ENV || 'development'

export const runRollup = async () => {
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

export const moveFiles = async () => {
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
