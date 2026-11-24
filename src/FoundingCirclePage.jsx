import { useEffect, useMemo, useRef, useState } from 'react';

// HALLARD Founding Circle — invitation-gated founding program.
// The home page sells HALLARD; this page sells being part of its beginning. The invitation code unlocks the
// offer (client-side gate for the static site; real per-invite validation/tracking is a backend concern). The
// founding contribution (one-time) and the subscription (recurring) are always shown as SEPARATE line items.

function ArrowIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3 9h11M10 4l5 5-5 5" />
    </svg>
  );
}

function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M6 21V10.5a8 8 0 0 1 16 0V21h-5.2v-9.9a2.8 2.8 0 1 0-5.6 0V21H6Z" />
    </svg>
  );
}

// Invitation codes: a static-site gate. Configure real codes with VITE_FOUNDING_INVITE_CODES (comma-separated);
// otherwise a single launch code is accepted. Replace with a backend check before charging anyone.
const INVITE_CODES = (import.meta.env.VITE_FOUNDING_INVITE_CODES || 'HALLARD-2026')
  .split(',').map((code) => code.trim().toUpperCase()).filter(Boolean);

const env = import.meta.env;

const tiers = [
  {
    key: 'supporter', name: 'Founding Supporter', range: '$50–$149', min: 50,
    blurb: 'Believes in the vision and contributes what they can.',
    subscription: 'Starter', guidance: 'One 30-minute onboarding session', usage: '+25% monthly usage allowance',
    link: env.VITE_CLOVER_FOUNDING_SUPPORTER_PAYMENT_LINK,
  },
  {
    key: 'member', name: 'Founding Member', range: '$150–$499', min: 150,
    blurb: 'Makes a financial commitment and takes part in the community.',
    subscription: 'Starter', guidance: 'Two 30–45 minute guidance sessions', usage: '+50% monthly usage allowance',
    link: env.VITE_CLOVER_FOUNDING_MEMBER_PAYMENT_LINK,
  },
  {
    key: 'champion', name: 'Founding Champion', range: '$500–$999', min: 500,
    blurb: 'Steps up with more capacity and a direct line to the founding team.',
    subscription: 'Business', guidance: 'Two hours of 1:1 implementation and consulting', usage: '+100% monthly usage allowance',
    link: env.VITE_CLOVER_FOUNDING_CHAMPION_PAYMENT_LINK,
  },
  {
    key: 'partner', name: 'Founding Partner', range: '$1,000+', min: 1000,
    blurb: 'Helps shape the launch, the roadmap, and the first customers.',
    subscription: 'Business Plus', guidance: 'Four to six hours of implementation and consulting', usage: '+200% monthly usage or a negotiated allocation',
    link: env.VITE_CLOVER_FOUNDING_PARTNER_PAYMENT_LINK,
  },
];

const plans = [
  { name: 'Starter', price: '$47', period: '/month', link: env.VITE_CLOVER_STARTER_PAYMENT_LINK || env.VITE_STRIPE_STARTER_PAYMENT_LINK },
  { name: 'Business', price: '$197', period: '/month', link: env.VITE_CLOVER_BUSINESS_PAYMENT_LINK || env.VITE_STRIPE_BUSINESS_PAYMENT_LINK },
  { name: 'Business Plus', price: '$297', period: '/month', link: env.VITE_CLOVER_BUSINESS_PLUS_PAYMENT_LINK || env.VITE_STRIPE_BUSINESS_PLUS_PAYMENT_LINK },
  { name: 'Enterprise', price: 'Custom', period: 'pricing', link: '' },
];

const benefits = [
  { title: 'Founding access', copy: 'Special subscription privileges, founding-member pricing, and early capabilities before they reach everyone else.' },
  { title: 'Extra capacity', copy: 'A generous additional usage allowance on top of your plan, so you can build, test, and explore without watching limits.' },
  { title: 'Personal guidance', copy: 'One-on-one onboarding and implementation sessions — more hours at the higher levels — to get real work moving.' },
  { title: 'AI intelligence', copy: 'The Founding Intelligence Briefing: new models, pricing shifts, agent frameworks, and practical opportunities, delivered ongoing.' },
];

function hasLink(link) {
  return Boolean(link) && /^https:\/\//i.test(link) && !/replace|example|dummy|placeholder/i.test(link);
}

function money(value) {
  return Number.isFinite(value) ? `$${value.toLocaleString('en-US')}` : '';
}

export default function FoundingCirclePage() {
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [tierKey, setTierKey] = useState('member');
  const [customMode, setCustomMode] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [planName, setPlanName] = useState('Starter');
  const [checkout, setCheckout] = useState(null);
  const offerRef = useRef(null);

  const tier = tiers.find((entry) => entry.key === tierKey) ?? tiers[1];
  const plan = plans.find((entry) => entry.name === planName) ?? plans[0];

  const contribution = useMemo(() => {
    if (customMode) {
      const amount = Number(customAmount);
      return { label: 'Your contribution', amount: Number.isFinite(amount) && amount > 0 ? money(amount) : 'Choose an amount', link: env.VITE_CLOVER_FOUNDING_CUSTOM_PAYMENT_LINK };
    }
    return { label: tier.name, amount: tier.range, link: tier.link };
  }, [customMode, customAmount, tier]);

  function unlock(event) {
    event.preventDefault();
    const entered = code.trim().toUpperCase();
    if (!entered) { setCodeError('Enter your invitation code.'); return; }
    if (!INVITE_CODES.includes(entered)) { setCodeError('That code isn’t valid. Check your invitation and try again.'); return; }
    setCodeError('');
    setUnlocked(true);
    window.setTimeout(() => offerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  function openContribution() {
    if (!contribution.link || !hasLink(contribution.link)) { setCheckout({ kind: 'pending', title: 'Founding contribution', amount: contribution.amount }); return; }
    setCheckout({ kind: 'link', title: `${contribution.label} · ${contribution.amount}`, src: contribution.link, processor: 'Clover' });
  }

  function openSubscription() {
    if (plan.name === 'Enterprise') { setCheckout({ kind: 'enterprise' }); return; }
    if (!hasLink(plan.link)) { setCheckout({ kind: 'pending', title: `${plan.name} subscription`, amount: `${plan.price}${plan.period}` }); return; }
    setCheckout({ kind: 'link', title: `${plan.name} · ${plan.price}${plan.period}`, src: plan.link, processor: 'Clover' });
  }

  return (
    <>
      <a className="skip-link" href="#fc-main">Skip to content</a>
      <header className="fc-header">
        <div className="shell fc-header-inner">
          <a className="brand" href="/" aria-label="Hallard home">
            <img className="brand-wordmark" src="/assets/hallard-wordmark-on-dark.svg" alt="Hallard" width="176" height="50" />
          </a>
          <span className="fc-header-label">Founding Circle</span>
          <a className="button button--small" href="/">Back to Hallard</a>
        </div>
      </header>

      <main id="fc-main">
        <section className="fc-hero" id="top">
          <div className="fc-hero-glow" aria-hidden="true" />
          <div className="shell fc-hero-inner">
            <p className="eyebrow">Founding Circle · 2026</p>
            <h1>Be part of the <span>beginning.</span></h1>
            <p className="fc-lead">A personal invitation to join a select group helping build HALLARD from the start — with founding recognition, extra capacity, personal guidance, and an inside line on AI as it moves.</p>

            {!unlocked ? (
              <form className="fc-gate" onSubmit={unlock} aria-label="Enter your invitation code">
                <label htmlFor="fc-code">Personal invitation code</label>
                <div className="fc-gate-row">
                  <input id="fc-code" name="code" type="text" autoComplete="off" spellCheck="false" value={code}
                    onChange={(event) => { setCode(event.target.value); if (codeError) setCodeError(''); }}
                    placeholder="HALLARD-XXXX" aria-invalid={codeError || undefined} aria-describedby={codeError ? 'fc-code-error' : undefined} />
                  <button className="button" type="submit">Unlock invitation <ArrowIcon /></button>
                </div>
                {codeError && <p id="fc-code-error" className="fc-gate-error" role="alert">{codeError}</p>}
                <p className="fc-gate-note">Your code unlocks the program. It never charges you — you choose how to participate next.</p>
              </form>
            ) : (
              <div className="fc-unlocked" role="status">
                <Mark />
                <span>Welcome to the Founding Circle. Choose how you’d like to participate below.</span>
              </div>
            )}

            <p className="fc-launch"><i aria-hidden="true" /> Launching December 1, 2026</p>
          </div>
        </section>

        <section className="section section--paper fc-benefits" aria-labelledby="fc-benefits-title">
          <div className="shell">
            <header className="section-head">
              <p className="eyebrow">More than early access</p>
              <h2 id="fc-benefits-title">A seat at the table, not a discount code.</h2>
              <p className="section-lead">Founding Circle is recognition and participation. Every member gets the same foundation of privileges; the level shapes how much access, capacity, and guidance comes with it.</p>
            </header>
            <div className="fc-benefit-grid">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="fc-benefit">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div ref={offerRef} id="participate">
          {unlocked ? (
            <>
              <section className="section section--warm fc-participation" aria-labelledby="fc-participation-title">
                <div className="shell">
                  <header className="section-head">
                    <p className="eyebrow">Choose how you participate</p>
                    <h2 id="fc-participation-title">Pick a level — or set your own amount.</h2>
                    <p className="section-lead">These are suggested contribution levels, not a high score. Contribute what makes sense for you; the recognition and the spirit are the same.</p>
                  </header>
                  <div className="fc-tier-grid" role="radiogroup" aria-label="Founding contribution level">
                    {tiers.map((entry) => (
                      <button key={entry.key} type="button" role="radio" aria-checked={!customMode && tierKey === entry.key}
                        className={!customMode && tierKey === entry.key ? 'fc-tier is-selected' : 'fc-tier'}
                        onClick={() => { setTierKey(entry.key); setCustomMode(false); }} data-analytics={`founding_tier_${entry.key}`}>
                        <span className="fc-tier-name">{entry.name}</span>
                        <span className="fc-tier-range">{entry.range}</span>
                        <span className="fc-tier-blurb">{entry.blurb}</span>
                        <span className="fc-tier-meta"><b>Plan</b> {entry.subscription}</span>
                        <span className="fc-tier-meta"><b>Guidance</b> {entry.guidance}</span>
                        <span className="fc-tier-meta"><b>Usage</b> {entry.usage}</span>
                      </button>
                    ))}
                    <button type="button" role="radio" aria-checked={customMode}
                      className={customMode ? 'fc-tier fc-tier--custom is-selected' : 'fc-tier fc-tier--custom'}
                      onClick={() => setCustomMode(true)} data-analytics="founding_tier_custom">
                      <span className="fc-tier-name">Choose your own amount</span>
                      <span className="fc-tier-range">Any amount</span>
                      <span className="fc-tier-blurb">Participate with whatever feels right. Every contribution counts the same.</span>
                      {customMode && (
                        <span className="fc-custom-input">
                          <label htmlFor="fc-custom">Your contribution (USD)</label>
                          <input id="fc-custom" type="number" min="1" step="1" inputMode="numeric" value={customAmount}
                            onChange={(event) => setCustomAmount(event.target.value)} placeholder="250" />
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </section>

              <section className="section section--paper fc-plans" aria-labelledby="fc-plans-title">
                <div className="shell">
                  <header className="section-head">
                    <p className="eyebrow">Your subscription</p>
                    <h2 id="fc-plans-title">The plan your contribution builds on.</h2>
                    <p className="section-lead">Your one-time founding contribution is separate from your subscription. Pick the plan that fits now — founding pricing and the first recurring date are shown before you pay.</p>
                  </header>
                  <div className="fc-plan-grid" role="radiogroup" aria-label="Subscription plan">
                    {plans.map((entry) => (
                      <button key={entry.name} type="button" role="radio" aria-checked={planName === entry.name}
                        className={planName === entry.name ? 'fc-plan is-selected' : 'fc-plan'}
                        onClick={() => setPlanName(entry.name)} data-analytics={`founding_plan_${entry.name.toLowerCase().replace(/\s+/g, '_')}`}>
                        <span className="fc-plan-name">{entry.name}</span>
                        <span className="fc-plan-price">{entry.price}<small>{entry.period}</small></span>
                        {entry.name === 'Business' && <span className="fc-plan-badge">Most chosen</span>}
                      </button>
                    ))}
                  </div>

                  <div className="fc-summary" aria-label="Order summary">
                    <div className="fc-summary-row">
                      <span>Founding contribution <small>(one-time)</small></span>
                      <strong>{contribution.amount}</strong>
                    </div>
                    <div className="fc-summary-row">
                      <span>{plan.name} subscription <small>({plan.period === 'pricing' ? 'custom' : 'recurring'})</small></span>
                      <strong>{plan.price}{plan.period === '/month' ? '/mo' : ''}</strong>
                    </div>
                    <p className="fc-summary-note">These are two separate charges. Your card is handled by the payment provider, never by Hallard. You’ll see the exact recurring amount and first billing date on the provider’s checkout before you confirm.</p>
                    <div className="fc-summary-actions">
                      <button type="button" className="button" onClick={openContribution} data-analytics="founding_pay_contribution">Contribute {contribution.amount === 'Choose an amount' ? '' : contribution.amount}</button>
                      <button type="button" className="button button--secondary" onClick={openSubscription} data-analytics="founding_start_subscription">
                        {plan.name === 'Enterprise' ? 'Talk about Enterprise' : `Start ${plan.name}`}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="section section--ink fc-locked" aria-label="Invitation required">
              <div className="shell fc-locked-inner">
                <Mark />
                <h2>The circle is invitation only.</h2>
                <p>Enter your personal code above to see the participation levels, choose a plan, and review every charge before you decide.</p>
                <a className="text-action" href="#top">Enter your code <ArrowIcon /></a>
              </div>
            </section>
          )}
        </div>

        <section className="fc-close">
          <div className="shell fc-close-inner">
            <p className="eyebrow">The future is moving fast</p>
            <h2>Let’s navigate it together.</h2>
            <p>Founding Circle is a small group of people who believe in what we’re building and want to help shape it. If that’s you, we’d love to have you at the beginning.</p>
            <a className="button button--secondary" href="/#start">Talk to Hallard <ArrowIcon /></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-top">
          <div><a className="brand" href="/" aria-label="Hallard home"><img className="brand-wordmark" src="/assets/hallard-wordmark-on-dark.svg" alt="Hallard" width="176" height="50" /></a><p>Let AI agents do the work. Keep the decisions that matter.</p></div>
          <div className="footer-links"><a href="/#problems">Problems</a><a href="/#capabilities">Capabilities</a><a href="/#trust">Trust</a><a href="/#plans">Plans</a><a href="/">Hallard</a></div>
        </div>
        <div className="shell footer-bottom"><span>© {new Date().getFullYear()} Mentek, LLC</span><span><a href="/privacy-policy.html">Privacy</a> · <a href="/terms-and-conditions.html">Terms</a></span></div>
      </footer>

      {checkout && <FoundingCheckout state={checkout} onClose={() => setCheckout(null)} />}
    </>
  );
}

function FoundingCheckout({ state, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (state.kind === 'link' && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [state]);
  return (
    <dialog ref={dialog} className={state.kind === 'link' ? 'checkout-dialog checkout-dialog--checkout' : 'checkout-dialog'}
      aria-labelledby="fc-checkout-title" onClose={onClose}>
      <div className="checkout-dialog-head">
        <span id="fc-checkout-title">{state.title}</span>
        <button type="button" className="checkout-close" onClick={() => dialog.current?.close()} aria-label="Close checkout">×</button>
      </div>
      {state.kind === 'link' ? (
        <div className="checkout-embed">
          <iframe className="checkout-frame" src={state.src} title={`${state.title} secure checkout`} />
          <div className="checkout-embed-foot">
            <span>Secure checkout by {state.processor}. <a href={state.src} target="_blank" rel="noopener noreferrer">Open in a new tab</a> if the form doesn’t load.</span>
          </div>
        </div>
      ) : state.kind === 'enterprise' ? (
        <div className="checkout-dialog-body">
          <h2>Build the right Enterprise founding package.</h2>
          <p>Enterprise access is shaped around your controls, procurement, and first use case. We’ll build the founding arrangement with you.</p>
          <a className="button" href="mailto:support@mentek.ai?subject=Hallard%20Founding%20Circle%20%E2%80%94%20Enterprise">Plan the rollout <ArrowIcon /></a>
        </div>
      ) : (
        <div className="checkout-dialog-body">
          <h2>{state.title}, ready when you are.</h2>
          <p>{`You’ll enter payment details on the provider’s secure checkout — not on Hallard. This is ${state.amount}.`}</p>
          <p className="checkout-status">Secure checkout will be available as soon as the founding payment link is connected.</p>
          <p className="checkout-note">The provider handles card details and confirmation. Hallard never receives your card number.</p>
        </div>
      )}
    </dialog>
  );
}