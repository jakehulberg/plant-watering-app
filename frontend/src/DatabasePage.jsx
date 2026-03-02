import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Database, RefreshCw } from 'lucide-react'

function DatabasePage() {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPlants = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plants')
      if (!res.ok) throw new Error('Failed to fetch')
      setPlants(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlants()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Plant Database
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchPlants}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : plants.length === 0 ? (
          <p className="text-muted-foreground">No plants in the database yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Plant Name</th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Last Watered</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Moisture Level</th>
                </tr>
              </thead>
              <tbody>
                {plants.map((plant) => (
                  <tr key={plant.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{plant.id}</td>
                    <td className="py-2 pr-4 font-medium">{plant.name}</td>
                    <td className="py-2 pr-4">{plant.last_watered}</td>
                    <td className="py-2">{plant.moisture_level ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DatabasePage
