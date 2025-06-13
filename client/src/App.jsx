import './App.css'
import React, { useCallback, useEffect, useState, useRef } from 'react';
import Terminal from './components/Terminal'
import FileTree from './components/FileTree';
import socket from './socket';
import Editor from '@monaco-editor/react';

function App() {
const [tree, setTree] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);
const [selectedFileContent, setSelectedFileContent] = useState(null);
const [code, setCode] = useState('hello');
  const [terminalHeight, setTerminalHeight] = useState(200);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

const isSaved = selectedFileContent === code;
  
const getFileTree = async ()=>{
  const result = await fetch('http://localhost:9000/files');
  const data = await result.json();
  setTree(data.tree);
}
//Listen to the File refresh event
useEffect(()=>{
  socket.on('file:refresh', getFileTree);
}, [])
useEffect(()=>{
  getFileTree();
}, []);

//Syncing User File Code
useEffect(()=>{
  if (!code || isSaved || !selectedFile) return;
  const timer = setTimeout(()=>{
    socket.emit('File:Change', {
      FilePath:selectedFile,
      content : code,
    })
  }, 5*1000);
  return ()=>{ clearTimeout(timer);};
},[code, selectedFile]);
//Setting the selected file content to the code;
useEffect(()=>{
  if(selectedFile && selectedFileContent){
    setCode(selectedFileContent)
  }
}, [selectedFile, selectedFileContent]);
//Getting the Contern of the File
const getFileContent =useCallback(async()=>{
  const response = await fetch(`http://localhost:9000/file/content?path=${selectedFile}`);
  const data = await response.json();
  setSelectedFileContent(data.content);
}, [selectedFile]) ;
//to get the content of a given file;
useEffect(()=>{
  if(!selectedFile)return ;
  setCode("");
  getFileContent();

}, [getFileContent, selectedFile])

  const handleMouseDown = (e) => {
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = terminalHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) return;
    
    const deltaY = startY.current - e.clientY;
    const newHeight = Math.max(100, Math.min(window.innerHeight - 100, startHeight.current + deltaY));
    setTerminalHeight(newHeight);
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1e1e1e] text-white">
      <div className="flex h-full flex-col">
        {/* Top Bar */}
        <div className="h-8 bg-[#333333] border-b border-[#3c3c3c] flex items-center px-4">
          <div className="text-sm font-medium text-gray-300">Cloud IDE</div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* File Explorer */}
          <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
            <div className="px-4 py-3 border-b border-[#3c3c3c] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">Explorer</h2>
              <button 
                onClick={getFileTree}
                className="text-gray-400 hover:text-gray-300 transition-colors"
                title="Refresh"
              >
                🔄
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <FileTree tree={tree} onSelect={(path) => setSelectedFile(path)} />
            </div>
          </div>

          {/* Editor Container */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            <div className="px-4 py-2 bg-[#252526] border-b border-[#3c3c3c] flex justify-between items-center">
              <div className="flex items-center gap-2">
                {selectedFile && (
                  <>
                    <span className="text-gray-400">
                      {getFileIcon(selectedFile)}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm text-gray-300">
                      {selectedFile.split('/').map((part, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span className="text-gray-500">/</span>}
                          <span className="hover:text-blue-400 transition-colors">
                            {part}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isSaved && (
                  <div className="text-xs text-amber-500 px-2 py-0.5 rounded bg-amber-500/10 flex items-center gap-1">
                    <span>●</span>
                    Unsaved changes
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={(e) => setCode(e)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  lineHeight: 20,
                }}
              />
            </div>
          </div>
        </div>

        {/* Terminal Resize Handle */}
        <div 
          className="h-1 bg-[#3c3c3c] hover:bg-blue-500 cursor-row-resize transition-colors relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-x-0 -top-1 h-3 cursor-row-resize" />
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-1 bg-blue-500/0 group-hover:bg-blue-500/20 rounded-full transition-colors" />
        </div>

        {/* Terminal Section */}
        <div style={{ height: `${terminalHeight}px` }} className="bg-[#252526] border-t border-[#3c3c3c] flex flex-col">
          <div className="px-4 py-2 border-b border-[#3c3c3c] flex items-center justify-between">
            <div className="text-sm font-medium text-gray-300">Terminal</div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-300 transition-colors" title="Clear">
                🗑️
              </button>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-auto">
            <Terminal />
          </div>
        </div>
      </div>
    </div>
  )
}

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    js: '📜',
    jsx: '⚛️',
    ts: '📘',
    tsx: '⚛️',
    json: '📋',
    html: '🌐',
    css: '🎨',
    md: '📝',
    py: '🐍',
    java: '☕',
    cpp: '⚙️',
    c: '⚙️',
    h: '📘',
    txt: '📄',
    default: '📄'
  };
  return iconMap[extension] || iconMap.default;
};

export default App
