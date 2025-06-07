import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/LoginPage.css";

function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await window.electronAPI.validateMasterKey(password);

      if (result.success) {
        setError('');
        localStorage.setItem('masterKey', password);
        navigate('/vault');
      } else {
        setError('Clave incorrecta');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch (err) {
      console.error("Error al validar clave:", err);
      setError("Error interno");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="login-container">
      <form className="form" onSubmit={handleLogin}>
        <h1>🔐 Gestor de Contraseñas</h1>

        <input
          ref={inputRef}
          type="password"
          placeholder="Clave maestra"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />

        <button type="submit">Entrar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );

}

export default LoginPage;
