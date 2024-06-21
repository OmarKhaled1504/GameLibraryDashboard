import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MemberInfo from './MemberInfo';
import './Members.css';
import Spinner from './Spinner.js';

const authToken = 'REDACTED';

const Members = () => {
  const [sessions, setSessions] = useState([]);
  const [levels, setLevels] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [searchedMember, setSearchedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (memberId) => {
    setIsLoading(true)

    try {
      const memberResponse = await axios.get(`REDACTED/api/members?filters[membership_id][$eq]=${memberId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          populate: 'sessions,level',
        },
      });
      const levelsResponse = await axios.get('REDACTED/api/levels', {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      });
      const sessionsResponse = await axios.get('REDACTED/api/sessions', {
        headers: {
          Authorization: `bearer ${authToken}`,
        }
      });
      setLevels(levelsResponse.data.data);
      setSessions(sessionsResponse.data.data);
      setIsLoading(false)
      return memberResponse.data.data[0];

    } catch (error) {
      console.error('Error fetching data:', error);
      return;
    }
  };



  const handleSearch = async () => {
    // const member = members.find(entry => entry.attributes.membership_id === parseInt(searchId));
    const member = await fetchData(parseInt(searchId));
    setSearchedMember(member);
  };

  const handleRemove = () => {
    setSearchedMember(null);
    setSearchId('');
  };

  return (
    <div className="flex flex-col items-center mx-auto bg-white px-4 py-6">
      {isLoading && <Spinner />}

      <h1 className="text-2xl font-bold mb-6 text-center">Members</h1>
      <div className="flex py-1">
        <input
          type="text"
          className="p-2 border border-gray-300 rounded-md mr-2"
          placeholder="Enter Membership ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      {searchedMember && (
        <MemberInfo
          member={searchedMember}
          onRemove={handleRemove}
          sessions={sessions}
          levels={levels}
          authToken={authToken}
          fetchData={fetchData}
        />
      )}
    </div>



  );
};

export default Members;