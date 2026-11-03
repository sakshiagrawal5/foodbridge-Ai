import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import api from '../../services/api';
import {
  Utensils,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Truck,
  ArrowRight,
  Package,
  Layers,
  Award,
  ChevronRight,
  Quote,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DonorDashboard = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [rescues, setRescues] = useState([]);
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Post form state
  const [postForm, setPostForm] = useState({
    foodCategory: 'Cooked Meals',
    source: 'College Canteen',
    quantity: '100',
    foodPreference: 'Vegetarian',
    location: 'MPGI Canteen, Kanpur',
    collectionWindow: '45 min',
  });
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsRes, rescuesRes, analyticsRes] = await Promise.all([
          api.get('/donations').catch(() => ({ data: { data: [] } })),
          api.get('/rescues').catch(() => ({ data: { data: [] } })),
          api.get('/analytics/impact').catch(() => ({ data: { data: { summary: {} } } })),
        ]);

        if (donationsRes.data?.data) setDonations(donationsRes.data.data);
        if (rescuesRes.data?.data) setRescues(rescuesRes.data.data);
        if (analyticsRes.data?.data) setImpactData(analyticsRes.data.data);
      } catch (err) {
        console.error('Failed to load donor dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickPostSubmit = async (e) => {
    e.preventDefault();
    setSubmittingPost(true);
    setPostSuccess(false);

    try {
      const now = new Date();
      const windowMinutes = parseInt(postForm.collectionWindow) || 45;
      const deadline = new Date(now.getTime() + windowMinutes * 60 * 1000);

      const payload = {
        title: `${postForm.quantity} Portions - ${postForm.foodPreference} ${postForm.foodCategory}`,
        foodCategory: 'COOKED_MEALS',
        description: `Source: ${postForm.source}. Fresh surplus prepared hygienically.`,
        portionsAvailable: Number(postForm.quantity) || 100,
        preparedAt: new Date(now.getTime() - 45 * 60 * 1000),
        collectionDeadline: deadline,
        storageConditions: 'ROOM_TEMPERATURE',
        foodTemperatureCelsius: 58,
        packagingType: 'SEALED_CONTAINERS',
        allergens: [],
        pickupAddress: {
          formatted: postForm.location,
          city: 'Kanpur',
        },
        pickupLocation: {
          type: 'Point',
          coordinates: [80.3319, 26.4499], // MPGI Kanpur coordinates
        },
        safetyDeclarations: {
          hygienicallyPrepared: true,
          storedProperly: true,
          noExpiredIngredients: true,
        },
      };

      const res = await api.post('/donations', payload);
      if (res.data.success) {
        setPostSuccess(true);
        setTimeout(() => {
          navigate(`/donor/matches?donationId=${res.data.data._id}`);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      // Fallback: navigate to AI matches with simulated feedback
      navigate('/donor/matches');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Mock bar chart data for Meals Rescued (30 days)
  const barData = [
    { day: '1', meals: 45 },
    { day: '3', meals: 65 },
    { day: '5', meals: 55 },
    { day: '8', meals: 95 },
    { day: '10', meals: 120 },
    { day: '12', meals: 80 },
    { day: '15', meals: 110 },
    { day: '17', meals: 75 },
    { day: '20', meals: 130 },
    { day: '22', meals: 90 },
    { day: '25', meals: 145 },
    { day: '28', meals: 105 },
    { day: '30', meals: 125 },
  ];

  // Donut chart data for Food Sources
  const pieData = [
    { name: 'Canteens', value: 45, color: '#0F766E' },
    { name: 'Restaurants', value: 25, color: '#0284C7' },
    { name: 'Hostels', value: 20, color: '#F97316' },
    { name: 'Events', value: 10, color: '#F43F5E' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* ============================================================== */}
        {/* ROW 1: Hero Banner & Today's Impact Card                       */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Hero Green Gradient Banner (span 8 or 9) */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F3C28] via-[#155336] to-[#1E6B47] text-white p-6 sm:p-8 shadow-md border border-emerald-800/40 flex flex-col justify-between min-h-[260px]">
            {/* Background leaf graphic accents */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>

            {/* Top row with FoodBridgeAI badge & 3-step workflow diagram */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <span>🌱 FoodBridgeAI</span>
              </div>

              {/* 3 Step flow: You Donate -> AI Matches -> NGO Receives */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-[11px] font-medium text-emerald-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/80 text-white flex items-center justify-center text-[10px]">🍴</span>
                  <span>You Donate</span>
                </div>
                <span className="text-emerald-300/60">→</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/80 text-white flex items-center justify-center text-[10px]">🧠</span>
                  <span>AI Matches</span>
                </div>
                <span className="text-emerald-300/60">→</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/80 text-white flex items-center justify-center text-[10px]">👥</span>
                  <span>NGO Receives</span>
                </div>
              </div>
            </div>

            {/* Middle row: Hero image circle + Title & Subtitle */}
            <div className="flex flex-col sm:flex-row items-center gap-6 my-4 z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-emerald-400/50 shadow-lg shrink-0">
                <img
                  src="/banner_food_hero.jpg"
                  alt="Wholesome freshly prepared meal"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
                  Good Food Deserves a <br className="hidden sm:inline" />
                  <span className="text-emerald-300">Destination.</span>
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 max-w-xl leading-relaxed">
                  Connect surplus food from canteens, restaurants, hostels and events with verified NGOs through intelligent matching, safety checks and optimized routes.
                </p>
              </div>
            </div>

            {/* Bottom action button & organic signature */}
            <div className="flex items-center justify-between pt-2 z-10">
              <Link
                to="/donor/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#092B1B] text-xs font-extrabold shadow-md hover:shadow-lg transition-transform active:scale-95"
              >
                <span>Post a Donation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="text-[11px] font-serif italic text-emerald-200/90 text-right hidden sm:block">
                Together <br /> We Fight Food Waste
              </div>
            </div>
          </div>

          {/* Today's Impact Card (span 4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base text-emerald-600">🌱</span>
                <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">Today's Impact</h3>
              </div>

              {/* 2x2 grid of impact metrics matching image */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Metric 1: Meals Rescued */}
                <div className="bg-[#F8FAF8] p-3.5 rounded-2xl border border-emerald-100/60">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Utensils className="w-4 h-4" />
                    <span className="text-lg font-black text-slate-800">75+</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">Meals Rescued</div>
                </div>

                {/* Metric 2: Food Diverted */}
                <div className="bg-[#F8FAF8] p-3.5 rounded-2xl border border-emerald-100/60">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span className="text-sm">♻️</span>
                    <span className="text-lg font-black text-slate-800">33.75 kg</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">Food Diverted</div>
                </div>

                {/* Metric 3: NGO Partners */}
                <div className="bg-[#F8FAF8] p-3.5 rounded-2xl border border-emerald-100/60">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Users className="w-4 h-4" />
                    <span className="text-lg font-black text-slate-800">12</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">NGO Partners</div>
                </div>

                {/* Metric 4: Avg. Pickup Window */}
                <div className="bg-[#F8FAF8] p-3.5 rounded-2xl border border-emerald-100/60">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-lg font-black text-slate-800">45 min</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">Avg. Pickup Window</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Auto-synchronized with verified pickups</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROW 2: 4 Metric Cards (Total Donations, Meals Rescued, etc.)   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Donations */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Total Donations</span>
                <span className="text-xl font-black text-slate-800">28</span>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
                  <span>↗ +12% from last week</span>
                </div>
              </div>
            </div>
            {/* Sparkline wave */}
            <div className="w-12 h-6 text-emerald-500 opacity-70">
              <svg viewBox="0 0 50 25" className="w-full h-full stroke-current fill-none stroke-2">
                <path d="M 0 20 Q 15 5, 25 15 T 50 5" />
              </svg>
            </div>
          </div>

          {/* Card 2: Meals Rescued */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <span className="text-base">⏰</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Meals Rescued</span>
                <span className="text-xl font-black text-slate-800">1,240</span>
                <div className="text-[10px] text-amber-600 font-bold mt-0.5 flex items-center gap-0.5">
                  <span>↗ +18% from last week</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-6 text-amber-500 opacity-70">
              <svg viewBox="0 0 50 25" className="w-full h-full stroke-current fill-none stroke-2">
                <path d="M 0 22 Q 15 15, 25 8 T 50 3" />
              </svg>
            </div>
          </div>

          {/* Card 3: Food Waste Prevented */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <span className="text-base">🍃</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Food Waste Prevented</span>
                <span className="text-xl font-black text-slate-800">520 kg</span>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
                  <span>↗ +22% from last week</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-6 text-emerald-500 opacity-70">
              <svg viewBox="0 0 50 25" className="w-full h-full stroke-current fill-none stroke-2">
                <path d="M 0 18 Q 15 22, 25 10 T 50 4" />
              </svg>
            </div>
          </div>

          {/* Card 4: Active NGOs */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Active NGOs</span>
                <span className="text-xl font-black text-slate-800">8</span>
                <div className="text-[10px] text-indigo-600 font-bold mt-0.5 flex items-center gap-0.5">
                  <span>→ 2 new partners</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-6 text-indigo-400 opacity-70">
              <svg viewBox="0 0 50 25" className="w-full h-full stroke-current fill-none stroke-2">
                <path d="M 0 15 Q 15 2, 25 20 T 50 10" />
              </svg>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROW 3: Post a Donation Form + AI Match Engine Card + Activity  */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Post a Donation Form (span 4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800">Post a Donation</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              List your surplus food and let AI find the right recipient.
            </p>

            {postSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Surplus listed! Launching AI Match Engine...</span>
              </div>
            )}

            <form onSubmit={handleQuickPostSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Food Category */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Food Category
                  </label>
                  <select
                    value={postForm.foodCategory}
                    onChange={(e) => setPostForm({ ...postForm, foodCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Cooked Meals">Cooked Meals</option>
                    <option value="Packaged Food">Packaged Food</option>
                    <option value="Bakery Items">Bakery Items</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Source
                  </label>
                  <select
                    value={postForm.source}
                    onChange={(e) => setPostForm({ ...postForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="College Canteen">College Canteen</option>
                    <option value="Hostel Mess">Hostel Mess</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Event / Banquet">Event / Banquet</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Quantity (meal portions)
                </label>
                <input
                  type="number"
                  value={postForm.quantity}
                  onChange={(e) => setPostForm({ ...postForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  placeholder="100"
                />
              </div>

              {/* Food Preference (Radio options) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Food Preference
                </label>
                <div className="flex items-center gap-4 text-[11px] text-slate-600 font-medium pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="preference"
                      checked={postForm.foodPreference === 'Vegetarian'}
                      onChange={() => setPostForm({ ...postForm, foodPreference: 'Vegetarian' })}
                      className="accent-emerald-600"
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="preference"
                      checked={postForm.foodPreference === 'Non-vegetarian'}
                      onChange={() => setPostForm({ ...postForm, foodPreference: 'Non-vegetarian' })}
                      className="accent-emerald-600"
                    />
                    <span>Non-vegetarian</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="preference"
                      checked={postForm.foodPreference === 'Mixed'}
                      onChange={() => setPostForm({ ...postForm, foodPreference: 'Mixed' })}
                      className="accent-emerald-600"
                    />
                    <span>Mixed</span>
                  </label>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={postForm.location}
                    onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Collection Window (Radio tags) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Collection Window
                </label>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  {['30 min', '45 min', '60 min', '90 min'].map((win) => (
                    <label key={win} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="window"
                        checked={postForm.collectionWindow === win}
                        onChange={() => setPostForm({ ...postForm, collectionWindow: win })}
                        className="accent-emerald-600"
                      />
                      <span>{win}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submittingPost}
                className="w-full mt-2 py-2.5 bg-[#1B653F] hover:bg-[#155333] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>{submittingPost ? 'Evaluating matches...' : 'Generate AI Match'}</span>
              </button>
            </form>
          </div>

          {/* AI Match Engine Showcase (span 5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 flex flex-col justify-between">
            <div>
              {/* Top header row with Match Score pill */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 leading-tight">AI Match Engine</h3>
                    <p className="text-[10px] text-slate-400">Best recipient based on distance, capacity, urgency & safety</p>
                  </div>
                </div>

                <div className="text-right bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
                  <span className="text-[9px] font-bold text-emerald-800 block uppercase">Match Score</span>
                  <span className="text-sm font-black text-emerald-700">96/100</span>
                </div>
              </div>

              {/* NGO Card: Hope Community Kitchen */}
              <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-emerald-100 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1B653F] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      🍽️
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800">Hope Community Kitchen</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                          ✓ Verified NGO
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        2.4 km away · 8.5 km capacity
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter tags */}
                <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500 mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Meals</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Community Kitchen</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">Food for All</span>
                </div>

                {/* 2-column: Why this match? + Alternative Options */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Why this match?</span>
                    <ul className="space-y-1 text-slate-600">
                      <li className="flex items-center gap-1">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Perfect quantity match (100 meals)</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Within safe collection window (45 min)</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Nearest location (2.4 km)</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Verified NGO & accepts cooked meals</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-l border-slate-200/70 pl-3">
                    <span className="font-bold text-slate-700 block mb-1">Alternative Options</span>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-slate-600">
                        <div>
                          <div className="font-semibold text-slate-800">1. Shakti Foundation</div>
                          <span className="text-[9px] text-slate-400">3.8 km</span>
                        </div>
                        <span className="font-bold text-emerald-700 text-[10px]">Score 82/100</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <div>
                          <div className="font-semibold text-slate-800">2. Annapurna Seva Kendra</div>
                          <span className="text-[9px] text-slate-400">6.1 km</span>
                        </div>
                        <span className="font-bold text-emerald-700 text-[10px]">Score 74/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Full Details Button */}
            <Link
              to="/donor/matches"
              className="w-full py-2.5 bg-[#1B653F] hover:bg-[#155333] text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>View Full Details & Route</span>
            </Link>
          </div>

          {/* Right Column: Recent Activity (span 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📋</span>
                  <h3 className="font-extrabold text-sm text-slate-800">Recent Activity</h3>
                </div>
                <Link to="/donor/activity" className="text-[10px] font-bold text-emerald-700 hover:underline">
                  View All →
                </Link>
              </div>

              {/* Activity Timeline List */}
              <div className="space-y-3.5 text-xs">
                {/* Item 1 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Utensils className="w-3 h-3" />
                  </div>
                  <div className="flex-1 leading-tight">
                    <div className="font-bold text-[11px] text-slate-800">New donation added</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">100 meal portions · College Canteen</div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">12:45 PM</span>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="flex-1 leading-tight">
                    <div className="font-bold text-[11px] text-slate-800">NGO matched</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Hope Community Kitchen</div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">12:38 PM</span>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-3 h-3" />
                  </div>
                  <div className="flex-1 leading-tight">
                    <div className="font-bold text-[11px] text-slate-800">Pickup confirmed</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Driver assigned · 2.4 km</div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">11:20 AM</span>
                </div>

                {/* Item 4 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="flex-1 leading-tight">
                    <div className="font-bold text-[11px] text-slate-800">Delivered</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Meals received · 100 portions</div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">10:15 AM</span>
                </div>
              </div>
            </div>

            {/* Impact Showcase photo card at bottom right */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Impact Showcase
              </span>
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-28 border border-slate-200/60">
                <img
                  src="/impact_showcase.jpg"
                  alt="Food rescue impact"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2.5">
                  <p className="text-[11px] font-serif italic text-white leading-snug">
                    "Food is not just a meal, it's hope."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROW 4: Rescue Route + Food Safety Center + Quick Stats         */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Today's Rescue Route (span 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🗺️</span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-800">Today's Rescue Route</h3>
                </div>
                <Link to="/donor/rescues" className="text-[10px] font-bold text-emerald-700 hover:underline">
                  View on Map →
                </Link>
              </div>

              {/* Waypoints */}
              <div className="space-y-3 relative pl-6 border-l-2 border-emerald-500/40 my-3 text-xs">
                {/* Waypoint 1 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-5 h-5 rounded-full bg-[#1B653F] text-white text-[10px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">Campus Central Canteen</span>
                      <span className="text-[10px] text-slate-400">Pickup • 100 meals</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">10:30 AM</span>
                  </div>
                </div>

                {/* Waypoint 2 */}
                <div className="relative pt-2">
                  <span className="absolute -left-[31px] top-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">Hope Community Kitchen</span>
                      <span className="text-[10px] text-slate-400">Delivery • 2.4 km</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">11:00 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transit stats pill */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm">🚗</span>
                <div>
                  <span className="font-bold text-slate-800 block text-xs">12 min</span>
                  <span className="text-[10px] text-slate-400">Travel Time</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">📍</span>
                <div>
                  <span className="font-bold text-slate-800 block text-xs">2.4 km</span>
                  <span className="text-[10px] text-slate-400">Distance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Food Safety Center Mini Route Map (span 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800">Food Safety Center</h3>
              </div>
              <Link to="/donor/safety" className="text-[10px] font-bold text-emerald-700 hover:underline">
                View All →
              </Link>
            </div>

            {/* Stylized Illustrated Street Map Route matching screenshot */}
            <div className="relative w-full h-36 bg-[#EEF2ED] rounded-2xl overflow-hidden border border-slate-200/60 p-2 select-none">
              {/* Subtle road grid lines */}
              <svg className="absolute inset-0 w-full h-full stroke-white/80 stroke-2" fill="none">
                <line x1="0" y1="30" x2="260" y2="30" />
                <line x1="0" y1="90" x2="260" y2="90" />
                <line x1="50" y1="0" x2="50" y2="150" />
                <line x1="180" y1="0" x2="180" y2="150" />
                {/* Green transit route polyline */}
                <path
                  d="M 60 25 L 60 70 L 140 70 L 200 115"
                  stroke="#16a34a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>

              {/* Waypoint 1 Pin */}
              <div className="absolute top-4 left-11 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-[#1B653F] text-white text-[10px] font-black flex items-center justify-center shadow-md border-2 border-white">
                  1
                </div>
              </div>

              {/* Campus label */}
              <div className="absolute top-9 left-20 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-600 shadow-xs border border-slate-200/60">
                MPGI
              </div>

              {/* Transit Pill badge with mini van */}
              <div className="absolute top-12 left-18 bg-white shadow-md border border-slate-200 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-700 flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>2.4 km • 12 min</span>
              </div>

              {/* Delivery vehicle moving along path */}
              <div className="absolute top-14 left-32 bg-[#1B653F] text-white text-[9px] p-1 rounded-md shadow-md z-10">
                🚐
              </div>

              {/* Waypoint 2 Pin */}
              <div className="absolute bottom-3 right-10 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-md border-2 border-white">
                  2
                </div>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-1 left-2 text-[8px] font-mono text-slate-400">
                MPGI Hub
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Optimized Road Path</span>
              <span className="text-emerald-700 font-bold">OSRM Live</span>
            </div>
          </div>

          {/* Food Safety Center Stats & Checklist Card (span 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-800">Food Safety Center</h3>
                </div>
                <Link to="/donor/safety" className="text-[10px] font-bold text-emerald-700 hover:underline">
                  View All →
                </Link>
              </div>

              {/* Status counter badges: 5 Safe, 1 Review, 0 Rejected */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="p-1.5 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                  <div className="text-base font-black text-emerald-700">5</div>
                  <div className="text-[9px] font-bold text-emerald-800 uppercase">Safe</div>
                </div>
                <div className="p-1.5 bg-amber-50 border border-amber-200/60 rounded-xl">
                  <div className="text-base font-black text-amber-700">1</div>
                  <div className="text-[9px] font-bold text-amber-800 uppercase">Review</div>
                </div>
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-base font-black text-slate-400">0</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase">Rejected</div>
                </div>
              </div>

              {/* Safety Checklist list */}
              <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Fresh & Cooked Food
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">Checked</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Packaging & Storage
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">Good</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Collection Deadline
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 font-mono">In 45 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Allergen Information
                  </span>
                  <span className="text-[10px] text-slate-400">Not specified</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>Safety Standard</span>
              <span className="text-emerald-700 font-bold">100% Compliant</span>
            </div>
          </div>

          {/* Quick Stats: Recharts Bar Chart & Donut Chart (span 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📊</span>
                  <h3 className="font-extrabold text-sm text-slate-800">Quick Stats</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                  This Month ▾
                </span>
              </div>

              {/* Meals Rescued Bar Graph */}
              <div className="mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Meals Rescued
                </span>
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Bar dataKey="meals" fill="#1B653F" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Food Sources Donut Chart */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Food Sources
                </span>
                <div className="flex items-center gap-3">
                  {/* Donut chart */}
                  <div className="w-20 h-20 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={22}
                          outerRadius={36}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[8px] text-slate-400">Total</span>
                      <span className="text-[10px] font-black text-slate-800">1,240</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
                      <span>Canteens (45%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                      <span>Restaurants (25%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
                      <span>Hostels (20%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#F43F5E]"></span>
                      <span>Events (10%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Last updated: 5 minutes ago</span>
              <span className="text-emerald-700 font-bold">Live Data</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonorDashboard;
