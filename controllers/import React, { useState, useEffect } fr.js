import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; // Use the custom axios instance
import { toast } from 'react-toastify';
import { useSearchParams, Link } from 'react-router-dom';

const User = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventId: '',
  });
  const [searchParams] = useSearchParams();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Pre-fill eventId from URL query parameter e.g. /?eventId=123
    const eventIdFromQuery = searchParams.get('eventId');
    if (eventIdFromQuery) {
      setFormData((prev) => ({ ...prev, eventId: eventIdFromQuery }));
    }
  }, [searchParams]);

  const { name, email, eventId } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !eventId) {
      return toast.error('Please fill in all fields');
    }
    try {
      // The backend likely expects eventId to be a number
      const res = await api.post(
        '/users/register',
        {
          name,
          email,
          eventId: Number(eventId),
        },
        // Prevent sending stale auth headers on a public route
        { headers: { Authorization: null } }
      );
      toast.success(res.data.message || 'Registration successful! Check your email for the QR code.');
      setIsRegistered(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  if (isRegistered) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Registration Successful!</h2>
          <p className="text-gray-700">
            Thank you for registering. Please check your email for your event QR code.
          </p>
          <Link to="/" className="mt-6 inline-block text-blue-500 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Event Registration</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="eventId" className="block text-gray-700 font-bold mb-2">
              Event ID
            </label>
            <input
              type="text"
              id="eventId"
              name="eventId"
              value={eventId}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Event ID from your invitation"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Register
            </button>
          </div>
        </form>
      </div>
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Are you an admin?{' '}
          <Link to="/admin-login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default User;