import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AccessDenied } from './components/auth/AccessDenied';
import { RequireRole } from './components/auth/RequireRole';
import ErrorAlert from './components/ErrorAlert';
import SuccessAlert from './components/SuccessAlert';
import { APP_ROUTES } from './config/routes';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { ReferenceProvider } from './contexts/ReferenceContext';
import { SheetProvider } from './contexts/SheetContext';
import { SuccessProvider } from './contexts/SuccessContext';
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
                
                {/* Dynamic routes from configuration */}
                {APP_ROUTES.map((route) => {
                  const PageComponent = route.element;
                  
                  // Determine provider based on route path
                  let element = (
                    <RequireRole 
                      allowedRoles={route.allowedRoles} 
                      fallback={<AccessDenied />}
                    >
                      <PageComponent />
                    </RequireRole>
                  );
                  
                  // Wrap with specific providers based on path
                  if (route.path === '/dashboard') {
                    element = <SheetProvider>{element}</SheetProvider>;
                  } else if (route.path === '/library' || route.path === '/debug/library') {
                    element = <LibraryProvider>{element}</LibraryProvider>;
                  } else if (route.path === '/references') {
                    // References need both LibraryProvider (for image selection) and ReferenceProvider
                    element = (
                      <LibraryProvider>
                        <ReferenceProvider>{element}</ReferenceProvider>
                      </LibraryProvider>
                    );
                  }
                  
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={<ProtectedRoute>{element}</ProtectedRoute>}
                    />
                  );
                })}
                
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
