// Function to handle user login
export const login = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  // The interceptor in api/axios.js will now pick up the token for subsequent requests.
};

// Function to handle user logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // Returns true if token exists, false otherwise
};

// Function to get the current user's role
export const getUserRole = () => {
  return localStorage.getItem('role');
};