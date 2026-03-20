import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MainLayout from "../layouts/MainLayout";
import RegisterClient from "../pages/clients/RegistetClient";
import FormClients from "../pages/clients/FormClients";
import ListClients from "../pages/clients/ListClients";
import Productos from "../pages/products/Products";
import FinancialReport from "../pages/admin/FinancialReport";
import FinancialDashboard from "../pages/admin/FinancialDashboard";
import FinancialMonthlyReport from "../pages/admin/FinancialMonthlyReport";
import ClientProfile from "../pages/clients/ClientProfile";
import EmployeesPage from "../pages/employees/EmployeesPage";
import EmployeeProfilePage from "../pages/employees/EmployeeProfilePage";
import Card from "../pages/sales/SalesPages";
import PendingSubscriptionsPage from "../pages/sales/PendingSubscriptionsPage";
import ConfigPage from "../pages/sales/ConfigPage";
import AttendancePage from "../pages/attendance/AttendancePage";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<FormClients />} />
            <Route path="/clients/register" element={<RegisterClient />} />
            <Route path="/clients/list" element={<ListClients />} />
            <Route path="/products" element={<Productos />} />
            <Route path="/sales" element={<Card />} />
            <Route path="/sales/pending" element={<PendingSubscriptionsPage />} />
            <Route path="/sales/config" element={<ConfigPage />} />
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
    </BrowserRouter>
  );
}

export default AppRouter;
