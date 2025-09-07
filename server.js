const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;
const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
const topic = process.env.TOPIC || 'iot/demo/temperature';

// 提供静态文件
app.use(express.static('public'));

// MQTT客户端
const client = mqtt.connect(url, {
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
  reconnectPeriod: 1000,
});

client.on('connect', () => {
  console.log('[WEB] Connected to MQTT:', url);
  client.subscribe(topic, { qos: 0 }, (err) => {
    if (err) {
      console.error('[WEB] Subscribe error:', err);
    } else {
      console.log('[WEB] Subscribed to:', topic);
    }
  });
});

client.on('message', (t, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    // 通过WebSocket发送给所有连接的客户端
    io.emit('data', data);
  } catch (e) {
    console.error('Error parsing MQTT message:', e);
  }
});

client.on('error', (err) => {
  console.error('[WEB] MQTT Error:', err.message);
});

// 处理WebSocket连接
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});