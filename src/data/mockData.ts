import type { StatusMeta, StatusType } from '@/types/dashboard';

export const STATUS_META: Record<StatusType, StatusMeta> = {
  draft:     { label: 'DRAFT',     short: 'DR', color: 'gray',  tone: 'oklch(0.62 0.01 240)' },
  sent:      { label: 'SENT',      short: 'SE', color: 'blue',  tone: 'oklch(0.72 0.14 240)' },
  followup:  { label: 'FOLLOWUP',  short: 'FU', color: 'amber', tone: 'oklch(0.78 0.16 75)' },
  interview: { label: 'INTERVIEW', short: 'IV', color: 'cyan',  tone: 'oklch(0.80 0.13 195)' },
  offer:     { label: 'OFFER',     short: 'OF', color: 'lime',  tone: 'oklch(0.82 0.20 140)' },
  rejected:  { label: 'REJECTED',  short: 'RJ', color: 'red',   tone: 'oklch(0.65 0.18 25)' },
};

export const STATUS_ORDER: StatusType[] = ['draft', 'sent', 'followup', 'interview', 'offer', 'rejected'];
