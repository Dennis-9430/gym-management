/*
 * Script de migración de datos localStorage → MongoDB
 * 
 * USO:
 * 1. Abre el frontend: http://localhost:5173
 * 2. Inicia sesión como tenant:
 *    - Email: pinzonfabricio9430@gmail.com
 *    - Password: adminKa123
 * 3. Abre la consola (F12 → Console)
 * 4. Copia y pega este script completo
 * 5. Ejecuta: migrateAllData()
 */

const API_BASE = "http://localhost:8004";

/* Obtiene el token del tenant desde localStorage */
const getTenantToken = () => localStorage.getItem("tenantToken");

/* Obtiene el tenantId desde localStorage */
const getTenantData = () => {
  const data = localStorage.getItem("tenant");
  return data ? JSON.parse(data) : null;
};

/* Lee datos de localStorage */
const readLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

/* Lee un solo item de localStorage */
const readLocalStorageItem = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

/* Migra clientes */
const migrateClients = async (token, tenantId) => {
  const clients = readLocalStorage("gym-management.clients");
  if (!clients.length) {
    console.log("ℹ️ No hay clientes en localStorage");
    return 0;
  }
  
  console.log(`📦 Migrando ${clients.length} clientes...`);
  
  let migrated = 0;
  for (const client of clients) {
    try {
      const response = await fetch(`${API_BASE}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenantId,
          documentType: client.documentType || "CEDULA",
          documentNumber: client.documentNumber,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone || "",
          email: client.email || "",
          address: client.address || "",
          emergencyContact: client.emergencyContact || "",
          emergencyPhone: client.emergencyPhone || "",
          notes: client.notes || "",
          membership: client.memberShip || "Por registrar",
          membershipStatus: client.memberShipStatus || "NONE",
          fingerPrint: client.fingerPrint || false,
        }),
      });
      
      if (response.ok) {
        migrated++;
      } else {
        const error = await response.json();
        console.warn(`⚠️ ${client.firstName} ${client.lastName}: ${error.detail}`);
      }
    } catch (e) {
      console.error(`❌ Error: ${client.firstName}:`, e.message);
    }
  }
  
  console.log(`✅ ${migrated}/${clients.length} clientes`);
  return migrated;
};

/* Migra empleados */
const migrateEmployees = async (token, tenantId) => {
  const employees = readLocalStorage("gym-management.employees");
  if (!employees.length) {
    console.log("ℹ️ No hay empleados en localStorage");
    return 0;
  }
  
  console.log(`📦 Migrando ${employees.length} empleados...`);
  
  let migrated = 0;
  for (const emp of employees) {
    try {
      const response = await fetch(`${API_BASE}/api/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenantId,
          documentNumber: emp.documentNumber,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone || "",
          address: emp.address || "",
          notes: emp.notes || "",
          username: emp.username,
          password: emp.password,
          role: emp.role || "RECEPCIONISTA",
          status: emp.status || "ACTIVE",
        }),
      });
      
      if (response.ok) {
        migrated++;
      } else {
        const error = await response.json();
        console.warn(`⚠️ ${emp.firstName} ${emp.lastName}: ${error.detail}`);
      }
    } catch (e) {
      console.error(`❌ Error: ${emp.firstName}:`, e.message);
    }
  }
  
  console.log(`✅ ${migrated}/${employees.length} empleados`);
  return migrated;
};

/* Migra productos */
const migrateProducts = async (token, tenantId) => {
  const products = readLocalStorage("gym-management.products");
  if (!products.length) {
    console.log("ℹ️ No hay productos en localStorage");
    return 0;
  }
  
  console.log(`📦 Migrando ${products.length} productos...`);
  
  let migrated = 0;
  for (const prod of products) {
    try {
      const response = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenantId,
          code: prod.code,
          name: prod.name,
          description: prod.description || "",
          category: prod.category,
          unitPrice: prod.unitPrice,
          stock: prod.quantity || 0,
          minStock: prod.minStock || 0,
        }),
      });
      
      if (response.ok) {
        migrated++;
      } else {
        const error = await response.json();
        console.warn(`⚠️ ${prod.name}: ${error.detail}`);
      }
    } catch (e) {
      console.error(`❌ Error: ${prod.name}:`, e.message);
    }
  }
  
  console.log(`✅ ${migrated}/${products.length} productos`);
  return migrated;
};

/* Migra ventas */
const migrateSales = async (token, tenantId) => {
  const sales = readLocalStorage("gym-management.sales");
  if (!sales.length) {
    console.log("ℹ️ No hay ventas en localStorage");
    return 0;
  }
  
  console.log(`📦 Migrando ${sales.length} ventas...`);
  
  let migrated = 0;
  for (const sale of sales) {
    try {
      const response = await fetch(`${API_BASE}/api/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenantId,
          createdAt: sale.createdAt,
          items: sale.items,
          totals: sale.totals,
          client: sale.client,
          payment: sale.payment,
          voucherCode: sale.voucherCode || "",
          createdBy: sale.createdBy || "Sistema",
        }),
      });
      
      if (response.ok) {
        migrated++;
      } else {
        const error = await response.json();
        console.warn(`⚠️ Venta ${sale.id}: ${error.detail}`);
      }
    } catch (e) {
      console.error(`❌ Error: ${sale.id}:`, e.message);
    }
  }
  
  console.log(`✅ ${migrated}/${sales.length} ventas`);
  return migrated;
};

/* Función principal */
const migrateAllData = async () => {
  const token = getTenantToken();
  if (!token) {
    console.error("❌ No hay sesión de tenant.");
    console.log("💡 Pasos:");
    console.log("   1. Ve a http://localhost:5173/login");
    console.log("   2. Email: pinzonfabricio9430@gmail.com");
    console.log("   3. Password: adminKa123");
    console.log("   4. Luego ejecuta migrateAllData()");
    return;
  }
  
  const tenant = getTenantData();
  const tenantId = tenant?.tenantId || "demo-gym-001";
  console.log(`🚀 Migrando datos para tenant: ${tenantId}`);
  console.log("=".repeat(40));
  
  await migrateClients(token, tenantId);
  await migrateEmployees(token, tenantId);
  await migrateProducts(token, tenantId);
  await migrateSales(token, tenantId);
  
  console.log("=".repeat(40));
  console.log("🎉 ¡Migración completada!");
};

/* Muestra datos disponibles */
const showLocalStorageKeys = () => {
  console.log("📋 Datos en localStorage:");
  const keys = [
    "gym-management.clients",
    "gym-management.employees", 
    "gym-management.products",
    "gym-management.sales",
    "gym-management.config"
  ];
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const count = Array.isArray(parsed) ? parsed.length : 1;
        console.log(`  ✓ ${key}: ${count} items`);
      } catch {
        console.log(`  ? ${key}: (error al parsear)`);
      }
    } else {
      console.log(`  ✗ ${key}: (vacío)`);
    }
  });
};

/* Auto-ejecutar */
console.log("📝 Herramienta de migración lista.");
console.log("💡 showLocalStorageKeys() - Ver datos disponibles");
console.log("💡 migrateAllData() - Ejecutar migración");
console.log("💡 IMPORTANTE: Primero inicia sesión como ADMIN en el frontend");