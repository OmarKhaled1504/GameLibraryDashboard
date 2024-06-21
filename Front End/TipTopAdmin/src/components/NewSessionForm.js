import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Spinner from './Spinner.js';

const NewSessionForm = ({ activeSessions, authToken, onSubmit }) => {
  const [formData, setFormData] = useState({
    memberIds: [],
    branchId: 1,
    gameIds: [],
    guests: '',
  });
  const [selectedBranchId, setSelectedBranchId] = useState('1');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const membersInSessions = activeSessions.map(item => {
    return item.attributes.members.data.map(member => member.id);
  }).flat();
  // const membersIdsInDB = members.data.map(item => {
  //   return item.id;
  // });
  const validMember = async (memberId) => {
    
    const memberResponse = await axios.get(`REDACTED/api/members?filters[membership_id][$eq]=${memberId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (memberResponse.data.data.length > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'branchId') {
      setSelectedBranchId(value);
    }
  };

  // const handleGameChange = (e) => {
  //   const { value, checked } = e.target;
  //   let updatedGameIds = [...formData.gameIds];

  //   if (checked && !updatedGameIds.includes(value)) {
  //     updatedGameIds.push(value);
  //   } else {
  //     updatedGameIds = updatedGameIds.filter(id => id !== value);
  //   }

  //   setFormData({ ...formData, gameIds: updatedGameIds });
  // };

  const findIdByMembershipId =  async (membershipId) => {
    let member = await axios.get(`REDACTED/api/members?filters[membership_id][$eq]=${membershipId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if(member.data.data.length > 0){
      return member.data.data[0].id;
    }
    return 0;
  };
  
  
  const handleSubmit = async (e) => {
    setIsLoading(true);
    
    e.preventDefault();
    const memberIds = formData.memberIds.split(",").map(Number);
    // const isMemberInSession = memberIds.some(id => membersInSessions.includes(id));
    const guestIds = [];
    const start_time = moment()
    // const findIdByMembershipId = (membershipId) => members.data.find(entry => entry.attributes.membership_id === membershipId)?.id;
    if (!(await validMember(memberIds[0]))) {
      setError("Member ID is Invalid!");
      return;
    }
    if (await (membersInSessions.includes(await findIdByMembershipId(memberIds[0])))) {
      setError("A member cannot be in multiple sessions simultaneously");
      return;
    }
    try {
      for (let i = 0; i < parseInt(formData.guests); i++) {
        const newGuest = await axios.post('REDACTED/api/guests', {
          data: {
            start_time: start_time,
            active: true,
          }
        }, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        });

        guestIds.push(newGuest.data.data.id)
      }
    } catch (error) {
      console.error('Error adding guest:', error);
    }
    try {
      const response = await axios.post('REDACTED/api/sessions', {
        data: {
          members: await findIdByMembershipId(memberIds[0]),
          branch: parseInt(formData.branchId),
          guests: guestIds,
          games: formData.gameIds.map(Number),
          start_time: start_time,
          member_st: start_time, // Setting current time in HH:mm:ss.SSS format
          active: true,
        }
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setIsLoading(false)
      onSubmit();
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };
  // useEffect(() => {
  //   setIsLoading(false)
  // }, [response]);  

  // const filteredGameOptions = branchOptions.filter(branch => branch.id == selectedBranchId)[0].attributes.games.data;

  return (
    
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
      {isLoading && <Spinner />}
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="mb-4">
        <label htmlFor="memberIds" className="block text-sm font-medium text-gray-700">Member ID:</label>
        <input
          type="text"
          id="memberIds"
          name="memberIds"
          value={formData.memberIds}
          onChange={handleInputChange}
          placeholder="Enter member ID"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="guests" className="block text-sm font-medium text-gray-700">Guests :</label>
        <input
          type="text"
          id="guests"
          name="guests"
          value={formData.guests}
          onChange={handleInputChange}
          placeholder="Enter number of guests."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      {/* <div className="mb-4">
        <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">Branch:</label>
        <select
          id="branchId"
          name="branchId"
          value={formData.branchId}
          onChange={handleInputChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {branchOptions.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.attributes.name}
            </option>
          ))}
        </select>
      </div> */}
      {/* <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Games:</label>
        {filteredGameOptions.map(game => (
          <div key={game.id} className="flex items-center">
            <input
              type="checkbox"
              id={`game-${game.id}`}
              value={game.id}
              checked={formData.gameIds.includes(String(game.id))}
              onChange={handleGameChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor={`game-${game.id}`} className="ml-2 block text-sm text-gray-900">
              {game.attributes.name}
            </label>
          </div>
        ))}
      </div> */}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        disabled={isLoading}
      >
        Add Session
      </button>
    </form>
  );
};

export default NewSessionForm;