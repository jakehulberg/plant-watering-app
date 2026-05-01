import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Calendar, Leaf, Trash2, Pencil, Check, X, Droplets, Search, AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  getDaysSinceWatered,
  getPlantStatus,
  getStatusLabel,
  sortPlantsByStatus,
  summarizePlants,
} from './plantStatus.js'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'attention', label: 'Needs Attention' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'due-soon', label: 'Due Soon' },
  { id: 'watered-today', label: 'Watered Today' },
]

function PlantList({ onWatered }) {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [watering, setWatering] = useState(new Set())
  const [deleting, setDeleting] = useState(new Set())
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ name: '' })
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchPlants = async () => {
    try {
      const res = await fetch('/api/plants')
      if (!res.ok) throw new Error('Failed to fetch plants')
      const data = await res.json()
      setPlants(data)
    } catch (error) {
      console.error('Error fetching plants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlants()
  }, [])

  const summary = useMemo(() => summarizePlants(plants), [plants])

  const visiblePlants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return sortPlantsByStatus(plants).filter((plant) => {
      const status = getPlantStatus(plant)
      const matchesSearch = !normalizedSearch || plant.name.toLowerCase().includes(normalizedSearch)
      const matchesFilter =
        activeFilter === 'all' ||
        status === activeFilter ||
        (activeFilter === 'attention' && ['overdue', 'due-soon'].includes(status))

      return matchesSearch && matchesFilter
    })
  }, [plants, searchTerm, activeFilter])

  const handleWater = async (plantId) => {
    setWatering(prev => new Set(prev).add(plantId))
    try {
      const res = await fetch(`/plants/${plantId}/water`, {
        method: 'PUT'
      })
      if (!res.ok) throw new Error('Failed to water plant')
      await fetchPlants()
      if (onWatered) onWatered()
    } catch (error) {
      console.error('Error watering plant:', error)
    } finally {
      setWatering(prev => {
        const next = new Set(prev)
        next.delete(plantId)
        return next
      })
    }
  }

  const handleDelete = async (plantId) => {
    setDeleting(prev => new Set(prev).add(plantId))
    try {
      const res = await fetch(`/api/plants/${plantId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete plant')
      await fetchPlants()
    } catch (error) {
      console.error('Error deleting plant:', error)
    } finally {
      setDeleting(prev => {
        const next = new Set(prev)
        next.delete(plantId)
        return next
      })
    }
  }

  const startEdit = (plant) => {
    setEditingId(plant.id)
    setEditValues({ name: plant.name })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({ name: '' })
  }

  const handleSaveEdit = async (plantId) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/plants/${plantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editValues.name,
        })
      })
      if (!res.ok) throw new Error('Failed to update plant')
      await fetchPlants()
      setEditingId(null)
      setEditValues({ name: '' })
    } catch (error) {
      console.error('Error updating plant:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString.replace(' ', 'T'))
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const statusBadgeProps = (status) => {
    if (status === 'overdue') return { variant: 'destructive', className: '' }
    if (status === 'due-soon') return { variant: 'default', className: 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500' }
    if (status === 'watered-today') return { variant: 'secondary', className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' }
    if (status === 'healthy') return { variant: 'outline', className: 'border-green-200 text-green-700' }
    return { variant: 'outline', className: '' }
  }

  const statCards = [
    { label: 'Total Plants', value: summary.total, tone: 'text-gray-900' },
    { label: 'Needs Attention', value: summary.needsAttention, tone: summary.needsAttention ? 'text-orange-600' : 'text-green-700' },
    { label: 'Overdue', value: summary.overdue, tone: summary.overdue ? 'text-red-600' : 'text-green-700' },
    { label: 'Due Soon', value: summary.dueSoon, tone: summary.dueSoon ? 'text-yellow-600' : 'text-green-700' },
    { label: 'Watered Today', value: summary.wateredToday, tone: 'text-blue-600' },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading plants...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (plants.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Leaf className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No plants yet. Add your first plant above!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-2">
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.tone}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-green-100 bg-white/90">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Watering Command Center
              </CardTitle>
              <CardDescription>
                {summary.needsAttention > 0
                  ? `${summary.needsAttention} ${summary.needsAttention === 1 ? 'plant needs' : 'plants need'} attention first.`
                  : 'Everything is looking hydrated.'
                }
              </CardDescription>
            </div>
            {summary.needsAttention > 0 ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> Action Needed
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-green-200 text-green-700">
                <CheckCircle2 className="h-3 w-3" /> All Good
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plants..."
              aria-label="Search plants"
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((filter) => (
              <Button
                key={filter.id}
                type="button"
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={activeFilter === filter.id}
                className="shrink-0"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {visiblePlants.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No plants match your current search or filter.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visiblePlants.map((plant) => {
                const isEditing = editingId === plant.id
                const status = getPlantStatus(plant)
                const daysSince = getDaysSinceWatered(plant)
                const badge = statusBadgeProps(status)

                return (
                  <Card key={plant.id} data-testid="plant-card" className="border-2 hover:border-green-200 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                          {isEditing ? (
                            <Input
                              value={editValues.name}
                              onChange={(e) =>
                                setEditValues(prev => ({ ...prev, name: e.target.value }))
                              }
                              className="text-lg font-semibold h-9"
                              placeholder="Plant name"
                            />
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-lg">{plant.name}</CardTitle>
                                <Badge variant={badge.variant} className={badge.className}>
                                  {getStatusLabel(status)}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="rounded-full bg-muted px-2 py-1">Type: {plant.plant_type || 'General'}</span>
                                <span className="rounded-full bg-muted px-2 py-1">Threshold: {plant.water_threshold ?? 3} days</span>
                                <span className="rounded-full bg-muted px-2 py-1">
                                  {daysSince === null ? 'Last watered unknown' : `${daysSince} days since watered`}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(plant.id)}
                                disabled={saving}
                                className="p-2 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-50"
                                aria-label="Save changes"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={saving}
                                className="p-2 rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50"
                                aria-label="Cancel edit"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(plant)}
                                className="p-2 rounded-md text-muted-foreground hover:bg-muted"
                                aria-label="Edit plant"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(plant.id)}
                                disabled={deleting.has(plant.id)}
                                className="p-2 rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                aria-label="Delete plant"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Last watered: {formatDate(plant.last_watered)}</span>
                      </div>
                      <Button
                        onClick={() => handleWater(plant.id)}
                        disabled={watering.has(plant.id) || isEditing}
                        className="w-full"
                        variant={status === 'overdue' ? 'default' : 'outline'}
                      >
                        {watering.has(plant.id) ? (
                          'Watering...'
                        ) : (
                          <>
                            <Droplets className="h-4 w-4 mr-2" />
                            Water Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PlantList
