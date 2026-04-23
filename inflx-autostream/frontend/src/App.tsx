import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import DocsPage from './pages/DocsPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
