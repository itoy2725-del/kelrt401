import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     'mysql-2f3e85d0-bellabelatr-e464.j.aivencloud.com',
  user:     'avnadmin',
  password: 'AVNS_tPRCvJcfME90GziNmPs',
  database: 'defaultdb',
  port:     13100,
  ssl:      { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 3, // Serverless instance başına 3 bağlantı (limit aşımını ve şişmeyi önler)
  queueLimit: 0,
  enableKeepAlive: true, // TCP Keep-Alive'ı etkinleştir
  keepAliveInitialDelay: 10000, // 10 saniye sonra keep-alive paketleri gönder
  idleTimeout: 30000, // 30 saniye boyunca kullanılmayan boş bağlantıları havuzdan temizle (zombie connection önleme)
});

export default pool;