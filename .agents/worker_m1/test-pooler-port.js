import net from 'net';

const ports = [5432, 6543, 80, 443];
const host = 'aws-0-us-east-1.pooler.supabase.com';

ports.forEach(port => {
  const socket = new net.Socket();
  socket.setTimeout(3000);
  
  socket.on('connect', () => {
    console.log(`Port ${port} is OPEN on ${host}`);
    socket.destroy();
  });
  
  socket.on('timeout', () => {
    console.log(`Port ${port} TIMEOUT on ${host}`);
    socket.destroy();
  });
  
  socket.on('error', (err) => {
    console.log(`Port ${port} ERROR on ${host}: ${err.message}`);
    socket.destroy();
  });
  
  socket.connect(port, host);
});
