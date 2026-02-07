<p align="center">
  <img src="https://github.com/user-attachments/assets/55c67f4b-cf72-4b6b-84b0-2fa88cce09b0" 
       alt="Spnd App Icon" 
       width="180" />
</p>

# 💰 Spnd - Smart Budget Tracking App

> The official **React Native** mobile client for Spnd – a modern expense & budget tracker. Built with **Expo SDK 54**, **Expo Router**, and **TypeScript** for iOS, Android, and (optional) web.

📱 **Platforms**: iOS, Android (managed Expo workflow)  
🌐 **Web** (preview): Supported via Expo web  
🚀 **Production Builds**: Powered by EAS (Expo Application Services)

[![Expo](https://img.shields.io/badge/Expo_SDK_54-000.svg?logo=expo&style=flat)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue.svg)](https://reactnative.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Key Features

- 🔐 **Secure Authentication**  
  Google OAuth + JWT (via backend API)  
- 💸 **Expense & Income Tracking**  
  Add/edit/delete transactions, categories, notes, dates  
- 👥 **Shared Budgets**  
  Collaborate with family/friends in real-time  
- 📊 **Analytics & Insights**  
  Monthly summaries, category breakdowns, budget vs. actual charts  
- 📈 **Beautiful UI/UX**  
  Smooth animations, dark mode support, responsive layouts  
- ⚡ **Offline-first** (partial)  
  Local caching + sync when online  
- 🔔 **Push Notifications** (planned)

---

## 🏗️ Tech Stack (Mobile)

- **Framework**: Expo SDK 54  
- **Navigation**: Expo Router v6 (file-based routing)  
- **Language**: TypeScript  
- **State Management**: Context API + React Query (TanStack Query)  
- **HTTP Client**: Axios  
- **UI Library**: Custom components + SVGs / charts  
- **Auth**: expo-auth-session, expo-secure-store  
- **Charts**: react-native-chart-kit  
- **Build & Deploy**: EAS Build / Submit  
- **Linting/Formatting**: ESLint + Prettier  
- **Testing**: Jest + React Native Testing Library (TBD)

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥18  
- Yarn / npm / pnpm  
- Expo CLI (`npm install -g expo-cli`)  
- Android Studio (for Android emulator) or Xcode (for iOS simulator)  
- EAS CLI (`npm install -g eas-cli`) – for builds

### Installation

```bash
# Clone the mobile repo
git clone https://github.com/rowyda020/spnd-mobile.git
cd spnd-mobile

# Install dependencies
npm install
# or yarn install / pnpm install

# Start development server
npx expo start
# or npx expo start --clear (to reset cache)

# Press
#   a → Android emulator/device
#   i → iOS simulator
#   w → web browser (optional)
