import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../api/notesApi';
import { useAuth } from './AuthContext';

const NotesContext = createContext(null);
export const useNotes = () => useContext(NotesContext);

export function NotesProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Login zala ki tya user che notes load kar; logout zala ki sagla clear kar
  useEffect(() => {
    if (!userId) {
      setNotes([]);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [userId, refresh]);

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
