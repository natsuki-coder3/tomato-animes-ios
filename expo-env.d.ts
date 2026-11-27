/// <reference types="expo" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    EAS_BUILD_PROFILE: 'development' | 'preview' | 'production';
    API_BASE_URL: string;
    FIREBASE_API_KEY: string;
    FIREBASE_AUTH_DOMAIN: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_STORAGE_BUCKET: string;
    FIREBASE_MESSAGING_SENDER_ID: string;
    FIREBASE_APP_ID: string;
    FIREBASE_MEASUREMENT_ID: string;
    APPLOVIN_SDK_KEY: string;
  }
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
declare module '*.ttf';
declare module '*.woff';
declare module '*.woff2';
declare module '*.mp4';
declare module '*.mov';
declare module '*.mp3';
declare module '*.aac';
declare module '*.m4a';