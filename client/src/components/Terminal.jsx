import React, { useEffect, useRef } from 'react'
import {Terminal as xTerminal} from '@xterm/xterm'
import socket from '../socket'
import '@xterm/xterm/css/xterm.css'
 const Terminal = () => {
  const terminalRef = useRef();
  const isRendered = useRef(false);
  useEffect(()=>{
    if(isRendered.current)return ;
    isRendered.current = true;
    const terminal = new xTerminal({rows:20});
    terminal.open(terminalRef.current);
    terminal.onData(data =>{
      socket.emit('terminal:write', data);
    });
    socket.on('terminal:data', (data)=>{
      terminal.write(data);
    });
   
  }, [])
  return (
    <div ref={terminalRef} id='termainal' className='terminal-Container'></div>
  )
}
export default Terminal;