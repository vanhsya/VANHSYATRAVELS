import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimateOnScroll from '../components/AnimateOnScroll';
import SeoHead from '../components/SeoHead';
import { SocialEvent } from '../types';
import { BRAND_CONTACTS, buildWhatsAppDirectEnquiryUrl } from '../utils/utm';

interface PublicSurvey {
  id: number;
  eventId: number | null;
  eventTitle: string;
  respondentName: string;
  overallRating: number;
  venueRating: number;
  safetyWelcomeRating: number;
  wouldAttendAgain: boolean;
  highlights: string;
  createdAt: string;
}

const COMMUNITY_CIRCLES = [
  {
    title: 'Coffee & Creators',
    subtitle: 'UAE Morning Circles',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Trail & Canyon',
    subtitle: 'Wadi & Summit Hikes',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: 'Evening Lounges',
    subtitle: 'Heritage & City Nights',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Supper Tables',
    subtitle: 'Long-Table Storytelling',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
  },
];

const CommunityPage: React.FC = () => {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [verifiedSurveys, setVerifiedSurveys] = useState<PublicSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [customEventTitle, setCustomEventTitle] = useState('Vanhsya Social Club Gathering');
  const [rsvpCode, setRsvpCode] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [email, setEmail] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [venueRating, setVenueRating] = useState(5);
  const [safetyWelcomeRating, setSafetyWelcomeRating] = useState(5);
  const [wouldAttendAgain, setWouldAttendAgain] = useState(true);
  const [highlights, setHighlights] = useState('');
  const [improvements, setImprovements] = useState('');
  const [consentPublish, setConsentPublish] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = () => {
    Promise.all([
      fetch('/api/events').then((r) => r.json()).catch(() => ({ events: [] })),
      fetch('/api/surveys/verified').then((r) => r.json()).catch(() => ({ surveys: [] })),
    ])
      .then(([evData, svData]) => {
        setEvents(Array.isArray(evData.events) ? evData.events : []);
        setVerifiedSurveys(Array.isArray(svData.surveys) ? svData.surveys : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId ? Number(selectedEventId) : null,
          eventTitle: customEventTitle,
          rsvpCode,
          respondentName,
          email,
          overallRating,
          venueRating,
          safetyWelcomeRating,
          wouldAttendAgain,
          highlights,
          improvements,
          consentPublish,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Could not submit feedback.');
      } else {
        setSubmitSuccess(true);
        setHighlights('');
        setImprovements('');
        loadData();
      }
    } catch {
      setSubmitError('Network error while saving your feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-20 pb-20 min-h-screen bg-[#07050C] text-gray-200 overflow-hidden">
      <SeoHead
        title="Community Collective & Feedback — Vanhsya Social Club UAE"
        description="Explore Vanhsya's UAE community circles, Blueprint missions, official Instagram & WhatsApp channels, and consented post-event attendee surveys."
        path="/community"
      />

      {/* Restored Atmospheric Collective Hero */}
      <section className="relative py-24 lg:py-32 px-4 sm:px-6 flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
            alt="Vanhsya Collective Gathering"
            className="w-full h-full object-cover opacity-25 contrast-125"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07050C]/65 via-[#07050C]/75 to-[#07050C]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-6">
          <span className="inline-block py-1.5 px-5 rounded-full bg-purple-900/35 border border-purple-400/35 text-purple-200 text-xs font-mono font-bold uppercase tracking-[0.28em] backdrop-blur-md">
            {BRAND_CONTACTS.clubName} · {BRAND_CONTACTS.audienceNote}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white font-cinzel tracking-tight uppercase leading-[0.9]">
            Collective <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
              Unbound
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            {BRAND_CONTACTS.tagline} Explore our UAE social interest circles, host partnerships, and authentic attendee reflections gathered strictly with consent.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/social-club"
              className="px-7 py-3.5 rounded-xl bg-white text-black font-black uppercase tracking-wider text-xs hover:bg-purple-300 transition-colors"
            >
              Join Founding Registry
            </Link>
            <a
              href={buildWhatsAppDirectEnquiryUrl('Hi Vanhsya Community Desk! I would like to connect about UAE meetups and circles.')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 font-bold uppercase tracking-wider text-xs hover:bg-emerald-900/70 transition-colors"
            >
              WhatsApp {BRAND_CONTACTS.whatsappDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* Restored Community Circles Grid */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-white/10">
        <AnimateOnScroll>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-[0.28em] text-purple-300 block mb-2">
                CURATED INTEREST CIRCLES
              </span>
              <h2 className="text-3xl sm:text-5xl font-cinzel font-black text-white uppercase">
                Community Circles
              </h2>
            </div>
            <Link to="/meetups" className="text-xs font-bold uppercase tracking-widest text-purple-300 hover:text-white">
              Browse Verified MeetUps &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMUNITY_CIRCLES.map((circle) => (
              <Link
                to="/social-club"
                key={circle.title}
                className="relative group overflow-hidden rounded-3xl aspect-[4/5] border border-white/10 shadow-2xl block"
              >
                <img
                  src={circle.image}
                  alt={circle.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-purple-300 font-semibold">
                    {circle.subtitle}
                  </p>
                  <h3 className="text-2xl font-cinzel font-black text-white mt-1">{circle.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </AnimateOnScroll>
      </section>

      {/* Restored Ecosystem Infrastructure + Official Contacts Strip */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link to="/treasure-hunt" className="p-6 rounded-2xl bg-[#120D1D] border border-cyan-500/25 hover:border-cyan-400/60 transition-colors">
            <p className="text-xs font-mono text-cyan-300 font-bold uppercase">Interactive Quests</p>
            <h3 className="text-xl font-cinzel font-bold text-white mt-2">The Blueprint &rarr;</h3>
            <p className="text-xs text-gray-400 mt-2">Half-clue UAE city quests designed for collaborative teams.</p>
          </Link>
          <Link to="/partners/apply" className="p-6 rounded-2xl bg-[#120D1D] border border-purple-500/25 hover:border-purple-400/60 transition-colors">
            <p className="text-xs font-mono text-purple-300 font-bold uppercase">Hosts &amp; Venues</p>
            <h3 className="text-xl font-cinzel font-bold text-white mt-2">Partner Desk &rarr;</h3>
            <p className="text-xs text-gray-400 mt-2">Host verified cafes, supper clubs, or activity sessions.</p>
          </Link>
          <Link to="/vyno" className="p-6 rounded-2xl bg-[#120D1D] border border-cyan-500/25 hover:border-cyan-400/60 transition-colors">
            <p className="text-xs font-mono text-cyan-300 font-bold uppercase">ethers.js Console</p>
            <h3 className="text-xl font-cinzel font-bold text-white mt-2">Web3 Verification &rarr;</h3>
            <p className="text-xs text-gray-400 mt-2">Connect wallet and inspect signed receipts securely.</p>
          </Link>
          <div className="p-5 rounded-2xl bg-[#120D1D] border border-purple-500/25 flex items-center gap-4">
            <a
              href={BRAND_CONTACTS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-white/20"
            >
              <img
                src={BRAND_CONTACTS.instagramQrPath}
                alt="@vanhsyatravels Instagram QR Code"
                className="w-full h-full object-cover"
              />
            </a>
            <div className="text-xs space-y-1 min-w-0">
              <a
                href={BRAND_CONTACTS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-purple-300 font-semibold hover:text-white truncate"
              >
                {BRAND_CONTACTS.instagramHandle}
              </a>
              <a
                href={BRAND_CONTACTS.whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-emerald-300 font-mono hover:text-emerald-200"
              >
                {BRAND_CONTACTS.whatsappDisplay}
              </a>
              <a
                href={BRAND_CONTACTS.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 underline truncate"
              >
                {BRAND_CONTACTS.websiteDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Post-Event Survey & Consented Attendee Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          {submitSuccess ? (
            <div className="p-8 rounded-3xl bg-[#130E20] border border-emerald-400/40 space-y-4">
              <h2 className="text-2xl font-cinzel font-bold text-white">Thank You for Your Input</h2>
              <p className="text-sm text-gray-300">
                Your survey response has been persistently saved for organizer review.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500"
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-3xl bg-[#130E20] border border-purple-500/30 shadow-2xl space-y-4 text-xs"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
                  Post-Event Survey
                </p>
                <h2 className="text-2xl font-cinzel font-bold text-white mt-1">
                  Rate Your MeetUp Experience
                </h2>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Select Verified Event</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    const matched = events.find((ev) => String(ev.id) === e.target.value);
                    if (matched) setCustomEventTitle(matched.title);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0814] border border-white/15 text-sm text-white"
                >
                  <option value="">General Vanhsya Social Club / Other Event</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={String(ev.id)}>
                      {ev.title} ({ev.eventDate})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedEventId && (
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Event / Experience Name *</label>
                  <input
                    type="text"
                    required
                    value={customEventTitle}
                    onChange={(e) => setCustomEventTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">RSVP Pass Code (optional)</label>
                <input
                  type="text"
                  value={rsvpCode}
                  onChange={(e) => setRsvpCode(e.target.value)}
                  placeholder="VSC-XXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label className="text-gray-300 font-semibold">
                  Overall (1-5)
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={overallRating}
                    onChange={(e) => setOverallRating(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white"
                  />
                </label>
                <label className="text-gray-300 font-semibold">
                  Venue (1-5)
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={venueRating}
                    onChange={(e) => setVenueRating(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white"
                  />
                </label>
                <label className="text-gray-300 font-semibold">
                  Safety (1-5)
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={safetyWelcomeRating}
                    onChange={(e) => setSafetyWelcomeRating(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white"
                  />
                </label>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Highlights &amp; Reflections *</label>
                <textarea
                  required
                  rows={3}
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="How welcoming did the gathering feel? What worked well?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Suggestions for Improvement</label>
                <textarea
                  rows={2}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Timing, venue seating, group size, or host notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wouldAttendAgain}
                  onChange={(e) => setWouldAttendAgain(e.target.checked)}
                  className="accent-purple-500"
                />
                <span>I would attend another Vanhsya Social Club meetup</span>
              </label>

              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPublish}
                  onChange={(e) => setConsentPublish(e.target.checked)}
                  className="accent-purple-500"
                />
                <span>Consent to share my first name and highlight publicly on this page</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {submitting ? 'Saving Feedback...' : 'Submit Post-Event Survey'}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-2xl font-cinzel font-bold text-white">
              Verified Attendee Feedback
            </h2>
            <Link to="/meetups" className="text-xs font-semibold text-purple-300 hover:text-white">
              Browse Events &rarr;
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400">Loading feedback...</p>
          ) : verifiedSurveys.length > 0 ? (
            <div className="space-y-4">
              {verifiedSurveys.map((sv) => (
                <article key={sv.id} className="p-6 rounded-2xl bg-[#130E20] border border-white/10 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-purple-300">{sv.eventTitle}</span>
                    <span className="text-gray-300 font-semibold">
                      Overall {sv.overallRating}/5 · Venue {sv.venueRating}/5 · Safety {sv.safetyWelcomeRating}/5
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">"{sv.highlights}"</p>
                  <p className="text-xs text-gray-400">
                    — {sv.respondentName} · {new Date(sv.createdAt).toLocaleDateString('en-AE')}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-2xl border border-dashed border-purple-500/30 bg-[#130E20] text-center space-y-3">
              <h3 className="text-lg font-cinzel font-bold text-white">
                No Published Attendee Reviews Yet
              </h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Vanhsya Social Club never displays invented testimonials. Attend a verified meetup and submit your honest reflection using the survey form.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;
