import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Games.css';

const authToken = 'REDACTED';

const Games = () => {
  const [games, setGames] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const fetchData = async () => {
    try {
      const gamesResponse = await axios.get('REDACTED/api/games', {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
        params: {
          populate: 'branches,sessions',
        },
      });
      
      const branchesResponse = await axios.get('REDACTED/api/branches', {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
        params: {
          populate: 'games',
        },
      });

      const sessionsResponse = await axios.get('REDACTED/api/sessions', {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
        params: {
          populate: 'games',
        },
      });

      setGames(gamesResponse.data.data);
      setBranches(branchesResponse.data.data);
      setSessions(sessionsResponse.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  },[]);

  const getBranchesForGame = (gameId) => {
    return branches
      .filter(branch => branch.attributes.games.data.some(game => game.id === gameId))
      .map(branch => branch.attributes.name)
      .join(', ');
  };

  const getActiveSessionsForGame = (gameId) => {
    return sessions
      .filter(session => session.attributes.active && session.attributes.games.data.some(game => game.id === gameId))
      .map(session => session.id)
      .join(', ');
  };


  return (
    <div>
      <h1>Games</h1>
      <table>
        <thead className='game-table'>
          <tr>
            <th>Game</th>
            <th>Available At</th>
            <th>Sessions</th>
            
          </tr>
        </thead>
        <tbody>
          {games.map(game => (
            <tr key={game.id}>
              <td>{game.attributes.name}</td>
              <td>{getBranchesForGame(game.id)}</td>
              <td>{getActiveSessionsForGame(game.id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Games;