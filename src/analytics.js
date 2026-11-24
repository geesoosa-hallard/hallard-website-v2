const analyticsConsentKey = 'hallard:analytics-consent';
const requiresConsent = import.meta.env.VITE_ANALYTICS_CONSENT_REQUIRED !== 'false';
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

function hasUsableId(value) {
  return Boolean(value) && !/replace|dummy|example/i.test(value);
}

export function getAnalyticsConsent() {
  if (typeof window === 'undefined' || !requiresConsent) return null;
  try {
    const consent = window.localStorage.getItem(analyticsConsentKey);
    return consent === 'granted' || consent === 'declined' ? consent : null;
  } catch {
    return null;
  }
}

function hasConsent() {
  return !requiresConsent || getAnalyticsConsent() === 'granted';
}

function appendScript(source) {
  if (document.querySelector(`script[src="${source}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = source;
  document.head.append(script);
}

function installGoogleAnalytics() {
  if (!hasUsableId(gaMeasurementId) || window.gtag) return;
  appendScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', gaMeasurementId, { send_page_view: true });
}

function installClarity() {
  if (!hasUsableId(clarityProjectId) || window.clarity) return;
  window.clarity = function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };
  appendScript(`https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}`);
}

export function initialiseAnalytics() {
  if (import.meta.env.DEV || !hasConsent()) return;
  installGoogleAnalytics();
  installClarity();
}

export function saveAnalyticsConsent(consent) {
  if (!requiresConsent || (consent !== 'granted' && consent !== 'declined')) return false;
  const needsReload = consent === 'declined' && Boolean(window.gtag || window.clarity);
  try {
    window.localStorage.setItem(analyticsConsentKey, consent);
  } catch {
    return false;
  }
  if (consent === 'granted') initialiseAnalytics();
  return needsReload;
}

export function track(name) {
  if (!name || !hasConsent()) return;
  window.gtag?.('event', name);
  window.clarity?.('event', name);
}
