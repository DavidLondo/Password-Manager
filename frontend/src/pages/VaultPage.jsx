function VaultPage() {
  const masterKey = localStorage.getItem('masterKey');

  if (!masterKey) {
    return <p>Acceso denegado. No hay clave maestra cargada.</p>;
  }

  return (
    <div>
      <h1>Mis Contraseñas</h1>
      <p>Aquí irán las contraseñas cifradas</p>
      {/* En el próximo paso cargamos el archivo y desencriptamos */}
    </div>
  );
}

export default VaultPage;
