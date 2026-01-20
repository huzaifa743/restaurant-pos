import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(username, password, tenantCode);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Restaurant POS</h1>
          <p className="text-gray-600 mt-2">Point of Sale System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant Code <span className="text-gray-500 text-xs">(Optional for super admin)</span>
            </label>
            <input
              type="text"
              value={tenantCode}
              onChange={(e) => setTenantCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter tenant code"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty if you're logging in as super admin
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common.loading') : t('common.login')}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-semibold mb-3 text-blue-900">🔐 Demo Account (For Testing)</p>
          <div className="text-left space-y-1 text-sm">
            <p className="font-medium text-blue-800">Tenant Code:</p>
            <p className="font-mono text-xs bg-white p-2 rounded border border-blue-200">DEMO</p>
            
            <p className="font-medium text-blue-800 mt-3">Username (Admin):</p>
            <p className="font-mono text-xs bg-white p-2 rounded border border-blue-200">demo</p>
            
            <p className="font-medium text-blue-800 mt-3">Password:</p>
            <p className="font-mono text-xs bg-white p-2 rounded border border-blue-200">demo123</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-medium text-blue-800 mb-2">Cashier Account:</p>
            <p className="text-xs text-blue-700">Tenant Code: <span className="font-mono">DEMO</span> | Username: <span className="font-mono">cashier</span> | Password: <span className="font-mono">cashier123</span></p>
          </div>
          
          <p className="mt-4 text-xs text-blue-600">
            ⚠️ This is a demo account with pre-loaded sample data for testing purposes only.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Demo includes: Products, Categories, Customers, and Sample Sales
          </p>
        </div>
      </div>
    </div>
  );
}
