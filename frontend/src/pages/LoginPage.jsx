import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLocked) return;

    try {
      const result = await window.electronAPI.validateMasterKey(password);

      if (result.success) {
        setError("");
        localStorage.setItem("masterKey", password);
        navigate("/vault");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError("Clave maestra incorrecta");
        setPassword("");
        inputRef.current?.focus();

        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockTimeLeft(30); // 30 segundos

          const interval = setInterval(() => {
            setLockTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setIsLocked(false);
                setAttempts(0);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Error al validar clave:", err);
      setError("Error al conectar con el servidor");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>🔐 Gestor de Contraseñas</h1>

        <input
          ref={inputRef}
          className="login-input"
          type="password"
          placeholder="Ingresa tu clave maestra"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />

        <button type="submit" className="login-button" disabled={isLocked}>
          {isLocked ? `Bloqueado (${lockTimeLeft}s)` : "Acceder al Vault"}
        </button>

        {error && <p className="login-error">{error}</p>}
      </form>

      <div className="login-credits">
        <p>
          Creado por{" "}
          <a
            href="https://github.com/DavidLondo"
            target="_blank"
            rel="noopener noreferrer"
          >
            DavidLondo
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
