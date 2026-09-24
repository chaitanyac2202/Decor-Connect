import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { ToastProvider } from '../components/Toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-poppins' });

export const metadata = {
  title: 'DecorConnect | Find Home Decor Buyers',
  description: 'AI-powered B2B matchmaking and outreach tool for home decor businesses.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-[#0a0a1a] text-white font-sans antialiased">
        <AppProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
