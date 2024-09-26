import { Hono } from 'hono'
import { serve, type ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { watch as chokidar } from 'chokidar'
import { transformFile as swcTransform } from "@swc/core";
import swcConfig from "./swc_config";

const app = new Hono()
const { upgradeWebSocket, websocket } =
  createBunWebSocket<ServerWebSocket>()

app.get('/', async (ctx) => {
  const html = await Bun.file('./.prebuild/game.html').text()
  const modifiedHtml = html.replace(
    '</head>',
    `<script async src="${server.url.href}dev"></script>\n</head>`
  )
  return new Response(modifiedHtml, {
    headers: {
      "Content-Type": "text/html",
    }
  })
})

app.get('/dev', async (ctx) => {
  const output = await swcTransform('./.build/reload_agent.ts', swcConfig)
  return new Response(output.code, {
    headers: {
      "Content-Type": "application/javascript",
    }

  })

})

app.get(
  '/ws',
  upgradeWebSocket((c) => {
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

        chokidar('./.prebuild/game.html',
          {
            ignoreInitial: true
          }
        )
          .on('all', (event, id) => {
            ws.send('update')
          })
      }
    }
  })
)


const server = serve({
  fetch: app.fetch,
  websocket
})

console.log(server.url.href)