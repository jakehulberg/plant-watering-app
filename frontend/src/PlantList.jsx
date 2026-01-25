import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Droplets, Calendar, Leaf } from 'lucide-react'

function PlantList() {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [watering, setWatering] = useState(new Set())

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
          {plants.map((plant) => (
            <Card key={plant.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{plant.name}</CardTitle>
                  {plant.moisture_level !== null && (
                    <Badge variant={getMoistureBadgeVariant(plant.moisture_level)}>
                      <Droplets className="h-3 w-3 mr-1" />
                      {plant.moisture_level}/10
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last watered: {formatDate(plant.last_watered)}</span>
                </div>
                <Button
                  onClick={() => handleWater(plant.id)}
                  disabled={watering.has(plant.id)}
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PlantList
