import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Utensils, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('canteen@college.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data?.user) {
        switch (data.user.role) {
          case 'DONOR': navigate('/donor'); break;
          case 'NGO': navigate('/ngo'); break;
          case 'VOLUNTEER': navigate('/volunteer'); break;
          case 'ADMIN': navigate('/admin'); break;
          default: navigate('/'); break;
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-gray-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-forest-800 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-4">
            <Utensils className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign In to FoodBridgeAI</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">Empowering communities through smart surplus food rescue</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                placeholder="name@organization.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Development Quick-Fill Demo Personas */}
        <div className="border-t border-gray-100 pt-6">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center mb-3">
            Quick-Fill Seeded Demo Personas
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoUser('canteen@college.edu')}
              className="p-2 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-forest-900 rounded-xl font-semibold transition text-left"
            >
              🎓 College Canteen <span className="text-[10px] block text-forest-600 font-normal">Donor (100 portions)</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('annapurna@ngo.org')}
              className="p-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-900 rounded-xl font-semibold transition text-left"
            >
              🏢 Annapurna Food Bank <span className="text-[10px] block text-blue-600 font-normal">Verified NGO Recipient</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('admin@foodbridge.org')}
              className="p-2 border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-purple-900 rounded-xl font-semibold transition text-left"
            >
              🛡️ Platform Admin <span className="text-[10px] block text-purple-600 font-normal">Verifications & Audit</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('volunteer@foodbridge.org')}
              className="p-2 border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-900 rounded-xl font-semibold transition text-left"
            >
              🚴 Volunteer Courier <span className="text-[10px] block text-amber-600 font-normal">Pickup & Delivery</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
