export const parseDate = (date: string, fallbackYear = new Date().getFullYear()) => {
  const monthMap = {
    'jan.': 0,
    'fev.': 1,
    'mar.': 2,
    'abr.': 3,
    'mai.': 4,
    'jun.': 5,
    'jul.': 6,
    'ago.': 7,
    'set.': 8,
    'out.': 9,
    'nov.': 10,
    'dez.': 11
  }

  const match = date.match(/(\d+)\s+(\w+\.?)/)
  
  if (!match || !match[1] || !match[2]) return undefined

  const day = parseInt(match[1], 10)
  const month = match[2].toLowerCase()
  const monthIndex = monthMap[month as keyof typeof monthMap]

  if (monthIndex === undefined) return undefined

  const explicitYear = date.match(/\b(?:19|20)\d{2}\b/)
  const year = explicitYear ? parseInt(explicitYear[0], 10) : fallbackYear

  return new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0))
}
