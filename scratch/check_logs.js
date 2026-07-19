const mysql = require('./node_modules/mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host:     'mysql-1ff48a92-itoy2724-d356.d.aivencloud.com',
        user:     'avnadmin',
        password: 'AVNS_00WbvIaMHC0gqEbkojK',
        database: 'defaultdb',
        port:     18217,
        ssl:      { rejectUnauthorized: false }
    });

    const [sysRows] = await connection.query('SELECT NOW() as db_now, UTC_TIMESTAMP() as db_utc');
    console.log('DB Times:', sysRows[0]);

    const [rows] = await connection.query('SELECT id, kredi_karti, tarih, durum, ip FROM logs ORDER BY id DESC LIMIT 1');
    console.log('Last Log:', rows[0]);
    await connection.end();
}

main().catch(console.error);
