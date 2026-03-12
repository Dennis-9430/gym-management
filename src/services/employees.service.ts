import type { Employee, EmployeeInput, EmployeeUpdate } from "../types/employee.types";

const STORAGE_KEY = "gym-management.employees";

const seedEmployees: Employee[] = [
  {
    id: 1,
    documentNumber: "0102030405",
    firstName: "Admin",
    lastName: "Sistema",
    email: "admin@gym.com",
    phone: "099999999",
    address: "Direccion admin",
    notes: "",
    password: "admin123",
    role: "ADMIN",
    status: "ACTIVO",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    documentNumber: "0203040506",
    firstName: "Carla",
    lastName: "Recepcion",
    email: "recepcion@gym.com",
    phone: "098888888",
    address: "Direccion recepcion",
    notes: "",
    password: "recep123",
    role: "RECEPCIONISTA",
    status: "ACTIVO",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    documentNumber: "0304050607",
    firstName: "Luis",
    lastName: "Trainer",
    email: "trainer@gym.com",
    phone: "097777777",
    address: "Direccion entrenador",
    notes: "",
    password: "trainer123",
    role: "ENTRENADOR",
    status: "INACTIVO",
    createdAt: new Date().toISOString(),
  },
];

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const withDefaults = (employee: Employee): Employee => {
  return {
    notes: "",
    phone: "",
    address: "",
    documentNumber: "",
    ...employee,
  };
};

const loadEmployees = (): Employee[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEmployees));
    return seedEmployees;
  }

  try {
    const parsed = JSON.parse(raw) as Employee[];
    if (!Array.isArray(parsed)) {
      return seedEmployees;
    }
    return parsed.map((employee) => withDefaults(employee));
  } catch {
    return seedEmployees;
  }
};

const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
};

export const getEmployees = (): Employee[] => {
  const employees = loadEmployees();
  return [...employees].sort((a, b) => a.id - b.id);
};

export const getEmployeeById = (id: number): Employee | null => {
  const employees = loadEmployees();
  return employees.find((e) => e.id === id) ?? null;
};

export const createEmployee = (input: EmployeeInput): Employee => {
  const employees = loadEmployees();
  const email = normalizeEmail(input.email);

  if (employees.some((e) => normalizeEmail(e.email) === email)) {
    throw new Error("El email ya existe");
  }

  const nextId = employees.length
    ? Math.max(...employees.map((e) => e.id)) + 1
    : 1;

  const employee: Employee = {
    id: nextId,
    createdAt: new Date().toISOString(),
    ...input,
    email,
  };

  const updated = [...employees, employee];
  saveEmployees(updated);
  return employee;
};

export const updateEmployee = (
  id: number,
  update: EmployeeUpdate,
): Employee => {
  const employees = loadEmployees();
  const index = employees.findIndex((e) => e.id === id);

  if (index === -1) {
    throw new Error("Empleado no encontrado");
  }

  if (update.email) {
    const email = normalizeEmail(update.email);
    const emailUsed = employees.some(
      (e) => e.id !== id && normalizeEmail(e.email) === email,
    );
    if (emailUsed) {
      throw new Error("El email ya existe");
    }
  }

  const updatedEmployee: Employee = {
    ...employees[index],
    ...update,
    email: update.email ? normalizeEmail(update.email) : employees[index].email,
  };

  const updatedEmployees = [...employees];
  updatedEmployees[index] = updatedEmployee;
  saveEmployees(updatedEmployees);

  return updatedEmployee;
};

export const deleteEmployee = (id: number) => {
  const employees = loadEmployees();
  const updatedEmployees = employees.filter((e) => e.id !== id);
  saveEmployees(updatedEmployees);
};
