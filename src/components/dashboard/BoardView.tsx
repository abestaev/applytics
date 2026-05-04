import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { T } from '@/tokens';
import { STATUS_META, STATUS_ORDER } from '@/data/mockData';
import { StatusDot, CodeTag } from './Primitives';
import type { Application, StatusType } from '@/types/dashboard';

const COLS = STATUS_ORDER as StatusType[];

// ── Card (draggable) ─────────────────────────────────────────────────────────

function Card({ app, isDragging = false }: { app: Application; isDragging?: boolean }) {
  return (
    <div style={{
      background: T.bg1,
      border: `1px solid ${isDragging ? T.br2 : T.br0}`,
      padding: '9px 11px',
      display: 'flex', flexDirection: 'column', gap: 5,
      opacity: isDragging ? 0.4 : 1,
      boxShadow: isDragging ? `0 0 0 1px ${T.accent}40` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <CodeTag tone="gray">{app.id.slice(-4)}</CodeTag>
        <span style={{ flex: 1 }} />
        <CodeTag tone={app.priority === 1 ? 'accent' : 'gray'}>P{app.priority}</CodeTag>
      </div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 13, color: T.fg0, fontWeight: 500 }}>
        {app.company}
      </div>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{app.role}</div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--mono)', fontSize: 9.5, color: T.fg3, marginTop: 2,
      }}>
        <span>{app.loc}</span>
        <span style={{
          color: app.lastDays > 14 ? T.rejected : app.lastDays > 7 ? T.followup : T.fg3,
        }}>
          {app.lastDays === 0 ? 'now' : `${app.lastDays}d`}
        </span>
      </div>
      {app.status === 'interview' && app.interviewDate && (
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 9.5,
          color: T.interview, marginTop: 4,
          padding: '3px 6px', background: `${T.interview}15`,
          borderRadius: 2,
        }}>
          {new Date(app.interviewDate).toLocaleString('fr-FR', {
            day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
}

function DraggableCard({ app, activeId }: { app: Application; activeId: string | null }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: app.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: transform ? 'grabbing' : 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card app={app} isDragging={activeId === app.id} />
    </div>
  );
}

// ── Column (droppable) ───────────────────────────────────────────────────────

function Column({
  status, apps, activeId, onAdd,
}: {
  status: StatusType;
  apps: Application[];
  activeId: string | null;
  onAdd: (status: StatusType) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const m = STATUS_META[status];

  const dropColor = status === 'rejected' ? T.rejected : T.accent;

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 8,
        background: isOver ? `${dropColor}08` : 'transparent',
        border: isOver ? `1px dashed ${dropColor}50` : '1px dashed transparent',
        borderRadius: 2, transition: 'background 0.12s, border-color 0.12s',
        padding: isOver ? '4px' : '0',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', background: T.bg1,
        border: `1px solid ${T.br0}`,
        borderTop: `2px solid ${m.tone}`,
        flexShrink: 0,
      }}>
        <StatusDot status={status} />
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10.5,
          fontWeight: 600, letterSpacing: '0.1em', color: T.fg0,
        }}>{m.label}</span>
        <span style={{ flex: 1 }} />
        <CodeTag tone="gray">{String(apps.length).padStart(2, '0')}</CodeTag>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {isOver && status === 'rejected' && (
          <div style={{
            padding: '10px', textAlign: 'center',
            fontFamily: 'var(--mono)', fontSize: 10, color: T.rejected,
            letterSpacing: '0.1em',
          }}>DROP TO REJECT</div>
        )}
        {apps.map(a => (
          <DraggableCard key={a.id} app={a} activeId={activeId} />
        ))}
        {status !== 'rejected' && (
          <button onClick={() => onAdd(status)} style={{
            background: 'transparent',
            border: `1px dashed ${T.br1}`,
            padding: '8px', color: T.fg3,
            fontFamily: 'var(--mono)', fontSize: 10,
            letterSpacing: '0.08em', cursor: 'pointer',
          }}>+ ADD</button>
        )}
      </div>
    </div>
  );
}


// ── Board ────────────────────────────────────────────────────────────────────

export function BoardView({ apps: initialApps, onStatusChange, onAdd }: {
  apps: Application[];
  onStatusChange: (id: string, status: StatusType) => Promise<void>;
  onAdd: (status: StatusType) => void;
}) {
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => { setApps(initialApps); }, [initialApps]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeApp = activeId ? apps.find(a => a.id === activeId) : null;

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const targetStatus = over.id as StatusType;
    if (!STATUS_ORDER.includes(targetStatus)) return;
    setApps(prev =>
      prev.map(a => a.id === active.id ? { ...a, status: targetStatus } : a),
    );
    void onStatusChange(String(active.id), targetStatus);
  };


  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{
        flex: 1, minHeight: 0,
        padding: 12, display: 'flex', gap: 10,
        overflow: 'auto', background: T.bg0,
      }}>
        {COLS.map(s => (
          <Column
            key={s}
            status={s}
            apps={apps.filter(a => a.status === s).sort((a, b) => a.priority - b.priority)}
            activeId={activeId}
            onAdd={onAdd}
          />
        ))}

      </div>

      {/* Drag overlay — floating ghost card */}
      <DragOverlay dropAnimation={null}>
        {activeApp && (
          <div style={{
            width: 200,
            boxShadow: `0 16px 40px rgba(0,0,0,.5), 0 0 0 1px ${T.accent}40`,
            cursor: 'grabbing',
          }}>
            <Card app={activeApp} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
