import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, sirve /api/copilot con el mismo archivo que usará Vercel en producción.
function devApi(env) {
  return {
    name: 'nexo-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/copilot', async (req, res) => {
        Object.assign(process.env, env)
        const chunks = []
        for await (const c of req) chunks.push(c)
        try { req.body = JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { req.body = {} }
        res.status = code => { res.statusCode = code; return res }
        res.json = obj => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
        try {
          const mod = await server.ssrLoadModule('/api/copilot.js')
          await mod.default(req, res)
        } catch {
          res.status(500).json({ error: 'servidor' })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [react(), devApi(env)] }
})
