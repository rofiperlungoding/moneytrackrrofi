<div align="center">

# 💰 MoneyTrackr

### *Your Personal Finance Companion*

**Track your financial journey with style and precision**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

---

*MoneyTrackr is a modern, feature-rich personal finance application that helps you take control of your financial life with beautiful design, powerful analytics, and privacy-first approach.*

[🚀 **Live Demo**](#) • [📚 **Documentation**](#) • [🐛 **Report Bug**](#) • [✨ **Request Feature**](#)

</div>

## ✨ Features

### 💳 **Financial Management**
- **Smart Expense Tracking** - Categorize and monitor your spending with detailed analytics
- **Income Management** - Track multiple income sources and recurring payments
- **Goal Setting** - Set and achieve savings goals with progress tracking
- **Budget Controls** - Set spending limits and receive intelligent alerts

### 🔐 **Authentication & Security**
- **Secure User Authentication** - Email/password registration and login with Supabase
- **Two-Factor Authentication** - Enhanced security with email and phone verification
- **Account Management** - Complete profile setup and account deletion functionality
- **Session Management** - Automatic session handling and timeout controls

### 🌍 **Multi-Currency Support**
- **Real-time Exchange Rates** - Automatic currency conversion and rate updates
- **Global Accessibility** - Support for USD, EUR, GBP, JPY, IDR and more
- **Currency Switching** - Seamlessly switch between different currencies

### 📊 **Advanced Analytics**
- **Interactive Dashboards** - Beautiful charts and visualizations
- **Spending Insights** - Detailed breakdowns by category and time period
- **Trend Analysis** - Track your financial progress over time
- **Custom Reports** - Generate detailed financial reports

### 🎨 **Premium User Experience**
- **Cinematic Design** - Dark theme with stunning green accent colors
- **Smooth Animations** - Powered by Framer Motion and GSAP
- **Responsive Layout** - Perfect experience across all devices
- **Micro-interactions** - Delightful hover effects and transitions

### 🔒 **Privacy & Data Management**
- **Privacy First** - GDPR compliant with full data control
- **Complete Account Deletion** - Permanently remove your account and all data from servers
- **Data Export** - Export your data anytime in JSON format
- **Local Storage** - Option to keep data locally with cloud sync

### 🔔 **Smart Notifications**
- **Budget Alerts** - Get notified when approaching spending limits
- **Goal Reminders** - Stay motivated with progress updates
- **Security Notifications** - Monitor account activity and changes

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **GSAP** - Professional-grade animation library

### **Backend & Database**
- **Supabase** - Open source Firebase alternative
  - Authentication & User Management
  - PostgreSQL Database
  - Real-time subscriptions
  - Edge Functions for server-side logic
  - Row Level Security (RLS)

### **Data Visualization**
- **Recharts** - Composable charting library built on React components
- **Custom Charts** - Beautiful pie charts, line graphs, and progress indicators

### **Development Tools**
- **Vite** - Next generation frontend tooling
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization

### **Icons & Assets**
- **Lucide React** - Beautiful & consistent icon family
- **Custom Graphics** - Handcrafted illustrations and graphics

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (version 18.0.0 or higher)
- **npm** or **yarn** package manager
- **Supabase Account** (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/moneytrackr.git
   cd moneytrackr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   Create a new Supabase project at [supabase.com](https://supabase.com)
   
   Copy `.env.example` to `.env` and add your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Supabase project details:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Deploy the Edge Function** (for account deletion)
   
   Install the Supabase CLI and deploy the delete-user function:
   ```bash
   # Install Supabase CLI
   npm install -g @supabase/cli
   
   # Deploy the edge function
   supabase functions deploy delete-user
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application running.

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📱 Usage Guide

### **Getting Started**
1. **Create Account** - Sign up with email and password
2. **Complete Profile Setup** - Set up your name, avatar, and preferred currency
3. **Add Your First Transaction** - Record an expense or income to get started
4. **Set Financial Goals** - Create savings targets or spending limits
5. **Explore the Dashboard** - View your financial overview and insights

### **Key Features Usage**

#### **Account Management**
- **Profile Setup** - Complete your profile during first login
- **Two-Factor Authentication** - Enable 2FA for enhanced security
- **Account Deletion** - Permanently delete your account and all data

#### **Adding Transactions**
- Use the floating "+" button for quick access
- Fill in amount, description, category, and payment method
- Add receipts and notes for better tracking

#### **Managing Goals**
- Set savings targets with deadlines
- Create expense limits for specific categories
- Track progress with visual indicators

#### **Customizing Experience**
- Switch currencies in real-time
- Adjust privacy settings and data visibility
- Customize appearance and notifications

## 📁 Project Structure

```
moneytrackr/
├── public/                 # Static assets
│   └── Money (2).png      # Application logo
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx  # Main dashboard component
│   │   ├── AuthPage.tsx   # Authentication page
│   │   ├── ExpenseTracker.tsx
│   │   ├── IncomeTracker.tsx
│   │   ├── Goals.tsx
│   │   ├── Settings.tsx   # Settings and profile management
│   │   └── ...
│   ├── contexts/          # React context providers
│   │   ├── AuthContext.tsx      # Authentication and user management
│   │   ├── FinanceContext.tsx   # Financial data management
│   │   ├── CurrencyContext.tsx  # Multi-currency support
│   │   ├── SecurityContext.tsx  # Security features
│   │   └── ...
│   ├── lib/              # External service configurations
│   │   └── supabase.ts   # Supabase client configuration
│   ├── utils/            # Utility functions
│   │   ├── currency.ts   # Currency conversion utilities
│   │   └── financialStatus.ts
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── supabase/
│   └── functions/       # Supabase Edge Functions
│       └── delete-user/ # Account deletion function
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite configuration
└── README.md           # Project documentation
```

## 🔧 Supabase Setup

### **Required Tables**
The application uses Supabase's built-in authentication system. No additional tables are required for basic functionality as the app primarily uses local storage with optional cloud sync.

### **Edge Functions**
- **delete-user** - Handles permanent account deletion from the server

### **Authentication Configuration**
1. Enable email authentication in your Supabase project
2. Configure email templates (optional)
3. Set up proper RLS policies if you add custom tables

## 🎯 Key Components

### **Core Components**
- **AuthPage** - Registration and login interface
- **Dashboard** - Financial overview and quick insights
- **ExpenseTracker** - Detailed expense management
- **IncomeTracker** - Income source management
- **Goals** - Financial goal setting and tracking
- **Settings** - User preferences and security

### **Context Providers**
- **AuthContext** - User authentication and account management
- **FinanceContext** - Financial data management
- **CurrencyContext** - Multi-currency support
- **SecurityContext** - Security features and 2FA
- **NotificationContext** - Alert and notification system

## 🔐 Security Features

### **Authentication**
- Secure email/password authentication via Supabase
- Session management with automatic token refresh
- Password reset functionality

### **Two-Factor Authentication**
- Email verification codes
- Phone number verification (demo implementation)
- Secure OTP generation and validation

### **Data Protection**
- Row Level Security (RLS) in Supabase
- Secure API endpoints with proper authorization
- Complete account deletion with server-side cleanup

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Ways to Contribute**
- 🐛 **Bug Reports** - Report issues and help improve stability
- ✨ **Feature Requests** - Suggest new features and enhancements
- 📝 **Documentation** - Improve docs and add examples
- 🧑‍💻 **Code Contributions** - Submit pull requests with improvements

### **Development Process**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### **Code Guidelines**
- Follow TypeScript best practices
- Use meaningful component and variable names
- Add comments for complex logic
- Ensure responsive design compatibility
- Test on multiple browsers and devices
- Follow Supabase security best practices

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React library
- **Supabase** - For the excellent backend-as-a-service platform
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For beautiful animations
- **Lucide** - For the consistent icon system
- **Community** - For feedback and contributions

---

<div align="center">

**Made with ❤️ and ☕ by passionate developers**

[⬆ Back to Top](#-moneytrackr)

*If you found this project helpful, please consider giving it a ⭐ star!*

</div>