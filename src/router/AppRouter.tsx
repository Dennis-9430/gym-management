import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MainLouyt from "../layouts/MainLouyt";
import RegisterClient from "../pages/clients/RegistetClient";
import FormClients from "../components/clientes/FormClients";
import ListClients from "../pages/clients/ListClients";
import DailyPayment from "../pages/payments/DailyPayment";
import Productos from "../pages/products/Products";
import Cart from "../pages/sales/Card";
import RegisterEmployee from "../pages/employees/RegisterEmployee";
import FinancialReport from "../pages/admin/FinancialReport";
import ClientProfile from "../pages/clients/ClientProfile";

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

          {/*Pagos */}
          <Route path="/payments" element={<DailyPayment />} />
          {/*Productos */}
          <Route path="/products" element={<Productos />} />
          {/*Ventas */}
          <Route path="/sales" element={<Cart />} />
          {/*registro admin */}
          <Route path="/employees" element={<RegisterEmployee />} />
          {/*admin */}

          <Route path="/financial" element={<FinancialReport />} />
          {/*perfil cliente y editar*/}
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/clients/edit/:id" element={<FormClients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
