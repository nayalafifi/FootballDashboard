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

  return ( //this code was done with the help of chatgpt
    <div className="app-container"> 
      <h1>football team information</h1> 

      {/* input for team names */}
      <div className="input-section"> 
        <input
          type="text"
          name="team1" //input field for team 1's name
          placeholder="team 1's name" //placeholder text inside the input
          value={teamNames.team1} //binding the value to team1 state
          onChange={handleChange} //calls handleChange to update state on input change
        />
        <input
          type="text"
          name="team2" //input field for team 2's name
          placeholder="team 2's name" 
          value={teamNames.team2} //binding the value to team2 state
          onChange={handleChange} 
        />
        <input
          type="text"
          name="team3" //input field for team 3's name
          placeholder="team 3's name" 
          value={teamNames.team3} //binding the value to team3 state
          onChange={handleChange} 
        />
        <button onClick={handleSubmit}>get team info</button>
      </div>

      {loading && <p>loading...</p>} 
      {error && <p>{error}</p>} 

      {/* display fetched data */}
      {data && data.map((teamData, index) => ( //loops through the data array to display each team's info
        <div key={index} className="team-section"> 
          <h2>team {index + 1} information</h2>

          {/* upcoming fixtures */}
          <h3>upcoming fixtures</h3> 
          <div className="container">
            {teamData && teamData.fixtures && teamData.fixtures.response && teamData.fixtures.response.length > 0 ? (
              teamData.fixtures.response.map((fixture, i) => ( //maps through each fixture to display it
                <div className="fixture-card" key={i}>
                  <div className="fixture-teams"> 
                    <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} /> 
                    {fixture.teams.home.name} vs 
                    <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} /> 
                    {fixture.teams.away.name} 
                  </div>
                  <div className="fixture-date">{new Date(fixture.fixture.date).toLocaleDateString()}</div> //converts fixture date to a readable format
                </div>
              ))
            ) : (
              <p>no upcoming fixtures available.</p> //displays a message if no fixtures are available
            )}
          </div>

          {/* standings */}
          <h3>standings</h3> 
          {teamData && teamData.standings && teamData.standings.response && teamData.standings.response.length > 0 ? (
            teamData.standings.response.map((standing, i) => ( //maps through standings data to display it
              <div key={i} className="standing-card"> 
                <span>{standing.league.name}</span> 
                <p>position: {standing.league.standings[0][0].rank}</p> 
                <p>points: {standing.league.standings[0][0].points}</p> 
              </div>
            ))
          ) : (
            <p>no standings available.</p> //displays a message if standings are not available
          )}

          {/* injuries */}
          <h3>injuries</h3> 
          <ul> //unordered list for injuries
            {teamData && teamData.injuries && teamData.injuries.response && teamData.injuries.response.length > 0 ? (
              removeDuplicateInjuries(teamData.injuries.response).map((injury, i) => ( //maps through injuries and removes duplicates
                <li key={i}> 
                  {injury.player.name} 
                </li>
              ))
            ) : (
              <li>no injury data available.</li> //displays a message if no injuries are available
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App; 
