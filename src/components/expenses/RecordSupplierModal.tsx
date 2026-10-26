import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, CreditCard, Star, FileText } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Modal } from '../common/Modal';
import { Supplier, SupplierCategory } from '../../types/farm';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

interface RecordSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}

export const RecordSupplierModal: React.FC<RecordSupplierModalProps> = ({
  isOpen,
  onClose,
  supplierToEdit,
}) => {
  const { addSupplier, updateSupplier } = useFarm();

  const [formData, setFormData] = useState({
    name: supplierToEdit?.name || '',
    category: (supplierToEdit?.category || 'Fertilizer & Chemicals') as SupplierCategory,
    contactPerson: supplierToEdit?.contactPerson || '',
    phone: supplierToEdit?.phone || '',
    email: supplierToEdit?.email || '',
    address: supplierToEdit?.address || '',
    state: supplierToEdit?.state || 'Oyo State',
    paymentTerms: supplierToEdit?.paymentTerms || ('Net 30 Days' as const),
    rating: supplierToEdit?.rating || 5,
    status: (supplierToEdit?.status || 'active') as 'active' | 'inactive',
    bankName: supplierToEdit?.bankName || '',
    accountNumber: supplierToEdit?.accountNumber || '',
    accountName: supplierToEdit?.accountName || '',
    notes: supplierToEdit?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.phone) return;

    if (supplierToEdit) {
      await updateSupplier(supplierToEdit.id, formData);
    } else {
      await addSupplier(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplierToEdit ? 'Edit Supplier Profile' : 'Register Agricultural Supplier'}
      subtitle="Onboard vetted input dealers, tractor contractors, and farm service partners"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Supplier / Company Name *
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Seed Co Nigeria West Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Primary Supply Sector *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as SupplierCategory })
              }
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              <option value="Fertilizer & Chemicals">Fertilizer & Chemicals (NPK, Urea, Crop Protection)</option>
              <option value="Seeds & Seedlings">Seeds & Certified Seedlings</option>
              <option value="Machinery & Tractor Hire">Machinery, Tractor & Tillage Hire</option>
              <option value="Labor & Farm Hands">Labor & Farm Hands Cooperative</option>
              <option value="Fuel & Utilities">Fuel, Diesel (AGO) & Lubricants</option>
              <option value="Packaging & Logistics">Packaging, Crates & Haulage Transport</option>
              <option value="Irrigation & Hardware">Irrigation Hardware, Drip & Borehole Parts</option>
              <option value="General Farm Inputs">General Farm Inputs & Consumables</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Key Contact Person *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Engr. Kunle Alabi"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Phone Number (WhatsApp / Direct) *
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="+234 803 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="sales@supplier.ng"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Physical Depot / Office Address
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-[#181a19]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Plot 4 Commercial Agro Layout, New Ife Road"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Nigerian State
            </label>
            <select
              value={formData.state.replace(' State', '')}
              onChange={(e) => setFormData({ ...formData, state: `${e.target.value} State` })}
              className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
            >
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state} State
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Commercial Payment Terms */}
        <div className="p-3 bg-[#fafaf7] rounded-xl border border-[#181a19]/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#181a19]">
            <CreditCard className="w-3.5 h-3.5 text-[#16422b]" />
            <span>Commercial Terms & Settlement Account</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-[#181a19]/70 mb-1">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTerms: e.target.value as typeof formData.paymentTerms })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-[#181a19]/15 rounded-lg text-xs"
              >
                <option value="Cash on Delivery">Cash on Delivery (Immediate)</option>
                <option value="Net 15 Days">Net 15 Days Credit</option>
                <option value="Net 30 Days">Net 30 Days Credit</option>
                <option value="Advance Payment">100% Advance Payment</option>
                <option value="Supplier Credit">Supplier Consignment Credit</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#181a19]/70 mb-1">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. Zenith Bank / GTBank"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-[#181a19]/15 rounded-lg text-xs"
              >
              </input>
            </div>

            <div>
              <label className="block text-[10px] text-[#181a19]/70 mb-1">Account Number (NUBAN)</label>
              <input
                type="text"
                maxLength={10}
                placeholder="10-digit NUBAN"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-[#181a19]/15 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quality Rating & Operational Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Quality & Reliability Rating
            </label>
            <div className="flex items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= formData.rating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-[11px] font-semibold text-[#181a19]/70 ml-1">
                {formData.rating} of 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
              Partner Status
            </label>
            <div className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="sup_status"
                  checked={formData.status === 'active'}
                  onChange={() => setFormData({ ...formData, status: 'active' })}
                  className="accent-[#16422b]"
                />
                <span className="text-xs font-medium text-emerald-800">Active Vendor</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="sup_status"
                  checked={formData.status === 'inactive'}
                  onChange={() => setFormData({ ...formData, status: 'inactive' })}
                  className="accent-[#16422b]"
                />
                <span className="text-xs font-medium text-gray-600">Inactive / Suspended</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#181a19]/80 mb-1">
            Agronomic & Pricing Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Certified NASC tag distributor. Offers volume discounts on orders exceeding 50 bags."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 bg-[#fafaf7] border border-[#181a19]/15 rounded-lg focus:outline-none focus:border-[#16422b]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181a19]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#181a19]/70 hover:text-[#181a19] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#16422b] hover:bg-[#143826] rounded-lg transition-colors shadow-xs"
          >
            {supplierToEdit ? 'Save Changes' : 'Register Supplier'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
