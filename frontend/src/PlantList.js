import React, { useEffect, useState } from 'react';

function PlantList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plants')  // this hits your Flask API
      .then(res => res.json())
      .then(data => {
        setPlants(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching plants:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading plants...</p>;

  return (
    <div>
      <h2>🌿 Plant List</h2>
      <ul>
        {plants.map(plant => (
          <li key={plant.id}>
            <strong>{plant.name}</strong> — Last Watered: {plant.last_watered} — Moisture: {plant.moisture_level ?? 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlantList;