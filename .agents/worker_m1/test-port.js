import net from 'net';

const ports = [5432, 6543, 80, 443];
const host = 'db.nmkwhseqfbhrbzqldvcm.supabase.net';

ports.forEach(port => {
  const socket = new net.Socket();
  socket.setTimeout(3000);
  
  socket.on('connect', () => {
    console.log(`Port ${port} is OPEN`);
    socket.destroy();
  });
  
  socket.on('timeout', () => {
    console.log(`Port ${port} TIMEOUT`);
    socket.destroy();
  });
  
  socket.on('error', (err) => {
    console.log(`Port ${port} ERROR: ${err.message}`);
    socket.destroy();
  });
  
  socket.connect(port, host);
});
