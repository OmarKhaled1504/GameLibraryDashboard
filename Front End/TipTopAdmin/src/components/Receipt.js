import React from 'react';
import moment from 'moment';

const Receipt = ({ session, onRemove, points_earned, toBePaid }) => {
  if (!session) return null;
  const { branch, start_time, end_time, duration, members } = session.attributes || {};
  return (
    <div className="relative max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* <button
        className="absolute top-2 right-2 text-red-500 font-bold"
        onClick={onRemove}
      >
        X
      </button> */}
      <h2 className="text-2xl font-semibold mb-4">Session Receipt</h2>
      {branch && branch.data && branch.data.attributes && (
        <p className="mb-2"><strong>Branch:</strong> {branch.data.attributes.name}</p>
      )}
      <p className="mb-2"><strong>Session ID:</strong> {session.id}</p>
      <p className="mb-2"><strong>Session Start Time:</strong> {start_time ? moment(start_time).format("DD/MM/YY, hh:mm A") : 'N/A'}</p>
      <p className="mb-2"><strong>Session End Time:</strong> {end_time ? moment(end_time).format("DD/MM/YY, hh:mm A") : 'N/A'}</p>
      <p className="mb-2"><strong>Session Duration:</strong> {duration || 'N/A'}</p>
      <p className="mb-2"><strong>Member ID:</strong> {members.data.map((member) => member.attributes.membership_id).join(', ')}</p>
      <p className="mb-2"><strong>Member Price:</strong> {session.attributes.member_due.toFixed(2)} EGP</p>

      <p className="mb-2"><strong>Guests:</strong> {session.attributes.guests.data.length > 0 ?(<table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-center">Guest ID</th>
                        <th className="px-4 py-2 text-center">Start Time</th>
                        <th className="px-4 py-2 text-center">End Time</th>
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
                  (<span className='flex px-4 py-2 justify-center'>None</span>)}</p>
      <p className="mb-2"><strong>To Be Paid:</strong> {toBePaid.toFixed(2)} EGP</p>

      <p className="mb-2"><strong>Session Total:</strong> {session.attributes.total_due.toFixed(2)} EGP</p>
      <p className="mb-2"><strong>Points Earned:</strong> {points_earned.toFixed(2)}</p>
      <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => onRemove(null)}
        >
          Done
        </button>
    </div>
  );
};

export default Receipt;