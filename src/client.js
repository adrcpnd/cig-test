import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to server')

  ws.send(JSON.stringify({
    type: 'CREATE_EVENT',
    payload: { name: 'Test Event', time: Date.now() + 5000 }
  }))
})

ws.on('message', (msg) => console.log('Received:', msg.toString()));
ws.on('error', (err) => console.error('WebSocket error', err));
