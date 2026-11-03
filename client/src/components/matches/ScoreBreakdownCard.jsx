import React from 'react';
import { Award, Zap, ShieldCheck, MapPin, BarChart3, Clock } from 'lucide-react';

export const ScoreBreakdownCard = ({ match, onAccept, onDecline, canAct = false, isActing = false }) => {
  const {
    organizationName,
    priorityScore,
    scoreBreakdown,
    portionsAllocated,
    estimatedDistanceKm,
    estimatedTravelMinutes,
    recommendationExplanation,
    status,
  } = match;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-bold text-gray-900">{organizationName}</h4>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified NGO
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> {estimatedDistanceKm} km away
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> ~{estimatedTravelMinutes} mins transit
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-forest-700 flex items-center justify-end gap-1">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            {priorityScore}
            <span className="text-xs text-gray-400 font-normal">/ 100</span>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Match Score
          </span>
        </div>
      </div>

      {/* Rationale explanation */}
      <div className="p-3.5 bg-forest-50/70 border border-forest-100 rounded-xl mb-4 text-xs text-forest-900 font-medium leading-relaxed">
        <span className="font-bold text-forest-950 block mb-0.5">Recommendation Rationale:</span>
        {recommendationExplanation}
      </div>

      {/* 4 Normalized Sub-scores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center">
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <div className="text-[11px] text-gray-500 font-medium">Urgency (35%)</div>
          <div className="text-base font-bold text-gray-800">{scoreBreakdown?.urgencyScore || 0}%</div>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <div className="text-[11px] text-gray-500 font-medium">Quantity Fit (25%)</div>
          <div className="text-base font-bold text-gray-800">{scoreBreakdown?.quantityFitScore || 0}%</div>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <div className="text-[11px] text-gray-500 font-medium">Transit Speed (25%)</div>
          <div className="text-base font-bold text-gray-800">{scoreBreakdown?.travelEfficiencyScore || 0}%</div>
        </div>
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <div className="text-[11px] text-gray-500 font-medium">Demand Fit (15%)</div>
          <div className="text-base font-bold text-gray-800">{scoreBreakdown?.demandFitScore || 0}%</div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-600">
          Allocated Quantity: <span className="font-extrabold text-forest-800 text-sm">{portionsAllocated}</span> portions
        </div>

        {canAct && status === 'PROPOSED' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDecline(match)}
              disabled={isActing}
              className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold transition"
            >
              Decline
            </button>
            <button
              onClick={() => onAccept(match)}
              disabled={isActing}
              className="px-4 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" /> Accept Rescue Match
            </button>
          </div>
        )}

        {status && status !== 'PROPOSED' && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
            status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
          }`}>
            Status: {status}
          </span>
        )}
      </div>
    </div>
  );
};
