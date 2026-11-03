import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { PlusCircle, ShieldAlert, CheckCircle2, AlertCircle, Clock, MapPin } from 'lucide-react';

export const CreateDonationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default initial values optimized for 100-portion demo
  const [formData, setFormData] = useState({
    title: 'Surplus Fresh Veg Pulav & Paneer Tikka Masala',
    foodCategory: 'COOKED_MEALS',
    description: 'Hot college canteen batch prepared in stainless steel vessels. Sealed and safe for immediate distribution.',
    portionsAvailable: 100,
    preparedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString().slice(0, 16),
    collectionDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16),
    storageConditions: 'ROOM_TEMPERATURE',
    foodTemperatureCelsius: 60,
    packagingType: 'SEALED_CONTAINERS',
    allergens: 'Dairy',
    addressText: 'NIT Canteen Services, Central Campus Food Court Gate 3, Bengaluru',
    hygieneChecked: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        foodCategory: formData.foodCategory,
        description: formData.description,
        portionsAvailable: Number(formData.portionsAvailable),
        preparedAt: new Date(formData.preparedAt),
        collectionDeadline: new Date(formData.collectionDeadline),
        storageConditions: formData.storageConditions,
        foodTemperatureCelsius: Number(formData.foodTemperatureCelsius),
        packagingType: formData.packagingType,
        allergens: formData.allergens.split(',').map((s) => s.trim()).filter(Boolean),
        pickupAddress: {
          formatted: formData.addressText,
          city: 'Bengaluru',
        },
        pickupLocation: {
          type: 'Point',
          coordinates: [77.5946, 12.9716], // Bengaluru center
        },
        safetyDeclarations: {
          hygienicallyPrepared: true,
          storedProperly: true,
          noExpiredIngredients: true,
        },
      };

      const res = await api.post('/donations', payload);
      if (res.data.success) {
        // Direct to matching recommendation view for this donation
        navigate(`/donor/matches?donationId=${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list surplus food. Check required safety parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="List Surplus Food"
      subtitle="Complete food safety details to initiate AI recipient matching"
    >
      <div className="max-w-3xl bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Food Item Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
                placeholder="e.g. 100 Portions of Fresh Veg Biryani & Dal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Food Category *
              </label>
              <select
                value={formData.foodCategory}
                onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              >
                <option value="COOKED_MEALS">Cooked Meals (Hot/Prepared)</option>
                <option value="PACKAGED_FOOD">Packaged / Dry Food</option>
                <option value="BAKERY_ITEMS">Bakery & Breads</option>
                <option value="FRUITS_VEGETABLES">Fruits & Vegetables</option>
                <option value="OTHER_ELIGIBLE">Other Safe Food</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Number of Available Portions *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.portionsAvailable}
                onChange={(e) => setFormData({ ...formData, portionsAvailable: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" /> Prepared Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.preparedAt}
                onChange={(e) => setFormData({ ...formData, preparedAt: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Safe Collection Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.collectionDeadline}
                onChange={(e) => setFormData({ ...formData, collectionDeadline: e.target.value })}
                className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Strictly enforced by matching engine</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Storage Conditions
              </label>
              <select
                value={formData.storageConditions}
                onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              >
                <option value="ROOM_TEMPERATURE">Room Temperature (20°C - 25°C)</option>
                <option value="HEATED_WARMER">Heated Food Warmer (&gt;60°C)</option>
                <option value="REFRIGERATED">Refrigerated (&lt;4°C)</option>
                <option value="DEEP_FROZEN">Deep Frozen (&lt;-18°C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Packaging Format
              </label>
              <select
                value={formData.packagingType}
                onChange={(e) => setFormData({ ...formData, packagingType: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              >
                <option value="SEALED_CONTAINERS">Sealed Food Containers</option>
                <option value="STAINLESS_STEEL_VESSELS">Stainless Steel Vessels</option>
                <option value="DISPOSABLE_BOXES">Disposable Meal Boxes</option>
                <option value="CARTONS">Cardboard Cartons</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Pickup Location Details
              </label>
              <input
                type="text"
                required
                value={formData.addressText}
                onChange={(e) => setFormData({ ...formData, addressText: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
            <div className="text-xs text-forest-900 leading-relaxed">
              <span className="font-bold block text-sm">Food Safety & Hygiene Declaration</span>
              I certify that this surplus food was hygienically prepared, stored according to food safety guidelines, contains no expired ingredients, and is safe for human consumption prior to the stated deadline.
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5 text-emerald-300" />
            {loading ? 'Submitting & Evaluating Matches...' : 'Confirm Listing & Run AI Match'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};
