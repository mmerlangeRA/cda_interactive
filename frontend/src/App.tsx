import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorAlert from './components/ErrorAlert';
import SuccessAlert from './components/SuccessAlert';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { SheetProvider } from './contexts/SheetContext';
import { SuccessProvider } from './contexts/SuccessContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './pages/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ErrorProvider>
        <SuccessProvider>
          <ErrorAlert />
          <SuccessAlert />
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <SheetProvider>
                      <DashboardPage />
                    </SheetProvider>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </SuccessProvider>
      </ErrorProvider>
    </BrowserRouter>
  );
}

export default App;
