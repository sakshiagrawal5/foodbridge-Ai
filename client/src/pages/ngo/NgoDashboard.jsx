import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ScoreBreakdownCard } from '../../components/matches/ScoreBreakdownCard';
import { RouteMap } from '../../components/maps/RouteMap';
import api from '../../services/api';
import { ShieldCheck, Truck, CheckCircle2, AlertCircle, Sparkles, MapPin } from 'lucide-react';

export const NgoDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingMatchId, setActingMatchId] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  const fetchData = async () => {
    try {
      const [profileRes, matchesRes, rescuesRes] = await Promise.all([
        api.get('/ngos/profile'),
        api.get('/ngos/matches'),
        api.get('/rescues'),
      ]);

      if (profileRes.data.success) setProfile(profileRes.data.data);
      if (matchesRes.data.success) setMatches(matchesRes.data.data);
      if (rescuesRes.data.success) setRescues(rescuesRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptMatch = async (match) => {
    setActingMatchId(match._id || match.matchId);
    setAlertMsg(null);
    try {
      const res = await api.post(`/matches/${match._id || match.matchId}/accept`);
      if (res.data.success) {
        setAlertMsg({ type: 'success', text: 'Match Accepted! Rescue Mission created and assigned for pickup.' });
        fetchData();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to accept match.' });
    } finally {
      setActingMatchId(null);
    }
  };

  const handleDeclineMatch = async (match) => {
    setActingMatchId(match._id || match.matchId);
    try {
      await api.post(`/matches/${match._id || match.matchId}/decline`, { reason: 'Capacity limitation or schedule conflict.' });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActingMatchId(null);
    }
  };

  const handleUpdateStatus = async (rescueId, nextStatus, details = {}) => {
    try {
      await api.patch(`/rescues/${rescueId}/status`, {
        status: nextStatus,
        ...details,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status transition failed.');
    }
  };

  const proposedMatches = matches.filter((m) => m.status === 'PROPOSED');
  const activeRescues = rescues.filter((r) => ['ASSIGNED', 'PICKUP_CONFIRMED', 'PICKED_UP', 'IN_TRANSIT'].includes(r.status));
  const completedRescues = rescues.filter((r) => r.status === 'DELIVERED');

  return (
    <DashboardLayout
      title="NGO Distribution Hub"
      subtitle="Accept recommended surplus allocations, dispatch pickup, and verify meal delivery"
    >
      {/* Alert toast banner */}
      {alertMsg && (
        <div className={`p-4 rounded-2xl mb-6 text-xs font-bold flex items-center gap-2 ${
          alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          {alertMsg.text}
        </div>
      )}

      {/* Top NGO Profile & Capacity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:col-span-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Organization
            </span>
            <div className="text-xl font-bold text-gray-900">{profile?.organizationName || 'NGO Partner'}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Status:{' '}
              <span className={`font-bold ${profile?.verificationStatus === 'VERIFIED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {profile?.verificationStatus || 'PENDING'}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-forest-50 rounded-2xl flex items-center justify-center text-forest-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Current Demand
          </span>
          <div className="text-2xl font-black text-forest-800">{profile?.mealDemand || 0}</div>
          <span className="text-[11px] text-gray-400">Meal portions needed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Max Capacity
          </span>
          <div className="text-2xl font-black text-amber-700">{profile?.collectionCapacity || 0}</div>
          <span className="text-[11px] text-gray-400">Logistics vehicle limit</span>
        </div>
      </div>

      {/* Section: Incoming AI Match Recommendations Pending Acceptance */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Proposed Rescue Matches ({proposedMatches.length})
            </h3>
            <p className="text-xs text-gray-500">
              Matched by FoodBridgeAI intelligence engine based on your vehicle capacity and food category acceptance
            </p>
          </div>
        </div>

        {proposedMatches.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-400">
            No pending matches currently waiting for acceptance.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {proposedMatches.map((m) => (
              <ScoreBreakdownCard
                key={m._id}
                match={{
                  ...m,
                  organizationName: m.donationId?.title || 'Surplus Food Batch',
                }}
                canAct={true}
                isActing={actingMatchId === m._id}
                onAccept={handleAcceptMatch}
                onDecline={handleDeclineMatch}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section: Active Rescue Operations Tracking */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-forest-800" />
          Active Rescue Pickup & Delivery Operations ({activeRescues.length})
        </h3>

        {activeRescues.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-400">
            No pickups currently in transit. Accepted matches will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {activeRescues.map((rescue) => (
              <div key={rescue._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-gray-900">
                      {rescue.donationId?.title || 'Rescue Mission'}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      {rescue.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Portions: <strong className="text-forest-800">{rescue.portionsAllocated}</strong> · Donor Contact: {rescue.donorId?.phone || 'Campus Gate'}
                  </div>
                </div>

                {/* State Transition Action Buttons */}
                <div className="flex items-center gap-2">
                  {rescue.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(rescue._id, 'PICKED_UP', { portionsCollected: rescue.portionsAllocated, notes: 'Collected from canteen in insulated containers' })}
                      className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Confirm Food Picked Up
                    </button>
                  )}

                  {rescue.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleUpdateStatus(rescue._id, 'DELIVERED', { portionsDelivered: rescue.portionsAllocated, notes: 'Delivered and distributed to community center' })}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Confirm Delivery Completed
                    </button>
                  )}

                  {rescue.status === 'DELIVERED' && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Delivered & Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
