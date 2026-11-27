import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Booking } from '../types';
import { useAppContext } from '../contexts/AppContext';
import SeoHead from '../components/SeoHead';
import { TripFeedbackSection, TripFeedbackModal } from '../components/TripFeedback';
import { BRAND_CONTACTS } from '../utils/utm';

const DashboardPage: React.FC = () => {
  const { bookings } = useAppContext();
  const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState<Booking | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Membership ID verification lookup
  const [lookupId, setLookupId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    membershipId: string;
    fullName: string;
    emirate: string;
    createdAt: string;
  } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleVerifyMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/members/${encodeURIComponent(lookupId.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || 'Membership ID not found.');
      } else {
        setLookupResult(data.member);
      }
    } catch {
      setLookupError('Unable to check membership ID.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-20 pt-28 min-h-screen text-gray-100">
      <SeoHead
        title="Explorer & Member Dashboard — Vanhsya Social Club"
        description="Verify your Founding Member ID, inspect your travel itineraries, and manage post-event or post-trip feedback."
        path="/dashboard"
      />

      <header className="text-center mb-14 space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-purple-300">
          {BRAND_CONTACTS.clubName} · {BRAND_CONTACTS.companyName}
        </p>
        <h1 className="text-4xl md:text-6xl font-black font-cinzel text-white">
          Explorer Dashboard
        </h1>
        <p className="text-sm sm:text-base max-w-2xl mx-auto text-gray-400">
          Verify your Founding Member ID, manage your upcoming travel itineraries, and submit authentic meetup or journey feedback.
        </p>
      </header>

      {/* Membership Lookup & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#130E20] border border-purple-500/30 space-y-4">
          <h2 className="text-xl font-cinzel font-bold text-white">
            Verify Founding Member Digital ID
          </h2>
          <p className="text-xs text-gray-400">
            Enter your <span className="font-mono text-purple-300">VSC-UAE-...</span> code to confirm your active UAE 18+ Founding Membership status.
          </p>
          <form onSubmit={handleVerifyMembership} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="VSC-UAE-0001-XXXX"
              className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono"
            />
            <button
              type="submit"
              disabled={lookupLoading}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider"
            >
              {lookupLoading ? 'Checking...' : 'Verify ID'}
            </button>
          </form>

          {lookupError && <p className="text-xs text-rose-300">{lookupError}</p>}
          {lookupResult && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs space-y-1">
              <p className="font-bold text-emerald-300">Verified Founding Member</p>
              <p className="text-white font-semibold">{lookupResult.fullName}</p>
              <p className="text-gray-300 font-mono">
                {lookupResult.membershipId} · {lookupResult.emirate}, UAE
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#130E20] border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-cinzel font-bold text-white">Quick Actions</h2>
            <p className="text-xs text-gray-400 mt-1">
              Navigate directly to verified UAE community tools.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2.5 text-xs font-semibold">
            <Link to="/social-club" className="p-3 rounded-xl bg-purple-600/20 border border-purple-400/30 hover:bg-purple-600/35 text-purple-100">
              Register New Founding Member Pass &rarr;
            </Link>
            <Link to="/meetups" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white">
              Browse Verified Stranger MeetUps &rarr;
            </Link>
            <Link to="/community" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white">
              Complete Post-Event Survey &rarr;
            </Link>
            <Link to="/ai-planner" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white">
              Create AI Travel Blueprint &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <section className="mb-16 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-cinzel font-bold text-white">Saved Tour Bookings</h2>
          <Link to="/ai-planner" className="text-xs font-semibold text-purple-300 hover:text-white">
            Plan a Journey &rarr;
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="row-reveal flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-[#130E20] border border-white/10 hover-lift"
              >
                <div className="img-live w-full sm:w-28 h-20 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={booking.tourImage}
                    alt={booking.tourTitle}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-cinzel font-bold text-white">{booking.tourTitle}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Booking {booking.id} · {booking.date} · Status: {booking.status}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedBookingForFeedback(booking);
                        setIsFeedbackModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                    >
                      Leave Review
                    </button>
                  )}
                  <Link
                    to={`/tours/${booking.tourSlug}`}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold"
                  >
                    View Tour
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-sm text-gray-400">
            No bookings saved yet. Book any experience from the catalog or RSVP to a verified Stranger MeetUp.
          </div>
        )}
      </section>

      <TripFeedbackSection />

      {isFeedbackModalOpen && (
        <TripFeedbackModal
          isOpen={isFeedbackModalOpen}
          bookingToReview={selectedBookingForFeedback}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
