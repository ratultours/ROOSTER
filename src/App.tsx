import React from 'react';
import { AppProvider } from './AppContext';
import { Header, Hero, Footer, Toast } from './components/Layout';
import { Products } from './components/Products';
import { CartAndCheckout } from './components/CartAndCheckout';
import { AuthProfile } from './components/AuthProfile';

function AppContent() {
  return (
    <>
      <Header />
      <Hero />
      <Products />
      <Footer />
      <CartAndCheckout />
      <AuthProfile />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
