export interface ModulePermission {
  module: string;
  actions: PermissionAction[];
}

export interface PermissionAction {
  key: string;
  label: string;
  enabled: boolean;
}

export interface RolePermissions {
  clients: ModulePermission;
  employees: ModulePermission;
  products: ModulePermission;
  sales: ModulePermission;
  reports: ModulePermission;
  config: ModulePermission;
}

const defaultPermissions: RolePermissions = {
  clients: {
    module: "Módulo Clientes",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: true },
      { key: "delete", label: "Eliminar", enabled: true },
    ],
  },
  employees: {
    module: "Módulo Empleados",
    actions: [
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: false },
    ],
  },
  products: {
    module: "Módulo Productos",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: true },
      { key: "delete", label: "Eliminar", enabled: true },
    ],
  },
  sales: {
    module: "Módulo Ventas",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: true },
    ],
  },
  reports: {
    module: "Módulo Reportes",
    actions: [
      { key: "read", label: "Ver", enabled: true },
      { key: "export", label: "Exportar", enabled: false },
    ],
  },
  config: {
    module: "Módulo Configuración",
    actions: [
      { key: "access", label: "Acceso", enabled: false },
    ],
  },
};

const adminPermissions: RolePermissions = {
  clients: {
    module: "Módulo Clientes",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: true },
      { key: "delete", label: "Eliminar", enabled: true },
    ],
  },
  employees: {
    module: "Módulo Empleados",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: true },
      { key: "delete", label: "Eliminar", enabled: true },
    ],
  },
  products: {
    module: "Módulo Productos",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: true },
      { key: "delete", label: "Eliminar", enabled: true },
    ],
  },
  sales: {
    module: "Módulo Ventas",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: true },
      { key: "delete", label: "Eliminar", enabled: true },
    ],
  },
  reports: {
    module: "Módulo Reportes",
    actions: [
      { key: "read", label: "Ver", enabled: true },
      { key: "export", label: "Exportar", enabled: true },
    ],
  },
  config: {
    module: "Módulo Configuración",
    actions: [
      { key: "access", label: "Acceso", enabled: true },
    ],
  },
};

const receptionistPermissions: RolePermissions = {
  clients: {
    module: "Módulo Clientes",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: true },
      { key: "delete", label: "Eliminar", enabled: false },
    ],
  },
  employees: {
    module: "Módulo Empleados",
    actions: [
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: false },
    ],
  },
  products: {
    module: "Módulo Productos",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: true },
      { key: "delete", label: "Eliminar", enabled: false },
    ],
  },
  sales: {
    module: "Módulo Ventas",
    actions: [
      { key: "create", label: "Crear", enabled: true },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: false },
    ],
  },
  reports: {
    module: "Módulo Reportes",
    actions: [
      { key: "read", label: "Ver", enabled: true },
      { key: "export", label: "Exportar", enabled: false },
    ],
  },
  config: {
    module: "Módulo Configuración",
    actions: [
      { key: "access", label: "Acceso", enabled: false },
    ],
  },
};

const trainerPermissions: RolePermissions = {
  clients: {
    module: "Módulo Clientes",
    actions: [
      { key: "create", label: "Crear", enabled: false },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: false },
      { key: "delete", label: "Eliminar", enabled: false },
    ],
  },
  employees: {
    module: "Módulo Empleados",
    actions: [
      { key: "read", label: "Ver", enabled: false },
      { key: "update", label: "Editar", enabled: false },
    ],
  },
  products: {
    module: "Módulo Productos",
    actions: [
      { key: "create", label: "Crear", enabled: false },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: false },
      { key: "delete", label: "Eliminar", enabled: false },
    ],
  },
  sales: {
    module: "Módulo Ventas",
    actions: [
      { key: "create", label: "Crear", enabled: false },
      { key: "read", label: "Ver", enabled: true },
      { key: "update", label: "Editar", enabled: false },
    ],
  },
  reports: {
    module: "Módulo Reportes",
    actions: [
      { key: "read", label: "Ver", enabled: false },
      { key: "export", label: "Exportar", enabled: false },
    ],
  },
  config: {
    module: "Módulo Configuración",
    actions: [
      { key: "access", label: "Acceso", enabled: false },
    ],
  },
};

export const getRolePermissions = (role: string) => {
  switch (role) {
    case "ADMIN":
      return adminPermissions;
    case "RECEPCIONISTA":
      return receptionistPermissions;
    case "ENTRENADOR":
      return trainerPermissions;
    default:
      return defaultPermissions;
  }
};

export { adminPermissions, receptionistPermissions, trainerPermissions, defaultPermissions };
