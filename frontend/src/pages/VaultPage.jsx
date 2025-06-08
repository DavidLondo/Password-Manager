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
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const masterKey = localStorage.getItem("masterKey");
  const navigate = useNavigate();

  useEffect(() => {
    if (masterKey) {
      window.electronAPI.getPasswords(masterKey).then(setPasswords);
    }
  }, []);

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    if (!visiblePasswords[id]) {
      setTimeout(() => {
        setVisiblePasswords(prev => ({
          ...prev,
          [id]: false
        }));
      }, 10000);
    }
  };

  useEffect(() => {
      const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 5 minutos
      let logoutTimer;
      let warningTimer;

      const showWarningNotification = () => {
        if (window.electronAPI?.showNotification) {
          window.electronAPI.showNotification(
            "Inactividad detectada",
            "La sesión se cerrará en 30 segundos por inactividad"
          );
        } else {
          // Fallback para navegador
          new Notification("Inactividad detectada", {
            body: "La sesión se cerrará en 30 segundos por inactividad",
            silent: false
          });
        }
      };

      const logout = () => {
        localStorage.removeItem("masterKey");
        navigate("/");
        
        if (window.electronAPI?.showNotification) {
          window.electronAPI.showNotification(
            "Sesión cerrada",
            "Se ha cerrado la sesión por inactividad"
          );
        }
      };

      const resetTimers = () => {
        clearTimeout(logoutTimer);
        clearTimeout(warningTimer);
        
        // Mostrar advertencia 30 segundos antes
        warningTimer = setTimeout(showWarningNotification, INACTIVITY_TIMEOUT - 30000);
        
        // Cerrar sesión después del tiempo completo
        logoutTimer = setTimeout(logout, INACTIVITY_TIMEOUT);
      };

      // Eventos que reinician el temporizador
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, resetTimers);
      });

      resetTimers(); // Iniciar el temporizador

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, resetTimers);
        });
        clearTimeout(logoutTimer);
        clearTimeout(warningTimer);
      };
  }, [navigate]);

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
    setForm((prev) => ({ ...prev, password: generated }));
  };

  const handleCopyPassword = async (password) => {
    try {
      await navigator.clipboard.writeText(password);
      new Notification("Contraseña copiada", { 
        body: "Se ha copiado al portapapeles", 
        silent: true 
      });
      
      if (window.electronAPI?.clearClipboard) {
        setTimeout(() => {
          window.electronAPI.clearClipboard();
          console.log('Portapapeles limpiado');
        }, 15000);
      }
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  };

  if (!masterKey) return <p>Acceso denegado. No hay clave maestra cargada.</p>;

  return (
    <div className="vault-app">
      <div className="vault-sidebar">
        <h2 className="sidebar-title">🔐 Gestor</h2>
        <button className="sidebar-button" onClick={handleLogout}>
          🔓 Cerrar sesión
        </button>
        <button className="sidebar-button" onClick={handleGeneratePassword}>
          ⚙️ Generar Contraseña
        </button>
        <div className="sidebar-footer">
          <p>Creado por DavidLondo</p>
          <a 
            href="https://github.com/DavidLondo" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Ver en GitHub
          </a>
        </div>
      </div>

      <div className="vault-main">
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
              type="text"
              value={form.password}
              onChange={handleChange}
            />
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
                    type="text"
                    value={editingForm.password}
                    onChange={handleEditChange}
                  />
                  <div className="vault-edit-actions">
                    <button
                      className="vault-action-button vault-save-button"
                      onClick={handleSaveEdit}
                    >
                      💾 Guardar
                    </button>
                    <button
                      className="vault-action-button vault-cancel-button"
                      onClick={cancelEdit}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="vault-item-content">
                    <strong className="vault-item-site">{p.site}</strong>
                    <span className="vault-item-username">{p.username}</span>
                    <div className="vault-item-password">
                      {visiblePasswords[p.id] ? p.password : "••••••••"}
                      <button
                        className="vault-view-button"
                        onClick={() => togglePasswordVisibility(p.id)}
                        title={visiblePasswords[p.id] ? "Ocultar" : "Mostrar por 10 segundos"}
                      >
                        {visiblePasswords[p.id] ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                  <div className="vault-item-actions">
                    <button
                      className="vault-action-button vault-copy-button"
                      onClick={() => handleCopyPassword(p.password)}
                      title="Copiar contraseña"
                    >
                      📋
                    </button>
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
    </div>
  );
}

export default VaultPage;