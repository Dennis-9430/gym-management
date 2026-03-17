# 🧠 Rol
Actúa como un **Senior Frontend Engineer + UI/UX Designer experto en dashboards SaaS modernos con React, TypeScript y TailwindCSS**.

# 🎯 Objetivo
Rediseñar el dashboard del sistema "Gym Management" mejorando:
- experiencia de usuario (UX)
- consistencia visual (UI)
- accesibilidad
- arquitectura de componentes

# 📸 Contexto actual

El dashboard contiene módulos como:
- Registro de Pago
- Usuarios
- Productos
- Ventas
- Registrar Personal
- Reporte Financiero

Actualmente:
- Las cards son clickeables completas ❌
- No hay separación clara entre acción y visual
- UX puede causar errores (clics accidentales)
- Diseño es básico, aunque ordenado

# 🚨 Problema principal
Las acciones están ligadas a toda la card.

Esto genera:
- mala accesibilidad
- mala experiencia en mobile
- falta de control del usuario

# ✅ Requisito clave

❗ SOLO el botón debe ejecutar acciones  
❗ La card NO debe ser clickeable  

# 🔧 Tareas

## 1. 🎨 Rediseño visual
- Cards modernas tipo SaaS:
  - border-radius: 16px+
  - sombras suaves
  - fondo limpio
- Icono centrado arriba
- Título claro
- Botón en la parte inferior

## 2. 🧠 UX correcta
- Card = contenedor visual (NO interactivo)
- Botón = única acción
- Hover:
  - card: efecto leve (shadow/scale)
  - botón: feedback claro

## 3. 🧩 Estructura del componente

Crear componente reutilizable:

### DashboardCard props:
- title: string
- icon: ReactNode
- description?: string
- buttonLabel: string
- onClick: () => void

## 4. ⚛️ Arquitectura (IMPORTANTE)

- UI desacoplada de lógica
- Cards generadas desde un array (data-driven)
- Evitar hardcode

Ejemplo:

```ts
const dashboardItems = [
  {
    title: "Usuarios",
    buttonLabel: "Abrir",
    action: () => navigate("/users"),
  }
];