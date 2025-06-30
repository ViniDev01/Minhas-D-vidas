// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DividasPage from './pages/DividasPage';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
        <Route path="/dividas" element={
          <ProtectedRoute>
            <DividasPage />
          </ProtectedRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
