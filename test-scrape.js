async function test() {
    const res = await fetch('https://www.karaca.com/yemek-takimlari', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    });
    const html = await res.text();
    
    // Extract JSON-LD ItemList
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
            const data = JSON.parse(match[1]);
            if (data['@type'] === 'ItemList') {
                console.log('Found ItemList!');
                console.log('Items count:', data.itemListElement.length);
                
                // Show first item
                const first = data.itemListElement[0];
                console.log('\nFirst item:', JSON.stringify(first, null, 2).substring(0, 1000));
                
                // Show structure
                const product = first.item;
                console.log('\nProduct keys:', Object.keys(product));
                console.log('Name:', product.name);
                console.log('Image:', product.image ? (Array.isArray(product.image) ? product.image.length + ' images' : product.image) : 'none');
                if (Array.isArray(product.image)) {
                    console.log('Images:', product.image.slice(0, 4));
                }
                console.log('Offers:', JSON.stringify(product.offers).substring(0, 300));
                console.log('Brand:', product.brand);
                console.log('URL:', product.url);
                console.log('SKU:', product.sku);
                console.log('Description:', product.description ? product.description.substring(0, 100) : 'none');
                
                // Check all items for URLs
                console.log('\n=== ALL PRODUCT URLS ===');
                for (let i = 0; i < Math.min(5, data.itemListElement.length); i++) {
                    const item = data.itemListElement[i].item;
                    console.log(`${i+1}. ${item.name} | ${item.url}`);
                }
            }
        } catch (e) {
            // ignore
        }
    }
    
    // Also extract from href full URLs
    const fullUrlRegex = /href="(https:\/\/www\.karaca\.com\/urun\/[^"]+)"/g;
    const urls = new Set();
    let m;
    while ((m = fullUrlRegex.exec(html)) !== null) {
        urls.add(m[1]);
    }
    console.log('\n=== HREF FULL URLS ===');
    console.log('Unique product URLs:', urls.size);
    const urlArr = [...urls];
    console.log('First 5:', urlArr.slice(0, 5));
    
    // Also try to get product detail page images
    console.log('\n=== TESTING PRODUCT DETAIL PAGE ===');
    const detailRes = await fetch(urlArr[0], {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    });
    const detailHtml = await detailRes.text();
    
    // Find JSON-LD on detail page
    const detailJsonLd = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let dm;
    while ((dm = detailJsonLd.exec(detailHtml)) !== null) {
        try {
            const data = JSON.parse(dm[1]);
            if (data['@type'] === 'Product') {
                console.log('\nProduct Detail JSON-LD:');
                console.log('Name:', data.name);
                console.log('Brand:', data.brand);
                console.log('SKU:', data.sku);
                console.log('Description:', data.description ? data.description.substring(0, 200) : 'none');
                console.log('Image:', data.image);
                console.log('Offers:', JSON.stringify(data.offers).substring(0, 500));
                console.log('AggregateRating:', data.aggregateRating);
            }
        } catch (e) { /* ignore */ }
    }
    
    // Find CDN images on detail page
    const cdnImages = detailHtml.match(/https:\/\/cdn\.karaca\.com\/[^"'\s)]+\.(jpg|jpeg|png|webp)/gi);
    if (cdnImages) {
        const unique = [...new Set(cdnImages)];
        console.log('\nCDN Images found:', unique.length);
        console.log('First 6:', unique.slice(0, 6));
    }
}

test().catch(console.error);
