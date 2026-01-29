# Expense Tracker Mobile App

A beautiful React Native mobile app for tracking income and expenses, built with Expo and connecting to your Node.js backend.

## 📱 Features

- ✅ User authentication (Login/Register)
- ✅ Google OAuth support
- ✅ Home dashboard with monthly spending overview
- ✅ Recent transactions list
- ✅ Spending wallet balance
- ✅ Analytics screen (coming soon)
- ✅ Transaction details screen (coming soon)
- ✅ Account management

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Your backend server running
- Expo Go app on your phone (for testing)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure your backend URL:**

Edit `config/env.ts` and update the API_URL:
```typescript
export const API_URL = 'http://YOUR_LOCAL_IP:3000';  // Replace with your machine's IP
```

**Important**: Don't use `localhost` - use your actual local IP address (find it with `ipconfig` on Windows or `ifconfig` on Mac/Linux). Your phone needs to access your backend on the same network.

3. **Configure Google OAuth (Optional):**

If you want to use Google Sign-In:
- Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
- Update the client IDs in `config/env.ts`

### Running the App

1. **Start your backend server first:**
```bash
# In your backend directory
npm start
```

2. **Start the Expo development server:**
```bash
npm start
```

3. **Run on your device:**
- Scan the QR code with Expo Go app (Android) or Camera app (iOS)
- Or press `a` for Android emulator or `i` for iOS simulator

## 📁 Project Structure

```
app/
├── (auth)/              # Authentication screens
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/              # Main app tabs
│   ├── index.tsx        # Home screen
│   ├── transactions.tsx
│   ├── analytics.tsx
│   └── account.tsx
├── _layout.tsx          # Root layout
└── index.tsx            # Entry point

services/
├── api.ts               # Axios instance with interceptors
├── auth.service.ts      # Authentication API calls
├── expense.service.ts   # Expense API calls
└── income.service.ts    # Income API calls

context/
└── AuthContext.tsx      # Global auth state management

constants/
└── theme.ts             # Colors, spacing, fonts
```

## 🎨 Design System

The app uses a consistent design system with:
- **Primary Color**: Purple (#8B7FD9) - matching your UI design
- **Secondary Color**: Green (#A5D8A7) - for income
- **Background**: Light gray (#F5F5F5)
- **Card**: White (#FFFFFF)

## 🔧 Backend Requirements

Make sure your backend has these endpoints:

**Authentication:**
- `POST /register` - Register new user
- `POST /login/jwt` - Login with JWT
- `POST /login/google/mobile` - Google OAuth (optional)

**Expenses:**
- `GET /all-expenses` - Get all user expenses
- `POST /create-expense` - Create new expense

**Income:**
- `GET /all-incomes` - Get all user incomes
- `POST /create-income` - Create new income

All protected routes should accept `Authorization: Bearer <token>` header.

## 📝 TODO / Next Steps

- [ ] Add create expense/income forms
- [ ] Implement transactions screen with charts
- [ ] Build analytics screen with income vs expense comparison
- [ ] Add edit/delete functionality
- [ ] Implement shared budgets UI
- [ ] Add date filters
- [ ] Create categories management
- [ ] Add pull-to-refresh on all screens
- [ ] Implement offline support
- [ ] Add push notifications

## 🐛 Troubleshooting

**Cannot connect to backend:**
- Make sure you're using your local IP, not `localhost`
- Check if backend is running
- Ensure phone and computer are on same WiFi network
- Check firewall settings

**Google Sign-In not working:**
- Make sure you have the correct OAuth credentials
- Check that redirect URIs are configured correctly
- For Expo Go, you need Expo client ID

**App crashes on startup:**
- Clear cache: `expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check that all required packages are installed

## 📦 Key Dependencies

- `expo-router` - File-based routing
- `@tanstack/react-query` - Data fetching and caching
- `axios` - HTTP client
- `expo-secure-store` - Secure token storage
- `expo-linear-gradient` - Beautiful gradients
- `@expo/vector-icons` - Icons

## 🔐 Security Notes

- Tokens are stored securely using `expo-secure-store`
- API calls automatically include auth token
- Sensitive data never logged in production
- Passwords are never stored in the app

## 📱 Screenshots

(Add screenshots of your app here once you run it!)

## 🤝 Contributing

This is your personal project, but here are some best practices:
- Keep components small and reusable
- Use TypeScript for type safety
- Follow the existing code structure
- Test on both iOS and Android

## 📄 License

Private project - All rights reserved

---

**Happy coding! 🚀**

Need help? Check the Expo docs: https://docs.expo.dev
