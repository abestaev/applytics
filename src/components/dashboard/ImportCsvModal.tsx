import { useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { T } from '@/tokens';
import { STATUS_META, STATUS_ORDER } from '@/data/mockData';
import { CodeTag, ToolBtn } from './Primitives';
import type { NewApplication } from '@/hooks/useApplications';
import type { AppType, InterviewStage, StatusType } from '@/types/dashboard';

interface ImportCsvModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (values: NewApplication[]) => Promise<void>;
}

type CsvRow = Record<string, string | undefined>;

interface ParsedRow {
  line: number;
  raw: CsvRow;
  app?: NewApplication;
  errors: string[];
}

const TEMPLATE_HEADERS = [
  'company', 'role', 'status', 'source', 'location', 'mode', 'salary',
  'contact', 'priority', 'link', 'notes', 'sent_at', 'type',
  'followup_date', 'interview_stage', 'interview_date',
];

const TEMPLATE_ROW = [
  'Acme', 'Software Engineer Intern', 'sent', 'LinkedIn', 'Paris',
  'Hybrid', '1400€/mo', 'recruiter@acme.com', '3',
  'https://acme.com/jobs/123', 'Intro call planned', '2026-05-06',
  'stage', '', '', '',
];

const STATUS_ALIASES: Record<string, StatusType> = {
  draft: 'draft',
  brouillon: 'draft',
  sent: 'sent',
  submitted: 'sent',
  applied: 'sent',
  ongoing: 'sent',
  'on going': 'sent',
  followup: 'followup',
  'follow-up': 'followup',
  relance: 'followup',
  interview: 'interview',
  entretien: 'interview',
  offer: 'offer',
  offre: 'offer',
  rejected: 'rejected',
  refused: 'rejected',
  refuse: 'rejected',
  refusé: 'rejected',
  refusee: 'rejected',
};

const TYPE_ALIASES: Record<string, AppType> = {
  stage: 'stage',
  internship: 'stage',
  intern: 'stage',
  alternance: 'alternance',
  apprenticeship: 'alternance',
  cdi: 'cdi',
  fulltime: 'cdi',
  'full-time': 'cdi',
  freelance: 'freelance',
};

const INTERVIEW_STAGE_ALIASES: Record<string, InterviewStage> = {
  pending_date: 'pending_date',
  date: 'pending_date',
  'waiting for date': 'pending_date',
  pending_approval: 'pending_approval',
  approval: 'pending_approval',
  'waiting for approval': 'pending_approval',
};

const FIELD_ALIASES = {
  company: ['company', 'entreprise', 'societe', 'société'],
  role: ['role', 'job', 'poste', 'title', 'speciality', 'specialty'],
  status: ['status', 'statut'],
  source: ['source'],
  loc: ['location', 'loc', 'city', 'ville'],
  remote: ['mode', 'remote', 'work_mode'],
  salary: ['salary', 'salaire'],
  contact: ['contact', 'email'],
  priority: ['priority', 'p', 'priorite', 'priorité'],
  link: ['link', 'lien', 'url'],
  notes: ['notes', 'others', 'comment', 'comments'],
  sentAt: ['sent_at', 'sent date', 'date', 'date_envoi'],
  followupDate: ['followup_date', 'followup date', 'date_relance'],
  type: ['type', 'contract', 'contrat'],
  interviewStage: ['interview_stage', 'interview stage'],
  interviewDate: ['interview_date', 'interview date'],
} as const;

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function normalizeValue(value: string) {
  return normalizeKey(value).replace(/\s+/g, ' ');
}

function valueFor(row: CsvRow, aliases: readonly string[]) {
  const entries = Object.entries(row);
  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias);
    const match = entries.find(([key]) => normalizeKey(key) === normalizedAlias);
    const value = match?.[1]?.trim();
    if (value) return value;
  }
  return '';
}

function parseStatus(value: string, errors: string[]) {
  if (!value) return 'sent';
  const status = STATUS_ALIASES[normalizeValue(value)];
  if (status) return status;
  errors.push(`status "${value}" unknown. Accepted values: ${STATUS_ORDER.join(', ')}.`);
  return 'sent';
}

function parseType(value: string) {
  if (!value) return 'stage';
  return TYPE_ALIASES[normalizeValue(value)] ?? 'stage';
}

function parseInterviewStage(value: string, errors: string[]) {
  if (!value) return undefined;
  const stage = INTERVIEW_STAGE_ALIASES[normalizeValue(value)];
  if (stage) return stage;
  errors.push(`interview_stage "${value}" unknown.`);
  return undefined;
}

function parsePriority(value: string, errors: string[]) {
  if (!value) return 3;
  const priority = Number(value.replace(/^p/i, ''));
  if ([1, 2, 3].includes(priority)) return priority;
  errors.push(`priority "${value}" invalid. Accepted values: 1, 2, 3.`);
  return 3;
}

function parseDate(value: string, errors: string[], field: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  const isoLike = /^\d{4}-\d{2}-\d{2}/.test(trimmed);
  const frMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const normalized = frMatch
    ? `${frMatch[3]}-${frMatch[2].padStart(2, '0')}-${frMatch[1].padStart(2, '0')}`
    : trimmed;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    errors.push(`${field} "${value}" invalid. Recommended format: YYYY-MM-DD.`);
    return undefined;
  }
  return isoLike && trimmed.includes('T') ? date.toISOString() : new Date(`${normalized}T00:00:00`).toISOString();
}

function rowToApplication(row: CsvRow, index: number): ParsedRow {
  const errors: string[] = [];
  const company = valueFor(row, FIELD_ALIASES.company);
  const role = valueFor(row, FIELD_ALIASES.role);
  const status = parseStatus(valueFor(row, FIELD_ALIASES.status), errors);
  const interviewStage = parseInterviewStage(valueFor(row, FIELD_ALIASES.interviewStage), errors);
  const interviewDate = parseDate(valueFor(row, FIELD_ALIASES.interviewDate), errors, 'interview_date');
  const followupDate = status === 'followup'
    ? parseDate(valueFor(row, FIELD_ALIASES.followupDate), errors, 'followup_date') ?? new Date().toISOString()
    : undefined;
  const sentAt = status === 'draft'
    ? undefined
    : parseDate(valueFor(row, FIELD_ALIASES.sentAt), errors, 'sent_at') ?? new Date().toISOString();

  if (!company) errors.push('company missing.');
  if (!role) errors.push('role missing.');
  if (status === 'interview' && !interviewDate && interviewStage) {
    errors.push('interview_date missing while interview_stage is set.');
  }

  const app: NewApplication = {
    company,
    role,
    status,
    source: valueFor(row, FIELD_ALIASES.source) || 'CSV Import',
    loc: valueFor(row, FIELD_ALIASES.loc) || '—',
    remote: valueFor(row, FIELD_ALIASES.remote) || 'Hybrid',
    salary: valueFor(row, FIELD_ALIASES.salary),
    contact: valueFor(row, FIELD_ALIASES.contact),
    priority: parsePriority(valueFor(row, FIELD_ALIASES.priority), errors),
    link: valueFor(row, FIELD_ALIASES.link),
    notes: valueFor(row, FIELD_ALIASES.notes),
    sentAt,
    followupDate,
    type: parseType(valueFor(row, FIELD_ALIASES.type)),
    interviewStage,
    interviewDate,
  };

  return { line: index + 2, raw: row, app: errors.length === 0 ? app : undefined, errors };
}

function downloadTemplate() {
  const content = `${TEMPLATE_HEADERS.join(',')}\n${TEMPLATE_ROW.map(v => `"${v.replace(/"/g, '""')}"`).join(',')}`;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'applytics-import-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function ImportCsvModal({ open, onClose, onImport }: ImportCsvModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const validRows = useMemo(() => rows.filter(row => row.app), [rows]);
  const invalidRows = rows.length - validRows.length;

  const reset = () => {
    setRows([]);
    setFileName('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const close = () => {
    if (importing) return;
    reset();
    onClose();
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setError('');
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(),
      complete: result => {
        if (result.errors.length > 0) {
          setError(result.errors[0]?.message ?? 'CSV unreadable.');
        }
        setRows(result.data.map(rowToApplication));
      },
      error: err => setError(err.message),
    });
  };

  const importValidRows = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setError('');
    try {
      await onImport(validRows.map(row => row.app as NewApplication));
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 120,
      background: 'rgba(8,9,11,.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 680, maxHeight: 'calc(100vh - 48px)',
        background: T.bg1, border: `1px solid ${T.br2}`,
        boxShadow: '0 20px 60px rgba(0,0,0,.6)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${T.br0}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CodeTag tone="accent">IMPORT</CodeTag>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: T.fg0 }}>
            CSV APPLICATIONS
          </span>
          <span style={{ flex: 1 }} />
          <button onClick={close} style={{
            background: 'none', border: 'none', color: T.fg2,
            cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px',
          }}>x</button>
        </div>

        <div style={{
          padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
          overflow: 'auto', fontFamily: 'var(--mono)',
        }}>
          <div style={{ padding: 12, background: T.bg0, border: `1px solid ${T.br0}`, color: T.fg2, fontSize: 10.5, lineHeight: 1.5 }}>
            Required columns: <span style={{ color: T.fg0 }}>company</span>, <span style={{ color: T.fg0 }}>role</span>.
            Other columns are optional. Aliases like Company, poste, city, Date, ON GOING or REFUSED are also accepted.
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => inputRef.current?.click()} style={{
              background: T.accent, border: 'none', color: '#0a0b0d',
              padding: '6px 12px', fontFamily: 'var(--mono)', fontSize: 10.5,
              fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer',
            }}>CHOOSE CSV</button>
            <ToolBtn onClick={downloadTemplate}>DOWNLOAD TEMPLATE</ToolBtn>
            {fileName && <span style={{ alignSelf: 'center', color: T.fg2, fontSize: 10 }}>{fileName}</span>}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={e => handleFile(e.target.files?.[0])}
              style={{ display: 'none' }}
            />
          </div>

          {rows.length > 0 && (
            <div style={{
              display: 'flex', gap: 12, color: T.fg2, fontSize: 10.5,
              padding: '8px 0', borderTop: `1px solid ${T.br0}`, borderBottom: `1px solid ${T.br0}`,
            }}>
              <span><span style={{ color: T.fg0 }}>{rows.length}</span> rows detected</span>
              <span><span style={{ color: T.offer }}>{validRows.length}</span> ready</span>
              <span><span style={{ color: invalidRows ? T.rejected : T.fg2 }}>{invalidRows}</span> erreurs</span>
            </div>
          )}

          {error && (
            <div style={{ color: T.rejected, fontSize: 10.5, padding: '8px 10px', background: `${T.rejected}12`, border: `1px solid ${T.rejected}40` }}>
              {error}
            </div>
          )}

          {rows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: T.br0 }}>
              {rows.slice(0, 12).map(row => (
                <div key={row.line} style={{
                  background: T.bg0, padding: '8px 10px',
                  display: 'grid', gridTemplateColumns: '56px 1fr auto',
                  gap: 10, alignItems: 'center',
                }}>
                  <CodeTag tone={row.app ? 'lime' : 'red'}>L{row.line}</CodeTag>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: T.fg0, fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.app?.company || valueFor(row.raw, FIELD_ALIASES.company) || 'company ?'}
                    </div>
                    <div style={{ color: row.errors.length ? T.rejected : T.fg2, fontSize: 10, marginTop: 2 }}>
                      {row.errors.length ? row.errors.join(' ') : row.app?.role}
                    </div>
                  </div>
                  <span style={{ color: row.app ? STATUS_META[row.app.status].tone : T.rejected, fontSize: 10 }}>
                    {row.app ? STATUS_META[row.app.status].label : 'ERROR'}
                  </span>
                </div>
              ))}
              {rows.length > 12 && (
                <div style={{ background: T.bg0, padding: '8px 10px', color: T.fg3, fontSize: 10 }}>
                  +{rows.length - 12} rows hidden in preview
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{
          padding: '10px 16px', borderTop: `1px solid ${T.br0}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>
            Nothing is written until confirmed.
          </span>
          <span style={{ flex: 1 }} />
          <ToolBtn onClick={close}>CANCEL</ToolBtn>
          <button
            onClick={importValidRows}
            disabled={importing || validRows.length === 0}
            style={{
              background: validRows.length > 0 ? T.accent : T.bg3,
              color: validRows.length > 0 ? '#0a0b0d' : T.fg3,
              border: 'none', padding: '5px 14px',
              fontFamily: 'var(--mono)', fontSize: 10.5,
              fontWeight: 700, letterSpacing: '0.08em',
              cursor: validRows.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {importing ? 'IMPORTING...' : `IMPORT ${validRows.length} VALID`}
          </button>
        </div>
      </div>
    </div>
  );
}
