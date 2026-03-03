<div align="center">

# 💰 MoneyTrackr

### *Your Personal Finance Companion*

**Track your financial journey with style and precision**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

---

*MoneyTrackr is a modern, feature-rich personal finance application built with React & Supabase. It features a cinematic dark theme, multi-currency support, financial goal tracking, and a privacy-first approach to help you take control of your money.*

</div>

## ✨ Features

### 💳 Financial Management
- **Smart Expense Tracking** — Categorize and monitor spending with detailed analytics
- **Income Management** — Track multiple income sources and recurring payments
- **Goal Setting** — Set and achieve savings goals with visual progress tracking
- **Budget Controls** — Set spending limits and receive intelligent alerts

### 🔐 Authentication & Security
- **Supabase Auth** — Secure email/password registration and login
- **Two-Factor Authentication** — Email and phone verification via OTP
- **Session Management** — Automatic token refresh and timeout controls
- **Complete Account Deletion** — Permanently remove your account and all server-side data

### 🌍 Multi-Currency Support
- **15+ Currencies** — USD, EUR, GBP, JPY, IDR, SGD, AUD, CAD, CHF, CNY, KRW, MYR, THB, PHP, INR
- **Custom Currencies** — Add your own currencies via Reference Data Management
- **Live Conversion** — Seamlessly switch between currencies app-wide

### 📊 Advanced Analytics
- **Interactive Dashboard** — Charts powered by Recharts (pie, bar, line)
- **Spending Insights** — Breakdowns by category and time period
- **Budget Progress** — Visual budget utilization indicators
- **Financial Overview** — Net worth, income vs expenses, and trend analysis

### 🎨 Premium User Experience
- **Cinematic Dark Theme** — Deep backgrounds with vibrant green accents
- **Smooth Animations** — Powered by Framer Motion and GSAP
- **Responsive Layout** — Sidebar navigation, works on desktop and mobile
- **Micro-interactions** — Hover effects, count-up animations, rotating text

### 🔒 Privacy & Data Management
- **Privacy First** — GDPR-compliant cookie banner and privacy controls
- **Data Export** — Export all your data in JSON format
- **Local Storage Fallback** — Works offline without Supabase configured
- **Reference Data Management** — Customize categories, payment methods, and currencies

### 🔔 Smart Notifications
- **Budget Alerts** — Notified when approaching spending limits
- **Goal Reminders** — Progress updates to keep you motivated
- **Security Notifications** — Account activity monitoring

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI Framework** | React 18 with Hooks & Context API |
| **Language** | TypeScript 5.5 |
| **Styling** | Tailwind CSS 3.4 (custom cinematic theme) |
| **Animations** | Framer Motion + GSAP |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Backend** | Supabase (Auth, PostgreSQL, RLS, Edge Functions) |
| **Build Tool** | Vite 7.3 |
| **Linting** | ESLint 9 + TypeScript ESLint |
| **Date Utils** | date-fns |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** package manager
- **Supabase** account ([supabase.com](https://supabase.com))

### 1. Clone & Install

```bash
git clone https://github.com/rofiperlungoding/moneytrackrrofi.git
cd moneytrackrrofi
npm install
```

### 2. Set Up Supabase

Create a new Supabase project, then create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up the Database

Run the SQL in `setup-database.sql` in your Supabase SQL Editor. This creates all required tables with RLS policies:

- `transactions` — Income and expense records
- `goals` — Financial goals with progress tracking
- `user_settings` — Per-user preferences and configuration
- `categories` — Transaction categories (with defaults)
- `payment_methods` — Payment method options (with defaults)
- `currencies` — Supported currencies (with defaults)

### 4. Start Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | `npm run dev` | Start Vite dev server |
| **Build** | `npm run build` | Production build |
| **Preview** | `npm run preview` | Preview production build |
| **Lint** | `npm run lint` | Run ESLint (shows ✅ on success) |

---

## 📁 Project Structure

```
MoneyTrackr/
├── public/
│   └── Money (2).png              # App logo
├── src/
│   ├── components/                # React components (27 files)
│   │   ├── AuthPage.tsx           # Login & registration
│   │   ├── Dashboard.tsx          # Main financial overview
│   │   ├── ExpenseTracker.tsx     # Expense list & management
│   │   ├── ExpenseForm.tsx        # Add/edit expense form
│   │   ├── IncomeTracker.tsx      # Income list & management
│   │   ├── IncomeForm.tsx         # Add/edit income form
│   │   ├── Goals.tsx              # Goals list & management
│   │   ├── GoalForm.tsx           # Add/edit goal form
│   │   ├── Settings.tsx           # User settings & profile
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   ├── TopBar.tsx             # Top navigation bar
│   │   ├── DataManagementSettings.tsx  # Manage categories/currencies/methods
│   │   ├── FriendlyFinancialOverview.tsx
│   │   ├── FriendlyBudgetProgress.tsx
│   │   ├── FriendlyRecentTransactions.tsx
│   │   ├── FriendlySpendingChart.tsx
│   │   ├── CookieBanner.tsx       # GDPR cookie consent
│   │   ├── CurrencySelector.tsx   # Currency picker
│   │   ├── ErrorBoundary.tsx      # Error boundary wrapper
│   │   ├── NotificationCenter.tsx # Notification dropdown
│   │   ├── ProfileSetup.tsx       # First-time profile setup
│   │   ├── QuickAddButton.tsx     # Floating action button
│   │   ├── SecurityDashboard.tsx  # Security overview
│   │   ├── TwoFactorAuthSetup.tsx # 2FA configuration
│   │   ├── CountUp.tsx            # Animated number counter
│   │   ├── RotatingText.tsx       # Text animation component
│   │   └── SplitText.tsx          # Text split animation
│   ├── contexts/                  # React Context providers (7 files)
│   │   ├── AuthContext.tsx        # Authentication & user state
│   │   ├── FinanceContext.tsx     # Transactions, goals, settings
│   │   ├── CurrencyContext.tsx    # Currency conversion
│   │   ├── ReferenceDataContext.tsx # Categories, methods, currencies CRUD
│   │   ├── NotificationContext.tsx # Notification state
│   │   ├── PrivacyContext.tsx     # Privacy & cookie preferences
│   │   └── SecurityContext.tsx    # 2FA & security state
│   ├── lib/
│   │   └── supabase.ts           # Supabase client init
│   ├── utils/
│   │   └── currency.ts           # Currency formatting helpers
│   ├── App.tsx                    # Root app with providers
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles & Tailwind
├── setup-database.sql             # Full Supabase SQL schema
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── eslint.config.js
└── tsconfig.json
```

---

## 🔧 Supabase Setup

### Database Tables

All tables use **Row Level Security (RLS)** — users can only access their own data.

| Table | Purpose |
|-------|---------|
| `transactions` | Income & expense records with category, amount, date, notes |
| `goals` | Savings/spending goals with target amounts and deadlines |
| `user_settings` | Currency preference, theme, notification settings |
| `categories` | Transaction categories (defaults + user-created) |
| `payment_methods` | Payment options (defaults + user-created) |
| `currencies` | Supported currencies (defaults + user-created) |

### Edge Functions

- **`delete-user`** — Server-side permanent account deletion (requires Supabase CLI to deploy)

### Authentication

Email/password auth is used. Enable it in your Supabase dashboard under **Authentication → Providers**.

---

## 🎯 Key Components

### Pages
| Component | Description |
|-----------|-------------|
| `AuthPage` | Login, registration, password reset |
| `Dashboard` | Financial overview with charts and quick stats |
| `ExpenseTracker` | Full expense history with filters and search |
| `IncomeTracker` | Income management with source tracking |
| `Goals` | Goal creation, progress tracking, contributions |
| `Settings` | Profile, security, privacy, data management |

### Context Providers
| Context | Responsibility |
|---------|---------------|
| `AuthContext` | User auth state, login/logout, profile |
| `FinanceContext` | CRUD for transactions, goals, settings; Supabase sync |
| `CurrencyContext` | Active currency, conversion rates |
| `ReferenceDataContext` | CRUD for categories, payment methods, currencies |
| `NotificationContext` | In-app notification queue |
| `PrivacyContext` | Cookie consent, privacy preferences |
| `SecurityContext` | 2FA state, security settings |

---

## 🔐 Security

- **Supabase Auth** — Secure token-based authentication
- **Row Level Security** — Database-level access control
- **Two-Factor Auth** — Email/phone OTP verification
- **Session Management** — Auto-refresh with configurable timeout
- **Account Deletion** — Full server-side data wipe via Edge Function
- **GDPR Compliance** — Cookie banner with granular consent

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and ensure `npm run lint` passes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Guidelines
- Follow TypeScript strict mode
- Use meaningful component and variable names
- Ensure responsive design
- All new components must pass ESLint

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [rofiperlungoding](https://github.com/rofiperlungoding)**

[⬆ Back to Top](#-moneytrackr)

*If you found this helpful, give it a ⭐!*

</div>