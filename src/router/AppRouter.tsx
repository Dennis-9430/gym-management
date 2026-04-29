/* Router principal con lazy loading para code splitting */
/* Relacionado con: vite.config.ts, pages/* */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../layouts/MainLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

// Páginas con lazy loading para code splitting
// Relacionado con: vite.config.ts (manualChunks)
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Renew = lazy(() => import("../pages/Renew"));
const Terms = lazy(() => import("../pages/Terms"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const FormClients = lazy(() => import("../pages/clients/FormClients"));
const RegisterClient = lazy(() => import("../pages/clients/RegistetClient"));
const ListClients = lazy(() => import("../pages/clients/ListClients"));
const ClientProfile = lazy(() => import("../pages/clients/ClientProfile"));
const Productos = lazy(() => import("../pages/products/Products"));
const SalesPages = lazy(() => import("../pages/sales/SalesPages"));
const PendingSubscriptionsPage = lazy(() => import("../pages/sales/PendingSubscriptionsPage"));
const ConfigPage = lazy(() => import("../pages/sales/ConfigPage"));
const InvoiceListPage = lazy(() => import("../pages/sales/InvoiceListPage"));
const SalesListPage = lazy(() => import("../pages/sales/SalesListPage"));
const EmployeesPage = lazy(() => import("../pages/employees/EmployeesPage"));
const EmployeeProfilePage = lazy(() => import("../pages/employees/EmployeeProfilePage"));
const FinancialReport = lazy(() => import("../pages/admin/FinancialReport"));
const FinancialDashboard = lazy(() => import("../pages/admin/FinancialDashboard"));
const FinancialMonthlyReport = lazy(() => import("../pages/admin/FinancialMonthlyReport"));
const AttendancePage = lazy(() => import("../pages/attendance/AttendancePage"));

// Loading fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: '#64748b'
  }}>
    Cargando...
  </div>
);

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/renew" element={<Renew />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clients" element={<FormClients />} />
              <Route path="/clients/register" element={<RegisterClient />} />
              <Route path="/clients/list" element={<ListClients />} />
              <Route path="/products" element={<Productos />} />
              <Route path="/sales" element={<SalesPages />} />
              <Route path="/sales/pending" element={<PendingSubscriptionsPage />} />
              <Route path="/sales/config" element={<ConfigPage />} />
              <Route path="/sales/list" element={<SalesListPage />} />
              <Route path="/sales/invoices" element={<InvoiceListPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/employees/:id" element={<EmployeeProfilePage />} />
              <Route path="/financial" element={<FinancialReport />} />
              <Route path="/financial/dashboard" element={<FinancialDashboard />} />
              <Route path="/financial/monthly" element={<FinancialMonthlyReport />} />
              <Route path="/clients/:id" element={<ClientProfile />} />
              <Route path="/clients/edit/:id" element={<FormClients />} />
              <Route path="/attendance" element={<AttendancePage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;