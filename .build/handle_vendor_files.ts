import concat from 'concat'
import { glob } from 'fast-glob'
import swc from '@swc/core'
import postcss from 'postcss'
import { type Plugin } from 'rollup'
import { outputFile } from 'fs-extra/esm'

import swcOptions from './swc_config'
import { loadConfig } from './handle_config'
import postcssConfig from './postcss_config'

const config = await loadConfig()
const mode = process.env.NODE_ENV || 'development'

const projectRoot = config.builder!.prebuilding!.project_root
const prebuildDir = config.builder!.prebuilding!.prebuilding_dir

export const handleVendorFiles = async () => {
  return <Plugin>{
    name: 'handle-vendor-files',
    async buildStart() {
      const vendorScripts = await glob(
        `${projectRoot}/${
          config.builder!.prebuilding!.vendor_files.input_dir
        }/**/*.{js,ts}`
      )
      const rawScripts = (await concat(vendorScripts)) as string

      swc
        .transform(rawScripts, {
          sourceMaps: mode === 'development',
          ...swcOptions,
        })
        .then(async output => {
          await outputFile(
            `${prebuildDir}/${
              config.builder!.prebuilding!.vendor_files.output_js_file
            }`,
            output.code
          )

          if (output.map) {
            await outputFile(
              `${prebuildDir}/${
                config.builder!.prebuilding!.vendor_files.output_js_file
              }.map`,
              output.map
            )
          }
        })

      const vendorStyles = await glob(
        `${projectRoot}/${
          config.builder!.prebuilding!.vendor_files.input_dir
        }/**/*.css`
      )
      const rawStyles = (await concat(vendorStyles)) as string

      postcss(postcssConfig.options.postcssOptions.plugins)
        .process(rawStyles, { from: undefined })
        .then(async result => {
          await outputFile(
            `${prebuildDir}/${
              config.builder!.prebuilding!.vendor_files.output_css_file
            }`,
            result.css
          )

          if (result.map) {
            await outputFile(
              `${prebuildDir}/${
                config.builder!.prebuilding!.vendor_files.output_css_file
              }.map`,
              result.map.toString()
            )
          }
        })
    },
  }
}
