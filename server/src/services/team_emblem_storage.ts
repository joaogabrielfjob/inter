import { unlink } from 'node:fs/promises'
import { basename, join } from 'node:path'

export class TeamEmblemStorage {
  constructor(private readonly directory = process.env.TEAM_EMBLEM_STORAGE_PATH ?? '.data/team-emblems') {}

  file(applicationPath: string): ReturnType<typeof Bun.file> | null {
    const filename = basename(applicationPath)
    if (!applicationPath.startsWith('/team-emblems/') || filename !== applicationPath.slice('/team-emblems/'.length)) return null
    return Bun.file(join(this.directory, filename))
  }

  async remove(applicationPath: string): Promise<void> {
    await unlink(join(this.directory, basename(applicationPath)))
  }
}
