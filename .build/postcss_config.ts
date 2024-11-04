import postcssLightningcss from 'postcss-lightningcss'
import tailwindcss from 'tailwindcss'
import postcssImport from 'postcss-import'

import { loadConfig } from './handle_config.ts'
const config = await loadConfig()

const mode = process.env.NODE_ENV || 'development'

const postcssConfig = {
  options: {
    postcssOptions: {
      plugins: [
        postcssImport(),
        tailwindcss(),
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
