const express = require('express');
const db = require('./libs/confimysql'); // Importa la conexión a la base de datos



const app = express();
const port = 3000;
app.use(express.json());
app.use(express.static('src/Frontend'));

app.get('/clientes', async (req, res) => {

  try {
    const [results] = await db.query(`
      SELECT idcliente, nombre FROM cliente`)

    res.send(results)
  } catch (error) {
    res.send(error.message)
  }
})
app.get('/Buscar/Productos/:nombre', async (req, res) => {
  const {nombre} = req.params
  
  try {
    const [results] = await db.query(`
      SELECT idProducto,Nombre,PrecioActual FROM producto
      WHERE nombre LIKE ?`, 
      { replacements: [`%${nombre}%`] });

    res.send(results)
  } catch (error) {
    res.send(error.message)
  }
})

app.get('/Buscar/Promociones/:nombre', async (req, res) => {
  const {nombre} = req.params
  try {
    const [results] = await db.query(`
      SELECT IdPromocion,Nombre,Precio FROM promocion
      WHERE nombre LIKE ?`, 
      { replacements: [`%${nombre}%`] });

    res.send(results)
  } catch (error) {
    res.send(error.message)
  }
})

app.get('/Buscar/Activos/:nombre', async (req, res) => {
  const {nombre} = req.params
  try {
    const [results] = await db.query(`
      SELECT idActivoFijo,Nombre FROM activofijo
      WHERE nombre LIKE ?`, 
      { replacements: [`%${nombre}%`] });

    res.send(results)
  } catch (error) {
    res.send(error.message)
  }
})

app.post('/venta/productos', async (req, res) => {

  console.log(req.body);
  

  let { idcliente, FechaDeVenta, SubTotal, Descuento, CobroExtra, detalles,
    activosPrestados, Credito } = req.body;

  if(idcliente == ''){
    idcliente = null
  }

  try {
    // Llamar al procedimiento almacenado para insertar la venta
    const [{ idVenta }] = await db.query(
      `CALL InsertarVenta(?, ?, ?, ?, ?)`,
      {
        replacements: [idcliente, FechaDeVenta, SubTotal, Descuento, CobroExtra]
      }
    );

    // Insertar los detalle de la venta uno por uno
    for (const detalle of detalles) {
      const { Cantidad, PrecioUnitario, IdProducto, IdPromocion } = detalle;

      await db.query(
        `CALL InsertarDetalleVenta(?, ?, ?, ?, ?)`,
        { replacements: [idVenta, Cantidad, PrecioUnitario, IdProducto, IdPromocion] }
      );

      if (IdProducto != null) {
        await db.query(
          `CALL ReducirStock(? , ?);`,
          { replacements: [IdProducto, Cantidad] }
        )
      } else if (IdPromocion != null) {
        const [{ IdProducto, cantidad }] = await db.query(
          `CALL ObtenerProductosPorPromocion(?);`,
          { replacements: [IdPromocion] }
        )
        await db.query(
          `CALL ReducirStock(? , ?);`,
          { replacements: [IdProducto, cantidad * Cantidad] }
        )
      }
    }

    if (activosPrestados != null) {
      for (let activoPrestado of activosPrestados) {
        const { IdActivoFijo, CantidadPrestada, Estado } = activoPrestado;
        await db.query(
          `CALL AgregarRetornoActivo(?, ?, ?, ?);`,
          { replacements: [IdActivoFijo, idVenta, CantidadPrestada, Estado] }
        )
      }
    }

    if (Credito != null) {
      const { SaldoPendiente, Detalle } = Credito;


      await db.query(
        `CALL InsertarCredito(?, ?, ?);`,
        { replacements: [idVenta, SaldoPendiente, Detalle] }
      )
    }


    res.status(200).send({ message: 'Venta y detalles insertados exitosamente' });
  } catch (error) {
    console.error('Error al insertar la venta:', error);
    res.status(500).send('Error al insertar la venta');
  }
});


app.post('/deuda/PagoCredito', async (req, res) => {
  const { idCredito, MontoParcial, fecha, detalle, estado } = req.body
  try {
    if (estado != null) {
      await db.query(`UPDATE Credito SET estado = ?
        where idCredito = ?`,
        { replacements: [estado, idCredito] })
      res.status(200).send({ message: 'Credito Pagado' });
      console.log("Pago completo");
    } else {

      console.log("Pago parcial completo");
      // Verificacion si el monto ya cubre toda la deuda para cambiar el estado
      await db.query(`
      INSERT INTO creditoParcial (IdCredito, MontoParcial, FechaPago, Detalle)
      VALUES (?,?,?,?)`,
        { replacements: [idCredito, MontoParcial, fecha, detalle] }
      )

      const [[{ resultado }]] = await db.query(
        `select sum(MontoParcial) as 'resultado' from creditoparcial
      where idCredito = ?`,
        { replacements: [idCredito] })

      await db.query(
        `UPDATE Credito SET estado = ?
        where idCredito = ? and SaldoPendiente = ?`,
        { replacements: ['Pagado', idCredito, resultado] })

      console.log(resultado);


      res.status(200).send({ message: 'Credito Parcial agregado correctamente' });
    }
  } catch (error) {
    console.error('Error al insertar el creditoParcial', error);
    res.status(500).send('Error al insertar el creditoParcial');
  }

})


app.put('/deuda/ActivoFisico', async (req, res) => {
  const { idRetornoActivo, cantidad, estado } = req.body;
  // {estado: Pagado || Devuelto || Pendiente, cantidad: 12}
  try {
    await db.query(
      `UPDATE retornoActivo
      SET cantidad_devuelta = ?,
      estado = ?
      where idRetornoActivo = ?`,
      { replacements: [cantidad, estado, idRetornoActivo] }

    )
    res.status(200).send({ message: 'Prestamo Actualizado correctamente' });
  } catch (error) {
    console.error('Error al modificar el prestamo:', error);
    res.status(500).send('Error al modificar el prestamo');
  }
})


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}/ventas.html`);
})


