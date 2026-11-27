import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { BRAND_CONTACTS, buildHashShareUrl, buildWhatsAppShareUrl } from '../utils/utm';

const ReferAndEarnPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const shareUrl = buildHashShareUrl('/social-club', {
    source: 'member_invite',
    medium: 'referral_link',
    campaign: 'life_begins_with_a_hello',
  });

  const whatsappUrl = buildWhatsAppShareUrl(
    `Life Begins With a Hello — Come alone, explore together with Vanhsya Social Club (UAE 18+). Join here: ${shareUrl}`
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-28 pb-24 bg-[#0D0A14] min-h-screen text-white px-4">
      <SeoHead
        title="Invite Friends | Vanhsya Social Club UAE"
        description="Invite UAE residents (18+) to Vanhsya Social Club — Life Begins With a Hello. Come alone. Explore together."
      />

      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.28em] text-[#C4B5FD]">
            Life Begins With a Hello
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-cinzel text-white">
            Invite Your Circle to Vanhsya Social Club
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-base leading-relaxed">
            Share your personal UTM invitation link via WhatsApp or Instagram so friends in the UAE (18+) can claim their Founding Member ID and RSVP for verified meetups.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#151121] border border-purple-500/25 space-y-6">
          <h2 className="text-xl font-cinzel font-bold text-white">Shareable Invitation Link</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-gray-300 break-all">
              {shareUrl}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-gray-200 shrink-0"
            >
              {copied ? 'Copied!' : 'Copy Invite Link'}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-200 text-xs font-semibold"
            >
              Share on WhatsApp →
            </a>
            <a
              href={BRAND_CONTACTS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 text-xs font-semibold"
            >
              Follow {BRAND_CONTACTS.instagramHandle} →
            </a>
            <Link
              to="/partners/apply"
              className="px-6 py-3 rounded-xl bg-[#8A2BE2]/25 hover:bg-[#8A2BE2]/35 border border-purple-500/35 text-[#E9D5FF] text-xs font-semibold"
            >
              Apply as Community Host →
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/15 text-xs text-amber-100/90 leading-relaxed">
          <strong className="text-amber-300 font-mono uppercase">Compliance Notice:</strong> Monetary cash bounties or token-linked referral payouts are not enabled without a separate compliance review. Invitations currently connect members directly with verified UAE Social Club experiences.
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarnPage;
