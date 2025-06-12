import './App.css'
import  Terminal  from './components/Terminal'
import FileTree  from './components/FileTree';
import { useCallback, useEffect, useState } from 'react';
import socket from './socket';
import Editor from '@monaco-editor/react';
import ReactDOM from 'react-dom';
function App() {
const [tree, setTree] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);
const [selectedFileContent, setSelectedFileContent] = useState(null);
const [code, setCode] = useState('hello');

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
  return (
    <>
    <div>
    <div className='playground-Container'>
      <div className="editor-container">
        <div className="files">
            <FileTree tree={tree} onSelect={(path)=>setSelectedFile(path)}></FileTree>
        </div>
        <div className="editor" style={{backgroundColor:"blue",flexGrow:'1'}}>
          <p>{selectedFile && selectedFile.replaceAll('/', '>')}</p>
        <Editor height="50vh" defaultLanguage="javascript" defaultValue="// some comment"  theme='vs-dark' value={code} onChange={(e)=>setCode(e)}/>;
        </div>
      </div>
      <Terminal/>
      </div>
    </div>
    </>
  )
}

export default App
