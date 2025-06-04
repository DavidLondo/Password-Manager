import { useState } from 'react';
import '../styles/Login.css'; // importa tu nuevo CSS

export default function Login({ onLogin }) {
  const [masterKey, setMasterKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!masterKey) return alert('Por favor ingresa una clave');
    onLogin(masterKey);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Gestor de Contraseñas</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Clave maestra"
            value={masterKey}
            onChange={(e) => setMasterKey(e.target.value)}
          />
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}
