import React from 'react';
import { CanvasEditor } from '../components/canvas/CanvasEditor';
import { ModeToggle } from '../components/pageView/ModeToggle';
import { PageDescriptionBanner } from '../components/pageView/PageDescriptionBanner';
import { PageViewer } from '../components/pageView/PageViewer';
import { PageSelector } from '../components/sheets/PageSelector';
import { SheetSidebar } from '../components/sheets/SheetSidebar';
import { Toolbar } from '../components/toolbar/Toolbar';
import { CanvasProvider } from '../contexts/CanvasContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSheet } from '../contexts/SheetContext';

const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { selectedSheet, selectedPage, isEditMode } = useSheet();

  return (
    <div className="d-flex flex-column vh-100">
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

              {/* Page Description Banner */}
              {selectedPage && <PageDescriptionBanner />}

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
                      <h5>{t('dashboard.noPageSelected')}</h5>
                      <p>{t('dashboard.selectPagePrompt')}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center text-muted">
                <h3>{t('dashboard.welcomeMessage')}</h3>
                <p>{t('dashboard.selectSheet')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
