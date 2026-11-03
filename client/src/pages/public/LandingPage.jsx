import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  ShieldCheck,
  Sparkles,
  Truck,
  Heart,
  ChevronRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';

export const LandingPage = () => {
  const [impactData, setImpactData] = useState(null);

  useEffect(() => {
    api.get('/analytics/impact')
      .then((res) => {
        if (res.data.success) {
          setImpactData(res.data.data.summary);
        }
      })
      .catch(() => {
        // Fallback default metrics display
        setImpactData({
          totalMealsDelivered: 175,
          totalFoodWasteAvoidedKg: 78.75,
          completedRescues: 4,
          rescueSuccessRate: 98,
        });
      });
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-100 text-forest-800 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-forest-700" />
          Explainable Food Rescue Intelligence Engine
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Good Food Deserves a <span className="text-forest-700 underline decoration-emerald-300">Destination</span>.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
          Connect surplus food from college canteens and caterers with verified NGOs through intelligent matching, safety deadline verification, and optimized pickup routes.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 group"
          >
            <span>Launch College Canteen Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 rounded-xl font-bold text-base border border-gray-200 shadow-sm transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-forest-600" />
            <span>Register as Partner NGO</span>
          </Link>
        </div>

        {/* Live Metrics Grid Banner */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 glass-panel rounded-3xl max-w-5xl mx-auto text-left">
          <div className="p-4 border-r border-gray-200/60 last:border-none">
            <div className="text-3xl font-black text-forest-800">
              {impactData?.totalMealsDelivered || 0}+
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
              Meals Rescued & Delivered
            </div>
          </div>
          <div className="p-4 border-r border-gray-200/60 last:border-none">
            <div className="text-3xl font-black text-amber-600">
              {impactData?.totalFoodWasteAvoidedKg || 0} kg
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
              Edible Waste Diverted
            </div>
          </div>
          <div className="p-4 border-r border-gray-200/60 last:border-none">
            <div className="text-3xl font-black text-forest-700">
              {impactData?.rescueSuccessRate || 100}%
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
              Rescue Success Rate
            </div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-black text-gray-900">
              &lt; 45 mins
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
              Safe Pickup Window
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-forest-700 mb-2">Workflow Process</h2>
          <h3 className="text-3xl font-extrabold text-gray-900">How FoodBridgeAI Rescues Surplus Food</h3>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 font-black flex items-center justify-center mb-4">
              1
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-2">Donor Lists Surplus Food</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Specify portions, prep timestamp, storage conditions, and strict collection deadline.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center mb-4">
              2
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-2">Explainable AI Matching</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Scores urgency (35%), quantity fit (25%), road transit (25%), and NGO demand (15%).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center mb-4">
              3
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-2">NGO Accepts & Dispatches</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Live road routing with OSRM, verified capacity reservation, and pickup plan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-white font-black flex items-center justify-center mb-4">
              4
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-2">Audit & Impact Logged</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Delivered portions verified on-site; kilograms of food waste avoided recorded into open ledger.
            </p>
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section id="innovation" className="px-6 max-w-7xl mx-auto bg-forest-900 text-white rounded-3xl p-8 md:p-14">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 block mb-2">
              Explainable Intelligence Core
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Deterministic, Fair, & Safety-First Matching Engine
            </h3>
            <p className="mt-4 text-emerald-100 text-sm leading-relaxed">
              Unlike black-box models, FoodBridgeAI uses an explainable 4-pillar multi-objective algorithm. Unverified NGOs or vehicles unable to meet the food safety collection deadline are strictly excluded before scoring begins.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Zero duplicate allocation via atomic portion reservation</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Capacity-aware splitting when donation exceeds single NGO demand</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Road navigation distance calculated via OpenStreetMap & OSRM</span>
              </div>
            </div>
          </div>

          <div className="bg-forest-950/80 border border-emerald-500/20 rounded-2xl p-6 font-mono text-xs text-emerald-300">
            <div className="text-gray-400 mb-3 border-b border-forest-800 pb-2 flex justify-between">
              <span>// matchingAlgorithm.js</span>
              <span className="text-emerald-400">STATUS: ACTIVE</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`FinalScore = 
  0.35 * UrgencyScore +
  0.25 * QuantityFitScore +
  0.25 * TravelEfficiencyScore +
  0.15 * DemandFitScore;

if (travelMinutes > deadlineRemaining) {
  excludeCandidate("Shelf life expired in transit");
}`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
