import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import Spinner from './Spinner.js';

const authToken = '6bd61b66c9ef1c6358b40c1d23978a5b6a66012680330896e281648cf030bc341fce3ff77c1b49f668d6d6427eb8993391d4d52f3e9b0421589fec5f9d11049852968b12fb9f7ca9a50efb6f4a386a6d1b3bd558df2cfeb16f4020da5cfcefdbb8f6f23b8ab326cbaafb587adef3f2de05434ce908556e604f3039acbfa1cbe4';

const Summary = () => {
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [inactiveSessions, setInactiveSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const fetchData = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await axios.get('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/sessions', {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
        params: {
          populate: 'members,branch,guests',
        },
      });
      
      const allSessions = response.data.data;
      const inactive = allSessions.filter((session) => !session.attributes.active);
      setInactiveSessions(inactive);
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching data:', error);
    }

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = () => {
    if (startDate && endDate) {
      return inactiveSessions.filter((session) => {
        const sessionStartTime = moment(session.attributes.start_time);
        const sessionEndTime = moment(session.attributes.end_time);
        const filterStart = moment(startDate);
        const filterEnd = moment(endDate);

        return sessionStartTime.isBetween(filterStart, filterEnd, undefined, '[]') && sessionEndTime.isBetween(filterStart, filterEnd, undefined, '[]');
      });
    }
    return inactiveSessions;
  };

  const filteredSessions = handleFilterChange();
  
  const totalDue = filteredSessions.reduce((total, session) => {
    return total + (session.attributes.total_due || 0);
  }, 0);

  return (
    <div className="container mx-auto bg-white rounded-lg px-4 py-6 flex flex-col items-center">
      {isLoading && <Spinner />}

  <h1 className="text-2xl font-bold mb-6 text-center">Summary</h1>
  <div className="filter-container mb-4 flex justify-center space-x-4">
    <label className="block">
      Start Date:
      <input
        className="mt-1 block rounded-md border-gray-300 shadow-sm"
        type="datetime-local"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
    </label>
    <label className="block">
      End Date:
      <input
        className="mt-1 block rounded-md border-gray-300 shadow-sm"
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </label>
  </div>
  <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-2 text-center">Branch</th>
        <th className="px-4 py-2 text-center">Session ID</th>
        <th className="px-4 py-2 text-center">Start Time</th>
        <th className="px-4 py-2 text-center">End Time</th>
        <th className="px-4 py-2 text-center">Duration</th>
        <th className="px-4 py-2 text-center">Total Paid</th>
        <th className="px-4 py-2 text-center">Members ID</th>
        <th className="px-4 py-2 text-center">Guests</th>
      </tr>
    </thead>
    <tbody>
      {filteredSessions.map((session) => (
        <tr key={session.id} className="hover:bg-gray-50">
          <td className="px-4 py-2 text-center">{session.attributes.branch.data.attributes.name}</td>
          <td className="px-4 py-2 text-center">{session.id}</td>
          <td className="px-4 py-2 text-center">{moment(session.attributes.start_time).format("DD/MM/YY, h:mm a")}</td>
          <td className="px-4 py-2 text-center">{moment(session.attributes.end_time).format("DD/MM/YY, h:mm a")}</td>
          <td className="px-4 py-2 text-center">{session.attributes.duration}</td>
          <td className="px-4 py-2 text-center">{session.attributes.total_due}</td>
          <td className="px-4 py-2 text-center">{session.attributes.members.data.map((member) => member.attributes.membership_id).join(', ')}</td>
          <td>
          {session.attributes.guests.data.length > 0 ?(<table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-center">ID</th>
                        <th className="px-4 py-2 text-center">Start</th>
                        <th className="px-4 py-2 text-center">End</th>
                        <th className="px-4 py-2 text-center">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.attributes.guests.data.map((guest) =>{
                          return(
                            <tr key={guest.id} className="hover:bg-gray-50">
                               <td className="px-4 py-2 text-center">{guest.id}</td> 
                               <td className="px-4 py-2 text-center">{moment(guest.attributes.start_time).format("hh:mm A")}</td>
                               <td className="px-4 py-2 text-center">{moment(guest.attributes.end_time).format("hh:mm A") === 'Invalid date' ? 'Guest session still active.': moment(guest.attributes.end_time).format("hh:mm A") }</td>
                               <td className="px-4 py-2 text-center">{guest.attributes.guest_due.toFixed(2)} EGP</td>
                           
                            </tr>
                          )
                      })
                        
                      }
                    </tbody>
                  </table>):
                  (<span className='flex px-4 py-2 justify-center'>None</span>)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  <div className="total-due mt-6">
    <h2 className="text-xl font-semibold">Period Total: {totalDue.toFixed(2)} EGP</h2>
  </div>
</div>


  );
};

export default Summary;