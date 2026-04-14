import { useState, useEffect } from 'react';

interface Session {
  _id: string;
  course: string;
  duration: string;
  note: string;
  createdAt: Date;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState('');
  const [course, setCourse] = useState('');
  const [duration, setDuration] = useState('');
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
    setDuration('');
    setNote('');
    setEditing(false);
    setEditId(null);
  }

  function formIsValid(): boolean {
    if (!course.trim() || !duration.trim() || !note.trim()) {
      setError('Please fill in course, duration, and note.');
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
        body: JSON.stringify({ course, duration, note }),
      });
      await refreshSessions();
      clearForm();
    } catch (err) {
      setError('Could not add session.');
      console.error('createSession error:', err);
    }
  }

  function startEdit(session: Session) {
    setCourse(session.course);
    setDuration(session.duration);
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
        body: JSON.stringify({ course, duration, note }),
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
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (ex. 2 hours)"
        />
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
