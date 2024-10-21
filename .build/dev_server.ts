import { Hono } from 'hono'
import { serve, type ServerWebSocket } from 'bun'
import { createBunWebSocket, serveStatic } from 'hono/bun'
import { transformFile as swcTransform } from '@swc/core'

import { devEvents, devState } from './dev_state'
import { loadConfig } from './handle_config'
import swcConfig from './swc_config'

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
  })
)

app.get(
  '/media/*',
  serveStatic({
    root: dist,
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`)
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

app.get(
  '/ws',
  upgradeWebSocket(c => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`)
        ws.send('Hello from server!')
      },
      onClose: () => {
        console.log('Connection closed')
      },
      onOpen(event, ws) {
        ws.send('Hello from server!')

        devEvents.once('builded', () => {
          ws.send('update')
        })
      },
    }
  })
)

const server = serve({
  fetch: app.fetch,
  //@ts-expect-error
  websocket,
  hostname: config.dev_server!.hostname,
  port: config.dev_server!.port,
})

export { server }
