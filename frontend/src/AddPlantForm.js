// A React form that allows the user to add a new plant to the backend.
// This form will send a POST request to the Flask API route /api/plants

import React, { useState } from 'react';

function AddPlantForm({ onPlantAdded }) {
  // useState hooks track form input values
  const [name, setName] = useState('');
  const [moisture, setMoisture] = useState('');
  const [message, setMessage] = useState('');

  // This function runs when the form is submitted
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent full page reload

    // Build the data object to send to the backend
    const plantData = {
      name: name,
      moisture_level: parseInt(moisture)
    };

    // Send POST request to Flask
    fetch('/api/plants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(plantData)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to add plant');
      return res.json();
    })
    .then(data => {
      setMessage('✅ Plant added successfully!');
      setName('');
      setMoisture('');
      if (onPlantAdded) onPlantAdded(); // Optional callback to refresh plant list
    })
    .catch(err => {
      console.error(err);
      setMessage('❌ Error adding plant.');
    });
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Add New Plant</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Plant Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Moisture Level (1-10):
          <input
            type="number"
            value={moisture}
            min="1"
            max="10"
            onChange={(e) => setMoisture(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Add Plant</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddPlantForm;
