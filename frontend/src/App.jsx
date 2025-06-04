import { useState } from 'react';
import Login from './pages/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [masterKey, setMasterKey] = useState('');
  
  const handleLogin = async (key) => {
    const result = await window.electronAPI.validateMasterKey(key);

    if (result.success) {
      alert(result.message);
      setMasterKey(key);
      setIsLoggedIn(true);
    } else {
      alert('Clave incorrecta.');
    }
  };


  return (
    <>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="p-6">Bienvenido, clave: {masterKey}</div>
      )}
    </>
  );
}

export default App;
