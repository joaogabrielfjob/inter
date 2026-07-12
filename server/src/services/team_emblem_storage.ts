import { createHash } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

export type RetainedEmblem = {
  path: string
  contentHash: string
  mimeType: string
}

export type CurrentEmblem = Pick<RetainedEmblem, 'path' | 'contentHash'>

export class TeamEmblemStorage {
  constructor(private readonly directory = process.env.TEAM_EMBLEM_STORAGE_PATH ?? '.data/team-emblems') {}

  async retain(content: Uint8Array, mimeType: string, current?: CurrentEmblem, namespace?: string): Promise<RetainedEmblem> {
    const contentHash = createHash('sha256').update(content).digest('hex')
    if (current?.contentHash === contentHash) return { path: current.path, contentHash, mimeType }

    const filename = `${namespace ? `${namespace}-` : ''}${contentHash}.${extensionFor(mimeType)}`
    const destination = join(this.directory, filename)
    await mkdir(this.directory, { recursive: true })

    try {
      await writeFile(destination, content, { flag: 'wx' })
    } catch (error: unknown) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'EEXIST') throw error
    }

    return { path: `/team-emblems/${filename}`, contentHash, mimeType }
  }

  file(applicationPath: string): ReturnType<typeof Bun.file> | null {
    const filename = basename(applicationPath)
    if (!applicationPath.startsWith('/team-emblems/') || filename !== applicationPath.slice('/team-emblems/'.length)) return null
    return Bun.file(join(this.directory, filename))
  }

  async remove(applicationPath: string): Promise<void> {
    await unlink(join(this.directory, basename(applicationPath)))
  }
}

function extensionFor(mimeType: string): string {
  switch (mimeType.toLowerCase()) {
    case 'image/svg+xml': return 'svg'
    case 'image/jpeg': return 'jpg'
    case 'image/webp': return 'webp'
    case 'image/gif': return 'gif'
    default: return 'png'
  }
}
