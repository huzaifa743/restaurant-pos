import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';
import { X, Plus, Trash2 } from 'lucide-react';

export default function SplitPaymentModal({ total, onClose, onConfirm, initialSaleDate }) {
  const { t } = useTranslation();
  const { formatCurrency } = useSettings();
  const [payments, setPayments] = useState([
    { method: 'cash', amount: total }
  ]);
  const [saleDate, setSaleDate] = useState(() => initialSaleDate || new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (initialSaleDate) setSaleDate(initialSaleDate);
  }, [initialSaleDate]);

  const paymentMethods = ['cash', 'card', 'online', 'payAfterDelivery'];

  const addPayment = () => {
    setPayments([...payments, { method: 'cash', amount: 0 }]);
  };

  const removePayment = (index) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index, field, value) => {
    const updated = [...payments];
    if (field === 'amount') {
      updated[index].amount = parseFloat(value) || 0;
    } else {
      updated[index].method = value;
    }
    setPayments(updated);
  };

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remaining = total - totalPaid;
  const change = totalPaid > total ? totalPaid - total : 0;

  const handleConfirm = () => {
    if (totalPaid < total) {
      alert(`Total paid (${formatCurrency(totalPaid)}) is less than total (${formatCurrency(total)}). Please add more payments.`);
      return;
    }

    onConfirm({
      payments: payments.map(p => ({
        method: p.method,
        amount: parseFloat(p.amount) || 0
      })),
      totalPaid,
      change,
      sale_date: saleDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Split Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sale Date</label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(total)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Paid:</span>
              <span className={`text-xl font-bold ${
                totalPaid >= total ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalPaid)}
              </span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-600">Remaining:</span>
                <span className="text-lg font-semibold text-orange-600">
                  {formatCurrency(remaining)}
                </span>
              </div>
            )}
            {change > 0 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-600">Change:</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(change)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-4">
            {payments.map((payment, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <select
                    value={payment.method}
                    onChange={(e) => updatePayment(index, 'method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-2"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {t(`billing.${method}`)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={payment.amount}
                    onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    step="0.01"
                    min="0"
                  />
                </div>
                {payments.length > 1 && (
                  <button
                    onClick={() => removePayment(index)}
                    className="mt-8 p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addPayment}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={totalPaid < total}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors font-semibold ${
              totalPaid >= total
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
