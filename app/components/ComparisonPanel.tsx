import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, CheckCircle, AlertCircle, ChevronDown, FileText, X, Loader2, HelpCircle, BarChart2,  Info, Zap, BookOpen } from 'lucide-react';

interface ComparisonPanelProps {
  onOpenPdf: (pdfUrl: string, documentType: 'guidelines' | 'sop', pageNumber: number) => void;
}

type FilterOptions = {
  status: string[];
  severity: string[];
};

type ComparisonItem = {
  id: number;
  section: string;
  status: string;
  regulation: string;
  documentation: string;
  pdfUrl: string;
  guidelinesPdfUrl: string;
  sopPdfUrl: string;
  pageNumber: number;
  sopPageNumber: number;
  severity: string;
  comment: string;
  discrepancy_type?: string;
  content_location?: string;
};

export const ComparisonPanel = ({ onOpenPdf }: ComparisonPanelProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    severity: []
  });
  const filterRef = useRef<HTMLDivElement>(null);

  const [showHelp, setShowHelp] = useState(false);
  const [activeSortField, setActiveSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const hasActiveFilters = filters.status.length > 0 || filters.severity.length > 0;

  const handleSort = (field: string) => {
    if (activeSortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setActiveSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/comparison-results');
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setComparisonData(data);
          } else if (data.error) {
            setError(`Error: ${data.message || 'Failed to process comparison'}`);
            setComparisonData([]);
          } else {
            setComparisonData([
              {
                id: 1,
                section: "Section 4.2 - Temperature Controls",
                status: "discrepancy",
                regulation: "Products must be stored at 2-8°C with hourly temperature monitoring.",
                documentation: "Products stored at 2-10°C with daily temperature checks.",
                pdfUrl: "/content/guidelines/guidelines.pdf",
                guidelinesPdfUrl: "/content/guidelines/guidelines.pdf",
                sopPdfUrl: "/content/sop/sop.pdf",
                pageNumber: 12,
                sopPageNumber: 15,
                severity: "high",
                comment: "Two discrepancies found: (1) SOP specifies storage temperature up to 10°C while guideline limits to 8°C maximum, and (2) SOP requires only daily monitoring whereas guideline requires hourly monitoring."
              },
              {
                id: 2,
                section: "Section 5.1 - Documentation",
                status: "compliant",
                regulation: "All batch records must be retained for minimum 7 years.",
                documentation: "All batch records must be retained for minimum 7 years according to regulation 21 CFR part 211.180.",
                pdfUrl: "/content/guidelines/guidelines.pdf",
                guidelinesPdfUrl: "/content/guidelines/guidelines.pdf",
                sopPdfUrl: "/content/sop/sop.pdf",
                pageNumber: 18,
                sopPageNumber: 23,
                severity: "none",
                comment: "Fully compliant - all requirements properly implemented. SOP adds additional regulatory reference but maintains the same retention period."
              }
            ]);
          }
        } else {
          setError(`API Error: ${response.status}`);
          setComparisonData([]);
        }
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError('Failed to fetch comparison results');
        setComparisonData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComparisonData();
  }, []);

  const sortData = (data: ComparisonItem[]) => {
    if (!activeSortField) return data;
    
    return [...data].sort((a, b) => {
      // Use optional field access with nullish coalescing to handle possible undefined values
      let valueA = a[activeSortField as keyof ComparisonItem] ?? '';
      let valueB = b[activeSortField as keyof ComparisonItem] ?? '';
      
      // Convert to comparable types (ensuring string comparisons for strings only)
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      // For numeric comparison, ensure we're comparing numbers
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        // Number comparison - no conversion needed
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const stats = {
    total: comparisonData.length,
    compliant: comparisonData.filter(item => item.status === 'compliant').length,
    discrepancies: comparisonData.filter(item => item.status === 'discrepancy').length,
    highSeverity: comparisonData.filter(item => item.severity === 'high').length,
    mediumSeverity: comparisonData.filter(item => item.severity === 'medium').length,
    lowSeverity: comparisonData.filter(item => item.severity === 'low').length,
  };

  const filteredData = sortData(comparisonData.filter(item => {
    const matchesSearch = 
      item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regulation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = 
      filters.status.length === 0 || 
      filters.status.includes(item.status);
    
    const severityMatch = 
      filters.severity.length === 0 || 
      filters.severity.includes(item.severity);
    
    return matchesSearch && statusMatch && severityMatch;
  }));

  const handleSectionClick = (id: number) => {
    setActiveSection(activeSection === id.toString() ? null : id.toString());
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-l-red-500';
      case 'medium': return 'bg-amber-50 border-l-amber-500';
      case 'low': return 'bg-yellow-50 border-l-yellow-500';
      default: return '';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return (
        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
          High
        </span>
      );
      case 'medium': return (
        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
          Medium
        </span>
      );
      case 'low': return (
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          Low
        </span>
      );
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-12 bg-white">
        <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-700 font-medium">Analyzing documents</p>
        <p className="text-slate-500 text-sm mt-1">Processing comparison results</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-12 bg-white">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <p className="text-slate-800 font-semibold mb-2">Unable to load results</p>
        <p className="text-slate-600 max-w-md text-center mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center gap-2"
        >
          <Loader2 size={16} className="animate-spin" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100 sticky top-0 z-10 bg-white">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-500" size={18} />
            Compliance Analysis
          </h2>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 rounded-full transition-colors"
            title="Help & Tips"
          >
            <HelpCircle size={16} />
          </button>
        </div>
        
        {showHelp && (
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-3 text-xs text-blue-700">
            <div className="flex items-start gap-2">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Quick Tips</p>
                <ul className="space-y-1 ml-3 list-disc">
                  <li>Use search (<kbd className="px-1 py-0.5 bg-white rounded text-xs">Ctrl+F</kbd>) to find specific content</li>
                  <li>Click any row to expand details</li>
                  <li>Use filters (<kbd className="px-1 py-0.5 bg-white rounded text-xs">Ctrl+Shift+F</kbd>) to narrow results</li>
                  <li>Press <kbd className="px-1 py-0.5 bg-white rounded text-xs">Esc</kbd> to clear filters</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-50 p-3 rounded-md flex items-center">
            <BarChart2 size={18} className="text-indigo-500 mr-2" />
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-semibold text-slate-800">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-emerald-50 p-3 rounded-md flex items-center">
            <CheckCircle size={18} className="text-emerald-500 mr-2" />
            <div>
              <p className="text-xs text-emerald-700">Compliant</p>
              <p className="font-semibold text-emerald-800">{stats.compliant}</p>
            </div>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-md flex items-center">
            <AlertCircle size={18} className="text-amber-500 mr-2" />
            <div>
              <p className="text-xs text-amber-700">Discrepancies</p>
              <p className="font-semibold text-amber-800">{stats.discrepancies}</p>
            </div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md flex items-center">
            <Zap size={18} className="text-red-500 mr-2" />
            <div>
              <p className="text-xs text-red-700">High Severity</p>
              <p className="font-semibold text-red-800">{stats.highSeverity}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              id="search-regulations"
              type="text"
              placeholder="Search regulations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-md text-sm shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-md flex items-center gap-1 border ${
                hasActiveFilters 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Filter results"
            >
              <Filter size={16} />
              {hasActiveFilters && <span className="text-xs">Filtered</span>}
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-slate-200 z-20 overflow-hidden">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Filters</span>
                  {hasActiveFilters && (
                    <button 
                      className="text-xs text-indigo-500 hover:text-indigo-700"
                      onClick={() => setFilters({ status: [], severity: [] })}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                <div className="p-3 border-b border-slate-100">
                  <h4 className="text-xs font-medium text-slate-500 mb-2">Status</h4>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={filters.status.includes('compliant')}
                        onChange={() => toggleFilter('status', 'compliant')}
                        className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <CheckCircle size={14} className="text-emerald-500" />
                        Compliant
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={filters.status.includes('discrepancy')}
                        onChange={() => toggleFilter('status', 'discrepancy')}
                        className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <AlertCircle size={14} className="text-amber-500" />
                        Discrepancy
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="p-3">
                  <h4 className="text-xs font-medium text-slate-500 mb-2">Severity</h4>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={filters.severity.includes('high')}
                        onChange={() => toggleFilter('severity', 'high')}
                        className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                        High
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={filters.severity.includes('medium')}
                        onChange={() => toggleFilter('severity', 'medium')}
                        className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-1.5"></span>
                        Medium
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={filters.severity.includes('low')}
                        onChange={() => toggleFilter('severity', 'low')}
                        className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
                        Low
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {filters.status.map(status => (
              <div key={status} className="bg-slate-100 rounded-full px-2 py-1 text-xs flex items-center">
                {status === 'compliant' ? (
                  <CheckCircle size={12} className="text-emerald-500 mr-1" />
                ) : (
                  <AlertCircle size={12} className="text-amber-500 mr-1" />
                )}
                {status === 'compliant' ? 'Compliant' : 'Discrepancy'}
                <button 
                  onClick={() => toggleFilter('status', status)}
                  className="ml-1 hover:text-slate-900 p-0.5"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {filters.severity.map(severity => (
              <div key={severity} className="bg-slate-100 rounded-full px-2 py-1 text-xs flex items-center">
                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                  severity === 'high' ? 'bg-red-500' : 
                  severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'
                }`}></span>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                <button 
                  onClick={() => toggleFilter('severity', severity)}
                  className="ml-1 hover:text-slate-900 p-0.5"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => setFilters({ status: [], severity: [] })}
              className="bg-slate-200 hover:bg-slate-300 rounded-full px-2 py-1 text-xs flex items-center"
            >
              <X size={10} className="mr-1" />
              Clear
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {filteredData.length > 0 && (
          <div className="flex justify-between items-center mb-3 text-xs text-slate-500">
            <span>{filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}</span>
            <div className="flex items-center gap-2">
              <span>Sort:</span>
              <button 
                onClick={() => handleSort('section')}
                className={`px-2 py-1 rounded ${
                  activeSortField === 'section' ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                Section {activeSortField === 'section' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => handleSort('severity')}
                className={`px-2 py-1 rounded ${
                  activeSortField === 'severity' ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                Severity {activeSortField === 'severity' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        )}

        {filteredData.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center bg-slate-50 rounded-md border border-slate-100">
            <FileText size={32} className="text-slate-300 mb-2" />
            <p className="text-slate-600 font-medium">No results found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((item) => (
              <div 
                key={item.id} 
                className={`border rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-all ${
                  item.status === 'discrepancy' 
                    ? `border-l-2 ${
                        item.severity === 'high' ? 'border-l-red-500' : 
                        item.severity === 'medium' ? 'border-l-amber-500' : 
                        item.severity === 'low' ? 'border-l-yellow-500' : ''
                      }` 
                    : ''
                }`}
              >
                <div 
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSectionClick(item.id)}
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'compliant' ? (
                      <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full">
                        <CheckCircle size={16} className="text-emerald-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-full">
                        <AlertCircle size={16} className="text-amber-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-sm text-slate-800">{item.section}</h3>
                      {item.status === 'discrepancy' && item.severity !== 'none' && (
                        <div className="mt-1">
                          {getSeverityBadge(item.severity)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <ChevronDown 
                    size={18} 
                    className={`transition-transform text-slate-400 ${activeSection === item.id.toString() ? 'transform rotate-180' : ''}`} 
                  />
                </div>
                
                {activeSection === item.id.toString() && (
                  <div className="p-3 border-t border-slate-100 bg-slate-50 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <h4 className="text-xs font-medium text-slate-500 mb-1">Regulatory Guideline</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 text-sm">
                          {item.regulation}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                            <button 
                              className="text-xs px-2 py-1 text-indigo-500 hover:underline flex items-center gap-1"
                              onClick={() => onOpenPdf(item.guidelinesPdfUrl, 'guidelines', item.pageNumber)}
                            >
                              <FileText size={12} />
                              Page {item.pageNumber}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium text-slate-500 mb-1">SOP</h4>
                        <div className={`p-3 rounded border text-sm ${
                          item.status === 'discrepancy' 
                            ? `${getSeverityColor(item.severity)}` 
                            : 'bg-white border-slate-200'
                        }`}>
                          {item.documentation}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                            <button 
                              className="text-xs px-2 py-1 text-indigo-500 hover:underline flex items-center gap-1"
                              onClick={() => onOpenPdf(item.sopPdfUrl, 'sop', item.sopPageNumber)}
                            >
                              <FileText size={12} />
                              Page {item.sopPageNumber}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.comment && (
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-slate-500 mb-1">Analysis</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 text-sm">
                          {item.comment}
                        </div>
                      </div>
                    )}

                    {item.status === 'discrepancy' && item.discrepancy_type && (
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-slate-500 mb-1">Discrepancy Type</h4>
                        <div className="bg-white p-3 rounded border border-slate-200">
                          <p className="text-sm font-medium">
                            {item.discrepancy_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </p>
                          {item.content_location && (
                            <p className="text-xs text-slate-500 mt-1">
                              Location: {item.content_location}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <button 
                        className="text-xs px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition flex items-center gap-1"
                        onClick={() => onOpenPdf(item.guidelinesPdfUrl, 'guidelines', item.pageNumber)}
                      >
                        <FileText size={12} />
                        View Guideline
                      </button>
                      
                      <button 
                        className="text-xs px-3 py-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 transition flex items-center gap-1"
                        onClick={() => onOpenPdf(item.sopPdfUrl, 'sop', item.sopPageNumber)}
                      >
                        <FileText size={12} />
                        View SOP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function toggleFilter(type: keyof FilterOptions, value: string) {
    setFilters(prev => {
      const updatedFilters = { ...prev };
      if (updatedFilters[type].includes(value)) {
        updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
      } else {
        updatedFilters[type] = [...updatedFilters[type], value];
      }
      return updatedFilters;
    });
  }
};

export default ComparisonPanel;