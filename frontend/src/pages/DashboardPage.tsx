import React from 'react';
import { CanvasEditor } from '../components/canvas/CanvasEditor';
import { ModeToggle } from '../components/pageView/ModeToggle';
import { PageViewer } from '../components/pageView/PageViewer';
import { PageSelector } from '../components/sheets/PageSelector';
import { SheetSidebar } from '../components/sheets/SheetSidebar';
import { Toolbar } from '../components/toolbar/Toolbar';
import { useAuth } from '../contexts/AuthContext';
import { CanvasProvider } from '../contexts/CanvasContext';
import { useSheet } from '../contexts/SheetContext';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedSheet, selectedPage, isEditMode } = useSheet();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-0">Interactive Canvas Editor</h4>
          <small>
            Welcome, {user?.username} ({user?.role})
          </small>
        </div>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar */}
        <SheetSidebar />

        {/* Main Area */}
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          {selectedSheet ? (
            <>
              {/* Page Header */}
              <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <h5 className="mb-0">{selectedSheet.name}</h5>
                  <PageSelector />
                </div>
                <ModeToggle />
              </div>

              {/* Content Area */}
              <div className="flex-grow-1 overflow-auto">
                {selectedPage ? (
                  isEditMode ? (
                    // Edit Mode - Show Canvas Editor
                    <CanvasProvider>
                      <div className="h-100 d-flex flex-column">
                        <Toolbar />
                        <div className="flex-grow-1 d-flex justify-content-center align-items-center p-4">
                          <CanvasEditor />
                        </div>
                      </div>
                    </CanvasProvider>
                  ) : (
                    // View Mode - Show Page Viewer
                    <PageViewer />
                  )
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center text-muted">
                      <h5>No page selected</h5>
                      <p>Select a page from the dropdown above</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center text-muted">
                <h3>Welcome to Interactive Canvas Editor</h3>
                <p>Select a sheet from the sidebar to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
