import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/VaultPage.css";

function VaultPage() {
  const [passwords, setPasswords] = useState([]);
  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordToDelete, setPasswordToDelete] = useState(null);
  const masterKey = localStorage.getItem("masterKey");
  const navigate = useNavigate();

  useEffect(() => {
    if (masterKey) {
      window.electronAPI.getPasswords(masterKey).then(setPasswords);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditingForm({ ...editingForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.site || !form.username || !form.password) return;

    const newEntry = await window.electronAPI.addPassword(form, masterKey);
    setPasswords((prev) => [...prev, newEntry]);
    setForm({ site: "", username: "", password: "" });
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditingForm({
      site: entry.site,
      username: entry.username,
      password: entry.password,
      id: entry.id,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingForm.site || !editingForm.username || !editingForm.password)
      return;

    await window.electronAPI.updatePassword(
      editingForm.id,
      editingForm,
      masterKey
    );
    setPasswords((prev) =>
      prev.map((p) => (p.id === editingForm.id ? { ...editingForm } : p))
    );
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingForm(null);
  };

  const confirmDelete = (id) => {
    setPasswordToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    await window.electronAPI.deletePassword(passwordToDelete, masterKey);
    setPasswords((prev) => prev.filter((p) => p.id !== passwordToDelete));
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPasswordToDelete(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("masterKey");
    navigate("/");
  };

  const handleGeneratePassword = async () => {
    const generated = await window.electronAPI.generatePassword(16);
    setForm(prev => ({ ...prev, password: generated }));
  };

  if (!masterKey) return <p>Acceso denegado. No hay clave maestra cargada.</p>;

  return (
    <div className="vault-container">
      <button className="vault-logout-button" onClick={handleLogout}>
        🔓 Cerrar sesión
      </button>

      <h1 className="vault-title">🔐 Mis Contraseñas</h1>

      <div className="vault-form">
        <input
          className="vault-input"
          name="site"
          placeholder="Sitio"
          value={form.site}
          onChange={handleChange}
        />
        <input
          className="vault-input"
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
        />
        <div className="vault-input-group">
          <input
            className="vault-input"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="vault-generate-button"
            onClick={handleGeneratePassword}
            title="Generar contraseña segura"
          >
            ⚙️
          </button>
        </div>
        <button className="vault-button" onClick={handleSave}>
          Agregar
        </button>
      </div>

      <ul className="vault-list">
        {passwords.map((p) => (
          <li className="vault-item" key={p.id}>
            {editingId === p.id ? (
              <div className="vault-edit-form">
                <input
                  className="vault-input vault-edit-input"
                  name="site"
                  value={editingForm.site}
                  onChange={handleEditChange}
                />
                <input
                  className="vault-input vault-edit-input"
                  name="username"
                  value={editingForm.username}
                  onChange={handleEditChange}
                />
                <input
                  className="vault-input vault-edit-input"
                  name="password"
                  value={editingForm.password}
                  onChange={handleEditChange}
                />
                <div className="vault-edit-actions">
                  <button
                    className="vault-action-button vault-save-button"
                    onClick={handleSaveEdit}
                  >
                    💾
                  </button>
                  <button
                    className="vault-action-button vault-cancel-button"
                    onClick={cancelEdit}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <strong className="vault-item-site">{p.site}</strong> -{" "}
                  {p.username} - {p.password}
                </div>
                <div className="vault-item-actions">
                  <button
                    className="vault-action-button vault-edit-button"
                    onClick={() => handleEdit(p)}
                  >
                    ✏️
                  </button>
                  <button
                    className="vault-action-button vault-delete-button"
                    onClick={() => confirmDelete(p.id)}
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {showDeleteModal && (
        <div className="vault-modal-overlay">
          <div className="vault-modal">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar esta contraseña?</p>
            <p className="vault-modal-warning">
              ⚠️ Esta acción no se puede deshacer
            </p>
            <div className="vault-modal-actions">
              <button
                className="vault-modal-button vault-modal-cancel"
                onClick={cancelDelete}
              >
                Cancelar
              </button>
              <button
                className="vault-modal-button vault-modal-confirm"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VaultPage;
