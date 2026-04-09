import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg:        #f7f4ee;
    --surface:   #ffffff;
    --surface2:  #f2ede4;
    --border:    rgba(0,0,0,0.07);
    --gold:      #b8790a;
    --gold-glow: rgba(184,121,10,0.12);
    --teal:      #0d9488;
    --blue:      #2563eb;
    --amber:     #d97706;
    --text:      #1c1812;
    --muted:     #6b6458;
    --subtle:    #a39888;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ft { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

  .ft-serif  { font-family: 'Playfair Display', Georgia, serif; }
  .ft-mono   { font-family: 'DM Mono', 'Courier New', monospace; }

  /* Nav */
  .ft-nav {
    position: sticky; top: 0; z-index: 50;
    background: rgba(247,244,238,0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .ft-nav-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 28px;
    height: 64px; display: flex; align-items: center; justify-content: space-between;
  }
  .ft-logo-mark {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, #b8790a, #7c4f06);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 12px rgba(184,121,10,0.2);
    flex-shrink: 0;
  }
  .ft-logo-name {
    font-size: 17px; font-weight: 700; color: var(--text);
    letter-spacing: -0.01em;
  }

  /* Buttons */
  .ft-btn-primary {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 11px 24px; background: var(--gold); color: #ffffff;
    font-weight: 700; font-size: 14px; border-radius: 12px;
    text-decoration: none; transition: all 0.2s ease; letter-spacing: 0.01em;
    border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
  }
  .ft-btn-primary:hover {
    background: #9e6608; transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(184,121,10,0.25);
  }
  .ft-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 11px 22px; background: transparent; color: var(--muted);
    font-weight: 500; font-size: 14px; border-radius: 12px;
    text-decoration: none; border: 1px solid var(--border);
    transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .ft-btn-ghost:hover {
    color: var(--text); border-color: rgba(0,0,0,0.18);
    background: rgba(0,0,0,0.03);
  }
  .ft-btn-cta {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 15px 36px; background: var(--gold); color: #ffffff;
    font-weight: 700; font-size: 16px; border-radius: 14px;
    text-decoration: none; transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif; border: none; cursor: pointer;
  }
  .ft-btn-cta:hover {
    background: #9e6608; transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(184,121,10,0.3);
  }
  .ft-btn-cta-ghost {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 15px 28px; background: transparent; color: var(--muted);
    font-weight: 500; font-size: 16px; border-radius: 14px;
    text-decoration: none; border: 1px solid rgba(0,0,0,0.12);
    transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .ft-btn-cta-ghost:hover { color: var(--text); border-color: rgba(0,0,0,0.22); }

  /* Nav link */
  .ft-nav-link {
    padding: 8px 14px; font-size: 14px; color: var(--muted);
    text-decoration: none; font-weight: 500; transition: color 0.2s;
  }
  .ft-nav-link:hover { color: var(--text); }

  /* Badge */
  .ft-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px; background: rgba(184,121,10,0.08);
    border: 1px solid rgba(184,121,10,0.2); border-radius: 999px;
    font-size: 11px; font-weight: 700; color: var(--gold);
    letter-spacing: 0.08em; text-transform: uppercase;
    font-family: 'DM Mono', monospace;
  }

  /* Hero */
  .ft-hero {
    padding: 88px 0 72px; position: relative; overflow: hidden;
  }
  .ft-hero-glow-1 {
    position: absolute; top: -80px; left: 40%;
    width: 700px; height: 600px;
    background: radial-gradient(ellipse, rgba(184,121,10,0.06), transparent 70%);
    pointer-events: none; transform: translateX(-50%);
  }
  .ft-hero-glow-2 {
    position: absolute; top: 80px; right: -80px;
    width: 450px; height: 450px;
    background: radial-gradient(circle, rgba(13,148,136,0.04), transparent 70%);
    pointer-events: none;
  }
  .ft-hero-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 28px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
  }
  .ft-h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2.6rem, 4.5vw, 4.2rem);
    line-height: 1.08; font-weight: 900; color: var(--text);
    letter-spacing: -0.02em; margin: 28px 0 24px;
  }
  .ft-h1 em { font-style: italic; color: var(--gold); }
  .ft-hero-sub { font-size: 17px; color: var(--muted); line-height: 1.7; max-width: 420px; }
  .ft-hero-ctas { margin-top: 36px; display: flex; gap: 12px; flex-wrap: wrap; }

  /* Budget card */
  .ft-budget-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 24px;
    padding: 28px; position: relative; overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  }
  .ft-budget-card::after {
    content: ''; position: absolute; top: -80px; right: -80px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(184,121,10,0.07), transparent 70%);
    pointer-events: none;
  }
  .ft-bar-track {
    height: 6px; background: rgba(0,0,0,0.07); border-radius: 999px;
    overflow: hidden; margin-top: 10px;
  }
  .ft-bar-fill { height: 100%; border-radius: 999px; transition: width 1.4s cubic-bezier(0.34,1.2,0.64,1); }
  .ft-divider { height: 1px; background: var(--border); }

  /* Stats */
  .ft-stats { border-top: 1px solid rgba(0,0,0,0.06); border-bottom: 1px solid rgba(0,0,0,0.06); background: #ffffff; }
  .ft-stats-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 28px;
    display: grid; grid-template-columns: repeat(3,1fr);
  }
  .ft-stat {
    padding: 36px 24px; text-align: center;
    border-right: 1px solid rgba(0,0,0,0.06);
  }
  .ft-stat:last-child { border-right: none; }
  .ft-stat-val {
    font-family: 'Playfair Display', serif; font-size: 2.8rem;
    font-weight: 700; line-height: 1; color: var(--text);
  }
  .ft-stat-lbl {
    font-size: 12px; color: var(--muted); margin-top: 8px;
    font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
    font-family: 'DM Mono', monospace;
  }

  /* Features */
  .ft-features { padding: 88px 0; }
  .ft-features-inner { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
  .ft-features-header { margin-bottom: 52px; }
  .ft-section-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--gold);
    margin-bottom: 16px; font-family: 'DM Mono', monospace;
  }
  .ft-h2 {
    font-family: 'Playfair Display', serif; font-size: 2.2rem;
    font-weight: 700; line-height: 1.2; color: var(--text); max-width: 420px;
  }
  .ft-features-grid {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 14px;
  }
  .ft-feature-card {
    padding: 28px; background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; transition: all 0.25s ease; position: relative; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .ft-feature-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--accent), transparent);
    opacity: 0; transition: opacity 0.25s;
  }
  .ft-feature-card:hover::before { opacity: 1; }
  .ft-feature-card:hover {
    transform: translateY(-3px); border-color: rgba(0,0,0,0.1);
    box-shadow: 0 12px 32px rgba(0,0,0,0.09);
  }
  .ft-feature-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px; background: var(--icon-bg);
  }
  .ft-feature-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
  .ft-feature-desc { font-size: 13.5px; color: var(--muted); line-height: 1.65; }

  /* CTA */
  .ft-cta { padding: 0 0 88px; }
  .ft-cta-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 28px;
  }
  .ft-cta-box {
    border-radius: 28px; padding: 72px 48px;
    background: linear-gradient(135deg, #1c1812 0%, #2d2418 50%, #1c1812 100%);
    border: 1px solid rgba(184,121,10,0.2);
    position: relative; overflow: hidden; text-align: center;
  }
  .ft-cta-glow {
    position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
    width: 500px; height: 350px;
    background: radial-gradient(ellipse, rgba(184,121,10,0.12), transparent 70%);
    pointer-events: none;
  }
  .ft-cta-h2 {
    font-family: 'Playfair Display', serif; font-size: 2.6rem;
    font-weight: 700; color: #f7f4ee; line-height: 1.18;
    margin-bottom: 16px; position: relative;
  }
  .ft-cta-sub {
    font-size: 16px; color: rgba(247,244,238,0.65); max-width: 420px;
    margin: 0 auto 40px; line-height: 1.65; position: relative;
  }
  .ft-cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; position: relative; }
  .ft-btn-cta-inv {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 15px 36px; background: #b8790a; color: #ffffff;
    font-weight: 700; font-size: 16px; border-radius: 14px;
    text-decoration: none; transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif; border: none; cursor: pointer;
  }
  .ft-btn-cta-inv:hover { background: #9e6608; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(184,121,10,0.4); }
  .ft-btn-cta-ghost-inv {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 15px 28px; background: transparent; color: rgba(247,244,238,0.65);
    font-weight: 500; font-size: 16px; border-radius: 14px;
    text-decoration: none; border: 1px solid rgba(247,244,238,0.18);
    transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .ft-btn-cta-ghost-inv:hover { color: #f7f4ee; border-color: rgba(247,244,238,0.32); }

  /* Footer */
  .ft-footer {
    border-top: 1px solid rgba(0,0,0,0.06); padding: 28px 0; background: #ffffff;
  }
  .ft-footer-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 28px;
    display: flex; align-items: center; justify-content: space-between;
  }

  /* Pulse animation */
  @keyframes pulse-gold {
    0%,100% { box-shadow: 0 0 0 0 rgba(184,121,10,0.35); }
    50% { box-shadow: 0 0 0 5px rgba(184,121,10,0); }
  }
  .ft-pulse { animation: pulse-gold 2s ease infinite; border-radius: 50%; }

  /* Fade-up entrance */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ft-fu   { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .ft-d1   { animation-delay: 0.08s; }
  .ft-d2   { animation-delay: 0.18s; }
  .ft-d3   { animation-delay: 0.28s; }
  .ft-d4   { animation-delay: 0.38s; }

  /* Responsive */
  @media (max-width: 900px) {
    .ft-hero-inner { grid-template-columns: 1fr; gap: 48px; }
    .ft-features-grid { grid-template-columns: repeat(2,1fr); }
    .ft-stats-inner { grid-template-columns: 1fr; }
    .ft-stat { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.06); }
    .ft-stat:last-child { border-bottom: none; }
    .ft-cta-box { padding: 48px 28px; }
    .ft-cta-h2 { font-size: 2rem; }
  }
  @media (max-width: 600px) {
    .ft-hero { padding: 56px 0 48px; }
    .ft-features-grid { grid-template-columns: 1fr; }
    .ft-h1 { font-size: 2.4rem; }
    .ft-hero-sub { font-size: 15px; }
  }
`;

function BudgetRow({ label, pct, colorHex, amount, delay = 0 }) {
    const [barWidth, setBarWidth] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => {
            setBarWidth(pct);
            let s = 0;
            const fps = 1000 / 60;
            const inc = amount / (1400 / fps);
            const id = setInterval(() => {
                s = Math.min(s + inc, amount);
                setCount(Math.floor(s));
                if (s >= amount) clearInterval(id);
            }, fps);
        }, delay);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: colorHex, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '11px', color: 'var(--subtle)', fontFamily: 'DM Mono, monospace' }}>
                        R$ {count.toLocaleString('pt-BR')}
                    </span>
                    <span style={{ fontSize: '19px', color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
                        {pct}%
                    </span>
                </div>
            </div>
            <div className="ft-bar-track">
                <div className="ft-bar-fill" style={{ width: `${barWidth}%`, background: colorHex }} />
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, accent }) {
    const iconBg = accent + '14';
    return (
        <div className="ft-feature-card" style={{ '--accent': accent }}>
            <div className="ft-feature-icon" style={{ '--icon-bg': iconBg }}>
                <span style={{ color: accent, display: 'flex' }}>{icon}</span>
            </div>
            <div className="ft-feature-title">{title}</div>
            <div className="ft-feature-desc">{description}</div>
        </div>
    );
}

const IconGrid = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
const IconTrend = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
);
const IconBolt = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);
const IconCoin = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const IconReceipt = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const IconPie = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
);
const IconWallet = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
);

export default function Welcome({ auth, canLogin, canRegister }) {
    return (
        <>
            <Head title="FinTrack — Gestão Financeira Inteligente">
                <style>{css}</style>
            </Head>

            <div className="ft">
                {/* ── Nav ── */}
                <header className="ft-nav">
                    <div className="ft-nav-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="ft-logo-mark"><IconWallet /></div>
                            <span className="ft-logo-name">FinTrack</span>
                        </div>
                        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {auth.user ? (
                                <Link href={route('dashboard')} className="ft-btn-primary">Painel</Link>
                            ) : (
                                <>
                                    {canLogin && <Link href={route('login')} className="ft-nav-link">Entrar</Link>}
                                    {canRegister && <Link href={route('register')} className="ft-btn-primary">Criar conta</Link>}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="ft-hero">
                    <div className="ft-hero-glow-1" />
                    <div className="ft-hero-glow-2" />
                    <div className="ft-hero-inner">
                        {/* Left: copy */}
                        <div>
                            <div className="ft-badge ft-fu">
                                <div className="ft-pulse" style={{ width: '6px', height: '6px', background: 'var(--gold)' }} />
                                Regra 50 · 30 · 20
                            </div>
                            <h1 className="ft-h1 ft-fu ft-d1">
                                Controle total<br />das suas <em>finanças</em>
                            </h1>
                            <p className="ft-hero-sub ft-fu ft-d2">
                                Aplique a regra 50/30/20 de forma automática, acompanhe seus gastos e alcance suas metas financeiras com clareza.
                            </p>
                            <div className="ft-hero-ctas ft-fu ft-d3">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="ft-btn-cta">Ir para o Painel →</Link>
                                ) : (
                                    <>
                                        {canRegister && <Link href={route('register')} className="ft-btn-cta">Começar grátis →</Link>}
                                        {canLogin && <Link href={route('login')} className="ft-btn-ghost" style={{ padding: '15px 28px', fontSize: '15px' }}>Já tenho conta</Link>}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: budget card */}
                        <div className="ft-fu ft-d2">
                            <div className="ft-budget-card">
                                {/* Card header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <div>
                                        <div className="ft-mono" style={{ fontSize: '11px', color: 'var(--subtle)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                                            Renda mensal
                                        </div>
                                        <div className="ft-mono" style={{ fontSize: '30px', fontWeight: 500, color: 'var(--text)' }}>
                                            R$ 5.000
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '6px 12px', borderRadius: '8px',
                                        background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.18)',
                                        fontSize: '12px', color: 'var(--teal)', fontWeight: 600,
                                    }}>
                                        ✓ Balanceado
                                    </div>
                                </div>

                                <div className="ft-divider" style={{ marginBottom: '24px' }} />

                                <BudgetRow label="Necessidades" pct={50} colorHex="#2563eb" amount={2500} delay={400} />
                                <BudgetRow label="Desejos"      pct={30} colorHex="#d97706" amount={1500} delay={650} />
                                <BudgetRow label="Economia"     pct={20} colorHex="#0d9488" amount={1000} delay={900} />

                                <div className="ft-divider" style={{ margin: '8px 0 20px' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--subtle)', fontWeight: 500 }}>Meta de emergência</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '88px', height: '4px', background: 'rgba(0,0,0,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                                            <div style={{ width: '65%', height: '100%', background: 'var(--teal)', borderRadius: '999px' }} />
                                        </div>
                                        <span className="ft-mono" style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 500 }}>65%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Stats ── */}
                <div className="ft-stats">
                    <div className="ft-stats-inner">
                        {[
                            { value: '50/30/20', label: 'Regra de ouro do orçamento' },
                            { value: '3 buckets', label: 'Categorias inteligentes' },
                            { value: '100%', label: 'Gratuito para sempre' },
                        ].map((s, i) => (
                            <div key={i} className="ft-stat">
                                <div className="ft-stat-val ft-serif">{s.value}</div>
                                <div className="ft-stat-lbl">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Features ── */}
                <section className="ft-features">
                    <div className="ft-features-inner">
                        <div className="ft-features-header">
                            <div className="ft-section-eyebrow">Funcionalidades</div>
                            <h2 className="ft-h2">Tudo que você precisa para prosperar</h2>
                        </div>
                        <div className="ft-features-grid">
                            <FeatureCard accent="#2563eb" icon={<IconGrid />}
                                title="Regra 50/30/20"
                                description="Divida sua renda automaticamente em Necessidades, Desejos e Economia. Percentuais totalmente customizáveis." />
                            <FeatureCard accent="#d97706" icon={<IconTrend />}
                                title="Metas Inteligentes"
                                description="Defina metas financeiras e veja a previsão de quando será alcançada baseada na sua economia real." />
                            <FeatureCard accent="#0d9488" icon={<IconBolt />}
                                title="Modo Fast-Track"
                                description="Simule redirecionamento de gastos e descubra quantos dias antes você atinge sua meta." />
                            <FeatureCard accent="#7c3aed" icon={<IconCoin />}
                                title="Múltiplas Rendas"
                                description="Cadastre salário, freelance, renda passiva. Tudo normalizado para cálculo mensal automático." />
                            <FeatureCard accent="#e11d48" icon={<IconReceipt />}
                                title="Tracker de Despesas"
                                description="Registre cada gasto com categoria e bucket. Veja exatamente onde seu dinheiro está indo." />
                            <FeatureCard accent="#059669" icon={<IconPie />}
                                title="Planejado vs. Real"
                                description="Compare o que você planejou gastar com o que realmente gastou. Insights visuais e claros." />
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="ft-cta">
                    <div className="ft-cta-inner">
                        <div className="ft-cta-box">
                            <div className="ft-cta-glow" />
                            <div className="ft-badge" style={{ marginBottom: '28px', background: 'rgba(184,121,10,0.15)', border: '1px solid rgba(184,121,10,0.3)', color: '#e8b84b' }}>
                                <div className="ft-pulse" style={{ width: '6px', height: '6px', background: '#e8b84b' }} />
                                Comece hoje
                            </div>
                            <h2 className="ft-cta-h2">
                                Sua liberdade financeira<br />começa com um passo
                            </h2>
                            <p className="ft-cta-sub">
                                Gratuito, simples e projetado para ajudar você a atingir seus objetivos financeiros.
                            </p>
                            <div className="ft-cta-actions">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="ft-btn-cta-inv">Abrir Painel →</Link>
                                ) : (
                                    <>
                                        {canRegister && <Link href={route('register')} className="ft-btn-cta-inv">Criar minha conta →</Link>}
                                        {canLogin && <Link href={route('login')} className="ft-btn-cta-ghost-inv">Já tenho conta</Link>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="ft-footer">
                    <div className="ft-footer-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '26px', height: '26px', borderRadius: '7px',
                                background: 'linear-gradient(135deg, #b8790a, #7c4f06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>FinTrack</span>
                        </div>
                        <p className="ft-mono" style={{ fontSize: '12px', color: 'var(--subtle)' }}>Gestão financeira inteligente</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
