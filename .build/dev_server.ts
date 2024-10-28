import { Hono } from 'hono'
import { serve, Server, type ServerWebSocket } from 'bun'
import { createBunWebSocket, serveStatic } from 'hono/bun'
import { transformFile as swcTransform } from '@swc/core'
import pico from 'picocolors'

import { devState } from './dev_state'
import { loadConfig } from './handle_config'
import swcConfig from './swc_config'
import { WSContext } from 'hono/ws'

const config = await loadConfig()

const placeholder = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Document</title>
</head>
<body>
  
</body>
</html>
`

const throwServerLog = (log: string) => {
  console.log(`${pico.bgCyan(pico.bold(' DEV SERVER '))} ${log}`)
}

const throwServerError = (error: string) => {
  console.log(
    `${pico.bgCyan(pico.bold(' DEV SERVER '))} ${pico.bgRed(
      pico.bold(' ERROR ')
    )} ${error}`
  )
}

const app = new Hono()
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>()

app.get('/', async ctx => {
  const html = devState.html !== undefined ? devState.html : placeholder
  const modifiedHtml = html.replace(
    '</head>',
    `<script async src="${server.url.href}dev"></script>\n</head>`
  )
  return new Response(modifiedHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
})

const dist = config.builder!.dist!.output_dir

app.get(
  '*',
  serveStatic({
    root: `${dist}/scripts`,
  }),
  serveStatic({
    root: `${dist}/styles`,
  }),
  serveStatic({
    root: dist,
  })
)

app.get(
  '/media/*',
  serveStatic({
    root: dist,
    onNotFound: (path, c) => {
      throwServerError(`${path} is not found, you access ${c.req.path}`)
    },
  })
)

app.get('/dev', async ctx => {
  const output = await swcTransform('./.build/reload_agent.ts', {
    ...swcConfig,
  })
  return new Response(output.code, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  })
})

let ws: WSContext<ServerWebSocket<undefined>> | undefined

app.get(
  '/ws',
  upgradeWebSocket(c => {
    return {
      onMessage(event) {
        throwServerLog(`Message from client: ${event.data}`)
      },
      onClose: () => {
        throwServerLog('Connection with client lost')
        ws = undefined
      },
      onOpen(event, ctxWS) {
        throwServerLog('Client connected')
        ws = ctxWS
      },
    }
  })
)

let server: Server

try {
  server = serve({
    fetch: app.fetch,
    //@ts-expect-error
    websocket,
    hostname: config.dev_server!.hostname,
    port: config.dev_server!.port,
  })
} catch (error) {
  throwServerError(error)
}

export { server, ws }
