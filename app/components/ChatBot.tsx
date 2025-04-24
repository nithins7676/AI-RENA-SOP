import React, { useState, useRef, useEffect, ReactElement } from 'react';
import { MessageSquare, X, Paperclip, Send,  FileText, Search, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type Message = {
  id: string;
  type: 'user' | 'bot';
  content: string;
  mentions?: StoredFile[]; // Files mentioned in the message
};

interface StoredFile {
  name: string;
  path: string;
  type: 'sop' | 'guideline';
  mentionId?: string; // Unique ID for this mention in text
}

export const ChatBot = ({ isOpen, setIsOpen }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'bot', content: 'Hello! How can I help you understand the regulations today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [availableFiles, setAvailableFiles] = useState<StoredFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current && !isMinimized) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);
  
  // Fetch available PDFs
  useEffect(() => {
    if (showMentionDropdown) {
      fetchAvailableFiles();
    }
  }, [showMentionDropdown]);
  
  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMentionDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Prevent body scrolling when chat is open in full screen
  useEffect(() => {
    if (isOpen && !isMinimized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMinimized]);

  // Handle escape key to close full-screen chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isMinimized) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isMinimized, setIsOpen]);

  const fetchAvailableFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch('/api/documents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents from server');
      }
      
      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        setAvailableFiles(data.files);
      } else {
        setAvailableFiles([
          { name: 'Sample SOP 1.pdf', path: '/content/sop/sample-sop-1.pdf', type: 'sop' },
          { name: 'Sample SOP 2.pdf', path: '/content/sop/sample-sop-2.pdf', type: 'sop' },
          { name: 'Guideline Document 1.pdf', path: '/content/guidelines/guideline-1.pdf', type: 'guideline' },
          { name: 'Compliance Document.pdf', path: '/content/guidelines/compliance.pdf', type: 'guideline' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setAvailableFiles([
        { name: 'Sample SOP 1.pdf', path: '/content/sop/sample-sop-1.pdf', type: 'sop' },
        { name: 'Sample SOP 2.pdf', path: '/content/sop/sample-sop-2.pdf', type: 'sop' },
        { name: 'Guideline Document 1.pdf', path: '/content/guidelines/guideline-1.pdf', type: 'guideline' },
        { name: 'Compliance Document.pdf', path: '/content/guidelines/compliance.pdf', type: 'guideline' },
      ]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const extractMentions = (text: string): { content: string, mentions: StoredFile[] } => {
    const mentionRegex = /@\(([^)]+)\)/g;
    const mentions: StoredFile[] = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const fileName = match[1];
      const file = availableFiles.find(f => f.name === fileName);
      if (file) {
        mentions.push({...file, mentionId: match[0]});
      }
    }
    
    return { 
      content: text,
      mentions
    };
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const { content, mentions } = extractMentions(input);

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content,
      mentions: mentions.length > 0 ? mentions : undefined
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    setInput('');
    setIsLoading(true);

    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        mentions: mentions.length > 0 ? mentions : undefined
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      return response.json();
    })
    .then(data => {
      const botResponse: Message = {
        id: data.id || Date.now().toString(),
        type: 'bot',
        content: data.content,
        mentions: data.mentions
      };
      setMessages(prev => [...prev, botResponse]);
    })
    .catch(error => {
      console.error('Error calling chat API:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name;
      
      const cursorPos = inputRef.current?.selectionStart || 0;
      setMentionStartPos(cursorPos);
      
      insertFileReference({
        name: fileName,
        path: URL.createObjectURL(file),
        type: 'sop'
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      return;
    }
    
    if (e.key === '@') {
      setMentionStartPos(inputRef.current?.selectionStart || 0);
      setShowMentionDropdown(true);
      setMentionFilter('');
      e.preventDefault();
      
      if (inputRef.current) {
        const cursorPos = inputRef.current.selectionStart || 0;
        const textBefore = input.substring(0, cursorPos);
        const textAfter = input.substring(cursorPos);
        setInput(`${textBefore}@${textAfter}`);
        
        setTimeout(() => {
          if (inputRef.current) {
            const newPos = cursorPos + 1;
            inputRef.current.setSelectionRange(newPos, newPos);
          }
        }, 0);
      }
    }
    
    if (e.key === 'Escape') {
      setShowMentionDropdown(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    
    if (showMentionDropdown && mentionStartPos !== -1) {
      const cursorPos = e.target.selectionStart || 0;
      
      if (cursorPos > mentionStartPos) {
        const filterText = newInput.substring(mentionStartPos + 1, cursorPos);
        setMentionFilter(filterText);
      }
      
      const hasAtSymbol = newInput.charAt(mentionStartPos) === '@';
      if (!hasAtSymbol || cursorPos <= mentionStartPos) {
        setShowMentionDropdown(false);
      }
    }
  };
  
  const insertFileReference = (file: StoredFile) => {
    if (inputRef.current && mentionStartPos !== -1) {
      const textBefore = input.substring(0, mentionStartPos);
      
      const cursorPos = inputRef.current.selectionStart || 0;
      const textAfter = input.substring(Math.max(cursorPos, mentionStartPos + 1));
      
      const newText = `${textBefore}@(${file.name})${textAfter}`;
      setInput(newText);
      
      const newCursorPos = mentionStartPos + `@(${file.name})`.length;
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 10);
    }
    
    setShowMentionDropdown(false);
  };
  
  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const filteredFiles = availableFiles.filter(file => 
    mentionFilter === '' || file.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );
  
  const getFileTypeLabel = (type: 'sop' | 'guideline') => {
    return type === 'sop' ? 'SOP' : 'Guideline';
  };
  
  const getFileTypeColor = (type: 'sop' | 'guideline') => {
    return type === 'sop' 
      ? { bg: 'bg-indigo-100', text: 'text-indigo-800', hover: 'hover:bg-indigo-50' }
      : { bg: 'bg-emerald-100', text: 'text-emerald-800', hover: 'hover:bg-emerald-50' };
  };
  
  const formatMessageWithMentions = (message: Message) => {
    if (!message.mentions || message.mentions.length === 0) {
      return <p className="text-sm leading-relaxed">{message.content}</p>;
    }

    const mentionRegex = /@\(([^)]+)\)/g;
    const parts = message.content.split(mentionRegex);
    const result: ReactElement[] = [];
    
    parts.forEach((part, index) => {
      if (part) {
        result.push(<span key={`text-${index}`}>{part}</span>);
      }
      
      if (index % 2 === 0 && index < parts.length - 1) {
        const fileName = parts[index + 1];
        const fileType = message.mentions?.find(m => m.name === fileName)?.type || 'sop';
        const { bg, text } = getFileTypeColor(fileType);
        
        result.push(
          <span 
            key={`mention-${index}`} 
            className={`inline-flex items-center ${
              message.type === 'user' ? 'bg-blue-500/70 text-white' : `${bg} ${text}`
            } rounded px-1.5 py-0.5 mx-0.5`}
          >
            <FileText size={12} className="mr-1" />
            {fileName}
          </span>
        );
      }
    });
    
    return <p className="text-sm leading-relaxed">{result}</p>;
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all z-50 hover:scale-110"
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 w-72 bg-white rounded-lg shadow-xl flex flex-col border overflow-hidden transition-all duration-300 z-50">
        <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-700 rounded-full">
              <MessageSquare size={16} />
            </div>
            <h3 className="font-medium">Regulation Assistant</h3>
          </div>
          <div className="flex items-center">
            <button 
              onClick={() => setIsMinimized(false)} 
              className="text-white/80 hover:text-white p-1 mr-1"
              aria-label="Expand chat"
            >
              <Maximize2 size={18} />
            </button>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/80 hover:text-white p-1"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={chatContainerRef}
      className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden transition-all duration-300"
      style={{ 
        animation: 'fadeIn 0.3s ease-out forwards',
      }}
    >
      <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-700 rounded-full">
            <MessageSquare size={20} />
          </div>
          <h2 className="text-xl font-semibold">Regulation Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(true)} 
            className="text-white/80 hover:text-white p-2 hover:bg-blue-700 rounded-full transition-colors"
            aria-label="Minimize chat"
          >
            <Minimize2 size={20} />
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white/80 hover:text-white p-2 hover:bg-blue-700 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex justify-center bg-gray-50">
          <div className="w-full max-w-4xl flex flex-col h-full">
            <div className="flex-1 p-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 shrink-0">
                        <MessageSquare size={18} className="text-blue-600" />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[75%] rounded-2xl px-5 py-4 ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      {formatMessageWithMentions(message)}
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center ml-3 mt-1 shrink-0">
                        <span className="text-white text-xs font-bold">You</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0">
                      <MessageSquare size={18} className="text-blue-600" />
                    </div>
                    <div className="bg-white border rounded-2xl px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messageEndRef} />
              </div>
            </div>
            
            {showMentionDropdown && (
              <div
                ref={dropdownRef}
                className="absolute bottom-[85px] left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white shadow-xl rounded-md border overflow-hidden z-10"
              >
                <div className="sticky top-0 bg-white p-3 border-b">
                  <div className="flex items-center bg-gray-50 rounded-lg px-3">
                    <Search size={16} className="text-gray-500" />
                    <input
                      type="text"
                      className="w-full p-2.5 text-base bg-transparent focus:outline-none"
                      placeholder="Search documents..."
                      value={mentionFilter}
                      onChange={(e) => setMentionFilter(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-[250px]">
                  {loadingFiles ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
                      <span className="text-gray-600">Loading documents...</span>
                    </div>
                  ) : filteredFiles.length > 0 ? (
                    <ul>
                      {filteredFiles.map((file, index) => {
                        const { bg, text } = getFileTypeColor(file.type);
                        return (
                          <li 
                            key={index}
                            className={`p-3 cursor-pointer hover:bg-gray-50 ${index !== filteredFiles.length - 1 ? 'border-b' : ''}`}
                            onClick={() => insertFileReference(file)}
                          >
                            <div className="flex items-center">
                              <div className={`mr-3 ${bg} ${text} p-1.5 rounded`}>
                                <FileText size={16} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-800 font-medium truncate">{file.name}</span>
                                <span className="text-sm text-gray-500">{getFileTypeLabel(file.type)}</span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No documents found
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="border-t p-4 bg-white flex items-end gap-3 md:p-6">
              <div className="max-w-4xl w-full mx-auto flex items-end gap-3">
                <button 
                  onClick={handleAttachment}
                  className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                  title="Attach files"
                >
                  <Paperclip size={22} />
                </button>
                
                <div className="relative flex-1">
                  <TextareaAutosize
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type @ to mention a document..."
                    className="resize-none w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-40 text-base"
                    maxRows={5}
                  />
                </div>
                
                <button 
                  onClick={handleSendMessage}
                  className={`p-3 rounded-full ${
                    !input.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors`}
                  disabled={!input.trim()}
                >
                  <Send size={22} />
                </button>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};