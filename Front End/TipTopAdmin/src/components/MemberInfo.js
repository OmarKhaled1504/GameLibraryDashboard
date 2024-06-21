import React, { useState } from 'react';
import axios from 'axios';

const MemberInfo = ({ member, onRemove, authToken, fetchData }) => {
  const [points, setPoints] = useState(member.attributes.points);
  // setPoints(member.attributes.points);
  if (!member) return null;
  
  const resetPoints = async () => {
    try {
      const pointsResponse = await axios.put(`https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/members/${member.id}`, {
        data: { points: 0 }
      }, {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      });
      // Fetch the updated member data
      await axios.get(`https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/members/${member.id}`, {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
        params: {
          populate: 'sessions,level',
        },
      });
      setPoints(pointsResponse.data.data.attributes.points);
       // Optionally, refresh the entire members list
    } catch (error) {
      console.error('Error resetting points:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      {/* <button className="text-red-500 mb-4 right-2" onClick={() => onRemove(null)}>X</button> */}
      <h2 className="text-2xl font-bold mb-4">Member Information</h2>
      <p><strong>ID:</strong> {member.attributes.membership_id}</p>
      <p><strong>Level:</strong> {member.attributes.level.data.attributes.type}</p>
      <p><strong>Points:</strong> {points}</p>
      <p><strong>Sessions:</strong> {member.attributes.sessions?.data.map(session => session.id).join(', ') || 'N/A'}</p>
      <div className="mt-6">
        <button
          className="mr-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={resetPoints}
        >
          Redeem Points
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={() => onRemove(null)}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default MemberInfo;