import postcssLightningcss from "postcss-lightningcss";
import { browserslistToTargets } from "lightningcss";
import browserlist from "browserslist";
import tailwindcss from 'tailwindcss'

export const postcssConfig = {
  options: {
    postcssOptions: {
      plugins: [
        tailwindcss(),
        postcssLightningcss({
          browsers: 'defaults',
          lightningcssOptions: {
            minify: true,
            targets: browserslistToTargets(browserlist('defaults'))
          }
        })
      ]
    }
  }
}