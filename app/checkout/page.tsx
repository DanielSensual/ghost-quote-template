'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import config from '../../config.json';

declare global {
    interface Window { Square?: any; }
}

const APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID!;
const LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!;

function CheckoutContent() {
    const searchParams = useSearchParams();
    const amount = parseFloat(searchParams.get('amount') || '0');
    const desc = searchParams.get('desc') || `${config.brand.name} — Service`;

    const cardRef = useRef<HTMLDivElement>(null);
    const googlePayBtnRef = useRef<HTMLDivElement>(null);
    const cardInstanceRef = useRef<any>(null);
    const applePayInstanceRef = useRef<any>(null);
    const googlePayInstanceRef = useRef<any>(null);

    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ id: string; receipt?: string } | null>(null);
    const [applePayReady, setApplePayReady] = useState(false);
    const [googlePayReady, setGooglePayReady] = useState(false);
    const [walletSetupComplete, setWalletSetupComplete] = useState(false);

    const fmt = (n: number) => '$' + n.toLocaleString('en-US');

    useEffect(() => {
        if (document.getElementById('square-web-sdk')) { setSdkLoaded(true); return; }
        const script = document.createElement('script');
        script.id = 'square-web-sdk';
        script.src = 'https://web.squarecdn.com/v1/square.js';
        script.onload = () => setSdkLoaded(true);
        script.onerror = () => setError('Failed to load payment SDK.');
        document.head.appendChild(script);
    }, []);

    const processPayment = useCallback(async (sourceId: string, verificationToken?: string) => {
        setProcessing(true);
        setError(null);
        try {
            const res = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceId, amount, description: desc, verificationToken }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.details?.[0]?.detail || data.error || 'Payment failed');
            }
            setSuccess({ id: data.paymentId, receipt: data.receiptUrl });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setProcessing(false);
        }
    }, [amount, desc]);

    const tokenizeWallet = useCallback(async (walletInstance: any, label: string) => {
        if (!walletInstance) return;
        setProcessing(true);
        setError(null);
        try {
            const tokenResult = await walletInstance.tokenize();
            if (tokenResult.status === 'OK') { await processPayment(tokenResult.token); return; }
            const msg = tokenResult.errors?.map((e: any) => e.message || e.detail).filter(Boolean).join(' ');
            setError(msg || `${label} tokenization failed.`);
            setProcessing(false);
        } catch (e: any) {
            setError(e.message || `${label} failed.`);
            setProcessing(false);
        }
    }, [processPayment]);

    useEffect(() => {
        if (!sdkLoaded || !window.Square || amount <= 0) return;
        let cancelled = false;
        const gpBtnNode = googlePayBtnRef.current;

        const init = async () => {
            try {
                setError(null);
                setApplePayReady(false);
                setGooglePayReady(false);
                setWalletSetupComplete(false);

                const payments = window.Square.payments(APP_ID, LOCATION_ID);

                if (cardRef.current) {
                    cardRef.current.innerHTML = '';
                    const card = await payments.card();
                    await card.attach(cardRef.current);
                    if (cancelled) { await card.destroy(); return; }
                    cardInstanceRef.current = card;
                }

                const paymentRequest = payments.paymentRequest({
                    countryCode: 'US', currencyCode: 'USD',
                    total: { amount: amount.toFixed(2), label: desc },
                });

                try {
                    const applePay = await payments.applePay(paymentRequest);
                    if (cancelled) { await applePay.destroy(); return; }
                    applePayInstanceRef.current = applePay;
                    setApplePayReady(true);
                } catch { /* Apple Pay not available */ }

                if (gpBtnNode) { gpBtnNode.innerHTML = ''; gpBtnNode.onclick = null; }
                try {
                    const googlePay = await payments.googlePay(paymentRequest);
                    await googlePay.attach(gpBtnNode);
                    if (cancelled) { await googlePay.destroy(); return; }
                    googlePayInstanceRef.current = googlePay;
                    if (gpBtnNode) {
                        gpBtnNode.onclick = async (event: MouseEvent) => {
                            event.preventDefault();
                            await tokenizeWallet(googlePay, 'Google Pay');
                        };
                    }
                    setGooglePayReady(true);
                } catch { /* Google Pay not available */ }

                if (!cancelled) setWalletSetupComplete(true);
            } catch (e: any) {
                setError('Failed to initialize payment form: ' + e.message);
                if (!cancelled) setWalletSetupComplete(true);
            }
        };

        init();

        return () => {
            cancelled = true;
            if (gpBtnNode) { gpBtnNode.onclick = null; gpBtnNode.innerHTML = ''; }
            const destroyers = [
                cardInstanceRef.current?.destroy?.(),
                applePayInstanceRef.current?.destroy?.(),
                googlePayInstanceRef.current?.destroy?.(),
            ].filter(Boolean);
            Promise.allSettled(destroyers).catch(() => {});
            cardInstanceRef.current = null;
            applePayInstanceRef.current = null;
            googlePayInstanceRef.current = null;
        };
    }, [sdkLoaded, amount, desc, tokenizeWallet]);

    const handleCardPayment = async () => {
        if (!cardInstanceRef.current) return;
        setProcessing(true);
        setError(null);
        try {
            const result = await cardInstanceRef.current.tokenize();
            if (result.status !== 'OK') {
                setError(result.errors?.[0]?.message || 'Card tokenization failed.');
                setProcessing(false);
                return;
            }

            let verificationToken: string | undefined;
            try {
                const payments = window.Square.payments(APP_ID, LOCATION_ID);
                const verifyResult = await payments.verifyBuyer(result.token, {
                    amount: amount.toFixed(2),
                    billingContact: {},
                    currencyCode: 'USD',
                    intent: 'CHARGE',
                });
                verificationToken = verifyResult?.token;
            } catch {
                // Verification not required for all regions
            }

            await processPayment(result.token, verificationToken);
        } catch (e: any) { setError(e.message); setProcessing(false); }
    };

    const handleApplePayPayment = async () => {
        await tokenizeWallet(applePayInstanceRef.current, 'Apple Pay');
    };

    const hasWallets = applePayReady || googlePayReady;

    if (amount <= 0) {
        return (
            <div className="checkout-shell">
                <div className="checkout-card">
                    <div style={{ textAlign: 'center', color: '#f87171', padding: 40 }}>Invalid payment amount.</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg: #060608; --card: #111113; --card-border: rgba(255,255,255,0.08);
                    --white: #f5f5f7; --muted: #a1a1a6;
                    --accent: #ffffff; --green: #22c55e;
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { background: var(--bg); color: var(--white); font-family: '${config.brand.font}', -apple-system, sans-serif; }
                .checkout-shell {
                    min-height: 100vh; display: flex; align-items: center; justify-content: center;
                    padding: 40px 20px;
                    background: radial-gradient(ellipse at 50% 20%, rgba(72,72,72,0.12), transparent 60%);
                }
                .checkout-card {
                    width: 100%; max-width: 480px;
                    background: var(--card); border: 1px solid var(--card-border);
                    border-radius: 26px; padding: 40px 32px;
                    box-shadow: 0 32px 80px rgba(0,0,0,0.45);
                }
                @media (max-width: 480px) { .checkout-card { padding: 28px 20px; } }
                .checkout-brand {
                    font-size: 22px; font-weight: 800;
                    letter-spacing: 0.14em; color: var(--white); text-align: center;
                    text-transform: uppercase;
                }
                .checkout-sub {
                    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
                    color: var(--muted); text-align: center; margin-top: 4px;
                }
                .checkout-amount-box {
                    margin: 28px 0; padding: 20px; border-radius: 18px;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
                    text-align: center;
                }
                .checkout-desc { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
                .checkout-amount { font-size: 36px; font-weight: 800; color: var(--white); letter-spacing: -0.04em; }
                .sq-card-container { min-height: 90px; margin-bottom: 16px; }
                .pay-action-btn {
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    width: 100%; padding: 16px; border: none; border-radius: 999px;
                    cursor: pointer; font-family: inherit;
                    font-size: 15px; font-weight: 700; letter-spacing: 0.05em;
                    text-transform: uppercase; transition: all 0.2s;
                }
                .pay-action-btn.primary {
                    background: #ffffff; color: #060608;
                    box-shadow: 0 8px 28px rgba(255,255,255,0.1);
                }
                .pay-action-btn.primary:hover:not(:disabled) {
                    transform: translateY(-2px); box-shadow: 0 12px 36px rgba(255,255,255,0.15);
                }
                .pay-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .divider {
                    display: flex; align-items: center; gap: 16px;
                    margin: 24px 0; font-size: 11px;
                    color: rgba(161,161,166,0.5); text-transform: uppercase; letter-spacing: 0.15em;
                }
                .divider::before, .divider::after {
                    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08);
                }
                .wallet-section {
                    display: flex; flex-direction: column; gap: 12px;
                    padding: 20px; border-radius: 18px;
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
                }
                .wallet-label {
                    font-size: 10px; font-weight: 600; letter-spacing: 0.15em;
                    text-transform: uppercase; color: var(--muted); text-align: center; margin-bottom: 4px;
                }
                .wallet-btn-container { min-height: 48px; border-radius: 8px; overflow: hidden; width: 100%; }
                .apple-pay-btn {
                    width: 100%; height: 52px; border: none; border-radius: 8px;
                    cursor: pointer; -webkit-appearance: -apple-pay-button;
                    -apple-pay-button-type: buy; -apple-pay-button-style: black; transition: opacity 0.2s;
                }
                .apple-pay-btn:hover:not(:disabled) { opacity: 0.85; }
                .apple-pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .checkout-error {
                    margin-top: 16px; padding: 12px 16px; border-radius: 12px;
                    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
                    color: #f87171; font-size: 13px; text-align: center;
                }
                .checkout-success { text-align: center; padding: 40px 20px; }
                .success-icon {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 64px; height: 64px; border-radius: 50%;
                    background: rgba(34,197,94,0.1); border: 2px solid rgba(34,197,94,0.3);
                    font-size: 28px; margin-bottom: 20px;
                }
                .success-title { font-size: 22px; font-weight: 700; color: var(--green); margin-bottom: 8px; }
                .success-desc { font-size: 14px; color: var(--muted); margin-bottom: 20px; }
                .success-id { font-size: 11px; color: var(--muted); font-family: monospace; }
                .success-link {
                    display: inline-block; margin-top: 20px; padding: 12px 24px;
                    border-radius: 12px; background: rgba(34,197,94,0.08);
                    border: 1px solid rgba(34,197,94,0.2);
                    color: var(--green); text-decoration: none; font-size: 13px; font-weight: 600;
                    transition: all 0.2s;
                }
                .success-link:hover { background: rgba(34,197,94,0.15); }
                .secure-note { margin-top: 24px; text-align: center; font-size: 11px; color: rgba(161,161,166,0.6); }
                .back-link {
                    display: block; text-align: center; margin-top: 16px;
                    color: var(--muted); font-size: 12px; text-decoration: none; transition: color 0.2s;
                }
                .back-link:hover { color: var(--white); }
                .loading-state {
                    display: flex; align-items: center; justify-content: center;
                    min-height: 200px; color: var(--muted); font-size: 14px;
                }
                .spinner {
                    width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.2);
                    border-top-color: white; border-radius: 50%;
                    animation: spin 0.6s linear infinite; margin-right: 10px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="checkout-shell">
                <div className="checkout-card">
                    <div className="checkout-brand">{config.brand.name}</div>
                    <div className="checkout-sub">Secure Payment</div>

                    <div className="checkout-amount-box">
                        <div className="checkout-desc">{desc}</div>
                        <div className="checkout-amount">{fmt(amount)}</div>
                    </div>

                    {success ? (
                        <div className="checkout-success">
                            <div className="success-icon">✓</div>
                            <div className="success-title">Payment Successful</div>
                            <div className="success-desc">Thank you! Your payment has been processed.</div>
                            <div className="success-id">Payment ID: {success.id}</div>
                            {success.receipt && (
                                <a href={success.receipt} className="success-link" target="_blank" rel="noopener noreferrer">
                                    View Receipt →
                                </a>
                            )}
                            <a href="/" className="back-link">← Return to Quote</a>
                        </div>
                    ) : (
                        <>
                            {(!walletSetupComplete || hasWallets) && (
                                <div className="wallet-section">
                                    <div className="wallet-label">Express Checkout</div>
                                    {applePayReady && (
                                        <button type="button" className="apple-pay-btn"
                                            onClick={handleApplePayPayment} disabled={processing}
                                            aria-label="Pay with Apple Pay" />
                                    )}
                                    <div ref={googlePayBtnRef} className="wallet-btn-container"
                                        style={{
                                            display: walletSetupComplete && !googlePayReady ? 'none' : 'block',
                                            opacity: googlePayReady ? 1 : 0.001,
                                            pointerEvents: googlePayReady ? 'auto' : 'none',
                                        }} />
                                </div>
                            )}

                            {hasWallets && <div className="divider">or pay with card</div>}

                            {walletSetupComplete && !hasWallets && sdkLoaded && (
                                <div className="secure-note" style={{ marginTop: 0, marginBottom: 20 }}>
                                    Apple Pay and Google Pay shown when supported by your device.
                                </div>
                            )}

                            {!sdkLoaded ? (
                                <div className="loading-state"><span className="spinner" />Loading payment form...</div>
                            ) : (
                                <>
                                    <div ref={cardRef} className="sq-card-container" />
                                    <button className="pay-action-btn primary" onClick={handleCardPayment} disabled={processing}>
                                        {processing ? (<><span className="spinner" /> Processing...</>) : (<>Pay {fmt(amount)}</>)}
                                    </button>
                                </>
                            )}

                            {error && <div className="checkout-error">{error}</div>}
                            <div className="secure-note">🔒 Payments processed securely via Square</div>
                            <a href="/" className="back-link">← Back to Quote</a>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608', color: '#a1a1a6', fontFamily: 'Inter, sans-serif' }}>
                Loading checkout...
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
