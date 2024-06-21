import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Games.css';

const authToken = '6bd61b66c9ef1c6358b40c1d23978a5b6a66012680330896e281648cf030bc341fce3ff77c1b49f668d6d6427eb8993391d4d52f3e9b0421589fec5f9d11049852968b12fb9f7ca9a50efb6f4a386a6d1b3bd558df2cfeb16f4020da5cfcefdbb8f6f23b8ab326cbaafb587adef3f2de05434ce908556e604f3039acbfa1cbe4';

const Games = () => {
  const [games, setGames] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const fetchData = async () => {
    try {
      const gamesResponse = await axios.get('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/games', {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
        params: {
          populate: 'branches,sessions',
        },
      });
      
      const branchesResponse = await axios.get('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/branches', {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
        params: {
          populate: 'games',
        },
      });

      const sessionsResponse = await axios.get('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/sessions', {
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