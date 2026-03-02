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
  const [refreshKey, setRefreshKey] = useState(0)

  const handleWatered = () => setRefreshKey(k => k + 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            🌿 Plant Watering App
          </h1>
          <p className="text-sm text-gray-500">
            Keep track of your plants and get smart watering recommendations
          </p>
        </div>

        {/* Tab Navigation — large tap targets for mobile */}
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === id
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 active:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'plants' && (
          <div className="space-y-6">
            <AddPlantForm />
            <PlantList onWatered={handleWatered} />
          </div>
        )}
        {activeTab === 'weather' && <WeatherPage refreshKey={refreshKey} />}
        {activeTab === 'database' && <DatabasePage />}
      </div>
    </div>
  )
}

export default App
