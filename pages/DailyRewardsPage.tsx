import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';

const DailyRewardsPage: React.FC = () => {
  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#0D0A14] text-white px-4">
      <SeoHead
        title="Member Perks & Compliance Status | Vanhsya Social Club"
        description="Token-based reward promotions and staking programs are suspended pending a dedicated compliance review. Join Vanhsya Social Club UAE for verified community experiences."
      />

      <div className="max-w-3xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl border border-amber-500/35 bg-[#151121] space-y-6 text-center">
          <span className="inline-block text-xs font-mono uppercase tracking-[0.25em] text-amber-300 border border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-full">
            Compliance Review Gate
          </span>
          <h1 className="text-3xl sm:text-5xl font-cinzel font-black text-white">
            Token Rewards Paused Pending Review
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            In accordance with UAE governance and compliance standards, all token-linked staking pools, yield percentages, and crypto credit claims are disabled until a separate compliance review is completed.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            To participate in real-world curated meetups across the 7 Emirates, register as a verified 18+ Founding Member of <strong className="text-white">Vanhsya Social Club</strong>.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/social-club"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#8A2BE2] to-[#6A1BB2] text-white font-semibold text-sm hover:opacity-95"
            >
              Get Founding Member ID
            </Link>
            <Link
              to="/meetups"
              className="px-7 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-gray-200 font-semibold text-sm"
            >
              Browse Verified MeetUps
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRewardsPage;
