function parseWateredDate(value) {
  if (!value) return null
  const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function getDaysSinceWatered(plant, now = new Date()) {
  const wateredAt = parseWateredDate(plant?.last_watered)
  if (!wateredAt) return null

  const diffMs = now.getTime() - wateredAt.getTime()
  return Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 0)
}

export function getPlantStatus(plant, now = new Date()) {
  const daysSinceWatered = getDaysSinceWatered(plant, now)
  const threshold = plant?.water_threshold ?? 3

  if (daysSinceWatered === null) return 'unknown'
  if (daysSinceWatered === 0) return 'watered-today'
  if (daysSinceWatered > threshold) return 'overdue'
  if (daysSinceWatered >= threshold - 1) return 'due-soon'
  return 'healthy'
}

export function summarizePlants(plants, now = new Date()) {
  const summary = {
    total: plants.length,
    overdue: 0,
    dueSoon: 0,
    wateredToday: 0,
    healthy: 0,
    needsAttention: 0,
  }

  plants.forEach((plant) => {
    const status = getPlantStatus(plant, now)
    if (status === 'overdue') summary.overdue += 1
    if (status === 'due-soon') summary.dueSoon += 1
    if (status === 'watered-today') summary.wateredToday += 1
    if (status === 'healthy') summary.healthy += 1
  })

  summary.needsAttention = summary.overdue + summary.dueSoon
  return summary
}

const STATUS_WEIGHT = {
  overdue: 0,
  'due-soon': 1,
  healthy: 2,
  unknown: 3,
  'watered-today': 4,
}

export function sortPlantsByStatus(plants, now = new Date()) {
  return [...plants].sort((a, b) => {
    const statusDiff = STATUS_WEIGHT[getPlantStatus(a, now)] - STATUS_WEIGHT[getPlantStatus(b, now)]
    if (statusDiff !== 0) return statusDiff

    const daysA = getDaysSinceWatered(a, now) ?? -1
    const daysB = getDaysSinceWatered(b, now) ?? -1
    if (daysB !== daysA) return daysB - daysA

    return a.name.localeCompare(b.name)
  })
}

export function getStatusLabel(status) {
  const labels = {
    overdue: 'Overdue',
    'due-soon': 'Due Soon',
    healthy: 'Healthy',
    'watered-today': 'Watered Today',
    unknown: 'Unknown',
  }
  return labels[status] ?? 'Unknown'
}
