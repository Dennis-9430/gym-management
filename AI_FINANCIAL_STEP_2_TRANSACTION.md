— Lista de ingresos del día

Crear el componente:

src/components/financial/FinancialTransactionsList.tsx

## Requisitos

Esta sección debe ser una **lista de registros**, NO una tabla.

Debe seguir el estilo visual de las listas ya existentes en el sistema.

Los registros deben ordenarse por hora.

Cada registro debe mostrar:

- Hora
- Empleado
- Servicio o Producto
- Monto
- Método de pago
- Acción editar

## Detalles de campos

Hora:
hora exacta de la transacción.

Empleado:
nombre del empleado que registró la venta.

Servicio / Producto:
debe permitir múltiples conceptos.

Ejemplos:

Mensual + Agua  
Quincenal  
Diario + Bebida

Monto:

ejemplo:

$25  
$10

Debe incluir icono de Lucide:

DollarSign

Método de pago:

- efectivo
- transferencia
- mixto

Iconos sugeridos:

Efectivo → Wallet  
Transferencia → CreditCard

Debe poder editarse.

Acción:

botón con icono Lucide:

Pencil

Debe permitir editar:

- monto
- método de pago
- servicio o producto

Mantener tipado fuerte en TypeScript.

Respetar CSS existente del sistema.