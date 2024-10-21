import postcssLightningcss from 'postcss-lightningcss'
import tailwindcss from 'tailwindcss'
import postcssImport from 'postcss-import'
import postcssAdvancedVariables from 'postcss-advanced-variables'
import postcssColorModFunction from 'postcss-color-mod-function'

import { loadConfig } from './handle_config'
const config = await loadConfig()

const mode = process.env.NODE_ENV || 'development'

const postcssConfig = {
  options: {
    postcssOptions: {
      syntax: ['postcss-scss'],
      plugins: [
        postcssImport(),
        postcssAdvancedVariables(),
        tailwindcss(),
        postcssColorModFunction(),
        postcssLightningcss({
          //@ts-ignore
          browsers: config.builder!.compilation_target,
          lightningcssOptions: {
            minify: mode === 'production',
            cssModules: false,
          },
        }),
      ],
    },
  },
}

export default postcssConfig
