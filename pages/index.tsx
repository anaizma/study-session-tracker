import { useState, useEffect } from 'react';
import { WheelPicker, WheelPickerWrapper } from '@/components/wheel-picker';
import type { WheelPickerOption } from '@/components/wheel-picker';

interface Session {
  _id: string;
  course: string;
  duration: string;
  note: string;
  createdAt: Date;
}

const createOptions = (length: number, start = 0): WheelPickerOption<number>[] =>
  Array.from({ length }, (_, i) => {
    const v = i + start;
    return { label: v.toString().padStart(2, '0'), value: v };
  });

const HOUR_OPTIONS = createOptions(13); // 00–12
const MINUTE_OPTIONS = createOptions(60); // 00–59

function formatDuration(h: number, m: number): string {
  if (h === 0 && m === 0) return '';
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function parseDuration(str: string): { hours: number; minutes: number } {
  const hm = str.match(/(\d+)h(?:\s*(\d+)m)?/);
  if (hm) return { hours: parseInt(hm[1]), minutes: parseInt(hm[2] ?? '0') };
  const mOnly = str.match(/^(\d+)m$/);
  if (mOnly) return { hours: 0, minutes: parseInt(mOnly[1]) };
  const hoursWord = str.match(/(\d+(?:\.\d+)?)\s*hour/);
  if (hoursWord) {
    const total = parseFloat(hoursWord[1]);
    return { hours: Math.floor(total), minutes: Math.round((total % 1) * 60) };
  }
  return { hours: 0, minutes: 0 };
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState('');
  const [course, setCourse] = useState('');
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    refreshSessions();
  }, []);

  async function refreshSessions() {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data.map((s: Session) => ({ ...s, createdAt: new Date(s.createdAt) })));
      setError('');
    } catch (err) {
      setError('Could not load sessions.');
      console.error('refreshSessions error:', err);
    }
  }

  function clearForm() {
    setCourse('');
    setDurationHours(0);
    setDurationMinutes(0);
    setNote('');
    setEditing(false);
    setEditId(null);
  }

  function formIsValid(): boolean {
    if (!course.trim() || !note.trim()) {
      setError('Please fill in course and note.');
      return false;
    }
    if (durationHours === 0 && durationMinutes === 0) {
      setError('Please select a duration.');
      return false;
    }
    setError('');
    return true;
  }

  async function createSession() {
    if (!formIsValid()) return;
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course,
          duration: formatDuration(durationHours, durationMinutes),
          note,
        }),
      });
      await refreshSessions();
      clearForm();
    } catch (err) {
      setError('Could not add session.');
      console.error('createSession error:', err);
    }
  }

  function startEdit(session: Session) {
    const { hours, minutes } = parseDuration(session.duration);
    setCourse(session.course);
    setDurationHours(hours);
    setDurationMinutes(minutes);
    setNote(session.note);
    setEditing(true);
    setEditId(session._id);
    setError('');
  }

  async function updateSession() {
    if (!formIsValid() || !editId) return;
    try {
      await fetch(`/api/sessions/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course,
          duration: formatDuration(durationHours, durationMinutes),
          note,
        }),
      });
      await refreshSessions();
      clearForm();
    } catch (err) {
      setError('Could not update session.');
      console.error('updateSession error:', err);
    }
  }

  async function deleteSession(id: string) {
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      await refreshSessions();
      setError('');
    } catch (err) {
      setError('Could not delete session.');
      console.error('deleteSession error:', err);
    }
  }

  return (
    <div className="container">
      <h1>Study Session Tracker</h1>

      <div className="form">
        <input
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="Course (ex. STAT 312)"
        />

        <div className="duration-picker">
          <span className="duration-label">Duration</span>
          <WheelPickerWrapper>
            <WheelPicker
              options={HOUR_OPTIONS}
              value={durationHours}
              onChange={(v: number) => setDurationHours(v)}
              infinite
            />
            <span className="wheel-sep">h</span>
            <WheelPicker
              options={MINUTE_OPTIONS}
              value={durationMinutes}
              onChange={(v: number) => setDurationMinutes(v)}
              infinite
            />
            <span className="wheel-sep">m</span>
          </WheelPickerWrapper>
          {(durationHours > 0 || durationMinutes > 0) && (
            <span className="duration-preview">
              {formatDuration(durationHours, durationMinutes)}
            </span>
          )}
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you study?"
        />

        {!editing ? (
          <button onClick={createSession}>Add Session</button>
        ) : (
          <button onClick={updateSession}>Save Changes</button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <div className="sessions">
        {sessions.map((session) => (
          <div className="session-card" key={session._id}>
            <p className="date">{formatDate(session.createdAt)}</p>
            <h3>{session.course}</h3>
            <p><strong>Duration:</strong> {session.duration}</p>
            <p><strong>Note:</strong> {session.note}</p>
            <div className="actions">
              <button onClick={() => startEdit(session)}>Edit</button>
              <button onClick={() => deleteSession(session._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
