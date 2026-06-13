export const CSV_TEMPLATE = `fecha,tipo,categoria,descripcion,monto,moneda
2025-01-05,ingreso,salario,Salario quincenal,25000,MXN
2025-01-05,ingreso,freelance,Proyecto diseño web,8000,MXN
2025-01-08,egreso,comida,Super Walmart,1850,MXN
2025-01-10,egreso,transporte,Gasolina,600,MXN
2025-01-12,egreso,entretenimiento,Netflix / Spotify,350,MXN
2025-01-15,egreso,salud,Farmacia,280,MXN
2025-01-18,egreso,ropa,Compras online,1200,MXN
2025-01-20,ingreso,salario,Salario quincenal,25000,MXN
2025-01-22,egreso,comida,Restaurante,750,MXN
2025-01-25,egreso,servicios,CFE / Telmex,980,MXN
2025-01-28,egreso,hogar,Renta,12000,MXN
2025-02-05,ingreso,salario,Salario quincenal,25000,MXN
2025-02-08,egreso,comida,Super Walmart,1620,MXN
2025-02-10,egreso,transporte,Uber,340,MXN
2025-02-14,egreso,entretenimiento,Cena San Valentín,1100,MXN
2025-02-15,ingreso,freelance,Consultoría,5000,MXN
2025-02-20,ingreso,salario,Salario quincenal,25000,MXN
2025-02-22,egreso,comida,Abarrotes,890,MXN
2025-02-25,egreso,servicios,Internet / Gas,650,MXN
2025-02-28,egreso,hogar,Renta,12000,MXN`;

export const CSV_COLUMNS = [
  { nombre: "fecha", descripcion: "Fecha en formato YYYY-MM-DD", ejemplo: "2025-01-15" },
  { nombre: "tipo", descripcion: 'Tipo de movimiento: "ingreso" o "egreso"', ejemplo: "ingreso" },
  { nombre: "categoria", descripcion: "Categoría del movimiento", ejemplo: "salario" },
  { nombre: "descripcion", descripcion: "Descripción breve del movimiento", ejemplo: "Salario quincenal" },
  { nombre: "monto", descripcion: "Monto en números (sin símbolos)", ejemplo: "25000" },
  { nombre: "moneda", descripcion: "Código de moneda (MXN, USD, etc.)", ejemplo: "MXN" },
];
