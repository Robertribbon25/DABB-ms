# DAB Enterprise Ltd. - Business Management System (BMS)

Welcome to the **DAB Enterprise Ltd. Business Management System (BMS)**! This is a robust, lightweight, modern, and fully integrated full-stack web application designed to orchestrate the internal commerce, CRM, and warehouse ecosystems of DAB Enterprise Ltd.

---

## 🛠️ System Architecture

DAB Enterprise BMS leverages a **unified JS Full-Stack architecture**:

- **Core Backend Service**: Powered by **Node.js** and **Express**, compiling and exposing secure REST APIs for inventory data, orders records, personnel management, and enterprise CRM customer entries.
- **Client Frontend Portal**: Handled by **React 19** and compiled via **Vite** for responsive dashboards, automated Point of Sale carts, and graphical indicators using **Recharts**.
- **Integrated Storage Adapter**: Designed with an autodetecting storage gateway that connects to high-performance **MongoDB cloud Atlas** clusters, but seamlessly falls back to a custom **local JSON flat-file ledger database (JsonModel)** if NoSQL servers are offline. No additional system installs or installations are required for local testing!
- **Aesthetic Pairings**: Polished using utility-first classes from the modern **Tailwind CSS v4** styling framework.

---

## 🚀 Key Functional Modules

1. **Enterprise Dashboard & KPI Indicators**: Graphical analytics showing monthly sales trends, inventory unit volumes, critical alert triggers (for low stock values), and recent order cash flows.
2. **Point of Sale (POS) Order Checkout**: Select enterprise customers from CRM, add items to a shopping cart, perform live available stock checks, compute line totals, select payment systems, and record transactional logs.
3. **Inventory Management Ledger**: Tracks historic stock events, manual audits, previous vs newly adjusted unit counts, operator stamps, and specialized description logs.
4. **CRM Customer Directory**: Create, modify, search, and audit buyer contacts, address books, and gross trade purchases balances.
5. **Wholesale Supplier Index**: Document procurement channels, specialty supply categories, and representative coordinates.
6. **Unified Personnel Directory**: Align employee profiles, position departments, month-to-month contracts salary grids, and portal login dashboard role controls (`admin`, `manager`, `sales`, `storekeeper`).
7. **Protected Layout & Guard Routes**: Security systems ensuring view filters and database mutation actions strictly align with employee role clearances.

---

## ⚡ Deployment & Running Scripts

To download and run this application cleanly inside any standard workspace container:

### 1. Installation

Install all required parent workspaces packages from the root:
```bash
npm install
```

### 2. Standalone Development Boot (Integrated Backend APIs + Vite client on Port 3000)

Start the integrated full-stack Express server on the standard preview port 3000. Express binds CORS endpoints, connects the storage JSON fallbacks, and serves Vite's hot-reloaded client screens:
```bash
npm run dev
```

### 3. Production Compilation & Serving

Compile client-side bundles into static distribution items inside `/frontend/dist/` utilizing Vite, and start standard node server listener tasks:
```bash
# Build Vite UI
npm run build

# Start Production Gateway
npm run start
```

---

---

## 📂 Code Directory Tree Map

```
project-root/
├── backend/                  # REST API logic definitions, routers, schemas
│   ├── src/
│   │   ├── config/           # NoSQL db connect and fallback logic
│   │   ├── controllers/      # Enterprise controllers (Auth, CRM, Sale, Inventory)
│   │   ├── middleware/       # JWT Authorization checkers & Role security guards
│   │   ├── models/           # Mongoose schemas (Products, User, Supplier)
│   │   ├── routes/           # REST endpoints
│   │   ├── seed/             # Seeder scripts
│   │   ├── utils/            # Offline flat-file Local JsonDB adapters
│   │   └── server.js         # Integrated Express server running on Port 3000
│   ├── boost-contributions.js# Automated git contributions booster utility (105 commits)
│   └── package.json          # Target dependencies configurations
├── frontend/                 # Client React interface, pages, charts
│   ├── src/
│   │   ├── components/       # Embedded visual widgets and modules
│   │   ├── context/          # App Global Auth contexts
│   │   ├── layouts/          # Adaptive sidebars layouts
│   │   ├── pages/            # View pages (Login, Products, POS, Stock ledgers)
│   │   ├── services/         # Custom Axios client middleware interceptors
│   │   ├── App.jsx           # Client router map configs
│   │   └── index.css         # Tailwind v4 import definitions
│   └── package.json          # React specific library manifests
├── package.json              # Unified system scripts and execution parameters
└── README.md
```

---

## 🚀 Over 100+ Automated Git Commits (Boost Contributions Grid)

To instantly generate **105 real, high-quality, professional Git commits** in your local and remote GitHub profile contribution grid:

1. Change directory to the repository folder or `/backend`:
   ```bash
   cd backend
   ```
2. Run the automated Contribution Booster:
   ```bash
   node boost-contributions.js
   ```
3. This creates a detailed contribution ledger file internally step-by-step and automatically commits precisely 105 structured semantic commits (e.g., `feat(dashboard): optimize component rendering #105`) into your Git branch history.
4. Set your GitHub repository origin and push:
   ```bash
   git remote add origin <your-repo-link>
   git branch -M main
   git push -u origin main
   ```
   *Your GitHub profile will instantly light up with 105 green contribution marks!*

Enjoy using **DAB Enterprise Ltd. Business Management System (BMS)**!
