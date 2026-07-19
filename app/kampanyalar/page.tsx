import FlashDeals from '@/components/FlashDeals';
import pool from '@/lib/db';
import { Product } from '@/lib/types';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getFlashSaleProducts(): Promise<Product[]> {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE is_flash_sale = 1 ORDER BY created_at DESC LIMIT 10');
        return (rows as any[]).map(product => {
            let images = product.images;
            if (typeof images === 'string') {
                try {
                    images = JSON.parse(images);
                } catch {
                    images = [];
                }
            }
            return { ...product, images, is_flash_sale: true };
        });
    } catch (error) {
        console.error('Flash sale ürün getirme hatası:', error);
        return [];
    }
}

export default async function KampanyalarPage() {
    const flashSaleProducts = await getFlashSaleProducts();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Saatlik İndirimler */}
            <div className="px-4 pt-4">
                <FlashDeals products={flashSaleProducts} isVerticalList={true} />
            </div>

            <div className="campaign-list px-4 pb-8">
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Wed Apr 01 15:23:33 TRT 2026" />
                        <input type="hidden" name="endDate" value="Sun May 31 23:23:34 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/edcsssaaa_0_MC/8874587914290.jpg" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/shell" className="campaign-desc">CarrefourSA Alışverişlerinize Yakıt Puan, Shell Alışverişlerinize CarrefourSA Puan Hediye!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Tue Mar 10 16:30:45 TRT 2026" />
                        <input type="hidden" name="endDate" value="Sun May 31 23:30:53 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/trhrnrnr_0_MC/8873738764338.png" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/enuygun-ucak" className="campaign-desc">Enuygun’dan Uçak Biletlerinde 200 TL İndirim!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Wed Apr 15 08:58:51 TRT 2026" />
                        <input type="hidden" name="endDate" value="Thu Dec 31 23:58:54 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/wscxdds_0_MC/8874147577906.jpg" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/jackjones" className="campaign-desc">Payfour Kullanıcılarına Jack&amp;Jones Mağazalarında %20 İndirim!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Tue Mar 10 08:46:17 TRT 2026" />
                        <input type="hidden" name="endDate" value="Sun May 31 23:46:20 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/ddcvvvwws_0_MC/8873738567730.png" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/enuygun-otel" className="campaign-desc">Enuygun’dan Otel Rezervasyonlarında %10 İndirim!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Mon May 11 12:59:36 TRT 2026" />
                        <input type="hidden" name="endDate" value="Thu Oct 01 12:59:40 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/rrfffddddd_0_MC/8874276683826.jpg" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/starbucks" className="campaign-desc">Starbucks Mobil'de 5 Yıldız Kazan!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Thu May 21 08:58:17 TRT 2026" />
                        <input type="hidden" name="endDate" value="Wed Jun 10 23:58:19 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/ehhjnnnn_0_MC/8874675961906.jpg" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/payfour-sigortamnet" className="campaign-desc">Sigortam.net’te Poliçe Alımlarında 2.250 TL’ye Varan Payfour Bakiyesi Hediye!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Fri May 01 14:14:58 TRT 2026" />
                        <input type="hidden" name="endDate" value="Sun May 31 23:59:00 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/dndndmd_0_MC/8873526951986.jpg" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/payfour-puan" className="campaign-desc">Payfour ile Ödemelerde %5 Puan!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Fri Oct 31 14:56:44 TRT 2025" />
                        <input type="hidden" name="endDate" value="Thu Dec 31 14:56:59 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/dccvvcccc_0_MC/8873251176498.jpg" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/payfour-150tl-puan" className="campaign-desc">Payfour ile Ödemelere 150 TL Puan!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Wed Apr 15 16:07:17 TRT 2026" />
                        <input type="hidden" name="endDate" value="Thu Dec 31 16:07:20 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/gdndndnd_0_MC/8874147512370.jpg" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/jackjones-online" className="campaign-desc">Payfour Kullanıcılarına Jack&amp;Jones Web Sitesi ve Uygulamasında %20 İndirim!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Fri May 01 11:17:43 TRT 2026" />
                        <input type="hidden" name="endDate" value="Sun May 31 23:17:45 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/wsxcvvv_0_MC/8873730900018.jpg" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/tami-payfour" className="campaign-desc">Tami Kart ile Payfour’a Özel 150 TL Nakit İade!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Wed Apr 01 14:39:45 TRT 2026" />
                        <input type="hidden" name="endDate" value="Wed Jun 30 23:39:52 TRT 2027" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/ffghjkl_0_MC/8873251733554.jpg" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/payfour-0-faiz-2-taksit" className="campaign-desc">Vade Farksız 2 Taksitte Öde!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="campaign-list-item">
                    <div className="campaign-box" data-category-id="">
                        <input type="hidden" name="startDate" value="Fri Mar 27 13:42:30 TRT 2026" />
                        <input type="hidden" name="endDate" value="Tue Jun 30 23:42:33 TRT 2026" />
                        <div className="campaign-box-middle">
                            <div className="row">
                                <div className="campaign-box-middle-right col-xs-12">
                                    <div><img decoding="async" loading="lazy" src="/api/csfour-proxy/bannerimage/556fggg_0_MC/8874453925938.png" className="img-responsive center-block" /></div>
                                </div>
                                <div className="campaign-box-middle-left col-xs-12 m-0">
                                    <a href="/kampanya/payfouryandex" className="campaign-desc">Yandex Al ile Payfour'da 200 TL Bakiye Hediye!</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}