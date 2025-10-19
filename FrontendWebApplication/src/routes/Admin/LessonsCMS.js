import React, { useEffect, useState } from 'react';
import { createLesson, listLessons, updateLesson } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

// PUBLIC_INTERFACE
export default function LessonsCMS() {
  /** Admin CMS to manage lessons. */
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ title: '', difficulty: 'Beginner' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listLessons();
      setLessons(Array.isArray(list) ? list : []);
    } catch {
      showToast('Failed to load lessons.', 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createLesson(form);
      setLessons((prev) => [created, ...prev]);
      setForm({ title: '', difficulty: 'Beginner' });
      showToast('Lesson created.', 'success', 2000);
    } catch {
      showToast('Unable to create lesson.', 'error', 4000);
    } finally {
      setSaving(false);
    }
  };

  const onQuickRename = async (lessonId) => {
    const newTitle = prompt('New lesson title?');
    if (!newTitle) return;
    try {
      const updated = await updateLesson(lessonId, { title: newTitle });
      setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, ...updated } : l)));
      showToast('Lesson updated.', 'success', 2000);
    } catch {
      showToast('Update failed.', 'error', 4000);
    }
  };

  return (
    <div className="page" aria-labelledby="admin-lessons-title">
      <h1 id="admin-lessons-title">Lessons CMS</h1>

      <form onSubmit={onCreate} aria-label="Create new lesson" style={{ marginBottom: 16 }}>
        <fieldset disabled={saving} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <legend className="sr-only">Create new lesson</legend>
          <label>
            <span className="sr-only">Title</span>
            <input
              required
              placeholder="Lesson title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label>
            <span className="sr-only">Difficulty</span>
            <select
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <button className="btn" type="submit">{saving ? 'Creating...' : 'Create'}</button>
        </fieldset>
      </form>

      {loading && <p role="status">Loading lessons...</p>}
      {!loading && lessons.length === 0 && <p>No lessons found.</p>}
      {!loading && lessons.length > 0 && (
        <div className="responsive-table" role="region" aria-label="Lessons table">
          <table>
            <caption className="sr-only">Lessons list</caption>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Difficulty</th>
                <th scope="col">Updated</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l) => (
                <tr key={l.id}>
                  <td>{l.title}</td>
                  <td>{l.difficulty}</td>
                  <td>{l.updatedAt || '-'}</td>
                  <td>
                    <button className="btn small" onClick={() => onQuickRename(l.id)}>Rename</button>
                    <button className="btn small" disabled style={{ marginLeft: 8 }} title="More actions coming soon">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
