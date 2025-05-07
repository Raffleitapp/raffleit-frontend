import { useAuth } from '../../context/authUtils';

export function DashboardHome() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard Home</h1>
      <p>Welcome, {user.role === 'admin' ? 'Admin' : 'Host'}!</p>
    </div>
  );
}