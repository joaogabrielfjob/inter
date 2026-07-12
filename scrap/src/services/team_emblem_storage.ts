import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

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
    if (current?.contentHash === contentHash) {
      return { path: current.path, contentHash, mimeType }
    }

    const extension = extensionFor(mimeType)
    const filename = `${namespace ? `${namespace}-` : ''}${contentHash}.${extension}`
    const destination = join(this.directory, filename)
    await mkdir(this.directory, { recursive: true })

    try {
      await writeFile(destination, content, { flag: 'wx' })
    } catch (error: unknown) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'EEXIST') throw error
    }

    return { path: `/team-emblems/${filename}`, contentHash, mimeType }
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
