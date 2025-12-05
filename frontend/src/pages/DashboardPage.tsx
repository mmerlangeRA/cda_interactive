import React, { useEffect, useRef } from 'react';
import { CanvasEditor } from '../components/canvas/CanvasEditor';
import { ElementInspector } from '../components/canvas/ElementInspector';
import { ModeToggle } from '../components/pageView/ModeToggle';
import { PageDescriptionBanner } from '../components/pageView/PageDescriptionBanner';
import { PageViewer } from '../components/pageView/PageViewer';
import { PageSelector } from '../components/sheets/PageSelector';
import { SheetSidebar } from '../components/sheets/SheetSidebar';
import { CompactToolbar } from '../components/toolbar/CompactToolbar';
import { getReferenceModel } from '../config/references';
import { CanvasProvider, useCanvas } from '../contexts/CanvasContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LibraryProvider } from '../contexts/LibraryContext';
import { ReferenceProvider, useReference } from '../contexts/ReferenceContext';
import { useSheet } from '../contexts/SheetContext';
import { ReferenceValue } from '../types/reference';

const EditorLayout: React.FC = () => {
  const { addReferenceElement, loadElements, clearElements, setCanvasDimensions } = useCanvas();
  const { fetchReferences } = useReference();
  const { selectedPage } = useSheet();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch references when component mounts
  React.useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Load elements when page changes
  React.useEffect(() => {
    if (selectedPage) {
      loadElements(selectedPage.id); // Uses current language from LanguageContext
    } else {
      clearElements();
    }
  }, [selectedPage, loadElements, clearElements]);

  // Calculate and set canvas dimensions based on available height (16:9 ratio)
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const availableHeight = containerHeight - 32; // Account for padding
        const maxHeight = Math.min(availableHeight, 800); // Max height of 800px
        setCanvasDimensions(maxHeight);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [setCanvasDimensions]);

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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CompactToolbar onSpawnReference={handleSpawnReference} />
      <div 
        ref={containerRef}
        style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}
      >
        {/* Center - Canvas Editor with 16:9 ratio */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backgroundColor: '#f8f9fa' }}>
          <CanvasEditor />
        </div>

        {/* Right Panel - Element Inspector */}
        <div style={{ width: '300px', borderLeft: '1px solid #dee2e6', display: 'flex', flexDirection: 'column' }}>
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
              <div className="flex-grow-1" style={{ overflow: 'hidden' }}>
                {selectedPage ? (
                  isEditMode ? (
                    // Edit Mode - Show Canvas Editor with 3-column layout
                    <LibraryProvider>
                      <ReferenceProvider>
                        <CanvasProvider>
                          <EditorLayout />
                        </CanvasProvider>
                      </ReferenceProvider>
                    </LibraryProvider>
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
