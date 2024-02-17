import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import carte from './carte.png';

function App() {
  const [cities, setCities] = useState([]);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [maxCities, setMaxCities] = useState(100); // Nombre maximal de villes à afficher
  const [maxDistance, setMaxDistance] = useState(50); // Distance maximale du point ciblé (en km)
  const [minPopulation, setMinPopulation] = useState(1000); // Population minimale pour qu'une ville soit prise en compte
  const [userCoords, setUserCoords] = useState({ x: null, y: null });


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/citys');
      setCities(response.data);
      console.log('Données des villes récupérées avec succès:', response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données des villes:', error);
    }
  };

  const [redPoints, setRedPoints] = useState([]);

  const handleMapClick = async (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    console.log('Clicked at:', x, y);

     // Créez un nouvel objet représentant les coordonnées du point rouge
    const newRedPoint = { x, y };

    try {
      const response = await axios.get(`http://localhost:8080/citys?x=${x}&y=${y}`);
      const nearbyCities = response.data;
      if (nearbyCities.length === 0) {
        console.log('Aucune ville trouvée à proximité de ce point.');
      } else {
        setCities(nearbyCities);
        console.log('Villes récupérées:', nearbyCities);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
    }

    // Mettez à jour le tableau d'état pour inclure ce nouveau point rouge
    setRedPoints([...redPoints, newRedPoint]);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(0); // Distance arrondie à l'entier le plus proche
  };

  const handleCityHover = (city) => {
    setHoveredCity(city);
    console.log('Ville survolée:', city);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Récupérer les valeurs des champs du formulaire
    const maxVilles = parseInt(event.target.maxVilles.value);
    const distanceMax = parseInt(event.target.distanceMax.value);
    const populationMin = parseInt(event.target.populationMin.value);

    console.log('maxVilles:', maxVilles);
  console.log('distanceMax:', distanceMax);
  console.log('populationMin:', populationMin);
  
    // Filtrer les villes en fonction des paramètres du formulaire
    const filteredCities = cities.filter(city => {

      console.log('City:', city.name, 'Distance:', city.distance, 'Population:', city.population);
      return city.distance <= distanceMax &&
             city.population >= populationMin;
    })
 
    // Mettre à jour l'état des villes à afficher
    setCities(filteredCities);
    console.log('ville filtrer:', filteredCities);
  };

  return (
    <div className="App">
      <div className="map-container">
      {hoveredCity && (
          <div className="city-details" style={{ left: hoveredCity.x + 20, top: hoveredCity.y }}>
            <h2>{hoveredCity.name}</h2>
            {userCoords.x !== null && userCoords.y !== null && (
              <p>Distance: {calculateDistance(userCoords.latitude, userCoords.longitude, hoveredCity.latitude, hoveredCity.longitude)} km</p>
            )}
          </div>
        )}
        <img src={carte} alt="Carte de la France" onClick={handleMapClick} />
        {redPoints.map((point, index) => (
             <div
              key={index}
              className="red-point"
              style={{ left: `${point.x}px`, top: `${point.y}px` }}
            />
          ))}
        <map name="cities">
          {cities.map(city => (
            <area
              key={city.id}
              shape="circle"
              coords={`${city.x},${city.y},10`}
              onMouseOver={() => handleCityHover(city)}
              onMouseOut={() => handleCityHover(null)}
            />
          ))}
        </map>
        {cities.map(city => (
          <div
            key={city.id}
            className="city-marker"
            style={{ left: `${city.x}px`, top: `${city.y}px` }}
            onMouseOver={() => handleCityHover(city)}
            onMouseOut={() => handleCityHover(null)}
          />
        ))}
      </div>
      <div className="sidebar">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <label htmlFor="maxVilles" className="form-label">Nombre maximal de villes :</label>
            <input type="number" id="maxVilles" name="maxVilles" className="form-input" />

            <label htmlFor="distanceMax" className="form-label">Distance maximale (en km) :</label>
            <input type="number" id="distanceMax" name="distanceMax" className="form-input" />

            <label htmlFor="populationMin" className="form-label">Population minimale :</label>
            <input type="number" id="populationMin" name="populationMin" className="form-input" />

            <button type="submit" className="form-button">Filtrer</button>
          </form>
        </div>
        <h3>Liste des Villes</h3>
        <ul>
          {cities.map(city => (
            <li key={city.id}>{city.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
