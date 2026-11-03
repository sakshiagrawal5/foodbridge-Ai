import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ScoreBreakdownCard } from '../../components/matches/ScoreBreakdownCard';
import { RouteMap } from '../../components/maps/RouteMap';
import api from '../../services/api';
import { Sparkles, AlertCircle, CheckCircle2, XCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export const MatchRecommendationsPage = () => {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('donationId');

  const [donations, setDonations] = useState([]);
  const [selectedDonationId, setSelectedDonationId] = useState(donationId || '');
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMatchForRoute, setSelectedMatchForRoute] = useState(null);

  // Fetch all donor's available donations to allow selecting
  useEffect(() => {
    api.get('/donations')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setDonations(res.data.data);
          if (!selectedDonationId) {
            setSelectedDonationId(res.data.data[0]._id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Run matching engine when donation is selected
  useEffect(() => {
    if (!selectedDonationId) return;

    setLoading(true);
    setError('');
    api.post(`/donations/${selectedDonationId}/match`)
      .then((res) => {
        if (res.data.success) {
          setMatchData(res.data);
          if (res.data.recommendations.length > 0) {
            setSelectedMatchForRoute(res.data.recommendations[0]);
          } else {
            setSelectedMatchForRoute(null);
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to compute matches.');
      })
      .finally(() => setLoading(false));
  }, [selectedDonationId]);

  const currentDonation = donations.find((d) => d._id === selectedDonationId);

  return (
    <DashboardLayout
      title="Explainable AI Match Engine"
      subtitle="Evaluates food safety deadlines, NGO capacity, and live road transit times"
    >
      {/* Donation Selector */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Active Surplus Listing Under Evaluation
          </label>
          <select
            value={selectedDonationId}
            onChange={(e) => setSelectedDonationId(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-600 max-w-full truncate"
          >
            {donations.map((d) => (
              <option key={d._id} value={d._id}>
                {d.title} ({d.portionsRemaining} portions remaining · {d.status})
              </option>
            ))}
          </select>
        </div>

        {currentDonation && (
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Safe Collection Window
            </span>
            <div className="text-sm font-bold text-forest-800">
              Until {new Date(currentDonation.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-800 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="font-bold text-gray-800 text-base">Running Food Rescue Intelligence Engine...</div>
          <div className="text-xs text-gray-500 mt-1">
            Checking verification criteria, calculating OSRM road transit, and optimizing portion allocations
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2 mb-8">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && matchData && (
        <div className="space-y-8">
          {/* Split Plan Alert if Capacity Requires Multi-NGO Pickup */}
          {matchData.multiNgoSplitPlan && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Capacity-Aware Multi-NGO Allocation Recommended</span>
                Total portions ({matchData.portionsRemaining}) exceed a single recipient's current demand. An optimized split across {matchData.multiNgoSplitPlan.length} verified NGOs has been structured.
              </div>
            </div>
          )}

          {/* Road Routing Map */}
          {selectedMatchForRoute && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forest-700" />
                  Assigned Pickup Route & Feasibility Plan ({selectedMatchForRoute.organizationName})
                </h3>
                <span className="text-xs text-gray-500">
                  Estimated Road Transit: <strong className="text-gray-800">{selectedMatchForRoute.estimatedTravelMinutes} mins</strong> ({selectedMatchForRoute.estimatedDistanceKm} km)
                </span>
              </div>

              <RouteMap
                donorLocation={currentDonation?.pickupLocation?.coordinates}
                ngoLocation={selectedMatchForRoute.ngoLocation?.coordinates}
                routeCoordinates={selectedMatchForRoute.routeGeometry}
                donorTitle={currentDonation?.title}
                ngoTitle={selectedMatchForRoute.organizationName}
                distanceKm={selectedMatchForRoute.estimatedDistanceKm}
                durationMinutes={selectedMatchForRoute.estimatedTravelMinutes}
                routingType={selectedMatchForRoute.routingType}
              />
            </div>
          )}

          {/* Ranked Candidates */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest-700" />
              Ranked Eligible Recipient NGOs ({matchData.eligibleCount} Qualified)
            </h3>

            {matchData.recommendations.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-xs">
                No verified NGOs currently meet both the food category and deadline collection constraints.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {matchData.recommendations.map((match) => (
                  <div
                    key={match.ngoId}
                    onClick={() => setSelectedMatchForRoute(match)}
                    className="cursor-pointer"
                  >
                    <ScoreBreakdownCard match={match} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Excluded Candidates Section for Complete Transparency */}
          {matchData.excludedCandidates && matchData.excludedCandidates.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3">
                Excluded Candidates & Food Safety Ineligibility Reasons
              </h4>
              <div className="space-y-2">
                {matchData.excludedCandidates.map((c) => (
                  <div key={c.ngoId} className="p-3 bg-white rounded-xl border border-gray-200/60 text-xs flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900">{c.organizationName}</span>
                      <ul className="list-disc list-inside text-gray-500 mt-1 space-y-0.5">
                        {c.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};
