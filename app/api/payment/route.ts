import { NextResponse, NextRequest } from 'next/server';
import config from '../../../config.json';

export async function POST(request: NextRequest) {
    try {
        const { sourceId, amount, description, verificationToken } = await request.json();

        if (!sourceId) return NextResponse.json({ error: 'Missing payment source.' }, { status: 400 });
        if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });

        const cents = Math.round(parseFloat(amount) * 100);

        const body: Record<string, any> = {
            idempotency_key: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
            source_id: sourceId,
            amount_money: { amount: cents, currency: 'USD' },
            location_id: process.env.SQUARE_LOCATION_ID!,
            note: description || `${config.brand.name} — Service Payment`,
            autocomplete: true,
        };

        if (verificationToken) body.verification_token = verificationToken;

        const res = await fetch('https://connect.squareup.com/v2/payments', {
            method: 'POST',
            headers: {
                'Square-Version': process.env.SQUARE_API_VERSION || '2024-03-20',
                Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Square payment error:', JSON.stringify(data));
            return NextResponse.json({ error: 'Payment failed', details: data.errors || data }, { status: res.status });
        }

        return NextResponse.json({
            success: true,
            paymentId: data.payment?.id,
            status: data.payment?.status,
            receiptUrl: data.payment?.receipt_url,
        });
    } catch (err: unknown) {
        console.error('Payment error:', err);
        return NextResponse.json(
            { error: 'Server error', details: err instanceof Error ? err.message : 'Unknown' },
            { status: 500 }
        );
    }
}
