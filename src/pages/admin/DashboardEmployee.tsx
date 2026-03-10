import { useState } from "react";
import FormEmployee from "../admin/employees/FormEmployee";
import EmployeeList from "../admin/employees/ListEmployee";

const Employees = () => {
  const [activeTab, setActiveTab] = useState<"register" | "list">("register");

  return (
    <main className="employees-container">
      <div className="tabs">
        <button
          className={activeTab === "register" ? "active-tab" : ""}
          onClick={() => setActiveTab("register")}
        >
          Registrar empleado
        </button>

        <button
          className={activeTab === "list" ? "active-tab" : ""}
          onClick={() => setActiveTab("list")}
        >
          Lista de empleados
        </button>
      </div>

      <section className="tab-content">
        {activeTab === "register" && <FormEmployee />}

        {activeTab === "list" && <EmployeeList />}
      </section>
    </main>
  );
};

export default Employees;
