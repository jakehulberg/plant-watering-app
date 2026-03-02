import React, { useState } from 'react'
import PlantList from './PlantList.jsx'
import AddPlantForm from './AddPlantForm.jsx'
import WeatherPage from './WeatherPage.jsx'
import DatabasePage from './DatabasePage.jsx'
import { Leaf, CloudRain, Database } from 'lucide-react'

const TABS = [
  { id: 'plants', label: 'Plants', icon: Leaf },
  { id: 'weather', label: 'Weather', icon: CloudRain },
  { id: 'database', label: 'Database', icon: Database },
]

function App() {
  const [activeTab, setActiveTab] = useState('plants')

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

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === id
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'plants' && (
          <div className="space-y-6">
            <AddPlantForm />
            <PlantList />
          </div>
        )}
        {activeTab === 'weather' && <WeatherPage />}
        {activeTab === 'database' && <DatabasePage />}
      </div>
    </div>
  )
}

export default App
