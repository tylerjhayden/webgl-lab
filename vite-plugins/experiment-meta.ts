import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

const SLUG_PATTERN = /^[a-z0-9-]+$/
const FOLDER_MAX_LEN = 64

type MetaPatch = {
  starred?: boolean
  folder?: string | null
}

function listSlugs(experimentsDir: string): Set<string> {
  return new Set(
    readdirSync(experimentsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  )
}

function isValidFolder(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= FOLDER_MAX_LEN &&
    !/[\r\n]/.test(value)
  )
}

function applyField(
  source: string,
  field: 'starred' | 'folder',
  serialized: string | null,
): string {
  const linePattern = new RegExp(`^[ \\t]*${field}:[^\\n]*\\n`, 'm')

  if (serialized === null) {
    return source.replace(linePattern, '')
  }

  const newLine = `  ${field}: ${serialized},\n`

  if (linePattern.test(source)) {
    return source.replace(linePattern, newLine)
  }

  // Insert before the closing brace of the meta object literal.
  // The meta object always ends with `\n}\n` after the last field's trailing comma.
  return source.replace(/(\n)\}(\s*\n?)$/, `$1${newLine}}$2`)
}

function patchMeta(filePath: string, patch: MetaPatch): void {
  let source = readFileSync(filePath, 'utf8')

  if ('starred' in patch) {
    source = applyField(source, 'starred', patch.starred ? 'true' : null)
  }

  if ('folder' in patch) {
    source = applyField(
      source,
      'folder',
      patch.folder === null ? null : JSON.stringify(patch.folder),
    )
  }

  writeFileSync(filePath, source, 'utf8')
}

async function readBody(req: import('http').IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(chunk as Buffer)
    if (Buffer.concat(chunks).length > 4096) {
      throw new Error('body too large')
    }
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw)
}

export default function experimentMetaPlugin(): Plugin {
  const experimentsDir = resolve(process.cwd(), 'src/experiments')

  return {
    name: 'experiment-meta',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/meta', async (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (req.method !== 'POST') {
          return send(405, { error: 'method not allowed' })
        }

        const slug = (req.url ?? '').replace(/^\/+/, '').split('?')[0]
        if (!SLUG_PATTERN.test(slug)) {
          return send(400, { error: 'invalid slug' })
        }
        if (!listSlugs(experimentsDir).has(slug)) {
          return send(404, { error: 'unknown experiment' })
        }

        let body: unknown
        try {
          body = await readBody(req)
        } catch (err) {
          return send(400, { error: 'invalid body', detail: String(err) })
        }

        if (!body || typeof body !== 'object') {
          return send(400, { error: 'body must be object' })
        }

        const patch: MetaPatch = {}
        const raw = body as Record<string, unknown>

        if ('starred' in raw) {
          if (typeof raw.starred !== 'boolean') {
            return send(400, { error: 'starred must be boolean' })
          }
          patch.starred = raw.starred
        }

        if ('folder' in raw) {
          if (raw.folder === null) {
            patch.folder = null
          } else if (isValidFolder(raw.folder)) {
            patch.folder = raw.folder
          } else {
            return send(400, { error: 'invalid folder' })
          }
        }

        if (Object.keys(patch).length === 0) {
          return send(400, { error: 'no fields to update' })
        }

        const filePath = join(experimentsDir, slug, 'meta.ts')
        try {
          patchMeta(filePath, patch)
        } catch (err) {
          return send(500, { error: 'write failed', detail: String(err) })
        }

        return send(200, { ok: true })
      })
    },
  }
}
