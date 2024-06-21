import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import NewSessionForm from './NewSessionForm';
import EndSessionForm from './EndSessionForm';
import Receipt from './Receipt';
import GuestReceipt from './GuestReceipt';
import MemberReceipt from './MemberReceipt';
import Spinner from './Spinner.js';

import moment from 'moment';
import './Sessions.css';

const authToken = '6bd61b66c9ef1c6358b40c1d23978a5b6a66012680330896e281648cf030bc341fce3ff77c1b49f668d6d6427eb8993391d4d52f3e9b0421589fec5f9d11049852968b12fb9f7ca9a50efb6f4a386a6d1b3bd558df2cfeb16f4020da5cfcefdbb8f6f23b8ab326cbaafb587adef3f2de05434ce908556e604f3039acbfa1cbe4';

const Sessions = () => {
  const [showForm, setShowForm] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  // const [branchOptions, setBranchOptions] = useState([]);
  // const [gameOptions, setGameOptions] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [guestReceipt, setGuestReceipt] = useState(null);
  const [memberReceipt, setMemberReceipt] = useState(null);
  // const [members, setMembers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [pointsEarned, setPointsEarned] = useState(null);
  const [error, setError] = useState(null);
  const [searchedMember, setSearchedMember] = useState('');
  const [toBePaid, setToBePaid] = useState(null);
  const [currentTime, setCurrentTime] = useState(moment());
  const [isLoading, setIsLoading] = useState(false);

  const getMember = async (memberId) => {
    const memberResponse = await axios.get(`https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/members?filters[membership_id][$eq]=${memberId}`, {
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

  const handleFilterChange = () => {
    if (searchedMember) {
      return activeSessions.filter(session => session.attributes.members.data[0].attributes.membership_id === parseInt(searchedMember))

    }
    return activeSessions;
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await axios.get('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/sessions', {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
        params: {
          populate: 'members,level,guests,branch',
        },
      });
      // const branchesResponse = await axios.get('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/branches', {
      //   headers: {
      //     Authorization: `bearer ${authToken}`,
      //   },
      //   params: {
      //     populate: 'games',
      //   },
      // });
      // const gamesResponse = await axios.get('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/games', {
      //   headers: {
      //     Authorization: `bearer ${authToken}`,
      //   },
      //   params: {
      //     populate: 'branches',
      //   },
      // });
      // const membersResponse = await axios.get('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/members', {
      //   headers: {
      //     Authorization: `bearer ${authToken}`,
      //   },
      //   params: {
      //     populate: 'level',
      //   },
      // });
      const levelsResponse = await axios.get('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/levels', {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      });

      const sessionsData = response.data.data;

      const active = sessionsData.filter((session) => session.attributes.active);
      // setBranchOptions(branchesResponse.data.data);
      // setGameOptions(gamesResponse.data.data);
      // setMembers(membersResponse.data);
      setActiveSessions(active);
      setLevels(levelsResponse.data);
      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data:');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000); // Update every second

    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, []);
  const handleAddSession = () => {
    // if (members.length === 0) {
    //   setError("Data still loading, please wait!");
    // } else {
      setError(null);
      setShowForm('add');
    // }

  }


  const handleAddGuest = async (session) => {
    try {
      const sessionGuests = session.attributes.guests.data.map((guest) => guest.id);
      const newGuest = await axios.post('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/guests', {
        data: {
          start_time: moment(),
          active: true,
        }
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      });
      sessionGuests.push(newGuest.data.data.id);
      await axios.put(`https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/sessions/${session.id}`, {
        data: {
          guests: sessionGuests
        }
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      });
      fetchData();
    } catch (error) {
      console.error('Error adding guest:', error);
      setError('Error adding guest:');
    }
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
      await axios.put(`https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/guests/${parseInt(guest.id)}`, {
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

      // Show guest receipt modal
      setGuestReceipt({
        guestId: guest.id,
        startTime: startTime.format("YYYY-MM-DD HH:mm:ss"),
        endTime: endTime.format("YYYY-MM-DD HH:mm:ss"),
        duration: duration,
        totalDue: totalDue.toFixed(2)
      });

      fetchData();
      setError('');
    } catch (error) {
      console.error('Error removing guest:', error);
      setError('Error removing guest');
    }
  };
  const handleLeaveMember = async (session) => {
    const endTime = moment()
    const duration = moment.utc(endTime.diff(session.attributes.start_time)).format("HH:mm:ss");
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
    const member_due = pph;
    await axios.put(`https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/sessions/${session.id}`, {
      data: {
        member_active: false,
        member_et: endTime,
        member_due: member_due
      }
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      }
    });
    fetchData();
    setMemberReceipt({
      memberId: session.attributes.members.data[0].attributes.membership_id,
      startTime: session.attributes.start_time,
      endTime: endTime.format("YYYY-MM-DD HH:mm:ss"),
      duration: duration,
      totalDue: member_due.toFixed(2)
    });

  }
  const handleEndSession = () => {
    // if (members.length === 0) {
      // setError("Data still loading, please wait!");
    // } else {
      setError(null);
      setShowForm('end');
    // }
  };

  const handleFormSubmit = (session, points_earned, toBePaid) => {
    setShowForm(null);
    fetchData();
    setReceipt(session);
    setPointsEarned(points_earned);
    setToBePaid(toBePaid)
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
  };
  const filteredSessions = handleFilterChange()
  return (
    <div className="flex sessions-container container mx-auto bg-white rounded-lg px-4 py-6">
      {isLoading && <Spinner />}

      <h1 className="text-2xl font-bold mb-6">Sessions</h1>
      <div className="mt-6">
        <button
          className="mr-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleAddSession}
        >
          New Session
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={handleEndSession}
        >
          End Session
        </button>
      </div>
      {showForm === 'add' && (
        <NewSessionForm
          activeSessions={activeSessions}
          authToken={authToken}
          onSubmit={handleFormSubmit}
        />
      )}
      {showForm === 'end' && (
        <EndSessionForm
          activeSessions={activeSessions}
          authToken={authToken}
          onSubmit={handleFormSubmit}
          levels={levels}
        />
      )}
      {receipt && <Receipt session={receipt} onRemove={handleRemoveReceipt} points_earned={pointsEarned} toBePaid={toBePaid} />}
      {guestReceipt && <GuestReceipt receipt={guestReceipt} onRemove={() => setGuestReceipt(null)} />}
      {memberReceipt && <MemberReceipt receipt={memberReceipt} onRemove={() => setMemberReceipt(null)} />}
      <div>
        <input
          type="text"
          className="p-2 border border-gray-300 rounded-md mr-2"
          placeholder="Search by member ID."
          value={searchedMember}
          onChange={(e) => setSearchedMember(e.target.value)}
        />
      </div>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-center">Branch</th>
            <th className="px-4 py-2 text-center">Session ID</th>
            <th className="px-4 py-2 text-center">Start Time</th>
            <th className="px-4 py-2 text-center">Duration</th>
            <th className="px-4 py-2 text-center">Member</th>
            <th className="px-4 py-2 text-center">Guests</th>
            <th className="px-4 py-2 text-center">Add Guest</th>
          </tr>
        </thead>
        <tbody>
          {filteredSessions.map((session) => {
            const startTime = moment(session.attributes.start_time);
            const duration = moment.utc(moment().diff(startTime)).format("HH:mm:ss");
            return (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-center">{session.attributes.branch.data.attributes.name}</td>
                <td className="px-4 py-2 text-center">{session.id}</td>
                <td className="px-4 py-2 text-center">{moment(session.attributes.start_time).format("DD/MM/YY, hh:mm A")}</td>
                <td className="px-4 py-2 text-center">{duration}</td>
                <td className="px-4 py-2 text-center">
                  <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <tbody>
                      <tr key={session.attributes.members.data[0].id} className="hover:bg-gray-50">
                        <td>{session.attributes.members.data[0].attributes.membership_id}</td>
                        <td>{session.attributes.member_active ? (
                          <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleLeaveMember(session)}>Leave</button>
                        ) : (
                          <span>Member Left.</span>

                        )}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td className="px-4 py-2 text-center">
                  {session.attributes.guests.data.length > 0 ? (<table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-center">Guest ID</th>
                        <th className="px-4 py-2 text-center">Start Time</th>
                        <th className="px-4 py-2 text-center">End Time</th>
                        <th className="px-4 py-2 text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.attributes.guests.data.map((guest) => {
                        return (
                          <tr key={guest.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-center">{guest.id}</td>
                            <td className="px-4 py-2 text-center">{moment(guest.attributes.start_time).format("hh:mm A")}</td>
                            <td className="px-4 py-2 text-center">{moment(guest.attributes.end_time).format("hh:mm A") === 'Invalid date' ? 'Guest session still active.' : moment(guest.attributes.end_time).format("hh:mm A")}</td>
                            <td className="px-4 py-2 text-center">
                              {guest.attributes.active ? (
                                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleRemoveGuest(session, guest)}>Leave</button>
                              ) : (
                                <span>Guest Left.</span>
                              )}
                            </td>

                          </tr>
                        )
                      })

                      }
                    </tbody>
                  </table>) : (<span className='flex px-4 py-2 justify-center'>None</span>)}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center items-center h-full">
                    <button
                      className="mr-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-center"
                      onClick={() => handleAddGuest(session)}
                    >
                      Add
                    </button>
                  </div>
                  {/* <input
                  type="text"
                  className="p-2 border border-gray-300 rounded-md mr-2"
                  placeholder="Enter Guest ID"
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                />
                <button
                  className="mr-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={() => handleRemoveGuest(session)}
                >
                  Remove 
                </button> */}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
};

export default Sessions;