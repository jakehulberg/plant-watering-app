import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AddPlantForm from './AddPlantForm.jsx'

describe('AddPlantForm', () => {
  it('posts a trimmed plant name and notifies the parent after success', async () => {
    const onPlantAdded = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ plant: { id: 1, name: 'Basil' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<AddPlantForm onPlantAdded={onPlantAdded} />)

    fireEvent.change(screen.getByLabelText(/plant name/i), {
      target: { value: '  Basil  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add plant/i }))

    await waitFor(() => expect(onPlantAdded).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith('/api/plants', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Basil' }),
    }))
    expect(screen.getByText(/plant added successfully/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/plant name/i)).toHaveValue('')
  })

  it('shows an error and does not notify the parent when the API rejects the plant', async () => {
    const onPlantAdded = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Plant name is required' }),
    }))

    render(<AddPlantForm onPlantAdded={onPlantAdded} />)

    fireEvent.change(screen.getByLabelText(/plant name/i), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add plant/i }))

    expect(await screen.findByText(/error adding plant/i)).toBeInTheDocument()
    expect(onPlantAdded).not.toHaveBeenCalled()
  })
})
