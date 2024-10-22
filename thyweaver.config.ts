import {
  defineConfig,
  defaultConfig,
  type ThyWeaverConfig,
} from './.build/handle_config'

const config = defineConfig<ThyWeaverConfig>({
  dev_server: {
    hostname: 'localhost',
    port: 3001,
    twine_debug: false,
  },
  builder: {
    ...defaultConfig.builder,
    compilation_target: 'defaults',
    watcherDelay: 1000,
  },
})

export default config
