import { useEffect, useRef, useState } from 'react';
import { T } from '@/tokens';
import { STATUS_META, STATUS_ORDER } from '@/data/mockData';
import { CodeTag, ToolBtn } from './Primitives';
import type { NewApplication } from '@/hooks/useApplications';
import type { Application, AppType, InterviewStage, StatusType } from '@/types/dashboard';

interface AddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (values: NewApplication) => Promise<void>;
  onUpdate: (id: string, patch: Partial<Omit<Application, 'id' | 'sentDays' | 'lastDays'>>) => Promise<void>;
  totalApps: number;
  initialStatus?: StatusType;
  editApp?: Application;
}

interface FormState {
  company: string;
  role: string;
  source: string;
  loc: string;
  remote: string;
  salary: string;
  contact: string;
  status: StatusType;
  type: AppType;
  interviewStage: InterviewStage | '';
  interviewDate: string;
  priority: number;
  link: string;
  notes: string;
  sentAt: string;
}

const INITIAL: FormState = {
  company: '', role: '', source: 'LinkedIn', loc: 'Paris',
  remote: 'Hybrid', salary: '', contact: '', status: 'draft',
  type: 'stage', interviewStage: '', interviewDate: '', priority: 3, link: '', notes: '', sentAt: new Date().toISOString().slice(0, 10),
};

function initialForm(status: StatusType = 'draft'): FormState {
  return { ...INITIAL, status };
}

function appToForm(app: Application): FormState {
  return {
    company: app.company, role: app.role, source: app.source,
    loc: app.loc, remote: app.remote, salary: app.salary,
    contact: app.contact, status: app.status,
    type: app.type ?? 'stage',
    interviewStage: app.interviewStage ?? '',
    interviewDate: app.interviewDate ? toLocalInput(app.interviewDate) : '',
    priority: app.priority, link: app.link, notes: app.notes,
    sentAt: app.sentAt ? app.sentAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const SOURCE_SUGGESTIONS = ['LinkedIn', 'Welcome to the Jungle', 'Indeed', 'Direct', 'Referral', '42 intra', 'Seekube'];

function ComboField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen]     = useState(false);
  const [hover, setHover]   = useState(-1);
  const ref                 = useRef<HTMLDivElement>(null);

  const filtered = SOURCE_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(value.toLowerCase())
  );
  const showList = open && filtered.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); setHover(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (!showList) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setHover(h => Math.min(h + 1, filtered.length - 1)); }
          if (e.key === 'ArrowUp')   { e.preventDefault(); setHover(h => Math.max(h - 1, 0)); }
          if (e.key === 'Enter' && hover >= 0) { onChange(filtered[hover]); setOpen(false); }
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="LinkedIn, 42 intra…"
        style={{
          width: '100%', background: T.bg0, border: `1px solid ${T.br1}`,
          color: T.fg0, fontFamily: 'var(--mono)', fontSize: 11,
          padding: '6px 9px', outline: 'none', height: 28,
        }}
      />
      {showList && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: T.bg1, border: `1px solid ${T.br2}`,
          boxShadow: '0 8px 24px rgba(0,0,0,.5)',
          maxHeight: 180, overflowY: 'auto',
        }}>
          {filtered.map((s, i) => (
            <div
              key={s}
              onMouseDown={() => { onChange(s); setOpen(false); }}
              onMouseEnter={() => setHover(i)}
              style={{
                padding: '7px 10px',
                fontFamily: 'var(--mono)', fontSize: 11,
                color: hover === i ? T.fg0 : T.fg1,
                background: hover === i ? T.bg3 : 'transparent',
                cursor: 'pointer',
              }}
            >{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 9.5, color: T.fg3, letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'var(--mono)' }}>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, full }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; full?: boolean;
}) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <FieldLabel>{label}</FieldLabel>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        width: '100%', background: T.bg0, border: `1px solid ${T.br1}`,
        color: T.fg0, fontFamily: 'var(--mono)', fontSize: 11,
        padding: '6px 9px', outline: 'none', height: 28,
      }} />
    </div>
  );
}

function SelectField<V extends string | number>({ label, value, onChange, options }: {
  label: string; value: V; onChange: (v: V) => void;
  options: { value: V; label: string }[] | string[];
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select value={String(value)} onChange={e => {
        const raw = e.target.value;
        onChange((typeof value === 'number' ? Number(raw) : raw) as V);
      }} style={{
        width: '100%', background: T.bg0, border: `1px solid ${T.br1}`,
        color: T.fg0, fontFamily: 'var(--mono)', fontSize: 11,
        padding: '6px 9px', outline: 'none', height: 28, appearance: 'none', cursor: 'pointer',
      }}>
        {options.map(o => {
          const v = typeof o === 'object' ? String(o.value) : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
}

export function AddModal({ open, onClose, onAdd, onUpdate, totalApps, initialStatus = 'draft', editApp }: AddModalProps) {
  const isEdit = !!editApp;
  const [form, setForm]   = useState<FormState>(isEdit ? appToForm(editApp) : initialForm(initialStatus));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setForm(editApp ? appToForm(editApp) : initialForm(initialStatus));
      setError(null);
    }
  }, [open, editApp, initialStatus]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.company) return;
    setSaving(true);
    setError(null);
    try {
      const stage = form.interviewStage || undefined;
      const iDate = form.interviewDate ? new Date(form.interviewDate).toISOString() : undefined;
      if (isEdit) {
        await onUpdate(editApp.id, {
          ...form,
          interviewStage: stage as InterviewStage | undefined,
          interviewDate: iDate,
          sentAt: form.sentAt ? new Date(form.sentAt).toISOString() : undefined,
        });
      } else {
        await onAdd({
          ...form,
          interviewStage: stage as InterviewStage | undefined,
          interviewDate: iDate,
          sentAt: form.sentAt
            ? new Date(form.sentAt).toISOString()
            : form.status !== 'draft' ? new Date().toISOString() : undefined,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const canSubmit = !saving && !!form.company;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(8,9,11,.75)',
      backdropFilter: 'blur(6px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 560, background: T.bg1,
        border: `1px solid ${T.br2}`,
        boxShadow: '0 20px 60px rgba(0,0,0,.6)',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${T.br0}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CodeTag tone="accent">{isEdit ? 'EDIT' : 'NEW'}</CodeTag>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: T.fg0 }}>
            {isEdit ? editApp.company.toUpperCase() : 'NEW APPLICATION'}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>
            {isEdit ? editApp.id.slice(0, 8) : `APL-${String(totalApps + 1).padStart(4, '0')}`}
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: T.fg2,
            cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px',
          }}>×</button>
        </div>

        {/* Fields */}
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontFamily: 'var(--mono)' }}>
          <Field label="COMPANY"  value={form.company}  onChange={v => set('company', v)}  placeholder="Stripe"                    full />
          <Field label="ROLE"     value={form.role}     onChange={v => set('role', v)}     placeholder="Software Engineer Intern"  full />
          <ComboField label="SOURCE" value={form.source} onChange={v => set('source', v)} />
          <Field label="LOCATION" value={form.loc}     onChange={v => set('loc', v)} />
          <SelectField label="MODE"     value={form.remote}   onChange={v => set('remote', v)}
            options={['On-site', 'Hybrid', 'Remote']} />
          <Field label="SALARY"   value={form.salary}  onChange={v => set('salary', v)}   placeholder="1400€/mo" />
          <SelectField label="STATUS"   value={form.status}   onChange={v => set('status', v as StatusType)}
            options={STATUS_ORDER.map(s => ({ value: s, label: STATUS_META[s].label }))} />
          {form.status === 'interview' && (
            <SelectField label="INTERVIEW STAGE" value={form.interviewStage} onChange={v => set('interviewStage', v as InterviewStage | '')}
              options={[
                { value: '',                 label: '— not set —' },
                { value: 'pending_date',     label: 'Waiting for date' },
                { value: 'pending_approval', label: 'Waiting for approval' },
              ]} />
          )}
          {form.status === 'interview' && (
            <div>
              <FieldLabel>INTERVIEW DATE</FieldLabel>
              <input
                type="datetime-local"
                value={form.interviewDate}
                onChange={e => set('interviewDate', e.target.value)}
                style={{
                  width: '100%', background: T.bg0, border: `1px solid ${T.br1}`,
                  color: form.interviewDate ? T.fg0 : T.fg3,
                  fontFamily: 'var(--mono)', fontSize: 11,
                  padding: '6px 9px', outline: 'none', height: 28,
                  colorScheme: 'dark',
                }}
              />
            </div>
          )}
          <SelectField label="TYPE"     value={form.type}     onChange={v => set('type', v as AppType)}
            options={[
              { value: 'stage',      label: 'Stage' },
              { value: 'alternance', label: 'Alternance' },
              { value: 'cdi',        label: 'CDI' },
              { value: 'freelance',  label: 'Freelance' },
            ]} />
          <div>
            <FieldLabel>SENT DATE</FieldLabel>
            <input type="date" value={form.sentAt} onChange={e => set('sentAt', e.target.value)} style={{
              width: '100%', background: T.bg0, border: `1px solid ${T.br1}`,
              color: form.sentAt ? T.fg0 : T.fg3, fontFamily: 'var(--mono)', fontSize: 11,
              padding: '6px 9px', outline: 'none', height: 28,
              colorScheme: 'dark',
            }} />
          </div>
          <SelectField label="PRIORITY" value={form.priority} onChange={v => set('priority', v)}
            options={[
              { value: 1, label: 'P1 · top' }, { value: 2, label: 'P2 · high' },
              { value: 3, label: 'P3 · normal' }, { value: 4, label: 'P4 · low' },
            ]} />
          <Field label="CONTACT"  value={form.contact} onChange={v => set('contact', v)}  full />
          <Field label="LIEN"     value={form.link}    onChange={v => set('link', v)}     placeholder="company.com/jobs/…" full />
          <div style={{ gridColumn: '1 / -1' }}>
            <FieldLabel>NOTES</FieldLabel>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{
              width: '100%', background: T.bg0, border: `1px solid ${T.br1}`,
              color: T.fg0, fontFamily: 'var(--mono)', fontSize: 11,
              padding: 8, outline: 'none', resize: 'vertical',
            }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px', borderTop: `1px solid ${T.br0}`,
          display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
        }}>
          {error
            ? <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.rejected }}>{error}</span>
            : <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>⏎ to save · ESC to cancel</span>
          }
          <span style={{ flex: 1 }} />
          <ToolBtn onClick={onClose}>CANCEL</ToolBtn>
          <button onClick={handleSubmit} disabled={!canSubmit} style={{
            background: canSubmit ? T.accent : T.bg3,
            color: canSubmit ? '#0a0b0d' : T.fg3,
            border: 'none', padding: '5px 14px',
            fontFamily: 'var(--mono)', fontSize: 10.5,
            fontWeight: 700, letterSpacing: '0.08em',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}>{saving ? '…' : isEdit ? 'SAVE' : '+ CREATE'}</button>
        </div>
      </div>
    </div>
  );
}
