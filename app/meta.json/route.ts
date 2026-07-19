import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        "name": "Stanley 1913",
        "description": "Shop Stanley insulated drinkware.",
        "facebook-domain-verification": ""
    });
}
