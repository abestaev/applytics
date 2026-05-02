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

const COLS = STATUS_ORDER.filter(s => s !== 'rejected') as StatusType[];

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

  return (
    <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
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

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          minHeight: 80,
          padding: isOver ? '4px' : '0',
          background: isOver ? `${T.accent}0d` : 'transparent',
          border: isOver ? `1px dashed ${T.accent}60` : '1px dashed transparent',
          borderRadius: 2,
          transition: 'all 0.12s ease',
        }}
      >
        {apps.map(a => (
          <DraggableCard key={a.id} app={a} activeId={activeId} />
        ))}
        <button onClick={() => onAdd(status)} style={{
          background: 'transparent',
          border: `1px dashed ${T.br1}`,
          padding: '8px', color: T.fg3,
          fontFamily: 'var(--mono)', fontSize: 10,
          letterSpacing: '0.08em', cursor: 'pointer',
          marginTop: apps.length ? 0 : 0,
        }}>+ ADD</button>
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

        {/* Rejected — collapsed */}
        <div style={{ width: 80, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            padding: '10px 8px', background: T.bg1,
            border: `1px solid ${T.br0}`,
            borderTop: `2px solid ${T.rejected}`,
          }}>
            <StatusDot status="rejected" />
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9.5,
              fontWeight: 600, letterSpacing: '0.1em', color: T.fg3,
              writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            }}>REJECTED</span>
            <CodeTag tone="gray">{String(apps.filter(a => a.status === 'rejected').length).padStart(2, '0')}</CodeTag>
          </div>
        </div>
      </div>

      {/* Drag overlay — floating ghost card */}
      <DragOverlay dropAnimation={null}>
        {activeApp && (
          <div style={{
            width: 240,
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
