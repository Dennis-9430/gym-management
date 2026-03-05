import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MainLouyt from "../layouts/MainLouyt";
import RegistetClient from "../pages/clients/RegistetClient";
import ClientsList from "../components/ClientsRegister";
import DailyPayment from "../pages/payments/DailyPayment";
import Productos from "../pages/products/Products";
import Cart from "../pages/sales/Card";
import RegisterEmployee from "../pages/employees/RegisterEmployee";
import FinancialReport from "../pages/admin/FinancialReport";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Login */}
        <Route path="/" element={<Login />} />
        {/*rutas protegidas */}
        <Route element={<MainLouyt />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/*Clientes*/}
          <Route path="/" element={<RegistetClient />} />
          <Route path="/clients" element={<ClientsList />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
