const sqlite3 = require('sqlite3').verbose();

class DatabaseManager {
  constructor(dbPath = 'iot_data.db') {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err.message);
      } else {
        console.log('Connected to SQLite database.');
      }
    });
    
    this.init();
  }
  
  init() {
    // 创建传感器数据表
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sensor_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL
      )`;
      
    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Sensor data table ready.');
      }
    });
  }
  
  insertSensorData(data) {
    const stmt = this.db.prepare('INSERT INTO sensor_data (deviceId, timestamp, temperature, humidity) VALUES (?, ?, ?, ?)');
    stmt.run(
      data.deviceId, 
      data.ts, 
      parseFloat(data.temperature), 
      parseFloat(data.humidity), 
      function(err) {
        if (err) {
          console.error('Database insert error:', err.message);
        } else {
          console.log(`Data inserted with rowid ${this.lastID}`);
        }
      }
    );
    stmt.finalize();
  }
  
  getLatestData(limit = 50) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT ?`;
      this.db.all(query, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      }
    });
  }
}

module.exports = DatabaseManager;