import React, { useState } from 'react';
import axios from 'axios';

const NewMemberForm = ({ members, authToken, onSubmit }) => {
  const [formData, setFormData] = useState({
    membership_id: '',
    name: '',
    phone_number: ''
  });
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if member with the same membership ID already exists
    const memberExists = members.some(member => member.id === parseInt(formData.membership_id));
    if (memberExists) {
      setError('A member with the same membership ID already exists.');
      return;
    }

    try {
      await axios.post('REDACTED/api/members', {
        data: {
          membership_id: parseInt(formData.membership_id),
          name: formData.name,
          phone_number: formData.phone_number
        }
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      onSubmit();
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error}</div>}
      <div>
        <label htmlFor="membership_id">Membership ID:</label>
        <input
          type="text"
          id="membership_id"
          name="membership_id"
          value={formData.membership_id}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="phone_number">Phone Number:</label>
        <input
          type="text"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit">Add Member</button>
    </form>
  );
};

export default NewMemberForm;
