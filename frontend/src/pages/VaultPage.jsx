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

  const handleSave = () => {
    if (!form.site || !form.username || !form.password) return;

    if (editingId) {
      const updated = passwords.map(p =>
        p.id === editingId ? { ...p, ...form } : p
      );
      setPasswords(updated);
      setEditingId(null);
    } else {
      const newEntry = { ...form, id: crypto.randomUUID() };
      window.electronAPI.addPassword(masterKey, newEntry);
      setPasswords([...passwords, newEntry]);
    }

    setForm({ site: '', username: '', password: '' });
  };

  const handleEdit = (password) => {
    setForm({
      site: password.site,
      username: password.username,
      password: password.password
    });
    setEditingId(password.id);
  };

  const handleDelete = async (id) => {
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
        <button onClick={handleSave}>
          {editingId ? 'Guardar cambios' : 'Agregar'}
        </button>
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
