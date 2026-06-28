# FinBot - Tu Asistente Financiero Personal

## Que es FinBot?

FinBot es una aplicacion web de gestion financiera personal disenada para ayudarte a tomar el control de tus finanzas. Te permite registrar tus ingresos y gastos, administrar tus tarjetas de credito y prestamos personales, y recibir recomendaciones inteligentes para pagar tus deudas de la forma mas eficiente posible.

La aplicacion incluye un asistente de inteligencia artificial que responde preguntas sobre tu situacion financiera y te da consejos practicos basados en tus datos reales.

---

## Como funciona?

### 1. Registra tus movimientos

Tienes dos formas de cargar tu informacion financiera:

- **Importar un archivo CSV**: Sube un archivo con tus transacciones historicas. La app te proporciona una plantilla con el formato correcto (fecha, tipo, categoria, descripcion, monto, moneda).
- **Agregar manualmente**: Registra cada ingreso o gasto uno por uno, seleccionando la categoria, el monto y la fecha.

Categorias disponibles:
- **Ingresos**: Salario, Freelance, Inversiones, Otros
- **Gastos**: Comida, Transporte, Hogar, Entretenimiento, Salud, Educacion, Otros

### 2. Visualiza tu panorama financiero

El **Dashboard** te muestra un resumen claro de tu salud financiera:

| Metrica | Descripcion |
|---------|-------------|
| Ingresos totales | Suma de todos tus ingresos registrados |
| Gastos totales | Suma de todos tus gastos registrados |
| Balance neto | La diferencia entre ingresos y gastos |
| Deuda en tarjetas | Total de saldos pendientes en tarjetas de credito |
| Deuda en prestamos | Total de saldos pendientes en prestamos personales |

Ademas, cuentas con graficas interactivas:
- **Analisis de ingresos**: Grafica de area mensual y desglose por categoria
- **Analisis de gastos**: Grafica de barras mensual y desglose por categoria

### 3. Administra tus tarjetas de credito

Agrega cada una de tus tarjetas de credito con los siguientes datos:

- Nombre de la tarjeta
- Linea de credito total
- Saldo actual
- Tasa de interes anual
- Pago minimo
- Fecha de corte
- Fecha limite de pago

La app calcula automaticamente tu **porcentaje de utilizacion** y te ayuda a visualizar cuanto de tu credito disponible estas usando.

### 4. Administra tus prestamos personales

Registra tus prestamos o creditos personales con:

- Nombre del credito
- Numero total de pagos
- Pagos pendientes
- Monto de pago mensual fijo
- Tasa de interes anual

La app calcula el **progreso de pago**, la deuda restante estimada y el costo mensual de intereses.

### 5. Recibe una estrategia de pago optimizada

Esta es la funcion principal de FinBot. En la seccion **Prioridad de Pago**, indicas cuanto dinero tienes disponible al mes para pagar deudas y la app:

1. **Ordena todas tus deudas** (tarjetas y prestamos) de mayor a menor tasa de interes
2. **Asigna tus pagos** cubriendo primero los minimos de cada deuda
3. **Destina el excedente** a la deuda con la tasa mas alta
4. **Te muestra** cuantos meses faltan para liquidar cada deuda
5. **Calcula el ahorro** en intereses que obtienes al seguir esta estrategia

Este metodo se conoce como **Avalancha** y es la forma matematicamente optima de eliminar deudas, ya que minimiza el total de intereses que pagas.

### 6. Consulta tu calendario de pagos

El **Calendario** te muestra de forma visual:

- Fechas de corte de tus tarjetas
- Fechas limite de pago
- Dias en que recibes ingresos

Esto te permite planificar tu flujo de efectivo mes a mes y no perderte ninguna fecha importante.

### 7. Chatea con el asistente de IA

**FinChat** es un asistente conversacional que:

- Conoce toda tu informacion financiera cargada en la app
- Responde preguntas en espanol
- Te da consejos practicos y concisos
- Puede ayudarte con temas como:
  - "Cuanto gaste en comida este mes?"
  - "Cual tarjeta me conviene pagar primero?"
  - "Como puedo reducir mis gastos?"
  - "Cuanto interes estoy pagando en total?"

---

## Donde se guardan mis datos?

Toda tu informacion se almacena **localmente en tu navegador** (localStorage). Esto significa:

- Tus datos no se envian a ningun servidor externo para almacenamiento
- La informacion esta disponible solo en el dispositivo y navegador donde la cargaste
- Si borras los datos de tu navegador, la informacion se perdera

> La unica excepcion es el chat con IA, donde tu contexto financiero se envia temporalmente al servicio de inteligencia artificial para generar respuestas personalizadas.

---

## Monedas soportadas

La moneda principal es el **Peso Mexicano (MXN)**, pero puedes registrar transacciones en otras monedas como USD.

---

## Resumen rapido

```
1. Carga tus transacciones (CSV o manual)
2. Revisa tu dashboard con graficas e indicadores
3. Agrega tus tarjetas de credito y prestamos
4. Consulta la estrategia de pago optima
5. Usa el calendario para planificar pagos
6. Preguntale a FinChat cualquier duda financiera
```

---

## Preguntas frecuentes

**Necesito crear una cuenta?**
No. La app funciona directamente en tu navegador sin registro.

**Mis datos estan seguros?**
Si. Tu informacion se guarda localmente en tu dispositivo y no se almacena en servidores externos.

**Que pasa si cambio de navegador o dispositivo?**
Tendras que volver a cargar tu informacion, ya que los datos se almacenan solo en el navegador donde los registraste.

**Puedo usar la app en mi celular?**
Si. La interfaz es responsiva y se adapta a pantallas de diferentes tamanos.

**Que es el metodo Avalancha?**
Es una estrategia de pago de deudas que prioriza las deudas con la tasa de interes mas alta. Esto minimiza el total de intereses que pagas a largo plazo, permitiendote salir de deudas mas rapido.
