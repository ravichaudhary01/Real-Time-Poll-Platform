
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('gamified_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login - in real app, this would validate against a backend
    if (email && password) {
      const userData = {
        id: Date.now(),
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        joinDate: new Date().toISOString()
      };
      
      localStorage.setItem('gamified_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (email, password, name) => {
    // Mock registration
    if (email && password && name) {
      const userData = {
        id: Date.now(),
        email,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        joinDate: new Date().toISOString()
      };
      
      localStorage.setItem('gamified_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: 'All fields are required' };
  };

  const logout = () => {
    localStorage.removeItem('gamified_user');
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout
  };
}
