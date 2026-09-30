# Adi Setu mobile prototype

The frontend is an Expo React Native prototype named Adi Setu. It runs without DigiLocker credentials. Profile, scholarship browsing, application drafts, sample submissions, themes, and language settings use local prototype data. JAGO uses the backend OpenAI route when configured.

## Start the mobile app

```powershell
cd frontend
npm install
npx expo start
```

Open the QR code with Expo Go, or press `w` for the web preview. Each screen has a separate route file under `frontend/app/`.

The document consent flow is simulated. It does not open DigiLocker, verify ST status, download or upload real documents, or submit an application to a government portal. Asha is a sample profile name. On web, prototype state is saved in local storage; on native, it stays in memory for the app session.

Run the backend for live JAGO responses: `cd backend; node server.js`. Set `OPENAI_API_KEY` in `backend/.env`. On a physical phone, set `EXPO_PUBLIC_API_URL` in `frontend/.env` to your computer's LAN address, such as `http://192.168.1.20:3002/api`. The key stays on the backend and is never embedded in the mobile app. Without a key and reachable backend, JAGO displays a setup message.
