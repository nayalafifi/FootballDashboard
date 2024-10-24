import React, { useState } from 'react';
import './App.css';

function App() 
{ 
  const [teamNames, setTeamNames] = useState({ team1: '', team2: '', team3: '' });
  const [data, setData] = useState([]);//state for fetched data
  const [loading, setLoading] = useState(false);//state for loading status
  const [error, setError] = useState(null);//state for error handling

  const handleChange = (e) => { 
    setTeamNames({
      ...teamNames, 
      [e.target.name]: e.target.value,//update team names
    });
  };

  const fetchTeamId = async (teamName) => { //function to fetch team ID by name
    const apiKey = process.env.REACT_APP_API_KEY;  
    const url = `https://api-football-v1.p.rapidapi.com/v2/teams/search/${teamName.replace(' ', '_')}`; 
    const options = 
    {
      method: 'GET', 
      headers: {
        'x-rapidapi-key': apiKey, 
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      },
    };

    try {
      const response = await fetch(url, options);//fetching data
      const result = await response.json();//parsing
      if (result.api.teams && result.api.teams.length > 0) 
      { 
        return result.api.teams[0].team_id;//return first matching team id
      } 
      else 
      {
        throw new Error(`No team found with the name: ${teamName}`); 
      }
    } catch (err) {
      console.error(err); 
      setError(`Error fetching team ID for ${teamName}`); 
      return null; 
    }
  };

  const fetchTeamData = async (teamId) => { //now a function to fetch team data by the id
    const apiKey = process.env.REACT_APP_API_KEY;  
    const options =
    {
      method: 'GET', 
      headers: {
        'x-rapidapi-key': apiKey, 
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      },
    };

    try {
      const urls = [
        `https://api-football-v1.p.rapidapi.com/v3/fixtures?team=${teamId}&next=15`,//upcoming 15 fixtures
        `https://api-football-v1.p.rapidapi.com/v3/standings?season=2024&team=${teamId}`,//team standings
        `https://api-football-v1.p.rapidapi.com/v3/injuries?season=2024&team=${teamId}`,//team injuries
      ];

      const responses = await Promise.all(urls.map((url) => fetch(url, options)));//fetch data from all URLs
      const [fixtures, standings, injuries] = await Promise.all(
        responses.map((res) => res.json())//map to JSON
      );

      return{
        fixtures, 
        standings, 
        injuries, 
      };
    } catch (err) {
      console.error(err); 
      setError('Failed to fetch data for the team'); 
      return null; 
    }
  };

  const handleSubmit = async () => {//function to handle form submission
    setLoading(true); 
    setError(null); 
    try {
      const teamNamesList = [teamNames.team1, teamNames.team2, teamNames.team3];//list of team names
      const promises = teamNamesList.map(async (teamName) => { 
        const teamId = await fetchTeamId(teamName);//fetch team ID by name
        if (teamId) 
        {
          return fetchTeamData(teamId);//fetch team data if team ID is available
        }
        return null;
      });

      const results = await Promise.all(promises);//await all promises
      setData(results); 
    } catch (err) {
      setError('Error fetching data.'); 
    }
    setLoading(false); 
  };

  const removeDuplicateInjuries = (injuries) => { //function to remove duplicate injuries since they are repeated in the data
    const uniqueInjuries = []; 
    const playerNames = new Set(); 

    injuries.forEach((injury) => { 
      if (!playerNames.has(injury.player.name)) 
        { 
        uniqueInjuries.push(injury); 
        playerNames.add(injury.player.name); 
      }
    });

    return uniqueInjuries; 
  };

  return ( //This code was done with the help of chatgpt
    <div className="app-container"> 
      <h1>Football Team Information</h1>

      {/* Input for Team Names */}
      <div className="input-section"> 
        <input
          type="text"
          name="team1"
          placeholder="Team 1's name"
          value={teamNames.team1} 
          onChange={handleChange} 
        />
        <input
          type="text"
          name="team2"
          placeholder="Team 2's name"
          value={teamNames.team2} 
          onChange={handleChange} 
        />
        <input
          type="text"
          name="team3"
          placeholder="Team 3's name"
          value={teamNames.team3} 
          onChange={handleChange} 
        />
        <button onClick={handleSubmit}>Get Team Info</button> 
      </div>

      {loading && <p>Loading...</p>} 
      {error && <p>{error}</p>} 

      {/* Display Fetched Data */}
      {data && data.map((teamData, index) => ( 
        <div key={index} className="team-section"> 
          <h2>Team {index + 1} Information</h2>

          {/* Upcoming Fixtures */}
          <h3>Upcoming Fixtures</h3> 
          <div className="container"> 
            {teamData && teamData.fixtures && teamData.fixtures.response && teamData.fixtures.response.length > 0 ? (
              teamData.fixtures.response.map((fixture, i) => ( 
                <div className="fixture-card" key={i}> 
                  <div className="fixture-teams"> 
                    <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} /> 
                    {fixture.teams.home.name} vs 
                    <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} /> 
                    {fixture.teams.away.name} 
                  </div>
                  <div className="fixture-date">{new Date(fixture.fixture.date).toLocaleDateString()}</div> 
                </div>
              ))
            ) : (
              <p>No upcoming fixtures available.</p> 
            )}
          </div>

          {/* Standings */}
          <h3>Standings</h3> 
          {teamData && teamData.standings && teamData.standings.response && teamData.standings.response.length > 0 ? (
            teamData.standings.response.map((standing, i) => ( 
              <div key={i} className="standing-card"> 
                <span>{standing.league.name}</span> 
                <p>Position: {standing.league.standings[0][0].rank}</p> 
                <p>Points: {standing.league.standings[0][0].points}</p> 
              </div>
            ))
          ) : (
            <p>No standings available.</p> 
          )}

          {/* Injuries */}
          <h3>Injuries</h3> 
          <ul> 
            {teamData && teamData.injuries && teamData.injuries.response && teamData.injuries.response.length > 0 ? (
              removeDuplicateInjuries(teamData.injuries.response).map((injury, i) => ( 
                <li key={i}> 
                  {injury.player.name} 
                </li>
              ))
            ) : (
              <li>No injury data available.</li> 
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App; 
