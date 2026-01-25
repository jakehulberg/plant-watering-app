import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Alert, AlertDescription } from './components/ui/alert'

function AddPlantForm({ onPlantAdded }) {
  const [name, setName] = useState('')
  const [moisture, setMoisture] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const plantData = {
      name: name.trim(),
      moisture_level: parseInt(moisture)
    }

    try {
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(plantData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to add plant')
      }

      const data = await res.json()
      setMessage('success')
      setName('')
      setMoisture('')
      if (onPlantAdded) onPlantAdded()
    } catch (err) {
      console.error(err)
      setMessage('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Plant</CardTitle>
        <CardDescription>
          Add a new plant to your collection. Moisture level is optional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plant-name">Plant Name</Label>
            <Input
              id="plant-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Basil, Tomato, Cactus"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moisture-level">Moisture Level (1-10)</Label>
            <Input
              id="moisture-level"
              type="number"
              value={moisture}
              min="1"
              max="10"
              onChange={(e) => setMoisture(e.target.value)}
              placeholder="Enter moisture level"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers indicate drier soil
            </p>
          </div>

          {message === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✅ Plant added successfully!
              </AlertDescription>
            </Alert>
          )}

          {message === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>
                ❌ Error adding plant. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Adding...' : 'Add Plant'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddPlantForm
