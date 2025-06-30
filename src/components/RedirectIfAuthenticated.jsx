// src/components/RedirectIfAuthenticated.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RedirectIfAuthenticated({ children }) {
  const { user } = useAuth();

  if(user) {
    return <Navigate to="/dividas" replace />;
  }

  return children;
}

export default RedirectIfAuthenticated;
