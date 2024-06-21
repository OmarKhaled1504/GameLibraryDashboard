import React from 'react';
import moment from 'moment';

const MemberReceipt = ({ receipt, onRemove }) => {
  if (!receipt) return null;

  return (
    <div className="relative max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Memeber Receipt</h2>
      <p className="mb-2"><strong>Member ID:</strong> {receipt.memberId}</p>
      <p className="mb-2"><strong>Start Time:</strong> {receipt.startTime ? moment(receipt.startTime).format("DD/MM/YY, hh:mm A") : 'N/A'}</p>
      <p className="mb-2"><strong>End Time:</strong> {receipt.endTime ? moment(receipt.endTime).format("DD/MM/YY, hh:mm A") : 'N/A'}</p>
      <p className="mb-2"><strong>Duration:</strong> {receipt.duration} </p>
      <p className="mb-2"><strong>Total Due:</strong> {receipt.totalDue} EGP</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={onRemove}
      >
        Done
      </button>
    </div>
  );
};

export default MemberReceipt;