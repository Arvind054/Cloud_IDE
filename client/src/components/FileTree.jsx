import React from 'react'

const FileTreeNode = ({fileName, Nodes, onSelect,path})=>{
  const isDir = !!Nodes;

    return <div onClick={(e)=>{
      e.stopPropagation();
      if(isDir)return;
      onSelect(path);
    }} style={{marginLeft:"20px"}}>
       <span className={isDir ? "Dirs": "file"}>{fileName}</span>
        {Nodes && <ul style={{listStyle:"none"}}>
            {Object.keys(Nodes).map(childNode=>(
                <li key={childNode}>
                    <FileTreeNode fileName={childNode} onSelect={onSelect} Nodes={Nodes[childNode]} path={path+'/'+childNode}></FileTreeNode>
                </li>
            ))}
            </ul>}
    </div>
}

const FileTree = ({tree, onSelect}) => {
  return (
    <FileTreeNode fileName={'/'} onSelect={onSelect} Nodes={tree} path={""}></FileTreeNode>
  )
}

export default FileTree;