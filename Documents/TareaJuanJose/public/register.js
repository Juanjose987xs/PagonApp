document.addEventListener('DOMContentLoaded', () => {
  // Asignar el evento de redirección al botón "Aceptar" del popup
  const popupBtn = document.getElementById('errorPopupBtn');
  popupBtn.addEventListener('click', () => {
    window.location.href = '/login';
  });

  // Referencias para el campo "Nombre Completo"
  const nombreInput = document.getElementById('nombre');
  const nombreError = document.getElementById('nombreError');
  const inputContainer = nombreInput.parentElement; // Contenedor con clase "input-container"

  // Mostrar tooltip cuando se hace focus si el campo está vacío
  nombreInput.addEventListener('focus', () => {
    if (nombreInput.value.trim() === '') {
      inputContainer.classList.add('show-tooltip');
    }
  });

  // Ocultar tooltip al escribir
  nombreInput.addEventListener('input', () => {
    if (nombreInput.value.trim() !== '') {
      inputContainer.classList.remove('show-tooltip');
    } else {
      inputContainer.classList.add('show-tooltip');
    }
  });

  // Ocultar tooltip al perder focus
  nombreInput.addEventListener('blur', () => {
    inputContainer.classList.remove('show-tooltip');
  });

  // Envío y validación del formulario
  document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Ocultar mensajes de error para otros campos
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.style.display = 'none');

    let valid = true;

    // Validar campo Nombre
    if (nombreInput.value.trim() === '') {
      inputContainer.classList.add('show-tooltip');
      valid = false;
    }

    // Validar Correo Electrónico
    const correo = document.getElementById('correo');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.value.trim())) {
      correo.nextElementSibling.style.display = 'block';
      valid = false;
    }

    // Validar Contraseña (mínimo 6 caracteres)
    const password = document.getElementById('password');
    if (password.value.length < 6) {
      password.nextElementSibling.style.display = 'block';
      valid = false;
    }

    if (valid) {
      const data = {
        nombre: nombreInput.value.trim(),
        correo: correo.value.trim(),
        password: password.value
      };

      fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json();
        } else {
          return response.text().then(text => { throw new Error(text) });
        }
      })
      .then(result => {
        if (result.success) {
          alert("Registro exitoso. Tu usuario fue creado con ID: " + result.userId);
          document.getElementById('registerForm').reset();
        } else {
          if (result.error === "Este correo ya está registrado. Intenta iniciar sesión.") {
            mostrarPopup(result.error);
          } else {
            alert("Error: " + result.error);
          }
        }
      })
      .catch(error => {
        console.error("Error en la petición:", error);
        alert("Error en el registro: " + error.message);
      });
    }
  });

  // Función para mostrar el popup de error
  function mostrarPopup(mensaje) {
    const popup = document.getElementById('errorPopup');
    const popupMessage = document.getElementById('errorPopupMessage');
    popupMessage.textContent = mensaje;
    popup.style.display = 'flex'; // Muestra el popup
  }
});

function redirectToLogin() {
  console.log("Redirigiendo a /login");
  window.location.href = '/login';
}
