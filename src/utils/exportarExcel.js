import * as XLSX from "xlsx";

/**
 * Exportar historial de cajas a Excel con detalles de productos
 * @param {Array} cajas - Array de cajas a exportar
 * @param {string} nombreArchivo - Nombre del archivo Excel (sin extensión)
 */
export const exportarHistorialCajasExcel = (cajas, nombreArchivo = "historial-cajas") => {
  if (!cajas || cajas.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  try {
    const wb = XLSX.utils.book_new();

    // Crear una hoja por cada caja
    cajas.forEach((caja, indexCaja) => {
      const datosHoja = [];

      // ========== RESUMEN DE LA CAJA ==========
      datosHoja.push(["RESUMEN DE CAJA #" + caja.id]);
      datosHoja.push([]);
      datosHoja.push(["Fecha Apertura:", formatearFecha(caja.fechaApertura)]);
      datosHoja.push(["Fecha Cierre:", formatearFecha(caja.fechaCierre)]);
      datosHoja.push(["Abierta por:", caja.abiertaPor || "—"]);
      datosHoja.push(["Cerrada por:", caja.cerradaPor || "—"]);
      datosHoja.push([]);

      // Totales
      datosHoja.push(["TOTALES"]);
      datosHoja.push(["Monto Inicial:", Number(caja.montoInicial || 0).toFixed(2), "Bs."]);
      datosHoja.push(["Total Efectivo:", Number(caja.montoFinalEfectivo || 0).toFixed(2), "Bs."]);
      datosHoja.push(["Total QR:", Number(caja.montoFinalQR || 0).toFixed(2), "Bs."]);
      datosHoja.push(["TOTAL GENERAL:", (Number(caja.montoFinalEfectivo || 0) + Number(caja.montoFinalQR || 0)).toFixed(2), "Bs."]);
      datosHoja.push([]);

      // Estadísticas de pedidos
      datosHoja.push(["ESTADÍSTICAS DE PEDIDOS"]);
      datosHoja.push(["Total de Pedidos:", caja.totalPedidos || 0]);
      datosHoja.push(["Pedidos Efectivo:", caja.pedidosEfectivo || 0]);
      datosHoja.push(["Pedidos QR:", caja.pedidosQR || 0]);
      datosHoja.push([]);
      datosHoja.push([]);

      // ========== DETALLES DE PRODUCTOS ==========
      datosHoja.push(["DETALLE DE PRODUCTOS VENDIDOS"]);
      datosHoja.push(["Producto", "Categoría", "Cantidad", "Precio Unitario", "Subtotal"]);

      // Agrupar productos por categoría
      const productosMap = new Map();

      if (caja.pedidos && caja.pedidos.length > 0) {
        caja.pedidos.forEach((pedido) => {
          if (pedido.detalles && pedido.detalles.length > 0) {
            pedido.detalles.forEach((detalle) => {
              const key = `${detalle.producto_id}-${detalle.categoria}`;
              if (!productosMap.has(key)) {
                productosMap.set(key, {
                  nombre: detalle.nombre || "Producto Desconocido",
                  categoria: detalle.categoria || "Sin categoría",
                  cantidad: 0,
                  precioUnitario: Number(detalle.precio_unitario || 0),
                  subtotal: 0,
                });
              }
              const prod = productosMap.get(key);
              prod.cantidad += Number(detalle.cantidad || 0);
              prod.subtotal += Number(detalle.subtotal || 0);
            });
          }
        });
      }

      // Agregar productos al Excel
      let totalProductos = 0;
      let totalCantidadProductos = 0;

      productosMap.forEach((producto) => {
        datosHoja.push([
          producto.nombre,
          producto.categoria,
          producto.cantidad,
          producto.precioUnitario.toFixed(2),
          producto.subtotal.toFixed(2),
        ]);
        totalProductos += producto.subtotal;
        totalCantidadProductos += producto.cantidad;
      });

      // Fila de totales
      datosHoja.push([]);
      datosHoja.push(["TOTAL", "", totalCantidadProductos, "", totalProductos.toFixed(2)]);

      // Crear hoja
      const ws = XLSX.utils.aoa_to_sheet(datosHoja);

      // Estilos para encabezados principales
      const styleEncabezadoPrincipal = {
        font: { bold: true, size: 14, color: "FFFFFF" },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "left", vertical: "center" },
      };

      const styleEncabezadoSecundario = {
        font: { bold: true, size: 11, color: "FFFFFF" },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      // Aplicar estilos solo si las celdas existen
      if (ws["A1"]) ws["A1"].s = styleEncabezadoPrincipal;
      if (ws["A8"]) ws["A8"].s = styleEncabezadoSecundario;
      if (ws["A19"]) ws["A19"].s = styleEncabezadoPrincipal;

      // Ajustar ancho de columnas
      ws["!cols"] = [
        { wch: 25 }, // Producto
        { wch: 15 }, // Categoría
        { wch: 12 }, // Cantidad
        { wch: 15 }, // Precio Unitario
        { wch: 15 }, // Subtotal
      ];

      // Agregar hoja al libro
      const nombreHoja = `Caja ${caja.id}`.substring(0, 31); // Excel limita a 31 caracteres
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    });

    // Descargar archivo
    const fecha = new Date().toLocaleDateString("es-ES").replace(/\//g, "-");
    XLSX.writeFile(wb, `${nombreArchivo}-${fecha}.xlsx`);
  } catch (error) {
    console.error("Error al exportar Excel:", error);
    alert("Error al exportar a Excel: " + error.message);
  }
};

/**
 * Formatear fecha para Excel
 */
const formatearFecha = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Exportar lista de pedidos a Excel
 * @param {Array} pedidos - Array de pedidos a exportar
 * @param {string} nombreArchivo - Nombre del archivo Excel
 */
export const exportarPedidosExcel = (pedidos, nombreArchivo = "pedidos") => {
  if (!pedidos || pedidos.length === 0) {
    alert("No hay pedidos para exportar");
    return;
  }

  try {
    const datosExcel = pedidos.map((pedido) => ({
      "ID Pedido": pedido.id,
      Tipo: pedido.tipo === "mesa" ? "Mesa" : "Para llevar",
      "Mesa/Ref": pedido.mesa_numero || "—",
      "Método Pago": pedido.metodo_pago === "efectivo" ? "Efectivo" : "QR",
      "Monto Total": Number(pedido.monto_total || 0).toFixed(2),
      Estado: pedido.estado || "Desconocido",
      Fecha: formatearFecha(pedido.created_at),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosExcel);

    ws["!cols"] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");

    const fecha = new Date().toLocaleDateString("es-ES").replace(/\//g, "-");
    XLSX.writeFile(wb, `${nombreArchivo}-${fecha}.xlsx`);
  } catch (error) {
    console.error("Error al exportar pedidos:", error);
    alert("Error al exportar a Excel: " + error.message);
  }
};
