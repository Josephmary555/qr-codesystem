import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Use the custom axios instance
import { toast } from 'react-toastify';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    institution: '',
    role: 'event_admin',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, institution, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !institution) {
      return toast.error('Please fill out all fields.');
    }
    setIsLoading(true);
    try {
      // Rely on the global axios instance for auth headers.
      // This is a protected route for a super_admin to create other admins.
      await api.post('/admin/register', {
        name, email, password, institution, role
      });
      toast.success('New admin created successfully!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register Admin</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className="w-full p-2 border rounded"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full p-2 border rounded"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full p-2 border rounded"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Institution</label>
            <input
              type="text"
              name="institution"
              value={institution}
              onChange={onChange}
              className="w-full p-2 border rounded"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              <option value="event_admin">Event Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;