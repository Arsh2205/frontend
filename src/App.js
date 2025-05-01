import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Callback from './pages/Callback';
import ReportVehicle from './pages/ReportVehicle';
import MyVehicles from './pages/MyVehicles';
import Admin from './pages/Admin'; // Added
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/report-vehicle"
            element={
              <PrivateRoute>
                <ReportVehicle />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-vehicles"
            element={
              <PrivateRoute>
                <MyVehicles />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;