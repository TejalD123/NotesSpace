import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../api/notesApi';

const NotesContext = createContext(null);
export const useNotes = () => useContext(NotesContext);

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await api.getNotes();
      setNotes(data);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = useCallback(async (id) => {
    await api.deleteNote(id);
    setNotes((list) => list.filter((n) => n._id !== id));
  }, []);

  return (
    <NotesContext.Provider value={{ notes, loading, error, online: !error, refresh, remove }}>
      {children}
    </NotesContext.Provider>
  );
}
