function getLocales() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const hojaLocales = ss.getSheetByName("va-puntosDeVenta");

  if (!hojaLocales) {
    SpreadsheetApp.getUi().alert("No se encontró la hoja 'Locales'.");
    return;
  }

  // Definir el rango dinámico en la hoja de locales
  const ultimaFila = hojaLocales.getLastRow();
  // Cambiar esto según la columna donde estén los locales
  const rangoLocales = hojaLocales.getRange(`C2:C${ultimaFila}`); 
  // Obtener los valores del rango y convertirlos en una lista 
  const valoresLocales = rangoLocales.getValues(); 
  // Filtrar valores no nulos return
  const listaLocales = valoresLocales.flat().filter(local => local); 

  return listaLocales;

}

function existeHojaUltimoStock(local) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hojaUltimoStock = ss.getSheetByName("ultimo-stock-" + local);
    return hojaUltimoStock !== null;
}


function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Opciones')
    .addItem('Configurar hojas', 'configurarInterfazBusquedaUnica')
    .addItem('Deshacer movimiento', 'deshacerMovimiento')
    .addItem('Actualizar y limpiar incremento', 'actualizarUltimoStockDesdeLocal')
    .addItem('Registrar Venta', 'registrarVenta')
    .addToUi();
}

function configurarInterfazBusquedaUnica() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const locales = getLocales();

  locales.forEach(local => {
    if(existeHojaUltimoStock(local) ){

      let hojaInterfaz = ss.getSheetByName(local + " - Ventas");
  
      if (!hojaInterfaz) {
        hojaInterfaz = ss.insertSheet(local + " - Ventas");
      } 
      

      // Encabezado principal
      const encabezado = hojaInterfaz.getRange("A1:F1");
      encabezado.merge();
      encabezado.setValue("Descontar Stock - " + local)
        .setFontSize(18)
        .setFontWeight("bold")
        .setHorizontalAlignment("center")
        .setBackground("#FFD700")
        .setFontColor("black");

      // Sección de búsqueda
      const rangoBusqueda = hojaInterfaz.getRange("A3:B3");
      rangoBusqueda.merge();
      rangoBusqueda.setValue("Búsqueda de Producto")
        .setFontWeight("bold")
        .setFontSize(12)
        .setHorizontalAlignment("center")
        .setBackground("#000000")
        .setFontColor("#FFFFFF");

      // Campo de búsqueda
      
      hojaInterfaz.getRange("A4").setValue("Buscar:");
      const rangoCampoBusqueda = hojaInterfaz.getRange("B4");
      rangoCampoBusqueda.setBackground("#FFFFFF").setBorder(true, true, true, true, false, false);
    

      // Producto seleccionado
      hojaInterfaz.getRange("A6").setValue("Producto:");
      const rangoProducto = hojaInterfaz.getRange("B6");
      rangoProducto.setBackground("#FFFFE0").setBorder(true, true, true, true, false, false);

      // Cantidad
      hojaInterfaz.getRange("A7").setValue("Cantidad:");
      const rangoCantidad = hojaInterfaz.getRange("B7");
      rangoCantidad.setBackground("#FFFFFF").setBorder(true, true, true, true, false, false);

    

      // Tabla de movimientos
      hojaInterfaz.getRange("A10:F10").setValues([
        ["Fecha", "Código", "Marca", "Descripción", "Cantidad", "Usuario"]
      ])
      .setFontWeight("bold")
      .setBackground("#000000")
      .setFontColor("#FFFFFF");

      // Ajustes de columna
      hojaInterfaz.setColumnWidths(1, 6, 150);
      
      // Proteger rangos importantes
      
      const rangoMovimientos = hojaInterfaz.getRange("A10:G1000"); 
      // proteger solo movimientos 
      const protection = rangoMovimientos.protect().setDescription('Protección de tabla de movimientos'); 
      protection.setWarningOnly(true);

    }
      
    //else {
      //hojaInterfaz.clear();
    //}

    
  });

  //crearHojaTransferencia()
  
}

function onEdit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaActiva = e.source.getActiveSheet();
  const rangoEditado = e.range;



  if (!hojaActiva.getName().includes("Ventas")) return;
  
  const local = hojaActiva.getName().split(" - ")[0];
  const hojaStock = ss.getSheetByName(local);
  
  if (!hojaStock || rangoEditado.getA1Notation() !== "B4") return;
  
  const busqueda = rangoEditado.getValue().toString().toLowerCase();
  if (!busqueda) return;
  
  const datosStock = hojaStock.getDataRange().getValues();
  const productosFiltrados = datosStock
    .slice(1)
    .filter(fila => {
      const [codigo, marca, descripcion, sabor] = fila;
      const textoCompleto = `${codigo} ${marca} ${descripcion} ${sabor}`.toLowerCase();
      return textoCompleto.includes(busqueda);
    })
    .map(fila => `${fila[0]} - ${fila[1]} - ${fila[2]}- ${fila[3]}`);

  // Actualizar lista desplegable
  const rangoDesplegable = hojaActiva.getRange("B6");
  if (productosFiltrados.length > 0) {
    const validation = SpreadsheetApp.newDataValidation()
      .requireValueInList(productosFiltrados)
      .build();
    rangoDesplegable.setDataValidation(validation);
  } else {
    rangoDesplegable.clearDataValidations();
  }
}

function registrarVenta() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaActiva = ss.getActiveSheet();
  
  if (!hojaActiva.getName().includes("Ventas")) {
    SpreadsheetApp.getUi().alert("Por favor, use una hoja de ventas válida.");
    return;
  }

  const local = hojaActiva.getName().split(" - ")[0];

  const hojaUltimoStock = ss.getSheetByName(`ultimo-stock-${local}`);
  
  if (!hojaUltimoStock) {
    SpreadsheetApp.getUi().alert(`No se encontró la hoja 'ultimo-stock-${local}'.`);
    return;
  }
 // const hojaStock = ss.getSheetByName(local);
  
  const producto = hojaActiva.getRange("B6").getValue();
  const cantidad = parseInt(hojaActiva.getRange("B7").getValue());
  
  if (!producto || !cantidad || isNaN(cantidad) || cantidad <= 0) {
    SpreadsheetApp.getUi().alert("Por favor complete todos los campos correctamente.");
    return;
  }

  const [codigo] = producto.split(" - ");
  //const datosStock = hojaStock.getDataRange().getValues();
  const datosUltimoStock = hojaUltimoStock.getDataRange().getValues();
  
  let filaStock = -1;
  let stockActual = 0;
  
  for (let i = 1; i < datosUltimoStock.length; i++) {
    if (datosUltimoStock[i][0] === codigo) {
      filaStock = i + 1;
      stockActual = datosUltimoStock[i][1];
      break;
    }
  }
  
  if (filaStock === -1) {
    SpreadsheetApp.getUi().alert("Producto no encontrado en stock.");
    return;
  }
  
  if (stockActual < cantidad) {
    SpreadsheetApp.getUi().alert("Stock insuficiente.");
    return;
  }
  
  // // Actualizar stock en la hoja 'ultimo-stock-[local]'
  hojaUltimoStock.getRange(filaStock, 2).setValue(stockActual - cantidad);
  
  // Registrar movimiento //["Fecha", "Código", "Marca", "Descripción","Sabor", "Cantidad", "Usuario"]
  const ultimaFila = hojaActiva.getLastRow() + 1;
  hojaActiva.getRange(ultimaFila, 1, 1, 6).setValues([[
    new Date(),
    codigo,
    producto.split(" - ")[1],
    producto.split(" - ")[2],
    cantidad,
    Session.getActiveUser().getEmail()
  ]]);

  // Agregar botón "Deshacer"
  const celdaBoton = hojaActiva.getRange(ultimaFila, 7);
  const boton = hojaActiva.getRange(ultimaFila, 7);
  boton.setValue("Deshacer").setFontColor("white").setBackground("red");
  celdaBoton.setNote(`filaStock:${filaStock},cantidad:${cantidad}`);
  
  // Limpiar campos
  hojaActiva.getRange("B6:B7").clearContent();
  
  //SpreadsheetApp.getUi().alert("Venta registrada exitosamente.");
}

function deshacerMovimiento() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaActiva = ss.getActiveSheet();

  if (!hojaActiva.getName().includes("Ventas")) {
    SpreadsheetApp.getUi().alert("Esta acción solo es válida en hojas de ventas.");
    return;
  }

  const rangoActivo = hojaActiva.getActiveRange();
  const filaMovimiento = rangoActivo.getRow();
  const columnaMovimiento = rangoActivo.getColumn();

  if (columnaMovimiento !== 7 || rangoActivo.getValue() !== "Deshacer") {
    SpreadsheetApp.getUi().alert("Por favor, seleccione un botón válido para deshacer.");
    return;
  }

  // Obtener información del botón
  const nota = rangoActivo.getNote();
  if (!nota) {
    SpreadsheetApp.getUi().alert("No se encontró información para deshacer este movimiento.");
    return;
  }

  // Extraer datos del botón
  const datos = nota.split(",");
  const filaStock = parseInt(datos[0].split(":")[1]);
  const cantidad = parseInt(datos[1].split(":")[1]);

  const local = hojaActiva.getName().split(" - ")[0];

  const hojaUltimoStock = ss.getSheetByName(`ultimo-stock-${local}`);

  if (!hojaUltimoStock) {
    SpreadsheetApp.getUi().alert(`No se encontró la hoja 'ultimo-stock-${local}'.`);
    return;
  }

  // Restaurar stock en la hoja 'ultimo-stock-[local]'
  const datosUltimoStock = hojaUltimoStock.getDataRange().getValues();
  const codigo = hojaUltimoStock.getRange(filaStock, 1).getValue();

  let stockActual = 0;
  for (let i = 1; i < datosUltimoStock.length; i++) {
    if (datosUltimoStock[i][0] === codigo) {
      stockActual = datosUltimoStock[i][1];
      break;
    }
  }

  hojaUltimoStock.getRange(filaStock, 2).setValue(stockActual + cantidad);

  // Actualizar el registro de movimientos
  hojaActiva.getRange(filaMovimiento, 1, 1, 8).setBackground("#d9ead3");
  hojaActiva.getRange(filaMovimiento, 8).setValue(`Stock devuelto (${cantidad})`);
  hojaActiva.getRange(filaMovimiento, 7).clearContent().clearNote();

  SpreadsheetApp.getUi().alert("El movimiento ha sido revertido y el stock restaurado.");
}

function actualizarUltimoStockDesdeLocal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaActiva = ss.getActiveSheet();

  // Verifica que estás en una hoja de un local válida
  if (hojaActiva.getName().includes(" - Ventas") || hojaActiva.getName().includes("ultimo-stock-") || hojaActiva.getName().includes("productos") || hojaActiva.getName().includes("global")) {
    SpreadsheetApp.getUi().alert("Por favor, ejecute esta función desde la hoja de un local ");
    return;
  }

  const local = hojaActiva.getName(); // El nombre del local es el nombre de la hoja activa
  const hojaUltimoStock = ss.getSheetByName(`ultimo-stock-${local}`);

  if (!hojaUltimoStock) {
    SpreadsheetApp.getUi().alert(`No se encontró la hoja "ultimo-stock-${local}".`);
    return;
  }

  // Obtener los datos de la hoja actual
  const ultimaFila = hojaActiva.getLastRow();
  const rangoCodigos = hojaActiva.getRange(`A2:A${ultimaFila}`).getValues(); // Columna A: Código
  const rangoStock = hojaActiva.getRange(`H2:H${ultimaFila}`).getValues();   // Columna H: Stock

  // Combinar códigos y stocks en un solo arreglo
  const datos = rangoCodigos.map((fila, i) => [fila[0], rangoStock[i][0]]);

  // Copiar valores en la hoja "último stock" correspondiente
  hojaUltimoStock.getRange(2, 1, datos.length, 2).setValues(datos);

  // Poner en cero la columna I (incrementoStock) de la hoja activa
  const rangoIncrementoStock = hojaActiva.getRange(`I2:I${ultimaFila}`);
  rangoIncrementoStock.setValue(0);

  SpreadsheetApp.getUi().alert(`Se actualizó "ultimo-stock-${local}" y se puso en cero la columna I.`);
}
