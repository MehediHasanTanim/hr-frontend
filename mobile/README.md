# HR Platform Mobile App — Sprint 12 (2.6.F3)

## Stack (pending confirmation — see §8 open questions)
- React Native (Expo managed workflow)
- React Navigation (native-stack + bottom-tabs)
- React Query v5, Zustand, React Hook Form + Zod
- expo-secure-store for tokens (never AsyncStorage)
- lucide-react-native for icons

## Screen Inventory
```
(auth) → Login, ForgotPassword, BiometricUnlock (deferred)
(main) → Home (ESS), Leave, Payslips, Notifications
```

## Auth Flow
- Access token in memory (Zustand), refresh in secure storage
- Silent 401 refresh via Axios interceptor
- Biometric re-auth after N minutes backgrounded → flagged for V2

## Offline (V1)
- NetInfo banner when offline
- Form submission disabled when offline (no offline queueing)
- React Query cache-then-network

## Out of Scope this Sprint
- Push notification delivery
- Deep linking / universal links
- App store submission
- Offline mutation queueing

## Setup
```bash
cd mobile
npm install
npx expo start
```

## Status
📱 Scaffolded screens only — full screen implementation pending team input on:
1. Expo managed vs bare RN
2. Biometric re-auth policy
3. Shared Zod schema package strategy
4. Push notification stub scope
