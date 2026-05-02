import type { Application, Stats, Streak, CalendarEvent, LogEntry, StatusMeta, StatusType } from '@/types/dashboard';

export const APPLICATIONS: Application[] = [
  { id: 'APL-0042', company: 'Stripe',        role: 'Software Engineer Intern',   status: 'interview', source: 'Welcome to the Jungle', loc: 'Paris',       remote: 'Hybrid',  salary: '1400€/mo', sentDays: 12, lastDays: 2,  contact: 'M. Dubois',   priority: 1, link: 'stripe.com/jobs/4501',      notes: 'Tech screen passed. 2nd round w/ infra team Tue.' },
  { id: 'APL-0041', company: 'Datadog',       role: 'SRE Intern',                 status: 'followup',  source: 'LinkedIn',              loc: 'Paris',       remote: 'On-site', salary: '1500€/mo', sentDays: 18, lastDays: 18, contact: 'L. Bernard',   priority: 2, link: 'datadoghq.com/careers',     notes: 'Sent followup mail today. No reply since.' },
  { id: 'APL-0040', company: 'Mistral AI',    role: 'ML Engineer Intern',         status: 'interview', source: 'Direct',                loc: 'Paris',       remote: 'On-site', salary: '1800€/mo', sentDays: 9,  lastDays: 1,  contact: 'A. Mensch',    priority: 1, link: 'mistral.ai/careers',        notes: 'Take-home received. Due Friday.' },
  { id: 'APL-0039', company: 'Doctolib',      role: 'Frontend Intern',            status: 'sent',      source: 'LinkedIn',              loc: 'Levallois',   remote: 'Hybrid',  salary: '1300€/mo', sentDays: 5,  lastDays: 5,  contact: '—',            priority: 3, link: 'doctolib.fr/jobs',          notes: '' },
  { id: 'APL-0038', company: 'Algolia',       role: 'Backend Intern',             status: 'rejected',  source: 'Welcome to the Jungle', loc: 'Paris',       remote: 'Remote',  salary: '—',        sentDays: 21, lastDays: 6,  contact: 'C. Helme',     priority: 4, link: 'algolia.com/careers',       notes: 'Position closed.' },
  { id: 'APL-0037', company: 'Qonto',         role: 'Product Engineer Intern',    status: 'sent',      source: 'Indeed',                loc: 'Paris',       remote: 'Hybrid',  salary: '1400€/mo', sentDays: 4,  lastDays: 4,  contact: '—',            priority: 3, link: 'qonto.com/jobs',            notes: '' },
  { id: 'APL-0036', company: 'Sorare',        role: 'Full-stack Intern',          status: 'offer',     source: 'Direct',                loc: 'Paris',       remote: 'On-site', salary: '1600€/mo', sentDays: 28, lastDays: 0,  contact: 'N. Julia',     priority: 1, link: 'sorare.com/careers',        notes: 'Offer received! Deadline Apr 30.' },
  { id: 'APL-0035', company: 'Alan',          role: 'Data Engineer Intern',       status: 'interview', source: 'LinkedIn',              loc: 'Paris',       remote: 'Hybrid',  salary: '1500€/mo', sentDays: 14, lastDays: 3,  contact: 'J. Reichel',   priority: 2, link: 'alan.com/jobs',             notes: 'Round 2 done, waiting answer.' },
  { id: 'APL-0034', company: 'PayFit',        role: 'Backend Intern',             status: 'rejected',  source: 'Welcome to the Jungle', loc: 'Paris',       remote: 'Hybrid',  salary: '—',        sentDays: 32, lastDays: 14, contact: '—',            priority: 4, link: 'payfit.com/careers',        notes: 'Rejected after take-home.' },
  { id: 'APL-0033', company: 'Aircall',       role: 'Mobile Intern',              status: 'followup',  source: 'LinkedIn',              loc: 'Paris',       remote: 'Remote',  salary: '1300€/mo', sentDays: 22, lastDays: 22, contact: 'O. Pailhes',   priority: 3, link: 'aircall.io/jobs',            notes: 'Need to send second followup.' },
  { id: 'APL-0032', company: 'Hugging Face',  role: 'ML Research Intern',         status: 'sent',      source: 'Direct',                loc: 'Paris',       remote: 'Remote',  salary: '1700€/mo', sentDays: 7,  lastDays: 7,  contact: 'C. Delangue',  priority: 1, link: 'huggingface.co/jobs',       notes: 'Cold-mailed CTO with project.' },
  { id: 'APL-0031', company: 'Swile',         role: 'Frontend Intern',            status: 'sent',      source: 'Indeed',                loc: 'Montpellier', remote: 'Hybrid',  salary: '1200€/mo', sentDays: 3,  lastDays: 3,  contact: '—',            priority: 4, link: 'swile.co/jobs',             notes: '' },
  { id: 'APL-0030', company: 'Ledger',        role: 'Security Intern',            status: 'draft',     source: 'LinkedIn',              loc: 'Paris',       remote: 'On-site', salary: '1500€/mo', sentDays: 0,  lastDays: 0,  contact: '—',            priority: 2, link: 'ledger.com/jobs',           notes: 'Need to finish CL.' },
  { id: 'APL-0029', company: 'Back Market',   role: 'Backend Intern',             status: 'rejected',  source: 'Welcome to the Jungle', loc: 'Paris',       remote: 'Hybrid',  salary: '—',        sentDays: 38, lastDays: 20, contact: '—',            priority: 4, link: 'backmarket.com/jobs',       notes: '' },
  { id: 'APL-0028', company: 'BlaBlaCar',     role: 'iOS Intern',                 status: 'interview', source: 'LinkedIn',              loc: 'Paris',       remote: 'Hybrid',  salary: '1400€/mo', sentDays: 16, lastDays: 4,  contact: 'V. Sanchez',   priority: 2, link: 'blablacar.com/careers',     notes: 'Tech round Wed 14:00.' },
  { id: 'APL-0027', company: 'Spendesk',      role: 'Full-stack Intern',          status: 'sent',      source: 'Indeed',                loc: 'Paris',       remote: 'Hybrid',  salary: '1400€/mo', sentDays: 6,  lastDays: 6,  contact: '—',            priority: 3, link: 'spendesk.com/jobs',         notes: '' },
  { id: 'APL-0026', company: 'Contentsquare', role: 'Data Intern',                status: 'draft',     source: 'Direct',                loc: 'Paris',       remote: 'Hybrid',  salary: '—',        sentDays: 0,  lastDays: 0,  contact: '—',            priority: 3, link: 'contentsquare.com/jobs',    notes: 'Refining cover letter.' },
  { id: 'APL-0025', company: 'OVHcloud',      role: 'DevOps Intern',              status: 'rejected',  source: 'LinkedIn',              loc: 'Roubaix',     remote: 'On-site', salary: '—',        sentDays: 41, lastDays: 18, contact: '—',            priority: 4, link: 'ovhcloud.com/careers',      notes: '' },
  { id: 'APL-0024', company: 'Lydia',         role: 'Mobile Intern',              status: 'sent',      source: 'LinkedIn',              loc: 'Paris',       remote: 'Hybrid',  salary: '1300€/mo', sentDays: 8,  lastDays: 8,  contact: '—',            priority: 4, link: 'lydia-app.com/jobs',        notes: '' },
  { id: 'APL-0023', company: 'Shine',         role: 'Backend Intern',             status: 'followup',  source: 'Welcome to the Jungle', loc: 'Paris',       remote: 'Remote',  salary: '1300€/mo', sentDays: 19, lastDays: 19, contact: '—',            priority: 4, link: 'shine.fr/jobs',             notes: '' },
];

export const STATUS_META: Record<StatusType, StatusMeta> = {
  draft:     { label: 'DRAFT',     short: 'DR', color: 'gray',  tone: 'oklch(0.62 0.01 240)' },
  sent:      { label: 'SENT',      short: 'SE', color: 'blue',  tone: 'oklch(0.72 0.14 240)' },
  followup:  { label: 'FOLLOWUP',  short: 'FU', color: 'amber', tone: 'oklch(0.78 0.16 75)' },
  interview: { label: 'INTERVIEW', short: 'IV', color: 'cyan',  tone: 'oklch(0.80 0.13 195)' },
  offer:     { label: 'OFFER',     short: 'OF', color: 'lime',  tone: 'oklch(0.82 0.20 140)' },
  rejected:  { label: 'REJECTED',  short: 'RJ', color: 'red',   tone: 'oklch(0.65 0.18 25)' },
};

export const STATUS_ORDER: StatusType[] = ['draft', 'sent', 'followup', 'interview', 'offer', 'rejected'];

export const ACTIVITY: number[] = (() => {
  const out: number[] = [];
  let seed = 42;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 90; i++) {
    const weekday = i % 7;
    const base = weekday >= 5 ? 0.3 : 1;
    out.push(Math.floor(rnd() * 4 * base + (i > 60 ? 1 : 0)));
  }
  return out;
})();

const sent = APPLICATIONS.filter(a => a.status !== 'draft').length;
const responses = APPLICATIONS.filter(a => ['interview', 'offer', 'rejected', 'followup'].includes(a.status)).length;
const interviews = APPLICATIONS.filter(a => ['interview', 'offer'].includes(a.status)).length;
const offers = APPLICATIONS.filter(a => a.status === 'offer').length;

export const STATS: Stats = {
  total: APPLICATIONS.length,
  sent,
  responses,
  interviews,
  offers,
  responseRate: ((responses / sent) * 100).toFixed(1),
  interviewRate: ((interviews / sent) * 100).toFixed(1),
};

export const STREAK: Streak = { current: 7, best: 14, today: 3, goal: 3 };

export const EVENTS: CalendarEvent[] = [
  { day: 'TUE', date: '29', time: '10:00', company: 'Stripe',     label: 'Tech screen R2',  type: 'interview' },
  { day: 'WED', date: '30', time: '14:00', company: 'BlaBlaCar',  label: 'iOS technical',   type: 'interview' },
  { day: 'WED', date: '30', time: '23:59', company: 'Sorare',     label: 'Offer deadline',  type: 'deadline' },
  { day: 'FRI', date: '02', time: '23:59', company: 'Mistral AI', label: 'Take-home due',   type: 'deadline' },
  { day: 'MON', date: '05', time: '11:00', company: 'Alan',       label: 'Final round',     type: 'interview' },
];

export const ACTIVITY_LOG: LogEntry[] = [
  { t: '14:32', code: 'STAT', msg: 'Stripe → INTERVIEW',        tone: 'cyan' },
  { t: '13:18', code: 'NOTE', msg: 'Added note on Mistral AI',  tone: 'gray' },
  { t: '11:04', code: 'SEND', msg: 'Submitted to Qonto',        tone: 'blue' },
  { t: '10:47', code: 'MAIL', msg: 'Followup sent → Datadog',   tone: 'amber' },
  { t: '09:51', code: 'STAT', msg: 'Sorare → OFFER',            tone: 'lime' },
  { t: '08:23', code: 'STAT', msg: 'PayFit → REJECTED',         tone: 'red' },
  { t: 'YDA',   code: 'SEND', msg: 'Submitted to Hugging Face', tone: 'blue' },
  { t: 'YDA',   code: 'NOTE', msg: 'Updated CV v3.2',           tone: 'gray' },
  { t: 'YDA',   code: 'STAT', msg: 'Algolia → REJECTED',        tone: 'red' },
];
