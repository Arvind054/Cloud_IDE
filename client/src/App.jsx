import './App.css'
import  Terminal  from './components/Terminal'
import FileTree  from './components/FileTree';
import { useEffect, useState } from 'react';
import socket from './socket';
function App() {
const [tree, setTree] = useState(null);

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
  return (
    <>
    <div>
     <FileTree tree={tree}></FileTree>
      <Terminal/>
    </div>
    </>
  )
}

export default App
