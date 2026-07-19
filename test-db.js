const mysql = require('mysql2/promise');
(async () => {
    const pool = mysql.createPool({
        host: '102.220.160.109',
        user: 'dimitri',
        password: 'Losete00*',
        database: 'dimitri',
        port: 3306,
        ssl: { rejectUnauthorized: false }
    });
    const [rows] = await pool.query("SELECT id, name, image_url, LENGTH(image_url) as url_len FROM products WHERE image_url LIKE '%,%' LIMIT 3");
    rows.forEach(r => {
        console.log('ID:', r.id, '| Name:', r.name?.substring(0,40), '| ImgLen:', r.url_len);
        console.log('  Img:', r.image_url?.substring(0,200));
    });
    if (rows.length === 0) {
        console.log('No products with comma-separated images found');
        const [all] = await pool.query("SELECT id, name, image_url FROM products ORDER BY id DESC LIMIT 3");
        all.forEach(r => console.log('ID:', r.id, '| Name:', r.name?.substring(0,40), '| Img:', r.image_url?.substring(0,120)));
    }
    await pool.end();
})();
