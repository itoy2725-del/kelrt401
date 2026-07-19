import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Toplam benzersiz sepete ürün ekleyen ziyaretçi sayısı
        const [totalResult] = await pool.query(
            'SELECT COUNT(DISTINCT session_id) as total_visitors FROM cart_items'
        ) as any[];

        // Bugün sepete ürün ekleyen benzersiz ziyaretçi sayısı
        const [todayResult] = await pool.query(
            `SELECT COUNT(DISTINCT session_id) as today_visitors 
             FROM cart_items 
             WHERE DATE(created_at) = CURDATE()`
        ) as any[];

        // Son 7 gün
        const [weekResult] = await pool.query(
            `SELECT COUNT(DISTINCT session_id) as week_visitors 
             FROM cart_items 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
        ) as any[];

        // Son 30 gün
        const [monthResult] = await pool.query(
            `SELECT COUNT(DISTINCT session_id) as month_visitors 
             FROM cart_items 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
        ) as any[];

        // Günlük bazda son 7 günün istatistiği
        const [dailyStats] = await pool.query(
            `SELECT 
                DATE(created_at) as date,
                COUNT(DISTINCT session_id) as visitors
             FROM cart_items 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date DESC`
        ) as any[];

        return NextResponse.json({
            success: true,
            data: {
                totalVisitors: totalResult[0]?.total_visitors || 0,
                todayVisitors: todayResult[0]?.today_visitors || 0,
                weekVisitors: weekResult[0]?.week_visitors || 0,
                monthVisitors: monthResult[0]?.month_visitors || 0,
                dailyStats
            }
        });
    } catch (error: any) {
        console.error('İstatistik hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}