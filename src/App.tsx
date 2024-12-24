import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { VideoPage } from './pages/VideoPage';
import { SharedVideoPage } from './pages/SharedVideoPage';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/video/:videoId" element={<VideoPage />} />
              <Route path="/shared/:videoId" element={<SharedVideoPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      <Toaster position="bottom-center" />
    </HelmetProvider>
  );
};

export default App;