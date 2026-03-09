const ClientPayments = () => {
  return (
    <div className="card card-history card-full">
      <h3>Historial de membresías</h3>
      <div className="history-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Plan</th>
              <th>Monto</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>05/03/2026</td>
              <td>Mensual</td>
              <td>$25</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientPayments;
