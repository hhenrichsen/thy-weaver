import concat from "concat";
import { glob } from "fast-glob"
import swc from "@swc/core";
import postcss from 'postcss'
import { type Plugin } from "rollup";
import postcssConfig from "./postcss_config";
import swcOptions from "./swc_config";
import { getBuildToml } from "./configuration";
import { outputFile } from "fs-extra/esm";

const config = getBuildToml()!
const mode = process.env.NODE_ENV || 'development';

export const handleVendorFiles = async () => {
  return <Plugin>{
    name: 'handle-vendor-files',
    async buildStart() {
      const vendorScripts = await glob(`${config.rollup.project_root}/${config.rollup.vendor.input}/**/*.{js,ts}`)
      const rawScripts = await concat(vendorScripts) as string

      swc.transform(rawScripts, {
        sourceMaps: mode === 'development',
        ...swcOptions
      }).then(async (output) => {
        await Bun.write(`${config.rollup.output_dir}/${config.rollup.vendor.output_js}`, output.code)

        if (output.map) {
          await outputFile(`${config.rollup.output_dir}/${config.rollup.vendor.output_js}.map`, output.map)
        }
      })

      const vendorStyles = await glob(`${config.rollup.project_root}/${config.rollup.vendor.input}/**/*.css`)
      const rawStyles = await concat(vendorStyles) as string

      postcss(postcssConfig.options.postcssOptions.plugins)
        .process(rawStyles, { from: undefined })
        .then(async (result) => {
          await outputFile(`${config.rollup.output_dir}/${config.rollup.vendor.output_css}`, result.css)

          if (result.map) {
            await Bun.write(`${config.rollup.output_dir}/${config.rollup.vendor.output_css}.map`, result.map.toString())
          }
        })
    }
  }
}