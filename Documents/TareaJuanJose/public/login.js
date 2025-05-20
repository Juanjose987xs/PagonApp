document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Obtener valores de los campos
  const correo = document.getElementById('correo').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validar que no estén vacíos
  if (!correo || !password) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  // Enviar datos al servidor mediante fetch
  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password })
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text) });
    }
    return response.json();
  })
  .then(result => {
    if (result.success) {
      // Redirigir al menú en caso de éxito
      window.location.href = '/menu';
    } else {
      alert(result.error);
    }
  })
  .catch(error => {
    console.error("Error en la petición:", error);
    alert("Error en el inicio de sesión: " + error.message);
  });
});
