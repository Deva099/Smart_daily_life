import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle2, Save, Loader2, Plus, Trash2 } from 'lucide-react';

const NotesView = () => {
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/notes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setSavedNotes(data);
        if (!activeNote) {
          setActiveNote(data[0]._id);
          setNoteTitle(data[0].title);
          setNoteContent(data[0].content);
        }
      }
    } catch (err) { console.error(err); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchNotes(); }, []);

  const handleNew = () => {
    setActiveNote(null);
    setNoteTitle('Untitled Note');
    setNoteContent('');
    setSummaryData(null);
  };

  const handleSelectNote = (note) => {
    setActiveNote(note._id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSummaryData(null);
  };

  const handleSave = async () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5001/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: noteTitle || 'Untitled Note', content: noteContent, tags: ['General'] })
      });
      await fetchNotes();
    } catch (err) { console.error(err); }
    setIsSaving(false);
  };

  const handleSummarize = async () => {
    if (!noteContent) return;
    setIsSummarizing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/ai/note-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: noteContent })
      });
      const data = await res.json();
      if (res.ok) setSummaryData(data);
    } catch (err) { console.error(err); }
    setIsSummarizing(false);
  };

  return (
    <div className="view-section" style={{ display: 'flex', gap: '0', flexDirection: 'column', height: '100%' }}>
      <div className="header-row" style={{ marginBottom: '1.5rem' }}>
        <h2>Smart Notes</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={handleNew}>
            <Plus size={18} /> New Note
          </button>
          <button className="btn-secondary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />} Save
          </button>
          <button className="btn-primary" onClick={handleSummarize} disabled={isSummarizing || !noteContent}>
            {isSummarizing ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />} AI Summarize
          </button>
        </div>
      </div>

      <div className="split-view" style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>

        {/* Note List Sidebar */}
        <div className="glass-panel split-sidebar" style={{ width: '230px', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.5rem', overflowY: 'auto' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, margin: '0 0 0.5rem 0.25rem' }}>
            {savedNotes.length} Note{savedNotes.length !== 1 ? 's' : ''}
          </p>
          {savedNotes.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No notes yet. Write your first one!</p>
          )}
          {savedNotes.map(note => (
            <button
              key={note._id}
              onClick={() => handleSelectNote(note)}
              style={{
                background: activeNote === note._id ? 'rgba(168,85,247,0.15)' : 'transparent',
                border: activeNote === note._id ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                fontFamily: 'inherit'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <FileText size={14} color={activeNote === note._id ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                <span style={{ color: activeNote === note._id ? 'white' : 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.title || 'Untitled'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                {note.content?.substring(0, 50) || 'Empty note'}...
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', margin: '0.5rem 0 0', opacity: 0.6 }}>
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="glass-panel split-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={18} color="var(--text-secondary)" />
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title..."
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', fontWeight: 600, outline: 'none', flex: 1, fontFamily: 'inherit' }}
            />
          </div>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Start writing your thoughts, meeting notes, or ideas here..."
            style={{ flex: 1, background: 'transparent', border: 'none', padding: '1.5rem', color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.7, resize: 'none', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {/* AI Output Panel */}
        {summaryData && (
          <div className="glass-panel" style={{ width: '320px', flexShrink: 0, padding: '2rem', background: 'rgba(26,28,41,0.6)', overflowY: 'auto', animation: 'fadeUp 0.4s ease-out' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
              <Sparkles size={18} /> AI Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Summary</h4>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{summaryData.answer || summaryData.text || summaryData.message}</p>
              </div>
              {summaryData.insights?.length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Key Points</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
                    {summaryData.insights.map((pt, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        <div style={{ marginTop: '7px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-secondary)', flexShrink: 0 }} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {summaryData.actions?.length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Action Items</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {summaryData.actions.map((act, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                        <CheckCircle2 size={16} color="var(--accent-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: 'white', fontSize: '0.9rem', lineHeight: 1.4 }}>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
};

export default NotesView;
