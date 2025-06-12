const express = require('express');
const http = require('http');
const { Server: SocketServer } = require('socket.io');
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const app = express();
const server = http.createServer(app);
const baseDir = process.env.INIT_CWD || process.cwd();
const userDir = path.join(baseDir, 'User');
const fs = require('fs/promises');
const cors = require('cors');
const chokidar = require('chokidar');
// Configure CORS
app.use(cors());
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Choose the shell based on OS
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

//Chokidar to watch the changes in the User Directory
chokidar.watch('./User').on('all', (event, path) => {
  io.emit('file:refresh', path);
});
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // Spawn shell process
  const shellProcess = spawn(shell, [], {
    cwd: userDir,
    env: process.env,
    stdio: 'pipe',
  });

  if (!shellProcess || !shellProcess.pid) {
    console.error('❌ Failed to spawn shell process');
    socket.emit('terminal:data', '[Error] Failed to start terminal session');
    return;
  }

  // Handle output
  shellProcess.stdout.on('data', (data) => {
    socket.emit('terminal:data', data.toString());
  });

  shellProcess.stderr.on('data', (data) => {
    socket.emit('terminal:data', data.toString());
  });

  shellProcess.on('exit', (code) => {
    socket.emit('terminal:data', '[Session terminated]');
    console.log(`🛑 Shell exited with code ${code}`);
  });

  shellProcess.on('error', (err) => {
    socket.emit('terminal:data', `[Error] Shell process failed: ${err.message}`);
    console.error('⚠️ Shell error:', err);
  });

  // Handle input from client
  socket.on('terminal:write', (data) => {
    if (shellProcess.stdin.writable) {
      shellProcess.stdin.write(data);
    } else {
      socket.emit('terminal:data', '[Error] Shell input not writable');
    }
  });
  // Handle File Content Change
  socket.on('File:Change', async({FilePath, content})=>{
    const requiredPath = path.join(userDir, FilePath);
    await fs.writeFile(requiredPath, content);
  })
  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
    if (!shellProcess.killed) {
      shellProcess.stdin.end();
      shellProcess.kill();
    }
  });
});

app.get('/files', async(req, res)=>{  
  const fileTree = await generateFileTree('./User');
  return res.json({tree: fileTree});
});
//To get the contern of a file
app.get("/file/content", async(req, res)=>{
  const FilePath = req.query.path;
  const requiredPath = path.join(userDir, FilePath);
  const content = await fs.readFile(requiredPath, 'utf-8');
  return res.json({content});
})
server.listen(9000, () => {
  console.log('🚀 Server is listening on PORT 9000');
});


async function generateFileTree(directory){
  const tree = {};
  async function buildTree(currentDir, currentTree){
     const files = await fs.readdir(currentDir);
     for (const file of files){ 
      const filePath = path.join(currentDir, file);  
      const stat = await fs.stat(filePath);
      if(stat.isDirectory()){         
        currentTree[file] = {};
        await buildTree(filePath, currentTree[file]);
      }else{
        currentTree[file] = null;
      }
     }                      
  }
  await buildTree(directory, tree);
  return tree;
}