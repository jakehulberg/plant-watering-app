import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App.jsx'

function mockDefaultFetch() {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (url === '/api/plants') {
      return { ok: true, json: async () => [] }
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
  it('renders the plant dashboard and switches to the database tab', async () => {
    mockDefaultFetch()

    render(<App />)

    expect(screen.getByRole('heading', { name: /plant watering app/i })).toBeInTheDocument()
    expect(screen.getByText(/add a new plant to your collection/i)).toBeInTheDocument()

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
