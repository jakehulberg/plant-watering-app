import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Droplets, Calendar, Leaf, Trash2, Pencil, Check, X } from 'lucide-react'

function PlantList({ onWatered }) {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [watering, setWatering] = useState(new Set())
  const [deleting, setDeleting] = useState(new Set())
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ name: '', watering_interval_days: '' })
  const [saving, setSaving] = useState(false)

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
    setEditValues({
      name: plant.name,
      watering_interval_days: plant.watering_interval_days ?? 3
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({ name: '', watering_interval_days: '' })
  }

  const handleSaveEdit = async (plantId) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/plants/${plantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editValues.name,
          watering_interval_days: Number(editValues.watering_interval_days)
        })
      })
      if (!res.ok) throw new Error('Failed to update plant')
      await fetchPlants()
      setEditingId(null)
      setEditValues({ name: '', watering_interval_days: '' })
    } catch (error) {
      console.error('Error updating plant:', error)
    } finally {
      setSaving(false)
    }
  }

  const getOverdueBadge = (plant) => {
    const interval = plant.watering_interval_days ?? 3
    let daysSince = null
    try {
      const date = new Date(plant.last_watered)
      daysSince = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24))
    } catch { return null }
    if (daysSince == null) return null
    if (daysSince > interval) {
      return <Badge variant="destructive">Overdue</Badge>
    }
    if (daysSince >= interval - 1) {
      return (
        <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Due Soon</Badge>
      )
    }
    return null
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
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

  const getMoistureBadgeVariant = (moisture) => {
    if (!moisture) return 'outline'
    if (moisture <= 3) return 'destructive'
    if (moisture <= 5) return 'default'
    return 'secondary'
  }

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Your Plants
        </CardTitle>
        <CardDescription>
          {plants.length} {plants.length === 1 ? 'plant' : 'plants'} in your collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {plants.map((plant) => {
            const isEditing = editingId === plant.id
            const overdueBadge = getOverdueBadge(plant)

            return (
              <Card key={plant.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">{plant.name}</CardTitle>
                          {overdueBadge}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {plant.moisture_level !== null && !isEditing && (
                        <Badge variant={getMoistureBadgeVariant(plant.moisture_level)}>
                          <Droplets className="h-3 w-3 mr-1" />
                          {plant.moisture_level}/10
                        </Badge>
                      )}
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
                  {isEditing && (
                    <div className="mt-2">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Watering interval (days)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={editValues.watering_interval_days}
                        onChange={(e) =>
                          setEditValues(prev => ({
                            ...prev,
                            watering_interval_days: e.target.value
                          }))
                        }
                        className="h-9 w-32"
                        placeholder="Days"
                      />
                    </div>
                  )}
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
                    variant="outline"
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
      </CardContent>
    </Card>
  )
}

export default PlantList
