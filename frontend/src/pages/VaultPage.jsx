import { useEffect, useState } from 'react';

function VaultPage() {
  const [passwords, setPasswords] = useState([]);
  const [form, setForm] = useState({ site: '', username: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  
  const masterKey = localStorage.getItem('masterKey');

  useEffect(() => {
    if (masterKey) {
      window.electronAPI.getPasswords(masterKey).then(setPasswords);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.site || !form.username || !form.password) return;

    if (editingId) {
      await window.electronAPI.updatePassword(editingId, form, masterKey);
      setPasswords(prev =>
        prev.map(p => (p.id === editingId ? { ...p, ...form } : p))
      );
      setEditingId(null);
    } else {
      const newEntry = await window.electronAPI.addPassword(form, masterKey);
      setPasswords(prev => [...prev, newEntry]);
    }

    setForm({ site: '', username: '', password: '' });
  };

  const handleEdit = (entry) => {
    setForm({ site: entry.site, username: entry.username, password: entry.password });
    setEditingId(entry.id);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar esta contraseña?');
    if (!confirmed) return;

    await window.electronAPI.deletePassword(id, masterKey);
    setPasswords(prev => prev.filter(p => p.id !== id));
  };

  if (!masterKey) return <p>Acceso denegado. No hay clave maestra cargada.</p>;

  return (
    <div>
      <h1>🔐 Mis Contraseñas</h1>

      <div>
        <input name="site" placeholder="Sitio" value={form.site} onChange={handleChange} />
        <input name="username" placeholder="Usuario" value={form.username} onChange={handleChange} />
        <input name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} />
        <button onClick={handleSave}>{editingId ? 'Guardar cambios' : 'Agregar'}</button>
      </div>

      <ul>
        {passwords.map((p) => (
          <li key={p.id}>
            <strong>{p.site}</strong> - {p.username} - {p.password}
            <button onClick={() => handleDelete(p.id)}>🗑️</button>
            <button onClick={() => handleEdit(p)}>✏️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VaultPage;
