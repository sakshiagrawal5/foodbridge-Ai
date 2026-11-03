# FoodBridgeAI — Comprehensive Architecture & Verification Report

## 1. System Overview
**FoodBridgeAI** is a smart surplus food rescue and intelligent NGO matching web application built using the MERN stack. It connects surplus food donors (college canteens, catering companies, restaurants) with verified NGOs and volunteer dispatchers.

---

## 2. Implemented Architecture & Monorepo Structure

```
UDAYAM/
├── package.json               # Root monorepo orchestrator
├── .env.example               # Environment variables template
├── .env                       # Local environment configuration
├── README.md                  # Comprehensive setup, demo guide & test summary
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── config/db.js       # MongoDB connector with auto-memory fallback
│   │   ├── models/            # Mongoose schemas: User, DonorProfile, NGOProfile,
│   │   │                      # VolunteerProfile, Donation, Match, Rescue, ImpactRecord, AuditLog
│   │   ├── services/
│   │   │   ├── matchingService.js  # 4-factor intelligence engine + eligibility filtering
│   │   │   ├── routeService.js     # OSRM road routing with Leaflet geometry & Haversine fallback
│   │   │   └── rescueService.js    # State machine, atomic acceptance, impact accounting
│   │   ├── controllers/       # Auth, Donation, Match, NGO, Rescue, Analytics, Admin
│   │   ├── routes/            # Express v1 modular routing
│   │   ├── middleware/        # JWT authMiddleware & role-based authorization
│   │   ├── sockets/           # Real-time WebSocket room broadcasting
│   │   ├── app.js
│   │   └── server.js
│   ├── seed/seed.js           # Deterministic seeding script for 100-portion demo
│   └── tests/matching.test.js # Automated unit tests for intelligence engine
└── client/
    ├── package.json
    ├── vite.config.js         # Vite config with backend proxy
    ├── tailwind.config.js     # Forest-green & warm cream design tokens
    ├── src/
        ├── App.jsx            # Protected role routing
        ├── main.jsx
        ├── index.css
        ├── context/AuthContext.jsx
        ├── services/api.js & socket.js
        ├── components/
        │   ├── common/Navbar.jsx
        │   ├── maps/RouteMap.jsx         # Leaflet interactive road route visualization
        │   └── matches/ScoreBreakdownCard.jsx # 4 normalized factors & human-readable rationale
        ├── layouts/DashboardLayout.jsx
        └── pages/
            ├── public/LandingPage.jsx
            ├── auth/LoginPage.jsx & RegisterPage.jsx
            ├── donor/DonorDashboard.jsx, CreateDonationPage.jsx, MatchRecommendationsPage.jsx
            ├── ngo/NgoDashboard.jsx
            └── admin/AdminDashboard.jsx
```

---

## 3. The Food Rescue Intelligence Engine

The core innovation is situated in `server/src/services/matchingService.js`:

1. **Strict Safety & Eligibility Constraints**:
   - Excludes unverified (`PENDING`, `REJECTED`, `SUSPENDED`) NGOs.
   - Excludes recipients whose required travel time exceeds the food's safe shelf-life deadline.
   - Excludes candidates without matching food category acceptance or necessary cold-storage capacity.
2. **Normalized Multi-Factor Scoring (0-100)**:
   $$\text{FinalScore} = 0.35 \times \text{Urgency} + 0.25 \times \text{QuantityFit} + 0.25 \times \text{TransitSpeed} + 0.15 \times \text{DemandFit}$$
3. **Transparent Explanations**:
   - Every candidate card shows individual sub-factor percentages and natural-language rationale.
   - Excluded candidates feature explicit rejection justifications.
4. **Capacity-Aware Multi-NGO Split Allocation**:
   - Automatically distributes surplus when portion quantity exceeds a single NGO's intake limit.

---

## 4. Test Verification Results

Automated Node.js test suite (`server/tests/matching.test.js`) executed with 100% pass rate:

```
✔ Haversine distance calculation is accurate within geographic bounds (3.885ms)
✔ Eligibility check excludes unverified NGOs (0.9399ms)
✔ Eligibility check excludes NGOs when food category is not supported (0.2237ms)
✔ Eligibility check fails if deadline is expired (0.1624ms)
✔ Component scoring correctly weights urgency, quantity, travel, and demand (28.0108ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
```

Frontend production build (`npm run build` in `client/`):
```
dist/index.html                   1.24 kB │ gzip:   0.69 kB
dist/assets/index-BT2QPcF2.css   26.48 kB │ gzip:   5.35 kB
dist/assets/index-B00-2ozV.js   447.74 kB │ gzip: 136.34 kB
✓ built in 6.91s
```
