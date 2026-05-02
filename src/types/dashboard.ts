export type StatusType = 'draft' | 'sent' | 'followup' | 'interview' | 'offer' | 'rejected';
export type ViewType = 'dash' | 'list' | 'board' | 'stats';

export interface Application {
  id: string;
  company: string;
  role: string;
  status: StatusType;
  source: string;
  loc: string;
  remote: string;
  salary: string;
  sentDays: number;
  lastDays: number;
  contact: string;
  priority: number;
  link: string;
  notes: string;
}

export interface Stats {
  total: number;
  sent: number;
  responses: number;
  interviews: number;
  offers: number;
  responseRate: string;
  interviewRate: string;
}

export interface Streak {
  current: number;
  best: number;
  today: number;
  goal: number;
}

export interface CalendarEvent {
  day: string;
  date: string;
  time: string;
  company: string;
  label: string;
  type: 'interview' | 'deadline';
}

export interface LogEntry {
  t: string;
  code: string;
  msg: string;
  tone: string;
}

export interface StatusMeta {
  label: string;
  short: string;
  color: 'gray' | 'blue' | 'amber' | 'cyan' | 'lime' | 'red';
  tone: string;
}
