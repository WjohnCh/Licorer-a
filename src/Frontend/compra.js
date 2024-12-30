// Variables globales
let productos = [];

// Elementos del DOM
const fechaCompraInput = document.getElementById('fechaCompra');
const proveedorSelect = document.getElementById('proveedor');
const productosList = document.getElementById('productosList');
const totalCompraInput = document.getElementById('totalCompra');
const productModal = document.getElementById('productModal');
const marcaSelect = document.getElementById('marca');
const productoSelect = document.getElementById('producto');
const cantidadInput = document.getElementById('cantidad');
const precioUnitarioInput = document.getElementById('precioUnitario');

// Inicialización
fechaCompraInput.value = new Date().toISOString().split('T')[0];
fetchProveedores();
fetchMarcas();

// Obtener proveedores
async function fetchProveedores() {
  const response = await fetch('/proveedor');
  const proveedores = await response.json();
  proveedorSelect.innerHTML = proveedores.map(p => `<option value="${p.idproveedor}">${p.nombre}</option>`).join('');
}

// Obtener marcas
async function fetchMarcas() {
  const response = await fetch('/Marcas');
  const marcas = await response.json();
  marcaSelect.innerHTML = marcas.map(m => `<option value="${m.idMarca}">${m.Nombre}</option>`).join('');
}

// Obtener productos por marca
marcaSelect.addEventListener('change', async () => {
  const idMarca = marcaSelect.value;
  const response = await fetch(`/productos/${idMarca}`);
  const productos = await response.json();
  productoSelect.innerHTML = productos.map(p => `<option value="${p.idProducto}">${p.nombre}</option>`).join('');
});

// Abrir modal para agregar producto
const addProductButton = document.getElementById('addProductButton');
addProductButton.addEventListener('click', () => {
  productModal.classList.remove('hidden');
});

// Cerrar modal
const cancelProductButton = document.getElementById('cancelProductButton');
cancelProductButton.addEventListener('click', () => {
  productModal.classList.add('hidden');
});

// Agregar producto
const productForm = document.getElementById('productForm');
productForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const idProducto = productoSelect.value;
  const productoNombre = productoSelect.options[productoSelect.selectedIndex].text;
  const cantidad = parseFloat(cantidadInput.value);
  const precioUnitario = parseFloat(precioUnitarioInput.value);
  const subtotal = cantidad * precioUnitario;

  productos.push({ idProducto, productoNombre, cantidad, precioUnitario, subtotal });
  updateProductosList();
  productModal.classList.add('hidden');
  productForm.reset();
});

// Actualizar tabla de productos
function updateProductosList() {
  productosList.innerHTML = productos.map((p, index) => `
    <tr>
      <td class="border border-gray-300 px-4 py-2">${p.productoNombre}</td>
      <td class="border border-gray-300 px-4 py-2">${p.cantidad}</td>
      <td class="border border-gray-300 px-4 py-2">${p.precioUnitario.toFixed(2)}</td>
      <td class="border border-gray-300 px-4 py-2">${p.subtotal.toFixed(2)}</td>
      <td class="border border-gray-300 px-4 py-2">
        <button class="text-red-600" onclick="removeProducto(${index})">Eliminar</button>
      </td>
    </tr>
  `).join('');

  const total = productos.reduce((acc, p) => acc + p.subtotal, 0);
  totalCompraInput.value = total.toFixed(2);
}

// Eliminar producto
function removeProducto(index) {
  productos.splice(index, 1);
  updateProductosList();
}

// Confirmar compra
const compraForm = document.getElementById('compraForm');
compraForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fechaCompra = fechaCompraInput.value;
  const idProveedor = proveedorSelect.value;
  const totalCompra = parseFloat(totalCompraInput.value);

  const detalles = productos.map(p => ({
    idProducto: p.idProducto,
    Cantidad: p.cantidad,
    PrecioUnitario: p.precioUnitario
  }));

  const compraData = {
    FechaCompra: fechaCompra,
    IdProveedor: idProveedor,
    TotalCompra: totalCompra,
    Detalles: detalles
  };

  try {
    const response = await fetch('/compra/actualizar/stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(compraData)
    });

    if (response.ok) {
      alert('Compra registrada correctamente');
      window.location.reload();
    } else {
      alert('Error al registrar la compra');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al procesar la solicitud');
  }
});