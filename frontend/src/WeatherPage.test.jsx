import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import WeatherPage from './WeatherPage.jsx'

const weatherPayload = {
  temperature_c: 24,
  temperature_f: 75.2,
  humidity: 55,
  rain_forecast: 1.5,
}

const recommendationPayload = {
  weather_available: true,
  recommendations: [
    {
      plant: 'Basil',
      action: 'Water soon',
      urgency: 0.9,
      factors: { time: 0.7, temp: 0.1, humidity: 0.1, rain: 0 },
      details: { days_since_watered: 2, water_threshold: 1, plant_type: 'Basil' },
    },
  ],
}

function mockFetchSequence(sequence) {
  const fetchMock = vi.fn()
  sequence.forEach((item) => {
    fetchMock.mockResolvedValueOnce({
      ok: item.ok ?? true,
      json: async () => item.body,
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('WeatherPage', () => {
  it('renders current weather and watering recommendations from the API', async () => {
    mockFetchSequence([
      { body: weatherPayload },
      { body: recommendationPayload },
    ])

    render(<WeatherPage />)

    expect(await screen.findByText('75.2°F')).toBeInTheDocument()
    expect(screen.getByText('24°C')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
    expect(screen.getByText('1.5 mm')).toBeInTheDocument()
    expect(await screen.findByText('Basil')).toBeInTheDocument()
    expect(screen.getByText('Water soon')).toBeInTheDocument()
  })

  it('clears a stale weather error when a later refresh succeeds', async () => {
    mockFetchSequence([
      { ok: false, body: { error: 'Failed' } },
      { body: { weather_available: false, recommendations: [] } },
      { body: weatherPayload },
      { body: recommendationPayload },
    ])

    render(<WeatherPage />)

    expect(await screen.findByText(/could not fetch weather data/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }))

    await waitFor(() => {
      expect(screen.queryByText(/could not fetch weather data/i)).not.toBeInTheDocument()
    })
    expect(await screen.findByText('75.2°F')).toBeInTheDocument()
  })
})
