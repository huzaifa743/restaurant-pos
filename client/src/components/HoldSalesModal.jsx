import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';
import api from '../api/api';
import toast from 'react-hot-toast';
import { X, Trash2, ShoppingCart } from 'lucide-react';

export default function HoldSalesModal({ onClose, onSelectHold }) {
  const { t } = useTranslation();
  const { formatCurrency } = useSettings();
  const [heldSales, setHeldSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeldSales();
  }, []);

  const fetchHeldSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/held-sales');
      setHeldSales(response.data);
    } catch (error) {
      console.error('Error fetching held sales:', error);
      toast.error('Failed to load held sales');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (holdId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this held sale?')) {
      return;
    }

    try {
      await api.delete(`/held-sales/${holdId}`);
      toast.success('Held sale deleted');
      fetchHeldSales();
    } catch (error) {
      console.error('Error deleting held sale:', error);
      toast.error('Failed to delete held sale');
    }
  };

  const handleSelect = (heldSale) => {
    try {
      const cartData = JSON.parse(heldSale.cart_data);
      onSelectHold(cartData, heldSale);
      onClose();
    } catch (error) {
      console.error('Error parsing cart data:', error);
      toast.error('Failed to load held sale');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Held Sales
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : heldSales.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No held sales found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {heldSales.map((heldSale) => {
                const cartData = JSON.parse(heldSale.cart_data || '[]');
                return (
                  <div
                    key={heldSale.id}
                    onClick={() => handleSelect(heldSale)}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">
                            {heldSale.hold_number}
                          </span>
                          {heldSale.customer_name && (
                            <span className="text-sm text-gray-600">
                              - {heldSale.customer_name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(heldSale.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {cartData.length} item(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(heldSale.total)}
                        </span>
                        <button
                          onClick={(e) => handleDelete(heldSale.id, e)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {heldSale.notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        Note: {heldSale.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
