import { type Options } from "@swc/core";
const mode = process.env.NODE_ENV || 'development';

const swcOptions: Options = {
  jsc: {
    parser: {
      syntax: 'typescript',
    },
    minify: mode === 'production' ? {
      mangle: true,
      format: {
        comments: "all"
      },
      compress: {
        defaults: true,
        evaluate: true,
        inline: 3,
      },
    } : undefined,
  },
  env: {
    targets: 'defaults'
  }
}

export default swcOptions