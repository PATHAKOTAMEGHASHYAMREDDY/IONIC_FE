// src/environments/environment.prod.ts
// This file is used when building for production (ng build --configuration production)
// 👇 Change this URL to your deployed backend URL when deploying

export const environment = {
  production: true,
  apiUrl: 'http://YOUR_SERVER_IP:4000/graphql'   // ← update before production build
};
