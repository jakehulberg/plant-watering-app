import React from 'react'
import PlantList from './PlantList.jsx'
import AddPlantForm from './AddPlantForm.jsx'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌿 Plant Watering App
          </h1>
          <p className="text-gray-600">
            Keep track of your plants and get smart watering recommendations
          </p>
        </div>

        <div className="space-y-6">
          <AddPlantForm />
          <PlantList />
        </div>
      </div>
    </div>
  )
}

export default App
