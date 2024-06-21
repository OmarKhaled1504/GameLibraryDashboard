import React from 'react';

const Spinner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 animate-spin border-t-blue-500"></div>
    </div>
  );
};

export default Spinner;