import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Branches, Hub, Relay } from '@lucasmarkes/hairline/react';
import { getAnalyticsConsent, saveAnalyticsConsent } from './analytics.js';

const taskPhrases = [
  'move work forward.',
  'turn plans into action.',
  'make room to grow.',
  'do the work.',
  'answer your customers.',
  'build the report.',
  'write the proposal.',
  'do the work.',
  'research the market.',
  'design the campaign.',
  'build the website.',
  'do the work.',
];

const problems = [
  {
    id: 'customers',
    label: 'Customers slipping away',
    title: 'Customers should not disappear after the first conversation.',
    copy: 'Bring in sales, operations, and service specialists to find the blockage, prepare the response, and keep ownership visible.',
    tasks: ['Find every stalled follow-up', 'Draft the recovery sequence', 'Queue decisions for review'],
  },
  {
    id: 'growth',
    label: 'Growth getting stuck',
    title: 'Growth should create capacity, not chaos.',
    copy: 'Give Hallard a market question or launch objective. The team researches, plans, produces, and brings the right calls back to you.',
    tasks: ['Map the opportunity', 'Build the launch plan', 'Assign the next actions'],
  },
  {
    id: 'operations',
    label: 'Work falling between teams',
    title: 'Work should not get lost between teams.',
    copy: 'Keep work from vanishing between inboxes, meetings, and spreadsheets. Hallard makes ownership, progress, and dependencies visible.',
    tasks: ['Locate handoff risk', 'Create the operating plan', 'Escalate what needs judgment'],
  },
];

const stories = [
  {
    audience: 'For the starter',
    title: 'Build the business. Keep your life.',
    copy: 'Tell Hallard what you want to build. The team can turn an early idea into research, a plan, a brand, and the operating work that gets a business moving.',
    action: 'Start with one job',
    image: '/assets/business-life-draft.webp',
    alt: 'A parent working at home while holding a baby',
    position: '25% 50%',
    detail: 'A business does not need a bigger to-do list. It needs capacity.',
    flowTitle: 'From idea to a business that can run.',
    flowCopy: 'Start where the uncertainty is. Hallard keeps the early work connected, from the first market question through launch.',
    flow: ['Clarify the offer', 'Research the market', 'Build the business plan', 'Organize registration', 'Create the identity', 'Prepare the launch'],
    industries: 'Professional services · Home services · Retail · Creative businesses',
  },
  {
    audience: 'For the growing business',
    title: 'Growth should not mean more handoffs.',
    copy: 'Give teams a shared place where specialists can prepare work, coordinate across functions, and return with decisions that are ready for a human owner.',
    action: 'See business plans',
    image: '/assets/starter-life-draft.webp',
    alt: 'A business owner reviewing work with an AI workforce dashboard',
    position: '18% 50%',
    detail: 'More work is coming. Your operating system should be ready for it.',
    flowTitle: 'From a slipping process to an operating rhythm.',
    flowCopy: 'Bring the work into view, keep the context together, and make the next responsible move obvious.',
    flow: ['Find the stalls', 'Connect the context', 'Assign clear owners', 'Build the workflow', 'Review exceptions', 'Measure the next cycle'],
    industries: 'Customer operations · Sales · Finance · Delivery',
  },
  {
    audience: 'For the enterprise',
    title: 'Scale capability. Keep control.',
    copy: 'Coordinate agents across departments while people keep direction, approval, and the decisions that matter inside the operating rhythm.',
    action: 'Plan an enterprise rollout',
    image: '/assets/enterprise-life-draft.webp',
    alt: 'A leadership team discussing work in an office',
    position: '18% 50%',
    detail: 'AI adoption becomes useful when responsibility stays clear.',
    flowTitle: 'From one use case to company-wide practice.',
    flowCopy: 'Start where the value is visible. Expand only when the right controls, patterns, and owners are in place.',
    flow: ['Pick the first use case', 'Set the guardrails', 'Connect the departments', 'Define roles', 'Approve the operating pattern', 'Expand with evidence'],
    industries: 'Operations · Finance · People · Technology',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$47',
    detail: 'For independent professionals and small businesses ready to put agents to work.',
    action: 'Choose Starter',
    points: ['One Hallard workspace', 'Voice-first work intake', 'AI workforce access'],
  },
  {
    name: 'Business',
    price: '$197',
    detail: 'For teams that need more capacity, organization, and oversight.',
    action: 'Choose Business',
    points: ['15 seats', 'Roles and permissions', 'Audit log and priority support'],
    featured: true,
  },
  {
    name: 'Business Plus',
    price: '$297',
    detail: 'For growing teams that need more usage, automation, and priority help.',
    action: 'Choose Business Plus',
    points: ['Everything in Business', 'Higher usage and automation limits', 'Advanced controls and priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    detail: 'For organizations that need dedicated environments and enterprise controls.',
    action: 'Contact sales',
    points: ['Custom seats and usage', 'Single sign-on', 'Dedicated environment'],
  },
];

const cloverPaymentLinks = {
  Starter: import.meta.env.VITE_CLOVER_STARTER_PAYMENT_LINK,
  Business: import.meta.env.VITE_CLOVER_BUSINESS_PAYMENT_LINK,
  'Business Plus': import.meta.env.VITE_CLOVER_BUSINESS_PLUS_PAYMENT_LINK,
};

const stripePaymentLinks = {
  Starter: import.meta.env.VITE_STRIPE_STARTER_PAYMENT_LINK,
  Business: import.meta.env.VITE_STRIPE_BUSINESS_PAYMENT_LINK,
  'Business Plus': import.meta.env.VITE_STRIPE_BUSINESS_PLUS_PAYMENT_LINK,
};

function paymentLinkFor(plan) {
  if (!plan) return '';
  // Clover is the primary processor; Stripe is the fallback.
  return cloverPaymentLinks[plan.name] || stripePaymentLinks[plan.name] || '';
}

function hasPaymentLink(link) {
  return Boolean(link) && /^https:\/\//i.test(link) && !/replace|example|dummy|placeholder/i.test(link);
}

function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M6 21V10.5a8 8 0 0 1 16 0V21h-5.2v-9.9a2.8 2.8 0 1 0-5.6 0V21H6Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3 9h11M10 4l5 5-5 5" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="3" width="8" height="13" rx="4" />
      <path d="M5 12a7 7 0 0 0 14 0M12 19v3M8.5 22h7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4.2 4.2L19 6.6" />
    </svg>
  );
}

function ThemeIcon({ dark }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {dark ? <path d="M19 15.1A8 8 0 0 1 8.9 5 7.2 7.2 0 1 0 19 15.1Z" /> : <><circle cx="12" cy="12" r="3.6" /><path d="M12 2v2.1M12 19.9V22M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2.1M19.9 12H22M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" /></>}
    </svg>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    const schemeMeta = document.querySelector('meta[name="color-scheme"]');
    const colorMeta = document.querySelector('meta[name="theme-color"]');
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const resolvedTheme = () => root.dataset.theme ?? (media.matches ? 'dark' : 'light');
    const sync = () => setTheme(resolvedTheme());
    const syncSystemTheme = () => { if (!root.dataset.theme) sync(); };
    const syncStoredTheme = (event) => {
      if (event.key !== 'hallard:theme') return;
      const next = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
      if (next) root.dataset.theme = next;
      else delete root.dataset.theme;
      if (schemeMeta) schemeMeta.content = next ?? 'light dark';
      if (colorMeta) colorMeta.content = resolvedTheme() === 'dark' ? '#080b10' : '#ecebe7';
      sync();
    };
    sync();
    media.addEventListener('change', syncSystemTheme);
    window.addEventListener('storage', syncStoredTheme);
    return () => {
      media.removeEventListener('change', syncSystemTheme);
      window.removeEventListener('storage', syncStoredTheme);
    };
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const shouldFollowSystem = nextTheme === systemTheme;
    try {
      if (shouldFollowSystem) window.localStorage.removeItem('hallard:theme');
      else window.localStorage.setItem('hallard:theme', nextTheme);
    } catch {
      // A session-only visual preference is still useful when storage is unavailable.
    }
    if (shouldFollowSystem) delete root.dataset.theme;
    else root.dataset.theme = nextTheme;
    const schemeMeta = document.querySelector('meta[name="color-scheme"]');
    const colorMeta = document.querySelector('meta[name="theme-color"]');
    if (schemeMeta) schemeMeta.content = shouldFollowSystem ? 'light dark' : nextTheme;
    if (colorMeta) colorMeta.content = nextTheme === 'dark' ? '#080b10' : '#ecebe7';
    setTheme(nextTheme);
  }

  const targetTheme = theme === 'dark' ? 'light' : 'dark';
  return <button className="theme-toggle" type="button" onClick={toggleTheme} aria-pressed={theme === 'dark'} aria-label={`Use ${targetTheme} appearance`}><ThemeIcon dark={theme === 'dark'} /><span className="sr-only">Use {targetTheme} appearance</span></button>;
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="#top" aria-label="Hallard home">
          <img className="brand-wordmark" src="/assets/hallard-wordmark-on-dark.svg" alt="Hallard" width="176" height="50" />
        </a>
        <button className="menu-button" type="button" aria-controls="site-navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span className="sr-only">Toggle navigation</span>
          <span />
          <span />
        </button>
        <nav id="site-navigation" className={open ? 'site-nav is-open' : 'site-nav'} aria-label="Main navigation">
          <a href="#problems" onClick={() => setOpen(false)}>Problems</a>
          <a href="#capabilities" onClick={() => setOpen(false)}>Capabilities</a>
          <a href="#trust" onClick={() => setOpen(false)}>Trust</a>
          <a href="#plans" onClick={() => setOpen(false)}>Plans</a>
          <ThemeToggle />
          <a className="button button--small" href="#start" data-analytics="nav_talk_to_hallard" onClick={() => setOpen(false)}>Talk to Hallard</a>
        </nav>
      </div>
    </header>
  );
}

function RoutingPanel() {
  const [run, setRun] = useState(false);
  const [phase, setPhase] = useState(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function replay() {
    timers.current.forEach(clearTimeout);
    setRun(true);
    setPhase(0);
    [650, 1320, 1990].forEach((delay, index) => {
      timers.current.push(setTimeout(() => setPhase(index + 1), delay));
    });
    timers.current.push(setTimeout(() => setRun(false), 3000));
  }

  return (
    <div className={run ? 'routing-panel is-running' : 'routing-panel'} aria-label="Illustrative Hallard work routing">
      <div className="routing-topline">
        <span><i /> Hallard / work routing</span>
        <strong>{phase === 3 ? 'ready for review' : 'human approval'}</strong>
      </div>
      <div className="routing-content">
        <div className="routing-roster" aria-hidden="true">
          <span className="roster-active"><i /> Hallard</span>
          <span><i /> Quill</span>
          <span><i /> Penn</span>
          <span><i /> Cody</span>
        </div>
        <div className="routing-work">
          <p className="micro-label">You said</p>
          <p className="request-copy">“We have <b>18 customer follow-ups</b> sitting still. Find what is blocking them and put a plan in front of me.”</p>
          <div className="routing-divider" />
          <div className="route-heading"><span>Hallard assembled a team</span><strong>3 specialists</strong></div>
          <ol className="route-steps">
            <li className={phase >= 1 ? 'is-active' : ''}><b>1</b><span>Quill checks pipeline and missed handoffs</span><em>data</em></li>
            <li className={phase >= 2 ? 'is-active' : ''}><b>2</b><span>Penn drafts the customer recovery sequence</span><em>copy</em></li>
            <li className={phase >= 3 ? 'is-active' : ''}><b>3</b><span>Hallard schedules ownership and review</span><em>ops</em></li>
          </ol>
          <button className="approval-row" type="button" onClick={replay}>
            <span>{phase === 3 ? 'Plan ready for your decision' : 'Replay work routing'}</span>
            <b>{phase === 3 ? 'you approve' : 'run it again'}</b>
          </button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const phrase = taskPhrases[phraseIndex];
    const delay = phrase === 'do the work.' ? 4000 : 2200;
    const timer = setTimeout(() => setPhraseIndex((index) => (index + 1) % taskPhrases.length), delay);
    return () => clearTimeout(timer);
  }, [phraseIndex, paused]);

  return (
    <section className="hero section--ink" id="top" data-enter>
      <div className="particle-field" aria-hidden="true" />
      <div className="shell hero-grid">
        <div className="hero-copy">
          <h1>Let AI agents <span className={taskPhrases[phraseIndex] === 'do the work.' ? 'is-signature' : ''}>{taskPhrases[phraseIndex]}</span></h1>
          <p className="hero-lead">Say what needs to happen. Hallard brings the right specialists into the conversation, builds the plan with you, and keeps the work moving until it is ready to review.</p>
          <div className="hero-actions">
            <a className="button" href="#start" data-analytics="hero_talk_to_hallard">Talk to Hallard <ArrowIcon /></a>
            <a className="text-action" href="#workforce" data-analytics="hero_meet_ai_team">Meet your AI team <ArrowIcon /></a>
          </div>
          <div className="hero-assurance"><i /> Starter workspaces begin at $47/month. Your approval remains the gate.</div>
          <button className="motion-toggle" type="button" onClick={() => setPaused((value) => !value)}>{paused ? 'Resume headline motion' : 'Pause headline motion'}</button>
        </div>
        <RoutingPanel />
      </div>
    </section>
  );
}

function ProblemExplorer() {
  const [active, setActive] = useState(problems[0].id);
  const activeProblem = problems.find((problem) => problem.id === active) ?? problems[0];
  const tabId = useId();
  return (
    <section className="section section--paper" id="problems">
      <div className="shell problem-layout">
        <div>
          <h2>What is holding your business back?</h2>
          <p className="section-lead">A customer promise, a stalled launch, or a process your team has outgrown. Tell Hallard where the pressure is. We will help you shape the next move and keep the decision with you.</p>
        </div>
        <div className="problem-explorer">
          <div className="problem-tabs" role="tablist" aria-label="Business problems Hallard can address">
            {problems.map((problem) => (
              <button key={problem.id} type="button" role="tab" aria-selected={active === problem.id} aria-controls={`${tabId}-${problem.id}`} id={`${tabId}-tab-${problem.id}`} data-analytics={`problem_${problem.id}`} onClick={() => setActive(problem.id)}>{problem.label}</button>
            ))}
          </div>
          <div className="problem-detail" role="tabpanel" id={`${tabId}-${activeProblem.id}`} aria-labelledby={`${tabId}-tab-${activeProblem.id}`}>
            <h3>{activeProblem.title}</h3>
            <p>{activeProblem.copy}</p>
            <ul>{activeProblem.tasks.map((task) => <li key={task}><CheckIcon />{task}</li>)}</ul>
            <a className="text-action text-action--dark" href="#start" data-analytics="problem_talk_to_hallard">Talk it through with Hallard <ArrowIcon /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceStories() {
  return (
    <section className="story-section" aria-label="Hallard for every stage of business">
      {stories.map((story, index) => (
        <section className={index % 2 ? 'audience-chapter audience-chapter--ink' : 'audience-chapter'} key={story.audience}>
          <article className={index % 2 ? 'audience-story audience-story--reverse' : 'audience-story'}>
            <div className="story-image-wrap">
              <img src={story.image} alt={story.alt} loading="lazy" decoding="async" data-source="User-supplied visual draft" data-subject={story.audience} style={{ objectPosition: story.position }} />
            </div>
            <div className="story-copy">
              <p className="story-audience">{story.audience}</p>
              <h2>{story.title}</h2>
              <p>{story.copy}</p>
              <p className="story-detail">{story.detail}</p>
              <a className="text-action text-action--dark" href="#start" data-analytics={`audience_${story.audience.replaceAll(' ', '_').toLowerCase()}`}>{story.action} <ArrowIcon /></a>
            </div>
          </article>
          <div className="story-flow shell">
            <div className="story-flow-intro">
              <h3>{story.flowTitle}</h3>
              <p>{story.flowCopy}</p>
              <p className="flow-industries"><strong>Useful for:</strong> {story.industries}</p>
            </div>
            <ol className="flow-steps">
              {story.flow.map((step, stepIndex) => <li key={step}><span>{String(stepIndex + 1).padStart(2, '0')}</span>{step}</li>)}
            </ol>
          </div>
        </section>
      ))}
    </section>
  );
}

function TeamHandoff() {
  const [step, setStep] = useState(0);
  const canvasRef = useRef(null);
  const timeouts = useRef([]);
  const loop = useRef(null);
  const detail = [
    'Voice brief received. Hallard is identifying the work behind the request.',
    'The right specialist team is discussing the job in one shared context.',
    'The proposed plan is ready. You decide what moves forward.',
  ];

  const runJob = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    setStep(0);
    timeouts.current = [
      window.setTimeout(() => setStep(1), 400),
      window.setTimeout(() => setStep(2), 1150),
      window.setTimeout(() => setStep(3), 2000),
    ];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !('IntersectionObserver' in window)) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stopLoop = (reset = true) => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
      if (loop.current !== null) {
        window.clearInterval(loop.current);
        loop.current = null;
      }
      if (reset) setStep(0);
    };
    const startLoop = () => {
      if (motionQuery.matches || loop.current !== null) return;
      runJob();
      loop.current = window.setInterval(runJob, 8000);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startLoop();
      else stopLoop();
    }, { threshold: 0.45 });
    const syncMotionPreference = () => {
      observer.disconnect();
      if (motionQuery.matches) stopLoop();
      else observer.observe(canvas);
    };

    syncMotionPreference();
    motionQuery.addEventListener('change', syncMotionPreference);
    return () => {
      motionQuery.removeEventListener('change', syncMotionPreference);
      observer.disconnect();
      stopLoop(false);
    };
  }, [runJob]);

  const currentCopy = step === 0 ? detail[0] : detail[Math.min(step - 1, detail.length - 1)];
  return (
    <section className="section section--ink workforce" id="workforce">
      <div className="particle-field" aria-hidden="true" />
      <div className="shell workforce-grid">
        <div className="workforce-copy">
          <h2>Solve a problem with your AI agent team.</h2>
          <p className="section-lead">Voice is where work begins. Talk through the situation, bring in the specialists you need, and redirect the conversation while the plan takes shape.</p>
          <a className="button" href="#start" data-analytics="voice_brief_start"><MicIcon /> Start a voice brief</a>
        </div>
        <div ref={canvasRef} className={step > 0 ? `handoff-canvas step-${step}` : 'handoff-canvas'}>
          <div className="handoff-chrome"><span>Hallard / agent mesh</span><strong>{step === 3 ? 'approval ready' : 'live work map'}</strong></div>
          <svg className="handoff-network" viewBox="0 0 760 470" preserveAspectRatio="none" aria-hidden="true">
            <path className={step >= 1 ? 'network-path is-active' : 'network-path'} d="M128 237C213 237 245 155 336 146" />
            <path className={step >= 2 ? 'network-path is-active' : 'network-path'} d="M128 237C216 237 248 237 336 237" />
            <path className={step >= 3 ? 'network-path is-active' : 'network-path'} d="M128 237C213 237 245 319 336 328" />
            <path className={step >= 3 ? 'network-path is-active' : 'network-path'} d="M424 237C492 237 545 237 632 237" />
            <circle className="network-junction" cx="128" cy="237" r="3" />
            <circle className="network-junction" cx="424" cy="237" r="3" />
          </svg>
          <div className="handoff-origin"><MicIcon /><span><b>Voice brief</b><small>customer follow-ups</small></span></div>
          <div className="handoff-hub"><span className="hub-orbit" /><Mark /><b>Hallard</b><span>Orchestrates</span></div>
          <div className={step >= 1 ? 'handoff-node node-data is-active' : 'handoff-node node-data'}><span className="node-sigil">Q</span><span><b>Quill</b><small>Pipeline context</small></span><em>data</em></div>
          <div className={step >= 2 ? 'handoff-node node-copy is-active' : 'handoff-node node-copy'}><span className="node-sigil">P</span><span><b>Penn</b><small>Recovery draft</small></span><em>copy</em></div>
          <div className={step >= 3 ? 'handoff-node node-code is-active' : 'handoff-node node-code'}><span className="node-sigil">C</span><span><b>Cody</b><small>Owner workflow</small></span><em>ops</em></div>
          <div className="handoff-approval"><span>Decision gate</span><strong>{step === 3 ? 'Ready for you' : 'Human review'}</strong></div>
          <div className="handoff-status"><span>Work in motion</span><p>{currentCopy}</p></div>
          <button type="button" className="handoff-run" data-analytics="team_assembly" onClick={runJob}>{step > 0 ? 'Replay the handoff' : 'Watch the handoff'} <ArrowIcon /></button>
        </div>
      </div>
    </section>
  );
}

function BriefComposer() {
  const [errors, setErrors] = useState({});
  const names = { firstName: 'First name', lastName: 'Last name', email: 'Work email', brief: 'What do you want to accomplish?' };
  function validate(event) {
    const { name, validity } = event.currentTarget;
    setErrors((current) => ({ ...current, [name]: !validity.valid }));
  }
  function clearError(event) {
    const { name, validity } = event.currentTarget;
    if (validity.valid) setErrors((current) => ({ ...current, [name]: false }));
  }
  return (
    <section className="section section--warm" id="start">
      <div className="shell brief-grid">
        <div>
          <h2>Start the brief. Speak if you prefer.</h2>
          <p className="section-lead">Tell Hallard the result you need. The team can ask the useful questions, prepare the plan, and leave every important call with you.</p>
        </div>
        <form className="brief-composer" action="mailto:support@mentek.ai" method="post" encType="text/plain" data-analytics="workspace_request_intent">
          <div className="composer-topline"><span><i /> Hallard is listening</span><button type="button" className="voice-button" aria-label="Voice input preview"><MicIcon /></button></div>
          <div className="message message--user">“We are losing track of customer follow-ups. I need a way to see the gaps and get the next actions moving.”</div>
          <div className="message message--agent"><Mark /><span>I can bring in the right team. First, tell me where Hallard should reply.</span></div>
          <div className="form-pair">
            <FormInput name="firstName" label={names.firstName} autoComplete="given-name" errors={errors} onInvalid={validate} onInput={clearError} />
            <FormInput name="lastName" label={names.lastName} autoComplete="family-name" errors={errors} onInvalid={validate} onInput={clearError} />
          </div>
          <FormInput name="email" label={names.email} type="email" autoComplete="email" errors={errors} onInvalid={validate} onInput={clearError} />
          <FormInput name="company" label="Company (optional)" autoComplete="organization" errors={errors} onInvalid={validate} onInput={clearError} required={false} />
          <div className="form-field">
            <label htmlFor="brief">{names.brief}</label>
            <textarea id="brief" name="brief" rows="3" required onInvalid={validate} onInput={clearError} aria-invalid={errors.brief || undefined} aria-describedby={errors.brief ? 'brief-error' : undefined} placeholder="Describe the outcome, the situation, and what matters." />
            <p id="brief-error" className={errors.brief ? 'field-error is-visible' : 'field-error'}>Tell us what you want your team to accomplish.</p>
          </div>
          <button className="button button--submit" type="submit">Request your workspace <ArrowIcon /></button>
          <p className="form-note">Your message opens in your email client so you stay in control of what is sent.</p>
        </form>
      </div>
    </section>
  );
}

function FormInput({ name, label, type = 'text', autoComplete, errors, onInvalid, onInput, required = true }) {
  const errorId = `${name}-error`;
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} autoComplete={autoComplete} required={required} onInvalid={onInvalid} onInput={onInput} aria-invalid={errors[name] || undefined} aria-describedby={errors[name] ? errorId : undefined} />
      {required && <p id={errorId} className={errors[name] ? 'field-error is-visible' : 'field-error'}>Enter your {label.toLowerCase()}.</p>}
    </div>
  );
}

function CheckoutDialog({ plan, onClose }) {
  const dialog = useRef(null);
  const paymentLink = paymentLinkFor(plan);
  const isEnterprise = plan?.name === 'Enterprise';
  const checkoutReady = hasPaymentLink(paymentLink);
  const processorName = (plan && cloverPaymentLinks[plan.name]) ? 'Clover' : ((plan && stripePaymentLinks[plan.name]) ? 'Stripe' : 'your payment provider');

  useEffect(() => {
    if (plan && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [plan]);

  if (!plan) return null;

  return (
    <dialog ref={dialog} className={checkoutReady ? 'checkout-dialog checkout-dialog--checkout' : 'checkout-dialog'} aria-labelledby="checkout-title" onClose={onClose}>
      <div className="checkout-dialog-head">
        <span id="checkout-title">{isEnterprise ? 'Enterprise planning' : checkoutReady ? `${plan.name} · ${plan.price}${plan.price.startsWith('$') ? '/month' : ''}` : 'Secure checkout'}</span>
        <button type="button" className="checkout-close" onClick={() => dialog.current?.close()} aria-label="Close checkout">×</button>
      </div>
      {isEnterprise ? (
        <div className="checkout-dialog-body">
          <h2>Build the right enterprise rollout.</h2>
          <p>Enterprise environments are shaped around controls, procurement, and the first business use case. We will build the purchase path with your team.</p>
          <a className="button" href="mailto:support@mentek.ai?subject=Hallard%20Enterprise%20rollout" data-analytics="enterprise_checkout_contact">Plan the rollout <ArrowIcon /></a>
          <p className="checkout-note">A dedicated path for teams with security, billing, and rollout requirements.</p>
        </div>
      ) : checkoutReady ? (
        <div className="checkout-embed">
          <iframe className="checkout-frame" src={paymentLink} title={`${plan.name} secure checkout`} />
          <div className="checkout-embed-foot">
            <span>Secure checkout by {processorName}. <a href={paymentLink} target="_blank" rel="noopener noreferrer" data-analytics={`checkout_${plan.name.toLowerCase().replace(/\s+/g, '_')}_newtab`}>Open in a new tab</a> if the form doesn’t load.</span>
          </div>
        </div>
      ) : (
        <div className="checkout-dialog-body">
          <h2>{plan.name}, ready when you are.</h2>
          <p>{`You will enter payment details on ${processorName}’s secure checkout—not on Hallard. Your ${plan.name} workspace is ${plan.price} per month.`}</p>
          <p className="checkout-status">Secure checkout will be available as soon as Hallard’s payment link is connected.</p>
          <p className="checkout-note">{`${processorName} handles card details and payment confirmation. Hallard never receives your card number.`}</p>
        </div>
      )}
    </dialog>
  );
}

function Plans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  return (
    <><section className="section section--paper" id="plans">
        <div className="shell plans-header"><h2>Choose the capacity you need now.</h2><p className="section-lead">Start with the work in front of you. Expand the team when the proof is there.</p></div>
        <div className="shell plan-grid">
          {plans.map((plan) => (
            <article className={plan.featured ? 'plan plan--featured' : 'plan'} key={plan.name}>
              <h3>{plan.name}</h3>
              <p className="plan-price">{plan.price}<span>{plan.price.startsWith('$') ? '/month' : ' pricing'}</span></p>
              <p>{plan.detail}</p>
              <ul>{plan.points.map((point) => <li key={point}><CheckIcon />{point}</li>)}</ul>
              <button type="button" data-analytics={`plan_${plan.name.toLowerCase().replace(/\s+/g, '_')}`} className={plan.featured ? 'button button--full' : 'text-action text-action--dark'} onClick={() => setSelectedPlan(plan)}>{plan.action} <ArrowIcon /></button>
            </article>
          ))}
        </div>
      </section><CheckoutDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} /></>
  );
}

function Footer({ onOpenPrivacyChoices }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div><a className="brand" href="#top" aria-label="Hallard home"><img className="brand-wordmark" src="/assets/hallard-wordmark-on-dark.svg" alt="Hallard" width="176" height="50" /></a><p>Let AI agents do the work. Keep the decisions that matter.</p></div>
        <div className="footer-links"><a href="#problems">Problems</a><a href="#capabilities">Capabilities</a><a href="#trust">Trust</a><a href="#workforce">Workforce</a><a href="#plans">Plans</a><a href="/mentek.html">Mentek</a></div>
      </div>
      <div className="shell footer-bottom"><span>© {new Date().getFullYear()} Mentek, LLC</span><span>Visual drafts supplied by Mentek</span><span><a href="/privacy-policy.html">Privacy</a> · <button type="button" className="footer-choice-link" onClick={onOpenPrivacyChoices}>Privacy choices</button> · <a href="/terms-and-conditions.html">Terms</a></span></div>
    </footer>
  );
}

function MentekNote() {
  return (
    <section className="mentek-note" aria-labelledby="mentek-note-heading">
      <div className="shell mentek-note-inner">
        <div><h2 id="mentek-note-heading">Built by Mentek, for people who want real work to move.</h2></div>
        <div><p>Mentek builds the operating layer behind Hallard: business context, specialist agents, human judgment, and the evidence to see what happened next.</p><a className="text-action text-action--dark" href="/mentek.html" data-analytics="hallard_meet_mentek">Meet Mentek <ArrowIcon /></a></div>
      </div>
    </section>
  );
}

function PrivacyNotice({ forceOpen, onChoice }) {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    setConsent(getAnalyticsConsent());
  }, []);

  function choose(nextConsent) {
    const needsReload = saveAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
    onChoice();
    if (needsReload) window.location.reload();
  }

  if (!forceOpen && consent !== null) return null;

  return (
    <aside className="privacy-notice" aria-label="Privacy choices">
      <p>We use optional analytics to understand what is useful. The site works either way. <a href="/privacy-policy.html">Read our privacy policy</a>.</p>
      <div className="privacy-notice-actions">
        <button type="button" className="privacy-decline" onClick={() => choose('declined')}>Decline</button>
        <button type="button" className="privacy-accept" onClick={() => choose('granted')}>Accept</button>
      </div>
    </aside>
  );
}

const shiftCards = [
  { label: 'The market', title: 'Governs the agent.', copy: 'Identity, policy, observability and cost controls for agents that live inside someone else’s application.' },
  { label: 'Hallard', title: 'Gives it a company.', copy: 'A graph of your business, a governed data hub, an app layer for work that repeats, and a meeting where the work gets decided.', featured: true },
  { label: 'The difference', title: 'The floor.', copy: 'Governance isn’t a dashboard you check after the fact. It’s the floor the whole thing stands on — every call, every approval, every artifact.' },
];

const capabilities = [
  {
    num: '01',
    title: 'Voice first. Multi-agent by default.',
    lead: 'Don’t type at your AI. Meet it.',
    copy: 'Hallard joins as a participant, not a search box. Multiple agents take the floor with roles and turn grants. A floor protocol keeps them from talking over each other. You can cut in, redirect, or stop the whole thing — and every claim they make carries a receipt.',
    points: ['Provider-native realtime voice, behind one contract', 'Barge-in with explicit targets: playback, response, capture, or work', 'Text and voice share the same conversation, tools and permissions'],
    visual: 'voice',
  },
  {
    num: '02',
    title: 'A graph, not a search index.',
    lead: 'Documents tell an AI what the policy says. A graph tells it how the policy connects.',
    copy: 'Entities, relationships, provenance and access — enforced before the first agent runs. Hallard knows not just what is true, but how it connects to the customer, the contract, the last three exceptions, and the person who owns the decision.',
    points: ['Knows why, not just what', 'Provenance and access on every edge', 'Company-owned, not locked in a vendor’s memory'],
    visual: 'graph',
  },
  {
    num: '03',
    title: 'The work that repeats becomes an app.',
    lead: 'Not a transcript you scroll. An app that runs.',
    copy: 'When a process recurs, Hallard turns it into a real operational workspace: pages, records, statuses, actions, approvals, permissions. Built by the agent, approved by you, running inside the same governed system.',
    points: ['Pages, expressions and typed workflows', 'Four-eyes approvals as a tenant setting', 'Records and statuses, not another chat window'],
    visual: 'valid',
  },
  {
    num: '04',
    title: 'Connect once. Govern always.',
    lead: 'Vendor files, emails, Drive drops, webhooks, MCP sources and connectors — declared, isolated, and queryable.',
    copy: 'Data Hub turns the things your business already produces into declared datasets with one query surface. Row-level isolation. Egress through an allowlist with brokered secrets. Every read and write receipted.',
    points: ['Ingress as a separate hardened door', 'Declared datasets, not a connector zoo', 'One query surface for agents and people'],
    visual: 'hub',
  },
  {
    num: '05',
    title: 'Code that fits your architecture.',
    lead: 'A developer identity, not a code generator with a chat box.',
    copy: 'The development agent works inside your permissions, your repository conventions and your tenant rules. It runs in a sandbox, renders deterministically, and shows you the diff before it ships.',
    points: ['Sandboxed execution and deterministic rendering', 'Pins, lint and evidence on every artifact', 'A preview link you approve before release'],
    visual: 'code',
  },
];

const trustPoints = [
  { title: 'One tool gateway.', copy: 'Every channel — voice, text, email, MCP, A2A, worker — asks permission the same way, at call time, against current policy.' },
  { title: 'Skills are the grant.', copy: 'Assigning a skill is the permission act. Skills can’t grant themselves tools. An agent can never reach further than the person it acts for.' },
  { title: 'Everything is receipted.', copy: 'What happened, what changed, who or what did it, on whose behalf, with what result. You can audit the work without reading a transcript.' },
  { title: 'Configuration is data.', copy: 'Enablement, routing, quotas and policy resolve from the database. Missing configuration fails closed and loud — never a silent default.' },
  { title: 'Your model, your choice.', copy: 'A native router across frontier and open models, with local and private-network paths as a direction — not a lock-in.' },
  { title: 'Autonomy is earned.', copy: 'You see what the agent does while it does it. You decide what it may access, complete, and when it has earned more freedom.' },
];

const reportCode = `export async function dailyReport(day) {
  const files = await hub.read({
    dataset: 'vendor-files',
    asOf: day,
    receipt: true,
  });

  const rows = reconcile(files, ledger);
  return valid.draft({
    rows,
    approval: 'four-eyes',
    deliver: 'email',
  });
}`;

function VoiceFloor() {
  const agents = [
    { id: 'host', sigil: 'H', name: 'Hallard', role: 'Host · routing' },
    { id: 'data', sigil: 'D', name: 'Data', role: 'Files · reconciliation' },
    { id: 'finance', sigil: 'F', name: 'Finance', role: 'Ledger · short-pays' },
    { id: 'valid', sigil: 'V', name: 'Valid', role: 'Approval · delivery' },
  ];
  return (
    <div className="floor-card">
      <div className="floor-head">
        <span className="live-dot" aria-hidden="true" />
        <span className="floor-title">Live floor</span>
        <span className="floor-turn">4 agents · 1 conversation</span>
      </div>
      <ul className="floor-agents">
        {agents.map((agent) => (
          <li key={agent.id} className={`floor-agent floor-agent--${agent.id}`}>
            <span className="agent-avatar" aria-hidden="true">{agent.sigil}</span>
            <span className="agent-meta"><strong>{agent.name}</strong><small>{agent.role}</small></span>
            <span className="agent-level" aria-hidden="true"><i /></span>
          </li>
        ))}
      </ul>
      <div className="floor-wave" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
      </div>
      <div className="floor-transcript">
        <p className="floor-speaker">You</p>
        <p className="floor-line">Reconcile A, B and C against inventory before the ops call.</p>
      </div>
    </div>
  );
}

function ValidCard() {
  const [approved, setApproved] = useState(false);
  return (
    <div className="valid-card">
      <div className="valid-top">
        <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="valid-title">Daily vendor reconciliation</span>
        <span className={approved ? 'pill pill--ok' : 'pill pill--draft'}>{approved ? 'Approved' : 'Draft'}</span>
      </div>
      <div className="valid-body">
        <div className="valid-table" aria-hidden="true">
          <div className="valid-row valid-row--head"><span>Vendor</span><span>Rows</span><span>Δ</span></div>
          <div className="valid-row"><span>Vendor A</span><span>512</span><span>0</span></div>
          <div className="valid-row"><span>Vendor B</span><span>438</span><span className="is-warn">+2 dupes</span></div>
          <div className="valid-row"><span>Vendor C</span><span>334</span><span className="is-warn">−1</span></div>
        </div>
        <div className="valid-approval">
          <p className="valid-approval-label">Approval required</p>
          <p className="valid-approval-meta">Manager · four-eyes</p>
          <button className="button button--small" type="button" data-analytics="valid_approve" disabled={approved} onClick={() => setApproved(true)}>{approved ? 'Approved' : 'Approve'}</button>
          <p className="valid-feedback" role="status" aria-live="polite">{approved ? 'Approved by you · recorded · receipt rc_01J8Q4M2' : ''}</p>
        </div>
      </div>
      <p className="valid-caption">Illustrative workspace. The approve button is live.</p>
    </div>
  );
}

function DataHubCard() {
  const [result, setResult] = useState('');
  const [running, setRunning] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  function run() {
    window.clearTimeout(timer.current);
    setRunning(true);
    setResult('');
    timer.current = window.setTimeout(() => {
      setResult('hub.query("reconcile") → 1,284 rows · 3 sources · receipted · rc_01J8Q4M2');
      setRunning(false);
    }, 650);
  }
  return (
    <div className="hub-visual">
      <Hub className="hub-figure" label="One hub with every source connected on governed links; the tile under the pointer rises." />
      <button className="text-action text-action--dark" type="button" data-analytics="hub_query" onClick={run} disabled={running}>{running ? 'Running the query…' : 'Run a sample query'} <span aria-hidden="true">→</span></button>
      <p className="query-result" role="status" aria-live="polite">{result}</p>
    </div>
  );
}

function CodeCard() {
  return (
    <div className="code-card">
      <div className="code-top">
        <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="code-file">report.ts</span>
        <span className="pill pill--ok">Preview ready</span>
      </div>
      <pre className="code-block" tabIndex={0}><code>{reportCode}</code></pre>
      <div className="code-diff" aria-hidden="true">
        <span className="is-add">+ receipt: true</span>
        <span className="is-add">+ approval: 'four-eyes'</span>
        <span className="is-del">− console.log(rows)</span>
      </div>
    </div>
  );
}

function CapabilityVisual({ kind }) {
  if (kind === 'voice') return <VoiceFloor />;
  if (kind === 'graph') {
    return (
      <div className="graph-visual">
        <Branches className="graph-figure" label="A commit graph on a board; the commit under the pointer rises, and its history follows." />
        <p className="figure-caption">Live figure: the commit under your pointer rises, and its history follows.</p>
      </div>
    );
  }
  if (kind === 'valid') return <ValidCard />;
  if (kind === 'hub') return <DataHubCard />;
  return <CodeCard />;
}

function Shift() {
  return (
    <section className="section section--warm shift" id="platform" aria-labelledby="shift-title">
      <div className="shell">
        <header className="section-head">
          <p className="eyebrow">The shift</p>
          <h2 id="shift-title">Everyone else is putting a seatbelt on the AI. We built the car.</h2>
          <p className="section-lead">Agent control planes are real, and they matter. But most of them govern an agent bolted onto a system built for humans clicking. Hallard starts from the other end: the agent is first-class, the interface is a conversation, and the app is generated from the work.</p>
        </header>
        <div className="shift-grid">
          {shiftCards.map((card) => (
            <article key={card.label} className={card.featured ? 'shift-card shift-card--feature' : 'shift-card'}>
              <p className="shift-label">{card.label}</p>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="section section--paper capabilities" id="capabilities" aria-labelledby="capabilities-title">
      <div className="shell">
        <header className="section-head">
          <p className="eyebrow">What you get</p>
          <h2 id="capabilities-title">One conversation. A meeting, a report, an app, a release.</h2>
          <p className="section-lead">Not because we added five features — because the work was always connected.</p>
        </header>
        <div className="cap-list">
          {capabilities.map((cap, index) => (
            <article key={cap.title} className={index % 2 ? 'cap cap--reverse' : 'cap'}>
              <div className="cap-copy">
                <p className="cap-num" aria-hidden="true">{cap.num}</p>
                <h3>{cap.title}</h3>
                <p className="cap-lead">{cap.lead}</p>
                <p>{cap.copy}</p>
                <ul className="cap-points">{cap.points.map((point) => <li key={point}>{point}</li>)}</ul>
              </div>
              <div className="cap-visual"><CapabilityVisual kind={cap.visual} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="section section--ink trust" id="trust" aria-labelledby="trust-title">
      <div className="shell">
        <header className="section-head section-head--ink">
          <p className="eyebrow">Trust</p>
          <h2 id="trust-title">Receipts, not vibes.</h2>
          <p className="section-lead">Every action has an owner, a scope, a result and a receipt. Refusals are typed and explained — not a shrug.</p>
        </header>
        <div className="trust-grid">
          <ul className="trust-list">
            {trustPoints.map((point) => (
              <li key={point.title}><h3>{point.title}</h3><p>{point.copy}</p></li>
            ))}
          </ul>
          <div className="trust-visual">
            <Relay className="relay-figure" label="A hub with branches of tiles; the path to the leaf under the pointer lights hop by hop, every hop authorized." />
            <figure className="receipt">
              <figcaption>
                <span className="receipt-label">Receipt</span>
                <span className="receipt-id">rc_01J8Q4M2</span>
              </figcaption>
              <dl>
                <div><dt>work</dt><dd>wk_8841 · reconcile-vendor-files</dd></div>
                <div><dt>command</dt><dd>data.reconcile <span className="receipt-ver">v3</span></dd></div>
                <div><dt>effect</dt><dd>report.draft <span className="receipt-ver">v1</span></dd></div>
                <div><dt>actor</dt><dd>agent.finance</dd></div>
                <div><dt>on behalf of</dt><dd>karen@northstar-dist</dd></div>
                <div><dt>policy</dt><dd>four_eyes / finance.write</dd></div>
                <div><dt>result</dt><dd className="receipt-ok">completed</dd></div>
                <div><dt>receipt</dt><dd>9f2c…a71b</dd></div>
              </dl>
              <p className="receipt-note">Illustrative receipt. Every production action produces one.</p>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

function GraphBandSvg() {
  return (
    <svg className="gb-svg" viewBox="0 0 620 360" role="img" aria-labelledby="gb-title gb-desc" preserveAspectRatio="xMidYMid meet">
      <title id="gb-title">Hallard’s living business graph</title>
      <desc id="gb-desc">A graph connecting a customer, a contract, an invoice, a short-pay exception, a policy, and the people who own and approve each decision.</desc>
      <g className="gb-edges" aria-hidden="true">
        <path className="gb-edge" pathLength="1" d="M120 190 C 200 190, 210 100, 300 100" />
        <path className="gb-edge" pathLength="1" d="M300 100 C 400 100, 410 160, 500 160" />
        <path className="gb-edge" pathLength="1" d="M120 190 C 200 190, 210 280, 300 280" />
        <path className="gb-edge" pathLength="1" d="M300 280 C 400 280, 410 230, 500 230" />
        <path className="gb-edge" pathLength="1" d="M300 100 C 300 160, 300 210, 300 280" />
        <path className="gb-edge" pathLength="1" d="M120 190 C 90 250, 90 300, 120 320" />
        <path className="gb-edge" pathLength="1" d="M500 160 C 540 120, 560 100, 580 80" />
        <path className="gb-edge" pathLength="1" d="M500 230 C 540 270, 560 290, 580 310" />
      </g>
      <g className="gb-nodes">
        <g transform="translate(120 190)"><g className="gb-node"><circle r="26" /><text y="4">Customer</text></g></g>
        <g transform="translate(300 100)"><g className="gb-node gb-node--core"><circle r="32" /><text y="4">Contract</text></g></g>
        <g transform="translate(500 160)"><g className="gb-node"><circle r="24" /><text y="4">Invoice</text></g></g>
        <g transform="translate(300 280)"><g className="gb-node gb-node--amber"><circle r="28" /><text y="4">Short-pay</text></g></g>
        <g transform="translate(120 320)"><g className="gb-node"><circle r="22" /><text y="4">Policy</text></g></g>
        <g transform="translate(580 80)"><g className="gb-node gb-node--cyan"><circle r="20" /><text y="4">Owner</text></g></g>
        <g transform="translate(580 310)"><g className="gb-node gb-node--cyan"><circle r="20" /><text y="4">Approver</text></g></g>
      </g>
    </svg>
  );
}

function GraphBand() {
  const ref = useRef(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDrawn(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setDrawn(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="graph-band" aria-labelledby="graph-title" ref={ref} data-drawn={drawn || undefined}>
      <div className="shell graph-band-inner">
        <header className="section-head section-head--ink">
          <p className="eyebrow">The living graph</p>
          <h2 id="graph-title">It doesn’t stop at the hero.</h2>
          <p className="section-lead">Every customer, contract, invoice and decision is a node. Every relationship is an edge with an owner.</p>
        </header>
        <div className="graph-band-grid">
          <div className="graph-band-figure"><GraphBandSvg /></div>
          <ol className="graph-milestones">
            <li className="graph-milestone"><p className="graph-milestone-title">Context, connected.</p><p className="graph-milestone-copy">People, contracts, invoices, policies — one graph.</p></li>
            <li className="graph-milestone"><p className="graph-milestone-title">Every decision is an edge.</p><p className="graph-milestone-copy">Not a document. A relationship.</p></li>
            <li className="graph-milestone"><p className="graph-milestone-title">Every edge has an owner.</p><p className="graph-milestone-copy">Permission, provenance, receipt.</p></li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [privacyChoicesOpen, setPrivacyChoicesOpen] = useState(false);
  return <><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content"><Hero /><ProblemExplorer /><Shift /><AudienceStories /><Capabilities /><Trust /><GraphBand /><TeamHandoff /><BriefComposer /><Plans /><MentekNote /></main><Footer onOpenPrivacyChoices={() => setPrivacyChoicesOpen(true)} /><PrivacyNotice forceOpen={privacyChoicesOpen} onChoice={() => setPrivacyChoicesOpen(false)} /></>;
}
