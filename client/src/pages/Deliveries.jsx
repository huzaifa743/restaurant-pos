import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';
import { Package, User, MapPin, DollarSign, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

export default function Deliveries() {
  const { t } = useTranslation();
  const { formatCurrency } = useSettings();
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveryBoyFilter, setDeliveryBoyFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [settlementData, setSettlementData] = useState([]);
  const [showSettlement, setShowSettlement] = useState(false);

  useEffect(() => {
    fetchDeliveries();
    fetchDeliveryBoys();
    if (user?.role === 'admin') {
      fetchSettlement();
    }
  }, [statusFilter, deliveryBoyFilter, selectedDate, user]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (deliveryBoyFilter) params.delivery_boy_id = deliveryBoyFilter;
      if (selectedDate) params.start_date = selectedDate;
      if (selectedDate) params.end_date = selectedDate;

      const response = await api.get('/deliveries', { params });
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const response = await api.get('/deliveries/delivery-boys');
      setDeliveryBoys(response.data);
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
    }
  };

  const fetchSettlement = async () => {
    try {
      const params = { date: selectedDate };
      const response = await api.get('/deliveries/settlement', { params });
      setSettlementData(response.data);
    } catch (error) {
      console.error('Error fetching settlement:', error);
    }
  };

  const handleAssignDeliveryBoy = async (saleId, deliveryBoyId) => {
    try {
      await api.put(`/deliveries/${saleId}/assign`, { delivery_boy_id: deliveryBoyId });
      toast.success('Delivery boy assigned successfully');
      fetchDeliveries();
    } catch (error) {
      console.error('Error assigning delivery boy:', error);
      toast.error(error.response?.data?.error || 'Failed to assign delivery boy');
    }
  };

  const handleUpdateStatus = async (saleId, newStatus) => {
    try {
      await api.put(`/deliveries/${saleId}/status`, { status: newStatus });
      toast.success('Delivery status updated successfully');
      fetchDeliveries();
      if (user?.role === 'admin') {
        fetchSettlement();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleSettle = async (deliveryBoyId = null) => {
    try {
      const data = { date: selectedDate };
      if (deliveryBoyId) data.delivery_boy_id = deliveryBoyId;
      
      const response = await api.post('/deliveries/settle', data);
      toast.success(response.data.message || 'Payments settled successfully');
      fetchDeliveries();
      fetchSettlement();
    } catch (error) {
      console.error('Error settling payments:', error);
      toast.error(error.response?.data?.error || 'Failed to settle payments');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'payment_collected': return 'bg-indigo-100 text-indigo-800';
      case 'settled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'assigned': return <User className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'payment_collected': return <DollarSign className="w-4 h-4" />;
      case 'settled': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Delivery Management</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowSettlement(!showSettlement)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            {showSettlement ? 'Hide' : 'Show'} Settlement
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="payment_collected">Payment Collected</option>
              <option value="settled">Settled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Boy</label>
            <select
              value={deliveryBoyFilter}
              onChange={(e) => setDeliveryBoyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Delivery Boys</option>
              {deliveryBoys.map((boy) => (
                <option key={boy.id} value={boy.id}>
                  {boy.full_name || boy.username}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchDeliveries}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Settlement Summary (Admin Only) */}
      {showSettlement && user?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">End of Day Settlement</h2>
          {settlementData.length > 0 ? (
            <div className="space-y-4">
              {settlementData.map((settlement) => (
                <div key={settlement.delivery_boy_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {settlement.delivery_boy_full_name || settlement.delivery_boy_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Total Deliveries: {settlement.total_deliveries}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Pending Settlement</p>
                      <p className="text-xl font-bold text-primary-600">
                        {formatCurrency(settlement.pending_settlement || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Collected</p>
                      <p className="font-semibold">{formatCurrency(settlement.total_collected || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Settled</p>
                      <p className="font-semibold">{formatCurrency(settlement.total_settled || 0)}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleSettle(settlement.delivery_boy_id)}
                        disabled={!settlement.pending_settlement || settlement.pending_settlement === 0}
                        className={`w-full px-4 py-2 rounded-lg font-semibold ${
                          settlement.pending_settlement && settlement.pending_settlement > 0
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Settle Payment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => handleSettle()}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
              >
                Settle All Payments
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No settlement data for selected date</p>
          )}
        </div>
      )}

      {/* Deliveries List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : deliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Boy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{delivery.sale_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {delivery.customer_name || 'Walk-in'}
                      {delivery.customer_phone && (
                        <div className="text-xs text-gray-400">{delivery.customer_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {delivery.delivery_boy_name ? (
                        <span>{delivery.delivery_boy_full_name || delivery.delivery_boy_name}</span>
                      ) : (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignDeliveryBoy(delivery.id, e.target.value);
                            }
                          }}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="">Assign...</option>
                          {deliveryBoys.map((boy) => (
                            <option key={boy.id} value={boy.id}>
                              {boy.full_name || boy.username}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {delivery.customer_address && (
                        <div>
                          <div>{delivery.customer_address}</div>
                          {delivery.customer_city && (
                            <div className="text-xs text-gray-400">{delivery.customer_city}</div>
                          )}
                        </div>
                      )}
                      {!delivery.customer_address && <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(delivery.total)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.delivery_status)}`}>
                        {getStatusIcon(delivery.delivery_status)}
                        {delivery.delivery_status?.replace('_', ' ') || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(delivery.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        {delivery.delivery_status === 'pending' && delivery.delivery_boy_id && (
                          <button
                            onClick={() => handleUpdateStatus(delivery.id, 'out_for_delivery')}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                          >
                            Mark Out for Delivery
                          </button>
                        )}
                        {delivery.delivery_status === 'out_for_delivery' && (
                          <button
                            onClick={() => handleUpdateStatus(delivery.id, 'delivered')}
                            className="text-green-600 hover:text-green-700 text-xs"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {delivery.delivery_status === 'delivered' && (
                          <button
                            onClick={() => handleUpdateStatus(delivery.id, 'payment_collected')}
                            className="text-indigo-600 hover:text-indigo-700 text-xs"
                          >
                            Mark Payment Collected
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No deliveries found</p>
          </div>
        )}
      </div>
    </div>
  );
}
