import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorAlert from './components/ErrorAlert';
import SuccessAlert from './components/SuccessAlert';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { SheetProvider } from './contexts/SheetContext';
import { SuccessProvider } from './contexts/SuccessContext';
import DashboardPage from './pages/DashboardPage';
import DebugLibraryPage from './pages/DebugLibraryPage';
import ImageLibraryPage from './pages/ImageLibraryPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './pages/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
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
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <LibraryProvider>
                        <ImageLibraryPage />
                      </LibraryProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/debug/library"
                  element={
                    <ProtectedRoute>
                      <DebugLibraryPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthProvider>
          </SuccessProvider>
        </ErrorProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
