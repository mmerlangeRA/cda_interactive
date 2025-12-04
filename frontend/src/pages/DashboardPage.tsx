import React from 'react';
import { CanvasEditor } from '../components/canvas/CanvasEditor';
import { ElementInspector } from '../components/canvas/ElementInspector';
import { ReferencePanel } from '../components/canvas/ReferencePanel';
import { ModeToggle } from '../components/pageView/ModeToggle';
import { PageDescriptionBanner } from '../components/pageView/PageDescriptionBanner';
import { PageViewer } from '../components/pageView/PageViewer';
import { PageSelector } from '../components/sheets/PageSelector';
import { SheetSidebar } from '../components/sheets/SheetSidebar';
import { Toolbar } from '../components/toolbar/Toolbar';
import { getReferenceModel } from '../config/references';
import { CanvasProvider, useCanvas } from '../contexts/CanvasContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ReferenceProvider, useReference } from '../contexts/ReferenceContext';
import { useSheet } from '../contexts/SheetContext';
import { ReferenceValue } from '../types/reference';

const EditorLayout: React.FC = () => {
  const { addReferenceElement, loadElements, clearElements } = useCanvas();
  const { fetchReferences } = useReference();
  const { selectedPage } = useSheet();

  // Fetch references when component mounts
  React.useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Load elements when page changes
  React.useEffect(() => {
    if (selectedPage) {
      loadElements(selectedPage.id, 'en'); // TODO: Use current language from context
    } else {
      clearElements();
    }
  }, [selectedPage, loadElements, clearElements]);

  const handleSpawnReference = (reference: ReferenceValue) => {
    // Get the handler for this reference type
    const model = getReferenceModel(reference.type);
    if (!model) {
      console.error(`No handler found for reference type: ${reference.type}`);
      return;
    }

    // Use the handler to spawn a canvas element from the reference
    const canvasElement = model.handler.spawn(reference, { x: 400, y: 300 });
    addReferenceElement(canvasElement);
  };

  return (
    <div className="h-100 d-flex flex-column">
      <Toolbar />
      <div className="flex-grow-1 d-flex overflow-hidden">
        {/* Left Panel - Reference Library */}
        <div style={{ width: '300px', borderRight: '1px solid #dee2e6' }}>
          <ReferencePanel onSpawnReference={handleSpawnReference} />
        </div>

        {/* Center - Canvas Editor */}
        <div className="flex-grow-1 d-flex justify-content-center align-items-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
          <CanvasEditor />
        </div>

        {/* Right Panel - Element Inspector */}
        <div style={{ width: '300px', borderLeft: '1px solid #dee2e6' }}>
          <ElementInspector />
        </div>
      </div>
    </div>
  );
};

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
                    // Edit Mode - Show Canvas Editor with 3-column layout
                    <ReferenceProvider>
                      <CanvasProvider>
                        <EditorLayout />
                      </CanvasProvider>
                    </ReferenceProvider>
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
