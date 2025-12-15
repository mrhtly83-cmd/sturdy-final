import React, { useState } from 'react';
import SplashScreen from './SplashScreen';
import OnboardingScreen from './OnboardingScreen';
import ScriptCreatorScreen from './ScriptCreatorScreen';
import ManifestoScreen from './ManifestoScreen';

export default function App() {
  const [route, setRoute] = useState('splash'); // splash | onboarding | manifesto | creator

  if (route === 'splash') {
    return <SplashScreen onDone={() => setRoute('onboarding')} />;
  }

  if (route === 'manifesto') {
    return <ManifestoScreen onBack={() => setRoute('onboarding')} />;
  }

  if (route === 'creator') {
    return <ScriptCreatorScreen onBack={() => setRoute('onboarding')} />;
  }

  return (
    <OnboardingScreen
      onGetStarted={() => setRoute('creator')}
      onSeeManifesto={() => setRoute('manifesto')}
    />
  );
}

