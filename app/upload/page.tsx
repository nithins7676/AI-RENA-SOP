"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface UploadedFile {
  name: string;
  size: number;
  path: string;
  type: 'sop' | 'guidelines';
  selected?: boolean;
}

export default function UploadPage() {
  const router = useRouter();
  const [sopFiles, setSopFiles] = useState<UploadedFile[]>([]);
  const [guidelineFiles, setGuidelineFiles] = useState<UploadedFile[]>([]);
  const [uploadType, setUploadType] = useState<'sop' | 'guidelines'>('sop');
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingExistingFiles, setLoadingExistingFiles] = useState(true);
  
  const [selectedSopFiles, setSelectedSopFiles] = useState<string[]>([]);
  const [selectedGuidelineFiles, setSelectedGuidelineFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchExistingFiles = async () => {
      try {
        setLoadingExistingFiles(true);
        const response = await fetch('/api/files');
        
        if (response.ok) {
          const data = await response.json();
          // Separate files by type
          const sopFiles = data.files.filter((file: UploadedFile) => file.type === 'sop');
          const guidelineFiles = data.files.filter((file: UploadedFile) => file.type === 'guidelines');
          
          // Pre-populate the dropzones with existing files
          setSopFiles(sopFiles);
          setGuidelineFiles(guidelineFiles);
          
          // Select first file of each type by default (optional)
          if (sopFiles.length > 0) {
            setSelectedSopFiles([sopFiles[0].path]);
          }
          if (guidelineFiles.length > 0) {
            setSelectedGuidelineFiles([guidelineFiles[0].path]);
          }
        }
      } catch (error) {
        console.error('Error fetching existing files:', error);
      } finally {
        setLoadingExistingFiles(false);
      }
    };
    
    fetchExistingFiles();
  }, []);

  // Handle file selection toggles
  const toggleFileSelection = (type: 'sop' | 'guidelines', path: string) => {
    if (type === 'sop') {
      setSelectedSopFiles(prev => 
        prev.includes(path) 
          ? prev.filter(p => p !== path)
          : [...prev, path]
      );
    } else {
      setSelectedGuidelineFiles(prev => 
        prev.includes(path) 
          ? prev.filter(p => p !== path)
          : [...prev, path]
      );
    }
  };

  const handleFileUpload = async (newFile: File, type: 'sop' | 'guidelines') => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', newFile);
      formData.append('type', type);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const fileData = await response.json();
      
      // Add the newly uploaded file to the appropriate array
      if (type === 'sop') {
        setSopFiles(prev => [...prev, fileData]);
        // Automatically select newly uploaded files
        setSelectedSopFiles(prev => [...prev, fileData.path]);
      } else {
        setGuidelineFiles(prev => [...prev, fileData]);
        // Automatically select newly uploaded files
        setSelectedGuidelineFiles(prev => [...prev, fileData.path]);
      }
      
      return fileData;
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Upload failed: ${errorMessage}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (type: 'sop' | 'guidelines', index: number) => {
    if (type === 'sop') {
      const fileToRemove = sopFiles[index];
      setSopFiles(sopFiles.filter((_, i) => i !== index));
      
      // Also remove from selected files if it was selected
      if (selectedSopFiles.includes(fileToRemove.path)) {
        setSelectedSopFiles(selectedSopFiles.filter(path => path !== fileToRemove.path));
      }
    } else {
      const fileToRemove = guidelineFiles[index];
      setGuidelineFiles(guidelineFiles.filter((_, i) => i !== index));
      
      // Also remove from selected files if it was selected
      if (selectedGuidelineFiles.includes(fileToRemove.path)) {
        setSelectedGuidelineFiles(selectedGuidelineFiles.filter(path => path !== fileToRemove.path));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSopFiles.length === 0) {
      setError("Please select at least one SOP document");
      return;
    }
    
    if (selectedGuidelineFiles.length === 0) {
      setError("Please select at least one regulation guideline");
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Update last used date for all selected files
      await fetch('/api/file-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paths: [...selectedSopFiles, ...selectedGuidelineFiles] 
        })
      });
      
      console.log(`Comparing SOPs (${selectedSopFiles.length} files) with guidelines (${selectedGuidelineFiles.length} files)`);
      
      // Call our API endpoint with multiple files
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sopPaths: selectedSopFiles,
          guidelinePaths: selectedGuidelineFiles
        })
      });
      
      if (!response.ok) {
        throw new Error('Comparison API request failed with status: ' + response.status);
      }
      
      // Redirect to home page to see results
      router.push('/');
    } catch (err: unknown) {
      console.error("Comparison failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Comparison failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 py-4 px-6 shadow-md">
        <h1 className="text-2xl font-semibold text-white">Regulation Comparison Tool</h1>
      </header>
      
      <main className="flex-1 container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Documents for Comparison</h2>
          <p className="text-gray-600 mb-6">
            Upload your Standard Operating Procedures (SOPs) and Regulation guidelines to identify compliance gaps and discrepancies.
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Two panels side by side */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Panel - SOP Files */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-700 flex items-center mb-3 pb-2 border-b">
                  <FileText className="mr-2 text-blue-600" size={20} />
                  SOP Documents <span className="ml-2 text-sm text-gray-500">({selectedSopFiles.length} selected)</span>
                </h3>
                
                <div className="h-64 overflow-auto">
                  {sopFiles.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-400 text-sm">No SOP files uploaded yet</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {sopFiles.map((file, index) => (
                        <li key={index} className={`flex items-center justify-between p-2 rounded border ${
                          selectedSopFiles.includes(file.path) 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedSopFiles.includes(file.path)}
                              onChange={() => toggleFileSelection('sop', file.path)}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <FileText className="text-blue-500 mr-2" size={16} />
                            <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">
                              {Math.round(file.size / 1024)} KB
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveFile('sop', index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove file"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              {/* Right Panel - Guideline Files */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-700 flex items-center mb-3 pb-2 border-b">
                  <FileText className="mr-2 text-blue-600" size={20} />
                  Regulation Guidelines <span className="ml-2 text-sm text-gray-500">({selectedGuidelineFiles.length} selected)</span>
                </h3>
                
                <div className="h-64 overflow-auto">
                  {guidelineFiles.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-400 text-sm">No guideline files uploaded yet</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {guidelineFiles.map((file, index) => (
                        <li key={index} className={`flex items-center justify-between p-2 rounded border ${
                          selectedGuidelineFiles.includes(file.path) 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedGuidelineFiles.includes(file.path)}
                              onChange={() => toggleFileSelection('guidelines', file.path)}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <FileText className="text-blue-500 mr-2" size={16} />
                            <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">
                              {Math.round(file.size / 1024)} KB
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveFile('guidelines', index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove file"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            {/* Upload Component Below Panels */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setUploadType('sop')}
                    className={`py-2 px-4 rounded-md ${
                      uploadType === 'sop'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                    disabled={uploadingFile}
                  >
                    Upload SOP
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('guidelines')}
                    className={`py-2 px-4 rounded-md ${
                      uploadType === 'guidelines'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                    disabled={uploadingFile}
                  >
                    Upload Guideline
                  </button>
                </div>
              </div>
              
              <div
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center 
                  ${uploadingFile ? 'bg-gray-100' : 'hover:bg-gray-100 cursor-pointer transition'}`}
                onClick={() => !uploadingFile && document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setUploadingFile(true);
                      // Process each file
                      Array.from(e.target.files).forEach(async (file) => {
                        await handleFileUpload(file, uploadType);
                      });
                      setUploadingFile(false);
                    }
                  }}
                  accept=".pdf"
                  className="hidden"
                  disabled={uploadingFile}
                />
                
                {uploadingFile ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                    <p className="text-sm text-gray-600">Uploading files...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-4" size={40} />
                    <p className="text-sm text-gray-500 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PDF files only</p>
                    <p className="mt-2 text-sm font-medium">
                      Currently uploading: <span className="text-blue-600">{uploadType === 'sop' ? 'SOP Documents' : 'Regulation Guidelines'}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {/* See Difference Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={uploading || uploadingFile || selectedSopFiles.length === 0 || selectedGuidelineFiles.length === 0}
                className={`
                  px-10 py-3 rounded-md text-white font-medium shadow-sm text-lg
                  ${(uploading || uploadingFile || selectedSopFiles.length === 0 || selectedGuidelineFiles.length === 0) 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'} 
                `}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Compare Selected Documents'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">Skip to comparison tool</Link>
        </div>
      </main>
    </div>
  );
}