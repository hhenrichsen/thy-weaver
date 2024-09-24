import concat from "concat";
import { glob } from "fast-glob"
import { mkdir, readFile, writeFile, rm } from "fs/promises";
import swc from "@swc/core";
import postcss from 'postcss'

import postcssConfig from "./postcss_config";
import swcOptions from "./swc_config";

export const handleVendorFiles = async () => {
  const vendorScripts = await glob('./src/assets/vendor/**/*.{js,ts}')
  await concat(vendorScripts, './.prebuild/vendor.prebuild.js')

  const rawScripts = await readFile('./.prebuild/vendor.prebuild.js', 'utf8')

  swc.transform(rawScripts, swcOptions).then(async (output) => {
    await rm('./.prebuild/vendor.prebuild.js')
    await writeFile('./.prebuild/vendor.bundle.js', output.code)
  })

  const vendorStyles = await glob('./src/assets/vendor/**/*.css')
  await concat(vendorStyles, './.prebuild/vendor.prebuild.css')
  const rawStyles = await readFile('./.prebuild/vendor.prebuild.css', 'utf8')

  postcss(postcssConfig.options.postcssOptions.plugins)
    .process(rawStyles, { from: undefined })
    .then(async (result) => {
      await rm('./.prebuild/vendor.prebuild.css')
      await writeFile('./.prebuild/vendor.bundle.css', result.css)
    })
}