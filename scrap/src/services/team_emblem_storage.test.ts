import { afterEach, describe, expect, it } from 'bun:test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TeamEmblemStorage } from './team_emblem_storage'

const directories: string[] = []
afterEach(async () => Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))))

async function createStorage() {
  const directory = await mkdtemp(join(tmpdir(), 'team-emblems-'))
  directories.push(directory)
  return { directory, storage: new TeamEmblemStorage(directory) }
}

describe('TeamEmblemStorage', () => {
  it('reuses the current application path when content is unchanged', async () => {
    const { storage } = await createStorage()
    const first = await storage.retain(new TextEncoder().encode('emblem'), 'image/png')

    expect(await storage.retain(new TextEncoder().encode('emblem'), 'image/png', first)).toEqual(first)
  })

  it('writes changed content to a new content-hashed application path', async () => {
    const { directory, storage } = await createStorage()
    const first = await storage.retain(new TextEncoder().encode('first'), 'image/png')
    const second = await storage.retain(new TextEncoder().encode('second'), 'image/png', first)

    expect(second.path).not.toBe(first.path)
    expect(await readFile(join(directory, second.path.split('/').at(-1)! ), 'utf8')).toBe('second')
  })
})
