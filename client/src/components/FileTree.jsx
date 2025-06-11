import React from 'react'

const FileTreeNode = ({fileName, Nodes})=>{
    return <div style={{marginLeft:"20px"}}>
        {fileName}
        {Nodes && <ul style={{listStyle:"none"}}>
            {Object.keys(Nodes).map(childNode=>(
                <li key={childNode}>
                    <FileTreeNode fileName={childNode} Nodes={Nodes[childNode]}></FileTreeNode>
                </li>
            ))}
            </ul>}
    </div>
}

const FileTree = ({tree}) => {
  return (
    <FileTreeNode fileName={'/'} Nodes={tree}></FileTreeNode>
  )
}

export default FileTree;