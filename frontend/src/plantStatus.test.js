import { describe, expect, it } from 'vitest'
import {
  getDaysSinceWatered,
  getPlantStatus,
  sortPlantsByStatus,
  summarizePlants,
} from './plantStatus.js'

const NOW = new Date('2026-05-01T12:00:00')

function plant(overrides) {
  return {
    id: 1,
    name: 'Basil',
    last_watered: '2026-04-30 12:00:00',
    water_threshold: 2,
    plant_type: 'Basil',
    ...overrides,
  }
}

describe('plant status helpers', () => {
  it('calculates non-negative days since watered', () => {
    expect(getDaysSinceWatered(plant({ last_watered: '2026-04-28 12:00:00' }), NOW)).toBe(3)
    expect(getDaysSinceWatered(plant({ last_watered: '2026-05-02 12:00:00' }), NOW)).toBe(0)
    expect(getDaysSinceWatered(plant({ last_watered: 'not-a-date' }), NOW)).toBeNull()
  })

  it('classifies watered today, healthy, due soon, and overdue plants', () => {
    expect(getPlantStatus(plant({ last_watered: '2026-05-01 08:00:00', water_threshold: 3 }), NOW)).toBe('watered-today')
    expect(getPlantStatus(plant({ last_watered: '2026-04-30 08:00:00', water_threshold: 5 }), NOW)).toBe('healthy')
    expect(getPlantStatus(plant({ last_watered: '2026-04-29 08:00:00', water_threshold: 3 }), NOW)).toBe('due-soon')
    expect(getPlantStatus(plant({ last_watered: '2026-04-26 08:00:00', water_threshold: 3 }), NOW)).toBe('overdue')
  })

  it('summarizes plants for dashboard stats', () => {
    const summary = summarizePlants([
      plant({ id: 1, last_watered: '2026-04-26 08:00:00', water_threshold: 3 }),
      plant({ id: 2, last_watered: '2026-04-29 08:00:00', water_threshold: 3 }),
      plant({ id: 3, last_watered: '2026-05-01 08:00:00', water_threshold: 3 }),
      plant({ id: 4, last_watered: '2026-04-30 08:00:00', water_threshold: 5 }),
    ], NOW)

    expect(summary).toEqual({
      total: 4,
      overdue: 1,
      dueSoon: 1,
      wateredToday: 1,
      healthy: 1,
      needsAttention: 2,
    })
  })

  it('sorts plants by watering urgency first', () => {
    const sorted = sortPlantsByStatus([
      plant({ id: 1, name: 'Healthy', last_watered: '2026-04-30 08:00:00', water_threshold: 5 }),
      plant({ id: 2, name: 'Watered Today', last_watered: '2026-05-01 08:00:00', water_threshold: 3 }),
      plant({ id: 3, name: 'Overdue', last_watered: '2026-04-26 08:00:00', water_threshold: 3 }),
      plant({ id: 4, name: 'Due Soon', last_watered: '2026-04-29 08:00:00', water_threshold: 3 }),
    ], NOW)

    expect(sorted.map(p => p.name)).toEqual(['Overdue', 'Due Soon', 'Healthy', 'Watered Today'])
  })
})
