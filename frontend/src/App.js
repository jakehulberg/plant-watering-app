import React from 'react';
import PlantList from './PlantList';
import AddPlantForm from './AddPlantForm';  // <-- Add this line

function App() {
  return (
    <div className="App">
      <h1>🌿 Plant Watering App (React)</h1>

      <AddPlantForm />       {/* <- Your new form */}
      <PlantList />          {/* <- Your existing list */}
    </div>
  );
}

export default App;

