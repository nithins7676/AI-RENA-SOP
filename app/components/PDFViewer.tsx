import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Use a reliable CDN for the worker
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface PDFViewerProps {
  guidelinesPdf: string | null;
  sopPdf: string | null;
  guidelinesPageNumber?: number;
  sopPageNumber?: number;
  onClose: (documentType: 'guidelines' | 'sop') => void;
}

type PDFState = {
  numPages: number | null;
  pageNumber: number;
  scale: number;
  rotation: number;
  isSearchOpen: boolean;
};

export const PDFViewer = ({ 
  guidelinesPdf, 
  sopPdf, 
  guidelinesPageNumber,
  sopPageNumber,
  onClose 
}: PDFViewerProps) => {
  // Track document loading state
  const [guidelinesDocumentLoaded, setGuidelinesDocumentLoaded] = useState(false);
  const [sopDocumentLoaded, setSopDocumentLoaded] = useState(false);
  
  // Initialize state with default values - will update after document loads
  const [guidelinesState, setGuidelinesState] = useState<PDFState>({
    numPages: null,
    pageNumber: 1, // Will be updated to guidelinesPageNumber when document loads
    scale: 1.2,
    rotation: 0,
    isSearchOpen: false,
  });

  const [sopState, setSopState] = useState<PDFState>({
    numPages: null,
    pageNumber: 1, // Will be updated to sopPageNumber when document loads
    scale: 1.2,
    rotation: 0,
    isSearchOpen: false,
  });

  // Determine if we're showing one or two PDFs
  const showBothPdfs = guidelinesPdf && sopPdf;
  const showNoPdf = !guidelinesPdf && !sopPdf;


  // Add this useEffect after your existing state initialization

// Add this useEffect after your existing state initialization

useEffect(() => {
  // Only attempt to navigate when:
  // 1. Document is loaded
  // 2. We have page numbers
  // 3. A target page is specified
  if (guidelinesDocumentLoaded && 
      guidelinesState.numPages && 
      guidelinesPageNumber) {
    
    console.log('Document ready, now navigating to page:', guidelinesPageNumber);
    
    // Make sure we're within valid page range
    const targetPage = Math.min(
      Math.max(1, guidelinesPageNumber), 
      guidelinesState.numPages
    );
    
    setGuidelinesState(prev => ({ 
      ...prev, 
      pageNumber: targetPage
    }));
  }
}, [guidelinesDocumentLoaded, guidelinesState.numPages, guidelinesPageNumber]);

// Add similar code for the SOP document
useEffect(() => {
  if (sopDocumentLoaded && 
      sopState.numPages && 
      sopPageNumber) {
    
    console.log('SOP document ready, now navigating to page:', sopPageNumber);
    
    const targetPage = Math.min(
      Math.max(1, sopPageNumber), 
      sopState.numPages
    );
    
    setSopState(prev => ({ 
      ...prev, 
      pageNumber: targetPage
    }));
  }
}, [sopDocumentLoaded, sopState.numPages, sopPageNumber]);
  // Reset loaded state when PDF changes
  useEffect(() => {
    if (guidelinesPdf) {
      setGuidelinesDocumentLoaded(false);
    }
  }, [guidelinesPdf]);

  useEffect(() => {
    if (sopPdf) {
      setSopDocumentLoaded(false);
    }
  }, [sopPdf]);

  

 // For Guidelines PDF
// Replace the current onGuidelinesLoadSuccess function with this:

function onGuidelinesLoadSuccess({ numPages }: { numPages: number }) {
  console.log("Guidelines PDF loaded with", numPages, "pages");
  
  // Only set the numPages, don't try to set page number here
  setGuidelinesState(prev => ({
    ...prev,
    numPages
  }));
  
  // Mark document as loaded - the useEffect will handle page navigation
  setGuidelinesDocumentLoaded(true);
}

// Also replace onSopLoadSuccess with this:

function onSopLoadSuccess({ numPages }: { numPages: number }) {
  console.log("SOP PDF loaded with", numPages, "pages");
  
  // Only set the numPages, don't try to set page number here
  setSopState(prev => ({
    ...prev,
    numPages
  }));
  
  // Mark document as loaded - the useEffect will handle page navigation
  setSopDocumentLoaded(true);
}

  function changeGuidelinesPage(offset: number) {
    setGuidelinesState(prev => ({
      ...prev,
      pageNumber: Math.min(Math.max(prev.pageNumber + offset, 1), prev.numPages || 1)
    }));
  }

  function zoomGuidelinesIn() {
    setGuidelinesState(prev => ({ ...prev, scale: Math.min(prev.scale + 0.2, 2.5) }));
  }

  function zoomGuidelinesOut() {
    setGuidelinesState(prev => ({ ...prev, scale: Math.max(prev.scale - 0.2, 0.6) }));
  }

  function rotateGuidelines() {
    setGuidelinesState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  }

  function changeSopPage(offset: number) {
    setSopState(prev => ({
      ...prev,
      pageNumber: Math.min(Math.max(prev.pageNumber + offset, 1), prev.numPages || 1)
    }));
  }

  function zoomSopIn() {
    setSopState(prev => ({ ...prev, scale: Math.min(prev.scale + 0.2, 2.5) }));
  }

  function zoomSopOut() {
    setSopState(prev => ({ ...prev, scale: Math.max(prev.scale - 0.2, 0.6) }));
  }

  function rotateSop() {
    setSopState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  }

  // No PDF view
  if (showNoPdf) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50">
        <div className="text-center p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-medium mb-2">No PDF Selected</h3>
          <p className="text-sm max-w-md text-gray-500">
            Select a section from the left panel to view the corresponding PDF document here.
          </p>
        </div>
      </div>
    );
  }

  // Stack view implementation
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Guidelines PDF */}
      {guidelinesPdf && (
        <div className={`flex flex-col ${showBothPdfs ? 'h-1/2' : 'h-full'} border-b`}>
          {/* Guidelines Header */}
          <div className="bg-blue-50 p-3 border-b flex flex-wrap justify-between items-center gap-2">
            <div className="text-sm font-medium text-blue-800 flex items-center">
              <div className="bg-blue-100 p-1 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="truncate max-w-[250px]">
                Guidelines: {guidelinesPdf.split('/').pop()}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={zoomGuidelinesOut} 
                className="p-1.5 rounded text-blue-600 hover:bg-blue-100 transition"
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs bg-white px-2 py-1 rounded border min-w-8 text-center">
                {Math.round(guidelinesState.scale * 100)}%
              </span>
              <button 
                onClick={zoomGuidelinesIn} 
                className="p-1.5 rounded text-blue-600 hover:bg-blue-100 transition"
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={rotateGuidelines} 
                className="p-1.5 rounded text-blue-600 hover:bg-blue-100 transition ml-1"
                title="Rotate"
              >
                <RotateCw size={16} />
              </button>
              <button
                onClick={() => onClose('guidelines')}
                className="p-1.5 rounded text-blue-600 hover:bg-blue-100 transition ml-1"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Guidelines Navigation */}
          <div className="bg-blue-50 p-2 border-b flex justify-center">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => changeGuidelinesPage(-1)} 
                disabled={guidelinesState.pageNumber <= 1}
                className="px-2 py-1 rounded text-xs bg-white border disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1 transition"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <div className="bg-white border rounded px-2 py-1 flex items-center text-xs">
                <input 
                  type="number"
                  value={guidelinesState.pageNumber}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0 && val <= (guidelinesState.numPages || 1)) {
                      setGuidelinesState(prev => ({ ...prev, pageNumber: val }));
                    }
                  }}
                  className="w-8 text-center focus:outline-none"
                />
                <span className="text-gray-600">/ {guidelinesState.numPages || '--'}</span>
              </div>
              <button 
                onClick={() => changeGuidelinesPage(1)} 
                disabled={guidelinesState.pageNumber >= (guidelinesState.numPages || 0)}
                className="px-2 py-1 rounded text-xs bg-white border disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1 transition"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          
          {/* Guidelines PDF Viewer */}
          <div className="flex-1 overflow-auto flex justify-center p-2 bg-blue-50 bg-opacity-30">
            <Document
              key={`guidelines-doc-${guidelinesPdf}`}
              file={guidelinesPdf}
              onLoadSuccess={onGuidelinesLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-full text-red-500 p-4">
                  <div className="text-center bg-white p-4 rounded-lg shadow-md max-w-sm">
                    <h3 className="font-medium mb-2">Error loading PDF</h3>
                    <p className="text-sm text-gray-600 mb-2">Path: {guidelinesPdf}</p>
                    <p className="text-xs">Make sure your PDF worker is properly configured.</p>
                  </div>
                </div>
              }
            >
              {guidelinesDocumentLoaded && guidelinesState.numPages !== null && guidelinesState.numPages > 0 && (
                <Page 
                  key={`guidelines-page-${guidelinesState.pageNumber}`}
                  pageNumber={guidelinesState.pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                  scale={guidelinesState.scale}
                  rotate={guidelinesState.rotation}
                  error={
                    <div className="text-red-500 bg-white p-2 rounded shadow">
                      Error loading page {guidelinesState.pageNumber}
                    </div>
                  }
                />
              )}
            </Document>
          </div>
        </div>
      )}
      
      {/* SOP PDF */}
      {sopPdf && (
        <div className={`flex flex-col ${showBothPdfs ? 'h-1/2' : 'h-full'}`}>
          {/* SOP Header */}
          <div className="bg-gray-50 p-3 border-b flex flex-wrap justify-between items-center gap-2">
            <div className="text-sm font-medium text-gray-800 flex items-center">
              <div className="bg-gray-200 p-1 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="truncate max-w-[250px]">
                SOP: {sopPdf.split('/').pop()}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={zoomSopOut} 
                className="p-1.5 rounded text-gray-600 hover:bg-gray-200 transition"
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs bg-white px-2 py-1 rounded border min-w-8 text-center">
                {Math.round(sopState.scale * 100)}%
              </span>
              <button 
                onClick={zoomSopIn} 
                className="p-1.5 rounded text-gray-600 hover:bg-gray-200 transition"
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={rotateSop} 
                className="p-1.5 rounded text-gray-600 hover:bg-gray-200 transition ml-1"
                title="Rotate"
              >
                <RotateCw size={16} />
              </button>
              <button
                onClick={() => onClose('sop')}
                className="p-1.5 rounded text-gray-600 hover:bg-gray-200 transition ml-1"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* SOP Navigation */}
          <div className="bg-gray-50 p-2 border-b flex justify-center">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => changeSopPage(-1)} 
                disabled={sopState.pageNumber <= 1}
                className="px-2 py-1 rounded text-xs bg-white border disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1 transition"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <div className="bg-white border rounded px-2 py-1 flex items-center text-xs">
                <input 
                  type="number"
                  value={sopState.pageNumber}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0 && val <= (sopState.numPages || 1)) {
                      setSopState(prev => ({ ...prev, pageNumber: val }));
                    }
                  }}
                  className="w-8 text-center focus:outline-none"
                />
                <span className="text-gray-600">/ {sopState.numPages || '--'}</span>
              </div>
              <button 
                onClick={() => changeSopPage(1)} 
                disabled={sopState.pageNumber >= (sopState.numPages || 0)}
                className="px-2 py-1 rounded text-xs bg-white border disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1 transition"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          
          {/* SOP PDF Viewer */}
          <div className="flex-1 overflow-auto flex justify-center p-2 bg-gray-100 bg-opacity-30">
            <Document
              key={`sop-doc-${sopPdf}`}
              file={sopPdf}
              onLoadSuccess={onSopLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-t-gray-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-full text-red-500 p-4">
                  <div className="text-center bg-white p-4 rounded-lg shadow-md max-w-sm">
                    <h3 className="font-medium mb-2">Error loading PDF</h3>
                    <p className="text-sm text-gray-600 mb-2">Path: {sopPdf}</p>
                    <p className="text-xs">Make sure your PDF worker is properly configured.</p>
                  </div>
                </div>
              }
            >
              {sopDocumentLoaded && sopState.numPages !== null && sopState.numPages > 0 && (
                <Page 
                  key={`sop-page-${sopState.pageNumber}`}
                  pageNumber={sopState.pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                  scale={sopState.scale}
                  rotate={sopState.rotation}
                  error={
                    <div className="text-red-500 bg-white p-2 rounded shadow">
                      Error loading page {sopState.pageNumber}
                    </div>
                  }
                />
              )}
            </Document>
          </div>
        </div>
      )}
    </div>
  );
};