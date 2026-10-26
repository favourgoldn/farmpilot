import { Building, Phone, Mail, MapPin, DollarSign, X } from 'lucide-react';
import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { BuyerCategory, Customer } from '../../types/farm';

interface CustomerModalProps {
  onClose: () => void;
  customerToEdit?: Customer | null;
}

const NIGERIAN_STATES = [
  'Oyo State',
  'Lagos State',
  'Ogun State',
  'Osun State',
  'Ondo State',
  'Ekiti State',
  'Kano State',
  'Kaduna State',
  'Plateau State',
  'Benue State',
  'Niger State',
  'Abuja FCT',
  'Kwara State',
  'Edo State',
  'Delta State',
  'Rivers State',
  'Anambra State',
  'Enugu State',
  'Imo State',
  'Abia State',
];

const COMMON_MARKET_HUBS = [
  'Mile 12 International Market, Lagos',
  'Dawanau Grain Market, Kano',
  'Bodija International Market, Ibadan',
  'Alaba Rago Commodity Market, Lagos',
  'Oyingbo Market, Lagos',
  'Ketu Fruit & Veg Market, Lagos',
  'Jos Commodity Depot, Plateau',
  'Wadata Market, Makurdi, Benue',
  'Gombe Grain Hub, Gombe',
  'Onitsha Main Market, Anambra',
  'Direct Industrial Factory Gate / Silo Intake',
];

export const CustomerModal: React.FC<CustomerModalProps> = ({
  onClose,
  customerToEdit,
}) => {
  const { addCustomer, updateCustomer } = useFarm();

  const [formData, setFormData] = useState({
    name: customerToEdit?.name || '',
    buyerType: (customerToEdit?.buyerType || 'Off-taker Processor') as BuyerCategory,
    contactPerson: customerToEdit?.contactPerson || '',
    phone: customerToEdit?.phone || '',
    email: customerToEdit?.email || '',
    address: customerToEdit?.address || '',
    state: customerToEdit?.state || 'Oyo State',
    marketHub: customerToEdit?.marketHub || 'Mile 12 International Market, Lagos',
    paymentTerms:
      customerToEdit?.paymentTerms || ('14 Days Net' as Customer['paymentTerms']),
    creditLimit: customerToEdit?.creditLimit ? customerToEdit.creditLimit.toString() : '10000000',
    status: (customerToEdit?.status || 'active') as 'active' | 'inactive',
    notes: customerToEdit?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    if (customerToEdit) {
      await updateCustomer(customerToEdit.id, {
        name: formData.name.trim(),
        buyerType: formData.buyerType,
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        state: formData.state,
        marketHub: formData.marketHub,
        paymentTerms: formData.paymentTerms,
        creditLimit: parseFloat(formData.creditLimit) || 0,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      });
    } else {
      await addCustomer({
        name: formData.name.trim(),
        buyerType: formData.buyerType,
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        state: formData.state,
        marketHub: formData.marketHub,
        paymentTerms: formData.paymentTerms,
        creditLimit: parseFloat(formData.creditLimit) || 0,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a19]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-[#181a19]/10 max-w-lg w-full overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#181a19]/10 bg-[#fafaf7]">
          <div>
            <h3 className="text-sm font-bold text-[#181a19]">
              {customerToEdit ? 'Edit Customer / Off-taker' : 'Register New Customer / Off-taker'}
            </h3>
            <p className="text-xs text-[#181a19]/60">
              Manage commodity off-takers, aggregators, trade terms, and credit limits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#181a19]/40 hover:text-[#181a19] p-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#181a19]/80 mb-1">
              Customer / Off-taker Business Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Premier Feed Mills Plc or Alhaji Danladi Produce"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Buyer Classification *
              </label>
              <select
                value={formData.buyerType}
                onChange={(e) =>
                  setFormData({ ...formData, buyerType: e.target.value as BuyerCategory })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Off-taker Processor">Off-taker Processor (Industrial / Mill)</option>
                <option value="Wholesale Aggregator">Wholesale Aggregator (Commodity Hub)</option>
                <option value="Open Market Trader">Open Market Trader</option>
                <option value="Retail Buyer">Retail Buyer / Direct</option>
                <option value="Export Merchant">Export Commodity Merchant</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                placeholder="e.g. Engr. Segun Adeleke"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+234 803 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="buyer@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Primary Trading State
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Commodity Market Hub
              </label>
              <select
                value={formData.marketHub}
                onChange={(e) => setFormData({ ...formData, marketHub: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                {COMMON_MARKET_HUBS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#181a19]/80 mb-1">
              Delivery Warehouse / Factory Address
            </label>
            <input
              type="text"
              placeholder="e.g. Plot 12, Oluyole Industrial Layout, Ibadan"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Agreed Payment Terms
              </label>
              <select
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentTerms: e.target.value as Customer['paymentTerms'],
                  })
                }
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
              >
                <option value="Cash on Delivery">Cash on Delivery / Gate Clearance</option>
                <option value="7 Days Net">7 Days Net</option>
                <option value="14 Days Net">14 Days Net</option>
                <option value="30 Days Net">30 Days Net</option>
                <option value="50% Advance & Balance on Delivery">50% Advance & Balance on Delivery</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#181a19]/80 mb-1">
                Credit Limit (Naira ₦)
              </label>
              <input
                type="number"
                min="0"
                step="100000"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#181a19]/80 mb-1">
              Commodity Specifications & Buyer Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Yellow maize 12.5% max moisture, aflatoxin compliant, bagged in clean sacks."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#fafaf7] border border-[#181a19]/15 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#181a19]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#181a19]/60 hover:text-[#181a19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
            >
              {customerToEdit ? 'Save Changes' : 'Register Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
