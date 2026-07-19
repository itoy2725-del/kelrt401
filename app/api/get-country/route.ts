import { NextRequest, NextResponse } from 'next/server';

const countryNames: Record<string, string> = {
    'AF':'Afghanistan','AL':'Albania','DZ':'Algeria','AD':'Andorra','AO':'Angola',
    'AR':'Argentina','AM':'Armenia','AU':'Australia','AT':'Austria','AZ':'Azerbaijan',
    'BS':'Bahamas','BH':'Bahrain','BD':'Bangladesh','BB':'Barbados','BY':'Belarus',
    'BE':'Belgium','BZ':'Belize','BJ':'Benin','BT':'Bhutan','BO':'Bolivia',
    'BA':'Bosnia and Herzegovina','BW':'Botswana','BR':'Brazil','BN':'Brunei','BG':'Bulgaria',
    'CA':'Canada','CL':'Chile','CN':'China','CO':'Colombia','CR':'Costa Rica',
    'HR':'Croatia','CU':'Cuba','CY':'Cyprus','CZ':'Czech Republic','DK':'Denmark',
    'DO':'Dominican Republic','EC':'Ecuador','EG':'Egypt','SV':'El Salvador','EE':'Estonia',
    'ET':'Ethiopia','FI':'Finland','FR':'France','GE':'Georgia','DE':'Germany',
    'GH':'Ghana','GR':'Greece','GT':'Guatemala','HN':'Honduras','HK':'Hong Kong',
    'HU':'Hungary','IS':'Iceland','IN':'India','ID':'Indonesia','IR':'Iran','IQ':'Iraq',
    'IE':'Ireland','IL':'Israel','IT':'Italy','JM':'Jamaica','JP':'Japan','JO':'Jordan',
    'KZ':'Kazakhstan','KE':'Kenya','KR':'South Korea','KW':'Kuwait','LV':'Latvia',
    'LB':'Lebanon','LT':'Lithuania','LU':'Luxembourg','MY':'Malaysia','MX':'Mexico',
    'MA':'Morocco','NL':'Netherlands','NZ':'New Zealand','NG':'Nigeria','NO':'Norway',
    'PK':'Pakistan','PA':'Panama','PY':'Paraguay','PE':'Peru','PH':'Philippines',
    'PL':'Poland','PT':'Portugal','QA':'Qatar','RO':'Romania','RU':'Russia',
    'SA':'Saudi Arabia','RS':'Serbia','SG':'Singapore','SK':'Slovakia','SI':'Slovenia',
    'ZA':'South Africa','ES':'Spain','LK':'Sri Lanka','SE':'Sweden','CH':'Switzerland',
    'TW':'Taiwan','TH':'Thailand','TR':'Turkey','UA':'Ukraine','AE':'United Arab Emirates',
    'GB':'United Kingdom','US':'United States','UY':'Uruguay','UZ':'Uzbekistan',
    'VE':'Venezuela','VN':'Vietnam',
};

function countryCodeToFlag(code: string): string {
    const upper = code.toUpperCase();
    const codePoints = [...upper].map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
}

export async function GET(request: NextRequest) {
    try {
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

        // Vercel geolocation headers
        let countryCode = request.headers.get('x-vercel-ip-country') || '';

        // Fallback: ip-api.com ile tespit
        if (!countryCode && ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
            try {
                const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, { signal: AbortSignal.timeout(3000) });
                const data = await res.json();
                if (data.countryCode) countryCode = data.countryCode;
            } catch {}
        }

        if (!countryCode) countryCode = 'US';
        countryCode = countryCode.toUpperCase();

        return NextResponse.json({
            success: true,
            country: countryCode,
            countryName: countryNames[countryCode] || countryCode,
            flag: countryCodeToFlag(countryCode),
        });
    } catch (error: any) {
        console.error('Country detection error:', error);
        return NextResponse.json({
            success: false,
            country: 'US',
            countryName: 'United States',
            flag: '🇺🇸',
        }, { status: 500 });
    }
}
