# STEP 5 — Mejoras y ajustes del módulo financiero

Aplicar las siguientes mejoras al módulo financiero existente.  
No volver a analizar todo el proyecto, trabajar únicamente con los componentes del módulo **financial**.

Mantener:

- React + TypeScript
- CSS actual del sistema
- iconos usando la librería Lucide
- tipado fuerte
- componentes reutilizables

---

# 1 Cambiar nombre del dashboard

La sección anteriormente llamada:

Ver Dashboard Financiero

debe cambiar su nombre a:

Estadísticas

Actualizar:

- textos
- rutas
- botones
- títulos de página

---

# 2 Cambios en la tabla resumen del día

Modificar el componente:

src/components/financial/FinancialSummaryTable.tsx

Agregar una nueva columna:

Empleado

Esta columna debe mostrar **qué empleado generó esos ingresos**.

Las columnas finales deben quedar:

- Empleado
- Servicios
- Bar
- Efectivo
- Transferencia
- Total

Mantener el mismo estilo de tabla usado en el sistema.

---

# 3 Cambios en la lista de transacciones del día

Modificar el componente:

src/components/financial/FinancialTransactionsList.tsx

Cuando la lista sea muy grande debe activarse **scroll vertical**.

Requisitos:

- definir una altura máxima
- usar overflow-y: auto
- mantener el diseño actual del sistema

---

# 4 Cambiar posición del botón de estadísticas

Mover el botón que abre **Estadísticas**.

Nueva posición:

esquina superior derecha de la sección.

Debe estar **encima del Transaciones del Dia**.

El botón debe mantener icono de Lucide:

BarChart3

---

# 5 Botón para volver atrás

En la página:

src/pages/admin/FinancialDashboard.tsx

Agregar botón para volver atrás.

Debe comportarse igual que el botón usado en:

ClientProfile.tsx

Icono sugerido de Lucide:

ArrowLeft

---

# 6 Contenido de la página Estadísticas

La página **Estadísticas** debe mostrar:

## 1 Resumen del día

Mostrar la tabla de resumen financiero.

## 2 Tabla pequeña de transferencias por empleado

Debajo del resumen agregar una tabla pequeña.

Columnas:

- Nombre del empleado
- transferencias

Cada fila representa un empleado y se mostrara el numero de la transeferencia este numero
seria un link que abrira una imagen

---

# 7 Cambios en los gráficos

Modificar gráficos existentes.

Gráfico de barras:

ANTES  
Ingresos mensuales

AHORA  
Ingresos semanales

Archivo:

FinancialBarChart.tsx

---

El gráfico de línea:

FinancialLineChart.tsx

Debe seguir mostrando:

tendencia de ingresos.

---

# 8 Guardar reportes financieros

Los reportes mostrados en **Estadísticas** deben guardarse en la base de datos.

Información a almacenar:

- fecha del reporte
- total de ingresos
- ingresos por servicio
- ingresos por bar
- ingresos por empleado
- número de transferencias por empleado

Mantener tipado fuerte con TypeScript.

---

# Objetivo final

El módulo financiero debe permitir:

- registrar transacciones del día
- ver resumen financiero
- consultar estadísticas
- visualizar gráficos
- guardar reportes financieros
