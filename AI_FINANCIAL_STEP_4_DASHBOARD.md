# STEP 4 — Dashboard financiero y página principal

## Botón de acceso al dashboard

Crear componente:

src/components/financial/FinancialDashboardButton.tsx

Texto del botón:

Ver Dashboard Financiero

Debe incluir icono Lucide:

BarChart3

Ruta al hacer click:

/financial/dashboard

Debe colocarse debajo de la tabla resumen.

---

# Dashboard financiero

Crear página:

src/pages/admin/FinancialDashboard.tsx

Las gráficas deben crearse usando la librería:

recharts

## Gráfico 1

FinancialBarChart.tsx

Tipo:

gráfico de barras.

Debe mostrar ingresos mensuales.

Ejemplo:

Enero  
Febrero  
Marzo  
Abril

Cada barra representa ingresos del mes.

---

## Gráfico 2

FinancialLineChart.tsx

Tipo:

gráfico de línea.

Debe mostrar tendencia de ingresos.

Debe usar los mismos datos mensuales.

---

# Página principal del módulo

Crear:

src/pages/admin/FinancialReport.tsx

Debe incluir:

1 Lista de ingresos del día  
2 Tabla resumen  
3 Botón para abrir el dashboard

El diseño debe ser:

- limpio
- responsivo
- consistente con el CSS del sistema
- tipado fuerte en TypeScript