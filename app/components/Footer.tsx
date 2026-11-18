import { useState } from 'react';
import HelpDeskModal from '../HelpDeskModal';
import { HelpCircle } from 'lucide-react';

export default function FooterHelpTrigger() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <footer className="w-full border-t border-slate-800 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 space-y-4">
        <div className="flex items-center justify-center gap-4 font-bold">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-4 h-4" /> Help Desk & Pricing Guide
          </button>
          <span>•</span>
          <a href="/battles" className="hover:text-white transition-colors">Battle Arena</a>
          <span>•</span>
          <a href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
        </div>
        <p>© 2026 Project-Apex AI Virtual Artist Ecosystem. All rights reserved.</p>
      </footer>

      {isHelpOpen && <HelpDeskModal onClose={() => setIsHelpOpen(false)} />}
    </>
  );
}