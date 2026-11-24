function ArrowIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3 9h11M10 4l5 5-5 5" />
    </svg>
  );
}

const principles = [
  {
    title: 'A place in the team.',
    copy: 'Agents should have an identity, a role, and work to own. We build around that responsibility, from the first brief to the handoff.',
  },
  {
    title: 'Continuity matters.',
    copy: 'Meaningful work takes more than one conversation. Goals, decisions, and progress should stay together so people and agents can pick up where the work left off.',
  },
  {
    title: 'Trust needs evidence.',
    copy: 'A fluent answer is only a beginning. Useful agents make their work inspectable, acknowledge uncertainty, and ask for human judgment when it matters.',
  },
];

const operatingLayers = [
  ['Context', 'Business knowledge, roles, documents, systems, and history should travel with the work.'],
  ['Judgment', 'People keep direction over consequential choices; agents bring options, execution, and clear escalation.'],
  ['Proof', 'Approvals, rationale, exceptions, and results stay visible enough to review and improve the next run.'],
];

export default function MentekPage() {
  return (
    <>
      <a className="skip-link" href="#mentek-main">Skip to content</a>
      <header className="mentek-header">
        <div className="shell mentek-header-inner">
          <a className="brand" href="/" aria-label="Hallard home">
            <img className="brand-wordmark" src="/assets/hallard-wordmark-on-dark.svg" alt="Hallard" width="176" height="50" />
          </a>
          <span className="mentek-header-label">A product by Mentek</span>
          <a className="button button--small" href="/#start" data-analytics="mentek_talk_to_hallard">Talk to Hallard</a>
        </div>
      </header>
      <main id="mentek-main">
        <section className="mentek-hero" id="top">
          <div className="shell mentek-hero-grid">
            <div>
              <p className="mentek-name">Mentek</p>
              <h1>People and AI, moving forward together.</h1>
            </div>
            <div className="mentek-hero-copy">
              <p>Mentek builds systems for people and AI to take useful work forward together—without asking either side to work in a black box.</p>
              <a className="text-action" href="/" data-analytics="mentek_explore_hallard">Explore Hallard <ArrowIcon /></a>
            </div>
          </div>
        </section>

        <section className="mentek-principles" aria-labelledby="principles-heading">
          <div className="shell">
            <h2 id="principles-heading">What we think a useful AI teammate should be.</h2>
            <div className="mentek-principle-list">
              {principles.map((principle) => (
                <article key={principle.title}>
                  <h3>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mentek-operating" aria-labelledby="operating-heading">
          <div className="shell mentek-operating-grid">
            <div>
              <h2 id="operating-heading">The work needs more than a good answer.</h2>
              <p className="section-lead">Models can reason, draft, and plan. To matter inside a business, they need the right context, clear boundaries, useful tools, and an accountable path back to people.</p>
            </div>
            <ol className="mentek-layer-list">
              {operatingLayers.map(([label, copy]) => <li key={label}><strong>{label}</strong><p>{copy}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="mentek-hallard" aria-labelledby="mentek-hallard-heading">
          <div className="shell mentek-hallard-grid">
            <div>
              <h2 id="mentek-hallard-heading">Hallard is how that work becomes visible.</h2>
              <p>Start with the situation. Hallard helps turn it into a clear plan, brings specialist agents into the shared context, and keeps important decisions with the person who owns the outcome.</p>
            </div>
            <div className="mentek-path" aria-label="How Mentek turns a business brief into accountable work">
              <span>A business brief</span><i aria-hidden="true" /><span>Specialist agents</span><i aria-hidden="true" /><span>Human approval</span><i aria-hidden="true" /><span>Work that moves</span>
            </div>
          </div>
        </section>

        <section className="mentek-close">
          <div className="shell mentek-close-inner">
            <h2>Big ambitions. Real responsibilities.</h2>
            <p>From one person to a company with many teams, AI becomes useful when its work can be understood, directed, and trusted.</p>
            <a className="button" href="/#start" data-analytics="mentek_start_brief">Start a brief with Hallard <ArrowIcon /></a>
          </div>
        </section>
      </main>
      <footer className="mentek-footer">
        <div className="shell"><span>Mentek, LLC</span><a href="/">Hallard</a><a href="/privacy-policy.html">Privacy</a><a href="/terms-and-conditions.html">Terms</a></div>
      </footer>
    </>
  );
}
