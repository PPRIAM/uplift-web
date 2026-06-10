import net from 'net';

const socket = new net.Socket();
socket.setTimeout(2000);

socket.on('connect', () => {
  console.log('Port 54321 is OPEN locally');
  socket.destroy();
});

socket.on('timeout', () => {
  console.log('Port 54321 TIMEOUT');
  socket.destroy();
});

socket.on('error', (err) => {
  console.log('Port 54321 ERROR:', err.message);
  socket.destroy();
});

socket.connect(54321, '127.0.0.1');
