import React, { useState } from 'react'

const FileTreeNode = ({ fileName, Nodes, onSelect, path, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isDir = !!Nodes;
  const indent = level * 16; // 16px per level

  const handleClick = (e) => {
    e.stopPropagation();
    if (isDir) {
      setIsOpen(!isOpen);
    } else {
      onSelect(path);
    }
  };

  return (
    <div className="select-none">
      <div
        onClick={handleClick}
        className={`flex items-center py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer group ${
          !isDir ? 'hover:text-blue-400' : ''
        }`}
        style={{ paddingLeft: `${indent + 8}px` }}
      >
        {isDir && (
          <span className="mr-1 text-gray-400">
            {isOpen ? '📂' : '📁'}
          </span>
        )}
        {!isDir && (
          <span className="mr-1 text-gray-400">
            {getFileIcon(fileName)}
          </span>
        )}
        <span className={`text-sm ${isDir ? 'text-gray-300' : 'text-gray-400'}`}>
          {fileName}
        </span>
      </div>
      {isDir && isOpen && (
        <div className="border-l border-[#3c3c3c] ml-2">
          {Object.keys(Nodes).map(childNode => (
            <FileTreeNode
              key={childNode}
              fileName={childNode}
              onSelect={onSelect}
              Nodes={Nodes[childNode]}
              path={path + '/' + childNode}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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

const FileTree = ({ tree, onSelect }) => {
  return (
    <div className="h-full overflow-auto">
      <FileTreeNode
        fileName={'/'}
        onSelect={onSelect}
        Nodes={tree}
        path={''}
      />
    </div>
  );
};

export default FileTree;