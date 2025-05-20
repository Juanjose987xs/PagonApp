document.addEventListener("DOMContentLoaded", () => {
    const saldoElement = document.getElementById("saldo");
    const historialElement = document.getElementById("historial");
    const recargarBtn = document.getElementById("recargar-btn");
    const pagoForm = document.getElementById("pago-form");
  
    // Inicialización de variables
    let saldo = 100.00;
    let historial = [];
  
    // Función para actualizar el saldo mostrado
    function actualizarSaldo() {
      saldoElement.textContent = `$${saldo.toFixed(2)}`;
    }
  
    // Función para agregar una transacción al historial
    function agregarTransaccion(tipo, monto) {
      const transaccion = { tipo, monto, fecha: new Date().toLocaleString() };
      historial.push(transaccion);
      renderHistorial();
    }
  
    // Función para renderizar el historial de transacciones
    function renderHistorial() {
      historialElement.innerHTML = "";
      historial.forEach((trans) => {
        const li = document.createElement("li");
        li.textContent = `[${trans.fecha}] ${trans.tipo}: $${trans.monto.toFixed(2)}`;
        historialElement.appendChild(li);
      });
    }
  
    // Evento para recargar saldo
    recargarBtn.addEventListener("click", () => {
      const montoRecarga = prompt("Ingrese el monto a recargar:");
      const monto = parseFloat(montoRecarga);
      if (!isNaN(monto) && monto > 0) {
        saldo += monto;
        actualizarSaldo();
        agregarTransaccion("Recarga", monto);
      } else {
        alert("Ingrese un monto válido.");
      }
    });
  
    // Evento para realizar el pago
    pagoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const montoInput = document.getElementById("monto");
      const monto = parseFloat(montoInput.value);
      if (!isNaN(monto) && monto > 0) {
        if (saldo >= monto) {
          saldo -= monto;
          actualizarSaldo();
          agregarTransaccion("Pago", monto);
          montoInput.value = "";
        } else {
          alert("Saldo insuficiente para realizar el pago.");
        }
      } else {
        alert("Ingrese un monto válido.");
      }
    });
  
    // Inicialización inicial
    actualizarSaldo();
  });
  