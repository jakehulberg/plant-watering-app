import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import PlantList from './PlantList.jsx'

const plants = [
  {
    id: 1,
    name: 'Overdue Cactus',
    last_watered: '2026-04-24 08:00:00',
    water_threshold: 3,
    plant_type: 'Cactus',
  },
  {
    id: 2,
    name: 'Due Soon Basil',
    last_watered: '2026-04-30 08:00:00',
    water_threshold: 2,
    plant_type: 'Basil',
  },
  {
    id: 3,
    name: 'Fresh Tomato',
    last_watered: '2026-05-01 08:00:00',
    water_threshold: 2,
    plant_type: 'Tomato',
  },
]

function mockPlantsFetch(data = plants) {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => data,
  })))
}

describe('PlantList command center', () => {
  it('renders dashboard stats and sorted status badges', async () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00'))
    mockPlantsFetch()

    render(<PlantList />)

    expect(await screen.findByText('Overdue Cactus')).toBeInTheDocument()
    expect(screen.getByText('Total Plants')).toBeInTheDocument()
    expect(screen.getAllByText('Needs Attention').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Watered Today').length).toBeGreaterThan(0)

    const plantCards = screen.getAllByTestId('plant-card')
    expect(within(plantCards[0]).getByText('Overdue Cactus')).toBeInTheDocument()
    expect(within(plantCards[0]).getByText('Overdue')).toBeInTheDocument()
    expect(within(plantCards[1]).getByText('Due Soon Basil')).toBeInTheDocument()
    expect(within(plantCards[1]).getByText('Due Soon')).toBeInTheDocument()
    expect(within(plantCards[2]).getByText('Fresh Tomato')).toBeInTheDocument()
    expect(within(plantCards[2]).getByText('Watered Today')).toBeInTheDocument()
  })

  it('filters plants by attention status and search text', async () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00'))
    mockPlantsFetch()

    render(<PlantList />)

    expect(await screen.findByText('Overdue Cactus')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /needs attention/i }))
    expect(screen.getByText('Overdue Cactus')).toBeInTheDocument()
    expect(screen.getByText('Due Soon Basil')).toBeInTheDocument()
    expect(screen.queryByText('Fresh Tomato')).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/search plants/i), {
      target: { value: 'basil' },
    })
    expect(screen.queryByText('Overdue Cactus')).not.toBeInTheDocument()
    expect(screen.getByText('Due Soon Basil')).toBeInTheDocument()
  })

  it('shows an empty filtered state when no plants match', async () => {
    vi.setSystemTime(new Date('2026-05-01T12:00:00'))
    mockPlantsFetch()

    render(<PlantList />)

    expect(await screen.findByText('Overdue Cactus')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/search plants/i), {
      target: { value: 'monstera' },
    })

    expect(screen.getByText(/no plants match/i)).toBeInTheDocument()
  })
})
