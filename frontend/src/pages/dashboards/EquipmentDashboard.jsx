import LogoutButton from "../../components/LogoutButton";

function EquipmentDashboard() {
  return (
    <div>
      <h1>Equipment Manager Dashboard</h1>

      <p>Welcome to the Equipment Manager Dashboard.</p>

      <LogoutButton />

      <hr />

      <h2>Equipment Management</h2>

      <ul>
        <li>Add Equipment</li>
        <li>Update Equipment</li>
        <li>Issue Equipment</li>
        <li>Return Equipment</li>
        <li>View Equipment Transactions</li>
        <li>Check Equipment Availability</li>
      </ul>
    </div>
  );
}

export default EquipmentDashboard;