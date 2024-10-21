import { defineConfig } from './.build/handle_config'

const config = defineConfig({
  dev_server: {
    hostname: 'localhost',
    port: 3001,
  },
})

export default config
