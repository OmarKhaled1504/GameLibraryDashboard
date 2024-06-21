import axios from 'axios';
import moment from 'moment';
import React, { useState } from 'react';
import Spinner from './Spinner.js';

const EndSessionForm = ({ activeSessions, authToken, onSubmit, levels }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    sessionId: ''
  });
  const [error, setError] = useState(null);
  // const membersIdsInDB = members.data.map(item => item.id);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const findIdByMembershipId = async (membershipId) => {
    let member = await axios.get(`REDACTED/api/members?filters[membership_id][$eq]=${membershipId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (member.data.data.length > 0) {
      return member.data.data[0].id;
    }
    return 0;
  };
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
  const getMember = async (memberId) => {
    const memberResponse = await axios.get(`REDACTED/api/members?filters[membership_id][$eq]=${memberId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: {
        populate: 'level',
      },
    });
    return memberResponse.data.data[0];
  }
  const getMemberLevelAndPPH = (member) => {
    return levels.data.find(level => level.attributes.membership_level === member.attributes.level.data.attributes.membership_level).attributes.pph;
  };

  const getMemberPoints = (member) => {
    return levels.data.find(level => level.attributes.membership_level === member.attributes.level.data.attributes.membership_level).attributes.pts_coeff;
  };

  const updateMemberPoints = (member, pointsEarned) => {
    const currentPoints = member.attributes.points;
    const updatedPoints = currentPoints + pointsEarned;
    return updatedPoints;
  };
  const handleRemoveGuest = async (session, guest) => {
    try {

      const startTime = moment(guest.attributes.start_time);
      const endTime = moment();

      const duration = moment.utc(endTime.diff(startTime)).format("HH:mm:ss");
      const splitDuration = duration.split(':');
      const durationInHours = parseInt(splitDuration[0]) + parseFloat(splitDuration[1] / 60);

      const customRound = (num) => {
        // Get the integer part of the number
        const integerPart = Math.floor(num);

        // Get the decimal part of the number
        const decimalPart = num - integerPart;

        // Apply the rounding logic
        if (decimalPart > 0 && decimalPart < 0.5) {
          return integerPart + 0.5;
        } else if (decimalPart > 0.5) {
          return integerPart + 1;
        } else {
          return num; // This will handle both the case where decimalPart is 0 and where it's exactly 0.5
        }
      };


      const roundedDuration = customRound(durationInHours);

      const pph = getMemberLevelAndPPH(await getMember(session.attributes.members.data[0].attributes.membership_id));

      let pphGuest;

      if (pph === 0) {
        pphGuest = 50;
      } else {
        pphGuest = pph;
      }

      const totalDue = pphGuest;
      await axios.put(`REDACTED/api/guests/${parseInt(guest.id)}`, {
        data: {
          active: false,
          end_time: endTime,
          guest_due: totalDue
        }
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      });
    } catch (error) {
      console.error('Error removing guest:', error);
      setError('Error removing guest');
    }
  }

  const handleSubmit = async (e) => {
    setIsLoading(true);

    e.preventDefault();
    const memberId = await findIdByMembershipId(parseInt(formData.memberId));
    const sessionId = formData.sessionId;
    if (!(await validMember(parseInt(formData.memberId)))) {
      setError("Member ID is Invalid!");
      return;
    }
    try {
      let sessionToUpdate;
      if (sessionId) {
        sessionToUpdate = activeSessions.find(session => session.id === parseInt(sessionId));
      } else if (memberId) {
        sessionToUpdate = activeSessions.find(session =>
          session.attributes.members.data.some(member => member.id === memberId)
        );
      }

      if (!sessionToUpdate) {
        setError("No active session found for the given member ID or session ID.");
        return;
      }

      const endTime = moment();

      const duration = moment.utc(endTime.diff(sessionToUpdate.attributes.start_time)).format("HH:mm:ss");
      const splitDuration = duration.split(':');
      const durationInHours = parseInt(splitDuration[0]) + parseFloat(splitDuration[1] / 60);



      const customRound = (num) => {
        // Get the integer part of the number
        const integerPart = Math.floor(num);

        // Get the decimal part of the number
        const decimalPart = num - integerPart;

        // Apply the rounding logic
        if (decimalPart > 0 && decimalPart < 0.5) {
          return integerPart + 0.5;
        } else if (decimalPart > 0.5) {
          return integerPart + 1;
        } else {
          return num; // This will handle both the case where decimalPart is 0 and where it's exactly 0.5
        }
      };
      // const toBePaid = sessionToUpdate.attributes.guests.
      const guestsPaid = sessionToUpdate.attributes.guests.data.filter(guest => guest.attributes.active === false).map(guest => guest.attributes.guest_due).reduce(function (a, b) {
        return a + b;
      }, 0);

      const activeGuests = sessionToUpdate.attributes.guests.data.filter(guest => guest.attributes.active === true)
      // activeGuests.forEach(element => {
      //   handleRemoveGuest(sessionToUpdate, element)
      for (const activeGuest of activeGuests){
       await handleRemoveGuest(sessionToUpdate, activeGuest)
      };
      
      const sessionMidUpdating = await axios.get(`REDACTED/api/sessions/${sessionToUpdate.id}`, {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
        params: {
          populate: 'guests',
        },
      });
      const guestsTotal = sessionMidUpdating.data.data.attributes.guests.data.map(guest => guest.attributes.guest_due).reduce(function (a, b) {
        return a + b;
      }, 0);
      const roundedDuration = customRound(durationInHours);
      const pph = getMemberLevelAndPPH(await getMember(formData.memberId));
      const pointsCoefficient = getMemberPoints(await getMember(formData.memberId));
      let toBePaid = 0;
      let member_due = sessionMidUpdating.data.data.attributes.member_due;
      if (sessionMidUpdating.data.data.attributes.member_active) {
        member_due = pph;
        toBePaid = member_due + guestsTotal - guestsPaid;
      } else {
        toBePaid = guestsTotal - guestsPaid;
      }
      const totalDue = member_due + guestsTotal;
      const totalPointsEarned = pointsCoefficient * totalDue;


      const updatedSession = await axios.put(`REDACTED/api/sessions/${sessionToUpdate.id}`, {
        data: {
          active: false,
          end_time: endTime,
          duration: duration,
          total_due: totalDue.toFixed(2),
          member_et: endTime,
          member_due: member_due,
          member_active: false

        }
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          populate: 'members,level,guests',
        },

      });

      const updatedMember = await axios.put(`REDACTED/api/members/${memberId}`, {
        data: {
          points: updateMemberPoints(await getMember(formData.memberId), totalPointsEarned).toFixed(2)
        }
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setIsLoading(false)

      onSubmit(updatedSession.data.data, totalPointsEarned, toBePaid);
    } catch (error) {
      console.error('Error ending session:', error);
      setError('An error occurred while ending the session.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
      {isLoading && <Spinner />}

      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="mb-4 py-6">
        <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">Member ID:</label>
        <input
          type="text"
          id="memberId"
          name="memberId"
          value={formData.memberId}
          onChange={handleInputChange}
          placeholder="Enter member ID"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      {/* <div className="mb-4">
        <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700">Session ID:</label>
        <input
          type="text"
          id="sessionId"
          name="sessionId"
          value={formData.sessionId}
          onChange={handleInputChange}
          placeholder="Enter session ID"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div> */}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
      >
        End Session
      </button>
    </form>
  );
};

export default EndSessionForm;