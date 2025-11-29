import React from 'react';
import { CreditCard as CardIcon } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <CardIcon className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-indigo-950">Card Genius</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Compare Cards</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Login</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Card Genius. All rights reserved.</p>
          <p className="mt-2">Recommendations are estimates based on standard bank data.</p>
        </div>
      </footer>
    </div>
  );
};
