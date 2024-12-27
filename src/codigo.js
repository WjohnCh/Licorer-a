// CREAR UN ID UNICO PARA CADA REGISTRO
/*
FORMA DE ADICION:
- ID DE LA TIENDA = DEFINIDO 			UNICO
- ID DEL NUMEROINCREMENTAL = NO DEFINIDO	NO UNIQUE
- ID DE LA TABLA = DEFINIDO			UNICO
- ID DEL NOMBRE SIN VOCALES = NO DEFINIDO	NO UNIQUE
EJEM:
ID_TIENDA=1
ID_NUMEROINCREMENTAL= 1
ID_NOMBRETABLA = CTG
ID_NOMBREATRIB = LR

TIENDA 1, PRIMERA INSERSION 1, TABLA CATEGORIA, NOMBRE LICO
RESULTADO:
1CTG1LR
*/

let idTienda = 1; // NUMERO DE LA TIENDA

let idTablas = {
    proveedor: 'PRV',
    tipo: 'TP',
    marca: 'MRC',
    categoria: 'CTG',
    subcategoria: 'SCT',
    producto: 'PRD',
    cliente: 'CLN'
}

function obtenerIdRegistro(idTienda, idTabla,CantidadProducto, nombreDato){
    nombreDato = nombreDato.toUpperCase();
    let sinVocales = nombreDato.replace(/[aeiouAEIOU]/g, '');
    // Verifica si después de eliminar las vocales aún quedan al menos dos caracteres
    if (sinVocales.length >= 2){
        codeNombre = sinVocales.substring(0, 2);
        return `${idTienda}${idTabla}${CantidadProducto}${codeNombre}`;
    }
    // Si no hay suficientes consonantes, retorna las dos primeras letras originales
    codeNombre = nombreDato.substring(0, 2);
    return `${idTienda}${idTabla}${CantidadProducto}${codeNombre}`;
}

//LLAMADO AL BACKEND PARA DEVOLVER EL CONTEO, EN ESTE CASO 1
console.log(obtenerIdRegistro(idTienda, idTablas.categoria, CantidadProducto,'Maria'))

// REALIZAR UN CONTEO POR CADA REGISTRO PARA OBTENER EL ULTIMO NUMERO `SELECT COUNT(*) FROM nombre_tabla;`


//uso de la funcion sin nombre de la tabla
function obtenerIdRegistro(idTienda, CantidadProducto, nombreDato){
    nombreDato = nombreDato.toUpperCase();
    let sinVocales = nombreDato.replace(/[aeiouAEIOU]/g, '');
    // Verifica si después de eliminar las vocales aún quedan al menos dos caracteres
    if (sinVocales.length >= 2){
        codeNombre = sinVocales.substring(0, 2);
        return `${idTienda}${codeNombre}${CantidadProducto}`;
    }
    // Si no hay suficientes consonantes, retorna las dos primeras letras originales
    codeNombre = nombreDato.substring(0, 2);
    return `${idTienda}${codeNombre}${CantidadProducto}`;
}
let CantidadProducto = 1 // autoincremental por cada producto aniadido

console.log(obtenerIdRegistro(idTienda, CantidadProducto,'Maria'))

