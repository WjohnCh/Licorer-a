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
app.get('/Marcas', async (req, res) => {

  try {
    const [results] = await db.query(`
      SELECT idMarca, Nombre FROM Marca`)

    res.send(results)
  } catch (error) {
    res.send(error.message)
  }
})
app.get('/productos/:idMarca', async (req, res) => {
  const { idMarca } = req.params
  try {
    const [results] = await db.query(`
      SELECT idProducto, nombre FROM producto
      where idMarca = ?`,
      { replacements: [idMarca] })

    res.send(results)
  } catch (error) {
    res.send(error.message)
  }
})
app.get('/Buscar/Productos/:nombre', async (req, res) => {
  const { nombre } = req.params

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
  const { nombre } = req.params
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
app.get('/Buscar/Activos', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT idActivoFijo,Nombre FROM activofijo`)

    res.send(results)
  } catch (error) {
    res.send(error.message)
  }
})
app.get('/Buscar/Activos/:nombre', async (req, res) => {
  const { nombre } = req.params
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

  let { idcliente, FechaDeVenta, SubTotal, Descuento, CobroExtra, detalles,
    activosPrestados, Credito } = req.body;

  if (idcliente == '') {
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

      const [[{PrecioCompra_Actual}]] = await db.query(
        `SELECT PrecioCompra_Actual FROM producto 
        where idproducto = ?`,
        { replacements: [IdProducto] }
      );
    
      await db.query(
        `CALL InsertarDetalleVenta(?, ?, ?, ?, ?, ?)`,
        { replacements: [idVenta, Cantidad, PrecioUnitario, IdProducto, IdPromocion, PrecioCompra_Actual] }
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

app.get('/deuda/verCredito', async (req, res) => {

  try {
    const [result] = await db.query(`
      select c.idCredito , cc.nombre, SaldoPendiente,FechaDeVenta
      from credito c
      join venta v
      on c.idventa = v.idventa
      join cliente cc on
      cc.idcliente = v.idcliente
      where c.estado = 'Pendiente'`)

    res.status(200).send(result);
  } catch (error) {
    console.error('Error al buscar los creditos:', error);
    res.status(500).send('Error al insertar el credito');
  }
})

app.get('/deuda/creditoParcial/:idCredito', async (req, res) => {

  const { idCredito } = req.params
  try {
    const [result] = await db.query(`
      SELECT MontoParcial, FechaPago, Detalle
      FROM creditoParcial
      WHERE idCredito = ?`,
      { replacements: [idCredito] })
    res.status(200).send(result);
  } catch (error) {
    console.error('Error al buscar los creditos parciales:', error);
    res.status(500).send('Error al buscar los creditos parciales');
  }
})

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

app.get("/deudad/ActivoFisico/Clientes", async (req, res) => {
  try {

    const [results] = await db.query(`SELECT * FROM retornoActivos`)

    res.status(200).send(results);
  } catch (error) {
    res.status(500).send('Error al buscar el cliente');
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


// AUMENTAR EL STOCK CON LAS COMPRAS
app.get("/proveedor", async (req, res) => {

  try {
    const [result] = await db.query(`SELECT idproveedor, nombre FROM Proveedor`)
    res.send(result)
  } catch (error) {
    console.error('Error al ver Proveedor:', error);
    res.status(500).send('Error al ver Proveedor');
  }

})


app.post('/compra/actualizar/stock', async (req, res) => {

  const { FechaCompra, IdProveedor, TotalCompra, Detalles } = req.body;
  try {

    const [{ idVenta }] = await db.query(`CALL InsertarCompra(?,?,?)`,
      { replacements: [FechaCompra, IdProveedor, TotalCompra] }
    )

    for (let Detalle of Detalles) {
      const { idProducto, Cantidad, PrecioUnitario } = Detalle;

      
      await db.query(
        `CALL InsertarDetalleCompra(?, ?, ?, ?);`,
        { replacements: [idVenta, idProducto, Cantidad, PrecioUnitario] }
      )

      await fetch(`http://localhost:3000/ponderado/precioCompra/${idProducto}`);

    }

    res.status(200).send({ message: 'Compra agregada correctamente' });
  } catch (error) {
    console.error('Error al aniadir la compra:', error);
    res.status(500).send('Error al aniadir la compra');
  }

})

app.get('/ponderado/precioCompra/:idproducto', async (req, res) => {

  const { idproducto } = req.params;

  try {

    const [result] = await db.query(`
    SELECT c.idcompra, c.FechaCompra, d.cantidad, d.preciounitario, p.nombre, p.precioCompra_Actual, p.stockActual FROM compra c
    join detallecompra d
    on c.idcompra = d.idcompra
    join producto p
    on p.idproducto = d.idproducto
    where p.idproducto = ?
    order by c.FechaCompra desc, c.idcompra desc;
    `, { replacements: [idproducto] })


    let stockactual2 = result[0].stockActual
    let ponderado = 0;
    for (let producto of result) {

      const { cantidad, preciounitario } = producto

      if (stockactual2 >= cantidad) {
        ponderado += (cantidad * preciounitario)
        stockactual2 -= cantidad
      } else {
        ponderado += (stockactual2 * preciounitario)
        break;
      }
    }
    
    await db.query(
      `UPDATE Producto 
      SET PrecioCompra_Actual = ?
      WHERE idproducto =?`,
      { replacements: [ponderado/result[0].stockActual, idproducto] }
    )
    res.status(200).send("Actualizado Correctamente");
  } catch (error) {
    console.error('Error al aniadir la compra:', error);
    res.status(200).send("Error al actualizar");
  }

})


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}/ventas.html`);
})


