const detallesContainer = document.getElementById('detallesContainer');
const addDetalleButton = document.getElementById('addDetalle');
const addDetallePromo = document.getElementById('addDetallePromo');
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
    // alert('No se pudo cargar la lista de clientes');
  }
}
addDetallePromo.addEventListener('click',()=>{
  const detalleDiv = document.createElement('div');
  detalleDiv.className = 'space-y-2 p-2 border rounded';
  detalleDiv.innerHTML = `

  <div class="flex justify-between">
    <div>
      <label class="font-semibold">Buscar Promoción</label>
      <div class="flex gap-2">
        <input type="text" class="w-48 p-2 border rounded buscar-promocion" placeholder="Nombre clave">
        <button type="button" class="bg-green-500 text-white px-4 py-2 rounded  buscar-promocion-button">Buscar</button>
      </div>
    </div>
    <div>
      <label class="font-semibold">Seleccionar Promoción</label><br>
      <select class="w-80 p-2 border rounded lista-promociones">
        <option value="">Seleccione una promoción</option>
      </select>
    </div>
    <div>
      <label class="font-semibold">Cantidad</label><br>
      <input type="number" class="w-16 p-2 border rounded detalle-cantidad" required>
    </div>
    <div>
      <label class="font-semibold">P. Unitario</label> <br>
      <input type="number" class="w-24 p-2 border rounded detalle-precio" step="0.01" readonly>
    </div>
  </div>
  
  <!-- Campo oculto para el ID de la promoción -->
  <input type="hidden" class="detalle-idpromocion">

  <div class="flex">
    
  </div>
`;
  detallesContainer.appendChild(detalleDiv);
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
        option.textContent = `${promocion.Nombre}`;
        option.dataset.precio = promocion.Precio;
        listaPromociones.appendChild(option);
      });
      
      listaPromociones.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        precioInput.value = selectedOption.dataset.precio || '';
        detalleDiv.querySelector('.detalle-idpromocion').value = selectedOption.value; // Guarda el ID de la promoción
      });
      listaPromociones.focus();
      listaPromociones.selectedIndex = 1;
      
      precioInput.value = promociones[0].Precio
      detalleDiv.querySelector('.detalle-idpromocion').value = listaPromociones.value; // Guarda el ID de la promoción
    } catch (error) {
      console.error('Error al buscar promociones:', error);
      alert('No se pudo buscar las promociones');
    }

  });
})
// Añadir un nuevo detalle
addDetalleButton.addEventListener('click', () => {
  const detalleDiv = document.createElement('div');
  detalleDiv.className = 'space-y-2 p-2 border rounded';
  detalleDiv.innerHTML = `
  <div class="flex justify-between">
    <div>
      <label class="font-semibold">Buscar Producto</label>
      <div class="flex gap-2">
        <input type="text" class="w-48 p-2 border rounded buscar-producto" placeholder="Nombre del producto">
        <button type="button" class="bg-blue-500 text-white px-4 py-2 rounded buscar-producto-button">Buscar</button>
      </div>
    </div>
    <div class="w-min"> 
      <label class="font-semibold">Seleccionar Producto</label>
      <select class="w-80 p-2 border rounded lista-productos">
      <option value="">Seleccione un producto</option>
      </select>
    </div>
    <div class="w-min">
      <label class="font-semibold">Cantidad</label>
      <input type="number" class="w-16 p-2 border rounded detalle-cantidad" required>
    </div>
    <div class="w-min">
      <label class="font-semibold">P. Unitario</label>
      <input type="number" class="w-24 p-2 border rounded detalle-precio" step="0.01" readonly>
    </div>
  </div>
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
      });

      listaProductos.focus();
      listaProductos.selectedIndex = 1;
      precioInput.value = productos[0].PrecioActual

    } catch (error) {
      console.error('Error al buscar productos:', error);
      alert('No se pudo buscar los productos');
    }
  });

});

// Añadir un nuevo activo
addActivoButton.addEventListener('click', async () => {
  const activoDiv = document.createElement('div');
  activoDiv.className = 'space-y-2 p-2 border rounded';
  activoDiv.innerHTML = `
    <div class="flex  gap-8">
      <div class="w-min">
        <label class="font-semibold">Seleccionar Activo</label>
        <select class="w-96 p-2 border rounded lista-activos">
          <option value="">Seleccione un activo</option>
        </select>
      </div>
      <div class="w-min">
        <label class="font-semibold">Cantidad</label>
        <input type="number" class="w-16 p-2 border rounded activo-cantidad" required>
      </div>
      <div class="w-min">
        <label class="font-semibold">Estado</label>
        <input type="text" class="w-24 p-2 border rounded activo-estado" value="Pendiente">
      </div>
    </div>
  `;
  activosContainer.appendChild(activoDiv);

  // Buscar activo
    
    try {
      const listaActivos = activoDiv.querySelector('.lista-activos');
      const response = await fetch(`/Buscar/Activos`);
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
    IdProducto: detalle.querySelector('.lista-productos')  ? detalle.querySelector('.lista-productos').value : null,
    IdPromocion: detalle.querySelector('.detalle-idpromocion') ? detalle.querySelector('.detalle-idpromocion').value : null, // Accede correctamente al ID de la promoción
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

