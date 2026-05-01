import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App.jsx'

const dashboardPlants = [
  {
    id: 1,
    name: 'Overdue Fern',
    last_watered: '2026-04-24 08:00:00',
    water_threshold: 3,
    plant_type: 'Fern',
  },
  {
    id: 2,
    name: 'Fresh Basil',
    last_watered: '2026-05-01 08:00:00',
    water_threshold: 2,
    plant_type: 'Basil',
  },
]

function mockDefaultFetch() {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (url === '/api/plants') {
      return { ok: true, json: async () => dashboardPlants }
    }
    if (url === '/weather') {
      return {
        ok: true,
        json: async () => ({
          temperature_c: 24,
          temperature_f: 75.2,
          humidity: 55,
          rain_forecast: 1.5,
        }),
      }
    }
    if (url === '/recommendation') {
      return { ok: true, json: async () => ({ weather_available: true, recommendations: [] }) }
    }
    return { ok: true, json: async () => ({}) }
  }))
}

describe('App', () => {
  it('renders the upgraded watering command center and switches to the database tab', async () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00'))
    mockDefaultFetch()

    render(<App />)

    expect(screen.getByRole('heading', { name: /plant watering app/i })).toBeInTheDocument()
    expect(screen.getByText(/add a new plant to your collection/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /watering command center/i })).toBeInTheDocument()
    expect(screen.getByText('Overdue Fern')).toBeInTheDocument()
    expect(screen.getAllByText('Needs Attention').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /overdue/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /database/i }))

    expect(await screen.findByText(/plant database/i)).toBeInTheDocument()
  })

  it('switches to the weather tab and loads weather content', async () => {
    mockDefaultFetch()

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /weather/i }))

    expect(await screen.findByText('75.2°F')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /watering recommendations/i })).toBeInTheDocument()
  })
})
