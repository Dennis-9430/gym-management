import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { sections } from "../types/dashboard.section";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const filteredSections = sections.filter((section) =>
    section.roles.includes(user.role),
  );
  const handleAccess = (path: string) => {
    setTimeout(() => {
      navigate(path);
    }, 180);
  };
  return (
    <main className="dashboard">
      <div className="dashboard__container">
        <h2 className="dashboard__title">Panel Principal</h2>

        <div className="dashboard__grid">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                className="dashboard__card"
                key={section.path}
                onClick={() => handleAccess(section.path)}
                role="button"
                tabIndex={0}
              >
                <div className="dashboard__icon">
                  <Icon size={42} strokeWidth={1.8}></Icon>
                </div>
                <h3 className="dashboard__card-title">{section.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
