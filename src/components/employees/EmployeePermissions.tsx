import { useState } from "react";
import { Settings, Edit2, Save, X } from "lucide-react";
import type { EmployeeRole } from "../../types/employee.types";
import {
  getRolePermissions,
  type RolePermissions,
} from "../../services/employeePermissions.service";

/* Componente para ver y editar permisos de empleado por modulo */
interface Props {
  role: EmployeeRole | "GERENTE";
  isAdmin: boolean;
  employeeId: number;
  isOwnerManaging?: boolean; // true si el owner está gestionando permisos de otro
  isReadOnly?: boolean; // true si es el propio Gerente viendo sus permisos
}

const EmployeePermissions = ({ role, isAdmin, employeeId, isOwnerManaging = false, isReadOnly = false }: Props) => {
  const [permissions, setPermissions] = useState<RolePermissions>(
    getRolePermissions(role as EmployeeRole),
  );
  const [isEditing, setIsEditing] = useState(false);

  // Owner o Admin pueden editar permisos (pero no si es readOnly)
  const canEdit = (isOwnerManaging || isAdmin) && !isReadOnly;

  const handleToggle = (moduleKey: string, actionKey: string) => {
    if (!isEditing || isReadOnly) return;

    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey as keyof RolePermissions],
        actions: prev[moduleKey as keyof RolePermissions].actions.map((action) =>
          action.key === actionKey
            ? { ...action, enabled: !action.enabled }
            : action,
        ),
      },
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPermissions(getRolePermissions(role as EmployeeRole));
    setIsEditing(false);
  };

  const moduleKeys = Object.keys(permissions) as Array<keyof RolePermissions>;

  return (
    <div className="card employee-permissions">
      <div className="employee-permissions__header">
        <h3>
          <Settings size={18} />
          Permisos del Sistema
        </h3>
        {canEdit && !isEditing && (
          <button
            className="employee-permissions__edit-btn"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 size={16} />
            Editar
          </button>
        )}
      </div>

      <div className="employee-permissions__table">
        <div className="employee-permissions__row employee-permissions__row--header">
          <div className="employee-permissions__module">Módulo</div>
          {permissions.clients.actions.map((action) => (
            <div key={action.key} className="employee-permissions__action">
              {action.label}
            </div>
          ))}
        </div>

        {moduleKeys.map((moduleKey) => {
          const module = permissions[moduleKey];
          return (
            <div key={moduleKey} className="employee-permissions__row">
              <div className="employee-permissions__module">{module.module}</div>
              {module.actions.map((action) => (
                <div key={action.key} className="employee-permissions__action">
                  <label
                    className={`employee-permissions__checkbox ${
                      isEditing ? "employee-permissions__checkbox--editable" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={action.enabled}
                      onChange={() => handleToggle(moduleKey, action.key)}
                      disabled={!isEditing}
                    />
                    <span className="employee-permissions__checkmark"></span>
                  </label>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {isEditing && (
        <div className="employee-permissions__actions">
          <button className="employee-permissions__save" onClick={handleSave}>
            <Save size={16} />
            Guardar
          </button>
          <button className="employee-permissions__cancel" onClick={handleCancel}>
            <X size={16} />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeePermissions;
