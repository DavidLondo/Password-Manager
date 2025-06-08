import { useEffect, useState } from 'react';

function VaultPage() {
  const [passwords, setPasswords] = useState([]);
  const [form, setForm] = useState({ site: '', username: '', password: '' });
  const masterKey = localStorage.getItem('masterKey');

  useEffect(() => {
    if (masterKey) {
      window.electronAPI.getPasswords(masterKey).then(setPasswords);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.site || !form.username || !form.password) return;

    const newEntry = await window.electronAPI.addPassword(form, masterKey);
    setPasswords(prev => [...prev, newEntry]);
    setForm({ site: '', username: '', password: '' });
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
        <button onClick={handleAdd}>Agregar</button>
      </div>

      <ul>
        {passwords.map((p) => (
          <li key={p.id}>
            <strong>{p.site}</strong> - {p.username} - {p.password}
            <button onClick={() => handleDelete(p.id)}>🗑️</button>
            {/* Botón de editar lo añadimos en el siguiente paso */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VaultPage;
