import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MainLouyt from "../layouts/MainLouyt";
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

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Login */}
        <Route path="/" element={<Login />} />
        {/*rutas protegidas */}
        <Route element={<MainLouyt />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/*Registro Clientes*/}
          <Route path="/clients" element={<FormClients />} />
          <Route path="/clients/register" element={<RegisterClient />} />

          <Route path="/clients/list" element={<ListClients />} />


          {/*Productos */}
          <Route path="/products" element={<Productos />} />
          {/*Ventas */}
          <Route path="/sales" element={<Card />} />
          <Route path="/sales/pending" element={<PendingSubscriptionsPage />} />

          {/*admin employee  */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeProfilePage />} />
          {/*admin */}

          <Route path="/financial" element={<FinancialReport />} />
          <Route path="/financial/dashboard" element={<FinancialDashboard />} />
          <Route path="/financial/monthly" element={<FinancialMonthlyReport />} />
          {/*perfil cliente y editar*/}
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/clients/edit/:id" element={<FormClients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
