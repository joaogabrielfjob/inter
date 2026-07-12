import { describe, expect, it } from 'bun:test'
import { parseDate } from './parse_date'

describe('parseDate', () => {
  it('uses the selected ESPN season when the result date has no year', () => {
    expect(parseDate('30 nov.', 2025)).toEqual(new Date(Date.UTC(2025, 10, 30)))
  })

  it('keeps an explicit result year instead of the selected ESPN season', () => {
    expect(parseDate('30 nov. 2024', 2025)).toEqual(new Date(Date.UTC(2024, 10, 30)))
  })
})
