const cleanupUrl = requiredEnvironment('CLEANUP_URL')
const token = requiredEnvironment('TEAM_EMBLEM_TOKEN')

const response = await fetch(cleanupUrl, {
  method: 'POST',
  headers: { 'x-railway-cron-token': token },
})

if (!response.ok) {
  throw new Error(`Team Emblem cleanup failed with ${response.status}: ${await response.text()}`)
}

console.info('Team Emblem cleanup completed:', await response.text())

function requiredEnvironment(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} must be configured`)
  return value
}
