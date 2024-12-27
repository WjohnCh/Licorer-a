const detallesContainer = document.getElementById('detallesContainer');
const addDetalleButton = document.getElementById('addDetalle');
const activosContainer = document.getElementById('activosContainer');
const addActivoButton = document.getElementById('addActivo');
const clienteSelect = document.getElementById('idcliente');
const fechaVentaInput = document.getElementById('FechaDeVenta');
const hoy = new Date().toISOString().split('T')[0];
fechaVentaInput.value = hoy;

// Cargar clientes en la lista desplegable
async function loadClientes() {
  try {
    const response = await fetch('/clientes');
    const clientes = await response.json();

    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.idcliente;
      option.textContent = cliente.nombre;
      clienteSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar los clientes:', error);
    alert('No se pudo cargar la lista de clientes');
  }
}

// Añadir un nuevo detalle
addDetalleButton.addEventListener('click', () => {
  const detalleDiv = document.createElement('div');
  detalleDiv.className = 'space-y-2 p-2 border rounded';
  detalleDiv.innerHTML = `
  <label>Buscar Producto</label>
  <input type="text" class="w-full p-2 border rounded buscar-producto" placeholder="Ingrese el nombre del producto">
  <button type="button" class="bg-blue-500 text-white px-4 py-2 rounded mt-2 buscar-producto-button">Buscar</button>

  <label>Seleccionar Producto</label>
  <select class="w-full p-2 border rounded lista-productos">
    <option value="">Seleccione un producto</option>
  </select>

  <label>Buscar Promoción</label>
  <input type="text" class="w-full p-2 border rounded buscar-promocion" placeholder="Ingrese el nombre de la promoción">
  <button type="button" class="bg-green-500 text-white px-4 py-2 rounded mt-2 buscar-promocion-button">Buscar</button>

  <label>Seleccionar Promoción</label>
  <select class="w-full p-2 border rounded lista-promociones">
    <option value="">Seleccione una promoción</option>
  </select>
  
  <!-- Campo oculto para el ID de la promoción -->
  <input type="hidden" class="detalle-idpromocion">

  <label>Cantidad</label>
  <input type="number" class="w-full p-2 border rounded detalle-cantidad" required>

  <label>Precio Unitario</label>
  <input type="number" class="w-full p-2 border rounded detalle-precio" step="0.01" readonly>
`;
  detallesContainer.appendChild(detalleDiv);

  // Buscar productos
  detalleDiv.querySelector('.buscar-producto-button').addEventListener('click', async () => {
    const buscarProductoInput = detalleDiv.querySelector('.buscar-producto');
    const listaProductos = detalleDiv.querySelector('.lista-productos');
    const precioInput = detalleDiv.querySelector('.detalle-precio');

    const nombre = buscarProductoInput.value;
    if (!nombre) {
      alert('Ingrese un nombre para buscar');
      return;
    }

    try {
      const response = await fetch(`/Buscar/Productos/${nombre}`);
      const productos = await response.json();

      listaProductos.innerHTML = '<option value="">Seleccione un producto</option>';
      productos.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.idProducto;
        option.textContent = `${producto.Nombre} - $${producto.PrecioActual}`;
        option.dataset.precio = producto.PrecioActual;
        listaProductos.appendChild(option);
      });

      listaProductos.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        precioInput.value = selectedOption.dataset.precio || '';
        detalleDiv.querySelector('.lista-promociones').value = ''; // Limpiar selección de promoción
      });
    } catch (error) {
      console.error('Error al buscar productos:', error);
      alert('No se pudo buscar los productos');
    }
  });

  // Buscar promociones
  detalleDiv.querySelector('.buscar-promocion-button').addEventListener('click', async () => {
    const buscarPromocionInput = detalleDiv.querySelector('.buscar-promocion');
    const listaPromociones = detalleDiv.querySelector('.lista-promociones');
    const precioInput = detalleDiv.querySelector('.detalle-precio');

    const nombre = buscarPromocionInput.value;
    if (!nombre) {
      alert('Ingrese un nombre para buscar');
      return;
    }

    try {
      const response = await fetch(`/Buscar/Promociones/${nombre}`);
      const promociones = await response.json();

      listaPromociones.innerHTML = '<option value="">Seleccione una promoción</option>';
      promociones.forEach(promocion => {
        const option = document.createElement('option');
        option.value = promocion.IdPromocion;
        option.textContent = `${promocion.Nombre} - $${promocion.Precio}`;
        option.dataset.precio = promocion.Precio;
        listaPromociones.appendChild(option);
      });

      listaPromociones.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        precioInput.value = selectedOption.dataset.precio || '';
        detalleDiv.querySelector('.detalle-idpromocion').value = selectedOption.value; // Guarda el ID de la promoción
        detalleDiv.querySelector('.lista-productos').value = ''; // Limpiar selección de producto
      });
      
    } catch (error) {
      console.error('Error al buscar promociones:', error);
      alert('No se pudo buscar las promociones');
    }
  });
});

// Añadir un nuevo activo
addActivoButton.addEventListener('click', () => {
  const activoDiv = document.createElement('div');
  activoDiv.className = 'space-y-2 p-2 border rounded';
  activoDiv.innerHTML = `
    <label>Buscar Activo</label>
    <input type="text" class="w-full p-2 border rounded buscar-activo" placeholder="Ingrese el nombre del activo">
    <button type="button" class="bg-blue-500 text-white px-4 py-2 rounded mt-2 buscar-activo-button">Buscar</button>

    <label>Seleccionar Activo</label>
    <select class="w-full p-2 border rounded lista-activos">
      <option value="">Seleccione un activo</option>
    </select>

    <label>Cantidad Prestada</label>
    <input type="number" class="w-full p-2 border rounded activo-cantidad" required>

    <label>Estado</label>
    <input type="text" class="w-full p-2 border rounded activo-estado" value="Pendiente">
  `;
  activosContainer.appendChild(activoDiv);

  // Buscar activos
  activoDiv.querySelector('.buscar-activo-button').addEventListener('click', async () => {
    const buscarActivoInput = activoDiv.querySelector('.buscar-activo');
    const listaActivos = activoDiv.querySelector('.lista-activos');

    const nombre = buscarActivoInput.value;
    if (!nombre) {
      alert('Ingrese un nombre para buscar');
      return;
    }

    try {
      const response = await fetch(`/Buscar/Activos/${nombre}`);
      const activos = await response.json();

      listaActivos.innerHTML = '<option value="">Seleccione un activo</option>';
      activos.forEach(activo => {
        const option = document.createElement('option');
        option.value = activo.idActivoFijo; // ID real del activo
        option.textContent = activo.Nombre; // Nombre visual del activo
        listaActivos.appendChild(option);
      });
    } catch (error) {
      console.error('Error al buscar activos:', error);
      alert('No se pudo buscar los activos');
    }
  });
});

function actualizarSubtotal() {
  const detalles = [...detallesContainer.children];
  const subtotal = detalles.reduce((acc, detalle) => {
    const cantidad = parseFloat(detalle.querySelector('.detalle-cantidad').value) || 0;
    const precio = parseFloat(detalle.querySelector('.detalle-precio').value) || 0;
    return acc + cantidad * precio;
  }, 0);

  document.getElementById('SubTotal').value = subtotal.toFixed(2);
}

// Escuchar cambios en cada detalle
detallesContainer.addEventListener('input', actualizarSubtotal);



// Manejar el envío del formulario
document.getElementById('ventaForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const detalles = [...detallesContainer.children].map(detalle => ({
    Cantidad: parseFloat(detalle.querySelector('.detalle-cantidad').value),
    PrecioUnitario: parseFloat(detalle.querySelector('.detalle-precio').value),
    IdProducto: detalle.querySelector('.lista-productos').value || null,
    IdPromocion: detalle.querySelector('.detalle-idpromocion').value || null, // Accede correctamente al ID de la promoción
  }));
  

  const activosPrestados = [...activosContainer.children].map(activo => ({
    IdActivoFijo: activo.querySelector('.lista-activos').value || null, // Enviar el ID del activo o NULL
    CantidadPrestada: parseFloat(activo.querySelector('.activo-cantidad').value) || 0,
    Estado: activo.querySelector('.activo-estado').value || '',
  }));

  const data = {
    idcliente: clienteSelect.value || null, // Si está vacío, se envía NULL
    FechaDeVenta: fechaVentaInput.value,
    SubTotal: parseFloat(document.getElementById('SubTotal').value),
    Descuento: parseFloat(document.getElementById('Descuento').value || 0),
    CobroExtra: parseFloat(document.getElementById('CobroExtra').value || 0),
    SaldoPendiente: parseFloat(document.getElementById('SaldoPendiente').value || 0),
    Credito: document.getElementById('SaldoPendiente').value ? {
      SaldoPendiente: parseFloat(document.getElementById('SaldoPendiente').value),
      Detalle: document.getElementById('CreditoDetalle').value || null
    } : undefined,
    detalles,
    activosPrestados,
  };

  console.log(data);
  

  try {
    const response = await fetch('/venta/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    alert(result.message);
  } catch (error) {
    console.error('Error al enviar la venta:', error);
    alert('No se pudo enviar la venta');
  }
});

// Inicializar
loadClientes();

