import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Thermometer, Droplets, CloudRain, RefreshCw } from 'lucide-react'

function WeatherPage() {
  const [weather, setWeather] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [loadingRecs, setLoadingRecs] = useState(true)
  const [error, setError] = useState('')

  const fetchWeather = async () => {
    setLoadingWeather(true)
    try {
      const res = await fetch('/weather')
      if (!res.ok) throw new Error('Failed to fetch weather')
      setWeather(await res.json())
    } catch (e) {
      setError('Could not fetch weather data.')
    } finally {
      setLoadingWeather(false)
    }
  }

  const fetchRecommendations = async () => {
    setLoadingRecs(true)
    try {
      const res = await fetch('/recommendation')
      if (!res.ok) throw new Error('Failed to fetch recommendations')
      setRecommendations(await res.json())
    } catch (e) {
      // recommendations failing is non-fatal
    } finally {
      setLoadingRecs(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    fetchRecommendations()
  }, [])

  const recBadgeVariant = (action) => {
    if (!action) return 'outline'
    if (action.toLowerCase().includes('water')) return 'destructive'
    if (action.toLowerCase().includes('rain')) return 'secondary'
    return 'default'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5" />
            Current Weather
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => { fetchWeather(); fetchRecommendations() }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loadingWeather ? (
            <p className="text-muted-foreground">Loading weather...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : weather ? (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <Thermometer className="mx-auto h-6 w-6 text-orange-400" />
                <p className="text-2xl font-bold">{weather.temperature_f}°F</p>
                <p className="text-sm text-muted-foreground">{weather.temperature_c}°C</p>
              </div>
              <div className="space-y-1">
                <Droplets className="mx-auto h-6 w-6 text-blue-400" />
                <p className="text-2xl font-bold">{weather.humidity}%</p>
                <p className="text-sm text-muted-foreground">Humidity</p>
              </div>
              <div className="space-y-1">
                <CloudRain className="mx-auto h-6 w-6 text-sky-400" />
                <p className="text-2xl font-bold">{weather.rain_forecast} mm</p>
                <p className="text-sm text-muted-foreground">Rain (12h)</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Watering Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecs ? (
            <p className="text-muted-foreground">Loading recommendations...</p>
          ) : recommendations.length === 0 ? (
            <p className="text-muted-foreground">No recommendations available.</p>
          ) : (
            <div className="divide-y">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <span className="font-medium">{rec.plant}</span>
                  <Badge variant={recBadgeVariant(rec.action)}>{rec.action}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WeatherPage
