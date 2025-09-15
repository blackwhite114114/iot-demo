const sqlite3 = require('sqlite3').verbose();

// 连接到数据库
const db = new sqlite3.Database('iot_data.db', (err) => {
  if (err) {
    console.error('Database error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// 查询最新的10条记录
const query = `SELECT deviceId, datetime(timestamp/1000, 'unixepoch', 'localtime') as time, temperature, humidity 
               FROM sensor_data 
               ORDER BY timestamp DESC 
               LIMIT 10`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Query error:', err.message);
  } else {
    console.log('Latest 10 records:');
    console.log('Device ID\t\tTime\t\t\tTemperature\tHumidity');
    console.log('--------------------------------------------------------------------');
    rows.forEach((row) => {
      console.log(`${row.deviceId}\t\t${row.time}\t${row.temperature}°C\t\t${row.humidity}%`);
    });
  }
  
  // 关闭数据库连接
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
  });
});