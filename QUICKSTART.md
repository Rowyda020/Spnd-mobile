# 🚀 Quick Start Guide

## Step 1: Update Backend URL

1. Find your computer's local IP address:
   - **Windows**: Open CMD and type `ipconfig`, look for "IPv4 Address"
   - **Mac/Linux**: Open Terminal and type `ifconfig`, look for "inet" under your WiFi adapter
   
2. Edit `config/env.ts`:
   ```typescript
   export const API_URL = 'http://192.168.1.XXX:3000';  // Replace XXX with your IP
   ```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Start Your Backend

In your backend directory:
```bash
npm start
```

Make sure it's running on port 3000!

## Step 4: Start the Mobile App

```bash
npx expo start
```

## Step 5: Open on Your Phone

1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in your terminal
3. Wait for the app to load

## Testing the App

### 1. Register a New Account
- Open the app
- Tap "Sign Up"
- Fill in username, email, password
- Tap "Create Account"

### 2. Login
- Enter your email and password
- Tap "Sign In"

### 3. View Dashboard
- You should see the home screen with:
  - Monthly spending total
  - Spending wallet balance
  - Recent transactions (will be empty if you haven't added any)

## Common Issues

### "Network request failed"
- ✅ Check that backend is running
- ✅ Verify you're using your local IP, not localhost
- ✅ Ensure phone and computer are on same WiFi

### "Cannot connect to backend"
- ✅ Check if you can access `http://YOUR_IP:3000` in your phone's browser
- ✅ Check firewall settings on your computer
- ✅ Make sure backend is listening on 0.0.0.0, not just localhost

### App crashes immediately
```bash
expo start --clear
```

## Next Steps

Once the app is running:

1. **Add some test data** via your backend or API:
   - Create some income entries
   - Create some expenses
   - Refresh the home screen to see them

2. **Explore the screens**:
   - Home: See your spending overview
   - Transactions: (Coming soon)
   - Analytics: (Coming soon)
   - Account: View profile and logout

3. **Start building features**:
   - Add expense/income creation forms
   - Build the charts for transactions screen
   - Implement analytics visualizations

## Development Tips

### Hot Reload
The app supports hot reload - just save your files and see changes instantly!

### Debugging
- Shake your device to open developer menu
- Press `j` in terminal to open Chrome DevTools
- Use `console.log()` to debug

### Testing on Different Devices
- iOS: Press `i` in terminal to open iOS Simulator
- Android: Press `a` to open Android Emulator
- Web: Press `w` to open in browser (limited functionality)

## File Structure Quick Reference

```
Need to add a new screen?
→ app/(tabs)/newscreen.tsx

Need to add authentication logic?
→ context/AuthContext.tsx

Need to call a new API endpoint?
→ services/*.service.ts

Need to change colors or spacing?
→ constants/theme.ts

Need to add new navigation?
→ app/(tabs)/_layout.tsx
```

## Ready to Code!

You now have:
- ✅ Authentication working (login/register)
- ✅ API integration set up
- ✅ Beautiful home screen
- ✅ Navigation between screens
- ✅ State management with React Query
- ✅ Secure token storage

Start building your features! 🎉

---

**Pro Tip**: Keep the backend terminal and Expo terminal open side-by-side so you can see logs from both.
