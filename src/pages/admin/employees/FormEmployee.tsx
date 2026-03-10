import useEmployeeForm from "../../../hooks/useEmployeeHook";
import PersonFields from "../../../components/formClients/PersonalDataFields";
import ContactFields from "../../../components/formClients/ContactFields";
import EmployeePermissions from "../../../components/formEmployee/EmployeePermissions";
import { useNavigate } from "react-router-dom";

const FormEmployee = () => {
  const { form, updateField, resetForm } = useEmployeeForm();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("empleado", form);

    resetForm();
    navigate("/employees");
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };
  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Registrar empleado</h2>

        <form className="register-form" onSubmit={handleSubmit}>
          <PersonFields form={form} updateField={updateField} />
          <ContactFields form={form} updateField={updateField} />
          <EmployeePermissions form={form} updateField={updateField} />

          <div className="form-buttons">
            <button type="submit" className="btn-register">
              Registrar
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="btn-register"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEmployee;
