import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import type { IncomingMessage } from 'node:http'
import path from 'node:path'
import { URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const isValidSetName = (value: string): boolean => /^[a-zA-Z0-9_-]+$/.test(value)

const workspaceFilePath = (setName: string): string =>
  path.resolve(process.cwd(), 'workspace', setName, 'code.ts')

const templatesDirPath = (): string => path.resolve(process.cwd(), 'templates')
const templateCodePath = (setName: string): string =>
  path.resolve(templatesDirPath(), setName, 'code.ts')
const templateExplainPath = (setName: string): string =>
  path.resolve(templatesDirPath(), setName, 'explain.json')

const createWorkspaceApiPlugin = (): Plugin => ({
  name: 'escode-workspace-api',
  configureServer(server) {
    const parseBody = async (req: IncomingMessage): Promise<Record<string, unknown>> =>
      new Promise((resolve, reject) => {
        let rawBody = ''
        req.on('data', (chunk: Buffer) => {
          rawBody += String(chunk)
        })
        req.on('end', () => {
          try {
            resolve(rawBody ? JSON.parse(rawBody) : {})
          } catch (error) {
            reject(error)
          }
        })
        req.on('error', (error: unknown) => reject(error))
      })

    server.middlewares.use(async (req, res, next) => {
      const method = (req as { method?: string }).method ?? 'GET'
      const requestUrl = (req as { url?: string }).url ?? ''
      const url = new URL(requestUrl, 'http://localhost')

      if (url.pathname !== '/api/workspace') {
        next()
        return
      }

      const sendJson = (statusCode: number, data: unknown) => {
        res.statusCode = statusCode
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
      }

      try {
        if (method === 'GET') {
          const setName = url.searchParams.get('setName') ?? ''
          if (!isValidSetName(setName)) {
            sendJson(400, { error: 'Invalid setName' })
            return
          }
          const filePath = workspaceFilePath(setName)
          try {
            const value = await readFile(filePath, 'utf-8')
            sendJson(200, { value })
          } catch {
            sendJson(200, { value: '' })
          }
          return
        }

        if (method === 'POST' || method === 'PUT') {
          const body = await parseBody(req)
          const setName = String(body.setName ?? '')
          if (!isValidSetName(setName)) {
            sendJson(400, { error: 'Invalid setName' })
            return
          }

          const filePath = workspaceFilePath(setName)
          await mkdir(path.dirname(filePath), { recursive: true })

          if (method === 'POST') {
            try {
              await readFile(filePath, 'utf-8')
            } catch {
              await writeFile(filePath, '', 'utf-8')
            }
            sendJson(200, { ok: true })
            return
          }

          await writeFile(filePath, String(body.value ?? ''), 'utf-8')
          sendJson(200, { ok: true })
          return
        }

        sendJson(405, { error: 'Method not allowed' })
      } catch (error) {
        sendJson(500, {
          error: error instanceof Error ? error.message : 'Unknown server error',
        })
      }
    })
  },
})

const createTemplatesApiPlugin = (): Plugin => ({
  name: 'escode-templates-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const method = (req as { method?: string }).method ?? 'GET'
      const requestUrl = (req as { url?: string }).url ?? ''
      const url = new URL(requestUrl, 'http://localhost')

      const sendJson = (statusCode: number, data: unknown) => {
        res.statusCode = statusCode
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
      }

      try {
        // GET /api/templates -> { sets: string[] }
        if (url.pathname === '/api/templates' && method === 'GET') {
          const base = templatesDirPath()
          let entries: string[] = []
          try {
            entries = await readdir(base)
          } catch {
            sendJson(200, { sets: [] })
            return
          }

          const sets: string[] = []
          for (const name of entries) {
            if (!isValidSetName(name)) continue
            try {
              const st = await stat(path.resolve(base, name))
              if (st.isDirectory()) sets.push(name)
            } catch {
              // ignore
            }
          }

          sendJson(200, { sets })
          return
        }

        // GET /api/template?setName=... -> { name, code, explain }
        if (url.pathname === '/api/template' && method === 'GET') {
          const setName = url.searchParams.get('setName') ?? ''
          if (!isValidSetName(setName)) {
            sendJson(400, { error: 'Invalid setName' })
            return
          }

          const code = await readFile(templateCodePath(setName), 'utf-8')
          const explainRaw = await readFile(templateExplainPath(setName), 'utf-8')
          const explain = JSON.parse(explainRaw) as Record<string, string>

          sendJson(200, { name: setName, code, explain })
          return
        }

        next()
      } catch (error) {
        sendJson(500, {
          error: error instanceof Error ? error.message : 'Unknown server error',
        })
      }
    })
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), createWorkspaceApiPlugin(), createTemplatesApiPlugin()],
})
