let productos  = [
    {
      "idcompra": 6,
      "FechaCompra": "2024-12-30",
      "cantidad": 2,
      "preciounitario": "12.22",
      "nombre": "Cristal 650ml - Botella",
      "precioCompra_Actual": null,
      "stockActual": 30
    },
    {
      "idcompra": 4,
      "FechaCompra": "2024-12-30",
      "cantidad": 12,
      "preciounitario": "22.00",
      "nombre": "Cristal 650ml - Botella",
      "precioCompra_Actual": null,
      "stockActual": 38
    },
    {
      "idcompra": 1,
      "FechaCompra": "2024-12-30",
      "cantidad": 12,
      "preciounitario": "24.00",
      "nombre": "Cristal 650ml - Botella",
      "precioCompra_Actual": null,
      "stockActual": 38
    },
    {
      "idcompra": 5,
      "FechaCompra": "2024-12-29",
      "cantidad": 12,
      "preciounitario": "11.00",
      "nombre": "Cristal 650ml - Botella",
      "precioCompra_Actual": null,
      "stockActual": 38
    }
  ]


let stockactual = productos[0].stockActual
let ponderado = 0;
for (let producto of productos){
    
    const {cantidad, preciounitario} = producto

    if(stockactual >= cantidad){
        ponderado +=  (cantidad* preciounitario)
        stockactual -=cantidad
    }else{
        ponderado +=  (stockactual* preciounitario)
     break;
    } 
}


console.log(ponderado/productos[0].stockActual);


console.log(stockactual);
