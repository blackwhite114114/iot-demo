require('dotenv').config();
const mqtt = require('mqtt');
const DatabaseManager = require('./db');

const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
const topic = process.env.TOPIC || 'iot/demo/temperature';

// 初始化数据库
const db = new DatabaseManager();

const client = mqtt.connect(url, {
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
  reconnectPeriod: 1000, // 断线重连
});

client.on('connect', () => {
  console.log('[SUB] Connected:', url);
  client.subscribe(topic, { qos: 0 }, (err) => {
    if (err) {
      console.error('[SUB] Subscribe error:', err);
    } else {
      console.log('[SUB] Subscribed to:', topic);
    }
  });
});

client.on('message', (t, payload) => {
  console.log(`[SUB] ${t} => ${payload.toString()}`);
  
  try {
    const data = JSON.parse(payload.toString());
    // 将数据插入数据库
    db.insertSensorData(data);
  } catch (e) {
    console.error('[SUB] Error processing message:', e.message);
  }
});

client.on('error', (err) => {
  console.error('[SUB] Error:', err.message);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('[SUB] Closing database connection...');
  db.close();
  process.exit(0);
});