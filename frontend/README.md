# DAB Enterprise Ltd. - Frontend Interface Portal

This sub-workspace contains the user interface, design systems, and pages of the DAB Enterprise Ltd. Business Management system.

## 🎨 Design & Libraries

- **Framework**: React 19 + Vite compiling
- **Styles**: Tailwind CSS v4 styling rules
- **Graphs**: Recharts (fully responsive visual SVG indicators for trend counting)
- **Icons**: Lucide React
- **Client Queries**: Axios with intelligent request authorization interceptors and auto-expiring logins handler.

## 📂 Directories

- `src/components/`: Reusable interface components and loading bars.
- `src/context/`: Auth state provider storing JWTs and personnel privilege levels in standard state.
- `src/layouts/`: Enterprise workspace sidebars, headers, responsive mobile drawer controls, and db connection status flags.
- `src/pages/`: Module page layouts:
  - `Login.jsx` & `Register.jsx` (Portal login screens with demo mock values prefill)
  - `Dashboard.jsx` (Aggregate financial KPIs)
  - `Categories.jsx` (Group items catalog)
  - `Products.jsx` (Item inventory specs)
  - `Sales.jsx` (Interactive Point of Sale checkout desk)
  - `Inventory.jsx` (Adjustment audits)
  - `Customers.jsx` (Buyer files index)
  - `Suppliers.jsx` (Procurement links)
  - `Employees.jsx` (Personnel and shift roles)
