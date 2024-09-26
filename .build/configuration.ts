import { parse } from "smol-toml";
import { readFileSync, existsSync } from 'node:fs'

const configPath = './build_config.toml'

interface BuildConfigToml {
  build: {
    watchDelay: number
    target: string
  }
  rollup: {
    project_root: string
    output_dir: string
    media: {
      input: string
      output: string
    }
    app: {
      input: string
      output: string
    }
    styles: {
      output: string
    }
    fonts: {
      input: string
      output: string
    }
    vendor: {
      input: string
      output_js: string
      output_css: string
    }
  }
  rollup_dist: {
    watch_dir: string
    output_dir: string
    index: {
      input: string
      input_head: string
      output: string
    }
    media: {
      input: string
      output: string
    }
    scripts: {
      input: string
      output: string
    }
    styles: {
      input: string
      output: string
    }
    fonts: {
      input: string
      output: string
    }
    config_toml: {
      input: string
      output: string
    }
  }
}

export const getBuildToml = () => {
  if (existsSync(configPath)) {
    const raw = readFileSync(configPath, { encoding: 'utf8' })
    try {
      const config = parse(raw)
      return config as any as BuildConfigToml
    } catch (error) {
      new Error('Failed to parse TOML', error)
    }
  }
}