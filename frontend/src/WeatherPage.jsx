import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Thermometer, Droplets, CloudRain, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

function WeatherPage({ refreshKey = 0 }) {
  const [weather, setWeather] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [weatherAvailable, setWeatherAvailable] = useState(true)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [loadingRecs, setLoadingRecs] = useState(true)
  const [error, setError] = useState('')
  const [expandedPlant, setExpandedPlant] = useState(null)

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
      const data = await res.json()
      setRecommendations(data.recommendations || [])
      setWeatherAvailable(data.weather_available !== false)
    } catch (e) {
      // recommendations failing is non-fatal
    } finally {
      setLoadingRecs(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    fetchRecommendations()
  }, [refreshKey])

  const recBadgeVariant = (rec) => {
    if (!rec || rec.urgency === undefined) return 'outline'
    if (rec.urgency >= 1.2) return 'destructive'
    if (rec.urgency >= 0.5) return 'default'
    if (rec.action === 'Delayed by rain') return 'secondary'
    return 'outline'
  }

  const recBadgeClass = (rec) => {
    if (rec && rec.urgency >= 0.8 && rec.urgency < 1.2) {
      return 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500'
    }
    return ''
  }

  const toggleExpand = (plantName) => {
    setExpandedPlant(expandedPlant === plantName ? null : plantName)
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
                <p className="text-sm text-muted-foreground">Rain (24h)</p>
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
          {!weatherAvailable && (
            <p className="text-sm text-yellow-600 mb-3">Weather data unavailable — recommendations based on time only.</p>
          )}
          {loadingRecs ? (
            <p className="text-muted-foreground">Loading recommendations...</p>
          ) : recommendations.length === 0 ? (
            <p className="text-muted-foreground">No recommendations available.</p>
          ) : (
            <div className="divide-y">
              {recommendations.map((rec, i) => (
                <div key={i}>
                  <div
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2"
                    onClick={() => toggleExpand(rec.plant)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rec.plant}</span>
                      <span className="text-xs text-muted-foreground">({rec.urgency?.toFixed(2)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={recBadgeVariant(rec)} className={recBadgeClass(rec)}>
                        {rec.action}
                      </Badge>
                      {expandedPlant === rec.plant
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                  </div>
                  {expandedPlant === rec.plant && rec.factors && (
                    <div className="pb-3 px-2 -mx-2 text-sm text-muted-foreground space-y-1">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-2">
                        <span>Time factor:</span>
                        <span className="font-mono">{rec.factors.time?.toFixed(2)}</span>
                        <span>Temp bonus:</span>
                        <span className="font-mono">+{rec.factors.temp?.toFixed(2)}</span>
                        <span>Humidity bonus:</span>
                        <span className="font-mono">+{rec.factors.humidity?.toFixed(2)}</span>
                        <span>Rain reduction:</span>
                        <span className="font-mono">{rec.factors.rain?.toFixed(2)}</span>
                      </div>
                      {rec.details && (
                        <div className="pl-2 pt-1 border-t mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                          <span>Days since watered:</span>
                          <span className="font-mono">{rec.details.days_since_watered}</span>
                          <span>Water threshold:</span>
                          <span className="font-mono">{rec.details.water_threshold} days</span>
                          <span>Plant type:</span>
                          <span>{rec.details.plant_type}</span>
                        </div>
                      )}
                    </div>
                  )}
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
