import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import {
  EventRsvp,
  NotificationLog,
  PartnerApplication,
  PostEventSurvey,
  SocialEvent,
  SocialEventStatus,
  SocialMember,
} from '../types';
import { BRAND_CONTACTS, UAE_EMIRATES, buildHashShareUrl } from '../utils/utm';

interface UtmBucket {
  source: string;
  campaign: string;
  total: number;
}

interface AdminOverviewData {
  events: SocialEvent[];
  members: SocialMember[];
  rsvps: EventRsvp[];
  partners: PartnerApplication[];
  surveys: PostEventSurvey[];
  notifications: NotificationLog[];
  utmBreakdown: UtmBucket[];
}

type AdminTab = 'events' | 'rsvps' | 'members' | 'partners' | 'surveys' | 'notifications';

const STATUS_BADGES: Record<SocialEventStatus, string> = {
  draft: 'bg-gray-800 text-gray-300 border-gray-600',
  upcoming: 'bg-purple-900/60 text-purple-200 border-purple-400/50',
  sold_out: 'bg-amber-900/50 text-amber-200 border-amber-400/50',
  completed: 'bg-emerald-900/50 text-emerald-200 border-emerald-400/50',
  cancelled: 'bg-rose-900/50 text-rose-200 border-rose-400/50',
};

const EMPTY_EVENT_FORM = {
  id: null as number | null,
  title: '',
  subtitle: '',
  description: '',
  emirate: 'Dubai',
  city: 'Dubai',
  venueName: '',
  venueAddress: '',
  eventDate: '',
  startTime: '7:00 PM',
  endTime: '9:30 PM',
  category: 'Coffee & Conversations',
  ageRestriction: '18+ UAE Residents',
  capacity: 18,
  status: 'draft' as SocialEventStatus,
  isAdminVerified: false,
  coverImageUrl: '',
  hostName: '',
  guidelinesSummary:
    'UAE Residents 18+ only. Arrive 15 minutes before start for QR check-in. Respectful conversation required.',
  cancellationPolicy:
    'Cancel at least 24 hours ahead via crm@vanhsya.com so open seats go to waitlisted members.',
  cancellationReason: '',
  priceAed: 0,
};

const AdminDashboardPage: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authStatusLoading, setAuthStatusLoading] = useState(true);
  const [requiresBootstrap, setRequiresBootstrap] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('events');
  const [eventStatusBucket, setEventStatusBucket] = useState<SocialEventStatus | 'all'>('all');

  // Event editor state
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Check-in lookup state
  const [quickCheckinCode, setQuickCheckinCode] = useState('');
  const [rsvpFilterEventId, setRsvpFilterEventId] = useState<string>('all');

  // Notification composer state
  const [notifChannel, setNotifChannel] = useState<'email' | 'whatsapp'>('email');
  const [notifEventId, setNotifEventId] = useState<string>('');
  const [notifSubject, setNotifSubject] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifSending, setNotifSending] = useState(false);
  const [preparedDispatchLinks, setPreparedDispatchLinks] = useState<
    Array<{ name: string; contact: string; actionHref: string }>
  >([]);

  const fetchAuthStatus = useCallback(async () => {
    setAuthStatusLoading(true);
    try {
      const res = await fetch('/api/admin/auth/status');
      const data = await res.json();
      setRequiresBootstrap(Boolean(data.requiresBootstrap));
    } catch {
      setAuthError('Unable to reach server.');
    } finally {
      setAuthStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthStatus();
  }, [fetchAuthStatus]);

  const loadOverview = useCallback(async (token: string) => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setAuthToken(null);
        setAuthError('Session expired. Please sign in again.');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setOverview(data);
      }
    } catch {
      setActionFeedback('Failed to load dashboard overview.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      loadOverview(authToken);
    }
  }, [authToken, loadOverview]);

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passcodeInput !== confirmPasscodeInput) {
      setAuthError('Passcodes do not match.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Setup failed.');
      } else {
        setAuthToken(data.token);
        setRequiresBootstrap(false);
        setPasscodeInput('');
        setConfirmPasscodeInput('');
      }
    } catch {
      setAuthError('Network error during setup.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresBootstrap) setRequiresBootstrap(true);
        setAuthError(data.error || 'Invalid credentials.');
      } else {
        setAuthToken(data.token);
        setPasscodeInput('');
      }
    } catch {
      setAuthError('Network error while authenticating.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    setAuthToken(null);
    setOverview(null);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setEventSaving(true);
    setActionFeedback(null);

    try {
      const isEdit = eventForm.id !== null;
      const endpoint = isEdit ? `/api/admin/events/${eventForm.id}` : '/api/admin/events';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: eventForm.title,
          subtitle: eventForm.subtitle,
          description: eventForm.description,
          emirate: eventForm.emirate,
          city: eventForm.city,
          venueName: eventForm.venueName,
          venueAddress: eventForm.venueAddress,
          eventDate: eventForm.eventDate,
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
          category: eventForm.category,
          ageRestriction: eventForm.ageRestriction,
          capacity: Number(eventForm.capacity),
          status: eventForm.status,
          isAdminVerified: eventForm.isAdminVerified,
          coverImageUrl: eventForm.coverImageUrl,
          hostName: eventForm.hostName,
          guidelinesSummary: eventForm.guidelinesSummary,
          cancellationPolicy: eventForm.cancellationPolicy,
          cancellationReason: eventForm.cancellationReason || null,
          priceAed: Number(eventForm.priceAed),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback(data.error || 'Failed to save event.');
      } else {
        setShowEventForm(false);
        setEventForm(EMPTY_EVENT_FORM);
        setActionFeedback(isEdit ? 'Event updated.' : 'Event created.');
        await loadOverview(authToken);
      }
    } catch {
      setActionFeedback('Error communicating with server.');
    } finally {
      setEventSaving(false);
    }
  };

  const handleQuickPatchEvent = async (
    eventId: number,
    patch: Partial<{ status: SocialEventStatus; isAdminVerified: boolean; cancellationReason: string }>
  ) => {
    if (!authToken) return;
    const res = await fetch(`/api/admin/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setActionFeedback('Event state updated.');
      await loadOverview(authToken);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!authToken) return;
    const res = await fetch(`/api/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.ok) {
      setActionFeedback('Event removed.');
      await loadOverview(authToken);
    }
  };

  const handleToggleCheckin = async (rsvpId: number) => {
    if (!authToken) return;
    const res = await fetch(`/api/admin/rsvps/${rsvpId}/checkin`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.ok) {
      await loadOverview(authToken);
    }
  };

  const handleCodeCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !quickCheckinCode.trim()) return;
    setActionFeedback(null);
    const res = await fetch('/api/admin/rsvps/checkin-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ rsvpCode: quickCheckinCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionFeedback(data.error || 'RSVP code not found.');
    } else {
      setQuickCheckinCode('');
      setActionFeedback(`Checked in ${data.rsvp.fullName} (${data.rsvp.rsvpCode}).`);
      await loadOverview(authToken);
    }
  };

  const handleCancelRsvp = async (rsvpId: number) => {
    if (!authToken) return;
    const res = await fetch(`/api/admin/rsvps/${rsvpId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (res.ok) {
      setActionFeedback('RSVP cancelled and seat released.');
      await loadOverview(authToken);
    }
  };

  const handleUpdatePartnerStatus = async (id: number, status: 'approved' | 'declined') => {
    if (!authToken) return;
    const res = await fetch(`/api/admin/partners/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status, adminNotes: `Reviewed on ${new Date().toLocaleDateString()}` }),
    });
    if (res.ok) {
      setActionFeedback(`Application #${id} marked ${status}.`);
      await loadOverview(authToken);
    }
  };

  const handleDispatchNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setNotifSending(true);
    setActionFeedback(null);
    setPreparedDispatchLinks([]);

    try {
      const res = await fetch('/api/admin/notifications/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          channel: notifChannel,
          eventId: notifEventId ? Number(notifEventId) : null,
          subjectOrTemplate: notifSubject,
          messageBody: notifBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback(data.error || 'Failed to prepare notifications.');
      } else {
        setActionFeedback(data.message);
        setPreparedDispatchLinks(data.dispatchLinks || []);
        await loadOverview(authToken);
      }
    } catch {
      setActionFeedback('Network error dispatching notifications.');
    } finally {
      setNotifSending(false);
    }
  };

  const filteredEvents = useMemo(() => {
    if (!overview) return [];
    if (eventStatusBucket === 'all') return overview.events;
    return overview.events.filter((e) => e.status === eventStatusBucket);
  }, [overview, eventStatusBucket]);

  const filteredRsvps = useMemo(() => {
    if (!overview) return [];
    if (rsvpFilterEventId === 'all') return overview.rsvps;
    return overview.rsvps.filter((r) => String(r.eventId) === rsvpFilterEventId);
  }, [overview, rsvpFilterEventId]);

  // --- Unauthenticated View ---
  if (!authToken) {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-[#0A0812] text-gray-100 px-4 flex items-center justify-center">
        <SeoHead
          title="Administrator Console — Vanhsya Social Club"
          description="Authorized administrator operations dashboard for Vanhsya Social Club events, RSVPs, members, partners, and notifications."
          path="/admin"
        />

        <div className="w-full max-w-md p-8 rounded-3xl bg-[#130E20] border border-purple-500/35 shadow-2xl space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300">
              Vanhsya Operations
            </p>
            <h1 className="text-2xl font-cinzel font-bold text-white mt-1">
              {requiresBootstrap ? 'Initialize Admin Access' : 'Administrator Sign In'}
            </h1>
            <p className="text-xs text-gray-400 mt-1.5">
              {requiresBootstrap
                ? 'First-run security setup: choose a strong administrator passcode (10+ characters) to lock this dashboard.'
                : 'Enter your administrator passcode to manage verified events, attendee check-ins, and member databases.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200">
              {authError}
            </div>
          )}

          {authStatusLoading ? (
            <p className="text-xs text-gray-400">Checking security status...</p>
          ) : requiresBootstrap ? (
            <form onSubmit={handleBootstrap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Create Administrator Passcode (min 10 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={10}
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter strong passcode"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Confirm Passcode
                </label>
                <input
                  type="password"
                  required
                  minLength={10}
                  value={confirmPasscodeInput}
                  onChange={(e) => setConfirmPasscodeInput(e.target.value)}
                  placeholder="Re-enter passcode"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {authSubmitting ? 'Securing Console...' : 'Set Passcode & Open Console'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Administrator Passcode
                </label>
                <input
                  type="password"
                  required
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {authSubmitting ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#0A0812] text-gray-100">
      <SeoHead
        title="Admin Console — Vanhsya Social Club"
        description="Manage verified meetups, capacities, QR check-ins, UTM attribution, partner applications, and notifications."
        path="/admin"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Top Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300">
              {BRAND_CONTACTS.clubName} · Authorized Operations
            </p>
            <h1 className="text-3xl font-cinzel font-bold text-white mt-1">
              Administrator Control Console
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEventForm(EMPTY_EVENT_FORM);
                setShowEventForm(true);
                setActiveTab('events');
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              + Create Meetup
            </button>
            <button
              onClick={() => authToken && loadOverview(authToken)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
            >
              {loadingData ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-rose-500/40 text-rose-200 hover:bg-rose-950/50 text-xs font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {actionFeedback && (
          <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-400/40 text-xs text-purple-100 flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button onClick={() => setActionFeedback(null)} className="text-purple-300 underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Cards */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[#130E20] border border-white/10 hover-lift ui-scale-in">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Verified Upcoming</p>
              <p className="text-2xl font-black text-white mt-1">
                {overview.events.filter((e) => e.isAdminVerified && e.status === 'upcoming').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#130E20] border border-white/10 hover-lift ui-scale-in">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Founding Members</p>
              <p className="text-2xl font-black text-purple-300 mt-1">{overview.members.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#130E20] border border-white/10 hover-lift ui-scale-in">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Active RSVPs</p>
              <p className="text-2xl font-black text-white mt-1">
                {overview.rsvps.filter((r) => r.status !== 'cancelled').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#130E20] border border-white/10 hover-lift ui-scale-in">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Checked In</p>
              <p className="text-2xl font-black text-emerald-300 mt-1">
                {overview.rsvps.filter((r) => r.status === 'checked_in').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#130E20] border border-white/10 hover-lift ui-scale-in">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Pending Applications</p>
              <p className="text-2xl font-black text-amber-300 mt-1">
                {overview.partners.filter((p) => p.status === 'pending').length}
              </p>
            </div>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {(
            [
              ['events', `Events (${overview?.events.length || 0})`],
              ['rsvps', `RSVPs & Check-In (${overview?.rsvps.length || 0})`],
              ['members', `Members & UTM (${overview?.members.length || 0})`],
              ['partners', `Partners & Hosts (${overview?.partners.length || 0})`],
              ['surveys', `Surveys (${overview?.surveys.length || 0})`],
              ['notifications', `Notifications (${overview?.notifications.length || 0})`],
            ] as Array<[AdminTab, string]>
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                activeTab === tabKey
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-[#130E20] border-white/10 text-gray-300 hover:border-purple-400/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: EVENTS */}
        {activeTab === 'events' && overview && (
          <div className="space-y-6">
            {showEventForm && (
              <form
                onSubmit={handleSaveEvent}
                className="p-6 rounded-3xl bg-[#140F22] border border-purple-400/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-cinzel font-bold text-white">
                    {eventForm.id ? 'Edit Meetup Details' : 'Create & Schedule New Meetup'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-300 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={eventForm.subtitle}
                      onChange={(e) => setEventForm({ ...eventForm, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Emirate *</label>
                    <select
                      value={eventForm.emirate}
                      onChange={(e) => setEventForm({ ...eventForm, emirate: e.target.value, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0814] border border-white/15 text-white"
                    >
                      {UAE_EMIRATES.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">City / District *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.city}
                      onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Venue Name *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.venueName}
                      onChange={(e) => setEventForm({ ...eventForm, venueName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventForm.eventDate}
                      onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Start Time *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">End Time</label>
                    <input
                      type="text"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Capacity *</label>
                    <input
                      type="number"
                      min={2}
                      max={500}
                      required
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Host Name</label>
                    <input
                      type="text"
                      value={eventForm.hostName}
                      onChange={(e) => setEventForm({ ...eventForm, hostName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Entry Fee (AED, 0 if free)</label>
                    <input
                      type="number"
                      min={0}
                      value={eventForm.priceAed}
                      onChange={(e) => setEventForm({ ...eventForm, priceAed: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-1">Venue Address</label>
                    <input
                      type="text"
                      value={eventForm.venueAddress}
                      onChange={(e) => setEventForm({ ...eventForm, venueAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Event Status</label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as SocialEventStatus })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0814] border border-white/15 text-white"
                    >
                      <option value="draft">Draft (Hidden)</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-gray-300 mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-white font-semibold">
                      <input
                        type="checkbox"
                        checked={eventForm.isAdminVerified}
                        onChange={(e) => setEventForm({ ...eventForm, isAdminVerified: e.target.checked })}
                        className="accent-purple-500"
                      />
                      <span>Administrator Verified (required alongside non-draft status to publish publicly)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/15 text-xs text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={eventSaving}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                  >
                    {eventSaving ? 'Saving...' : 'Save Event'}
                  </button>
                </div>
              </form>
            )}

            {/* Status Separation Filter */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'draft', 'upcoming', 'sold_out', 'completed', 'cancelled'] as const).map((bucket) => (
                <button
                  key={bucket}
                  onClick={() => setEventStatusBucket(bucket)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border ${
                    eventStatusBucket === bucket
                      ? 'bg-purple-600/30 border-purple-400 text-white'
                      : 'bg-[#130E20] border-white/10 text-gray-400'
                  }`}
                >
                  {bucket === 'all' ? 'All States' : bucket.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            {filteredEvents.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-sm text-gray-400">
                No events in this status bucket. Use "+ Create Meetup" above to schedule a verified UAE gathering.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="row-reveal p-5 rounded-2xl bg-[#130E20] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover-lift"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2.5 py-0.5 rounded border font-semibold uppercase ${STATUS_BADGES[ev.status]}`}>
                          {ev.status.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded border font-semibold ${
                            ev.isAdminVerified
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : 'bg-gray-800 text-gray-400 border-gray-600'
                          }`}
                        >
                          {ev.isAdminVerified ? 'Admin Verified' : 'Unverified'}
                        </span>
                        <span className="text-gray-400">
                          {ev.eventDate} · {ev.startTime} · {ev.city}, {ev.emirate}
                        </span>
                      </div>
                      <h3 className="text-lg font-cinzel font-bold text-white">{ev.title}</h3>
                      <p className="text-xs text-gray-400">
                        Venue: {ev.venueName} · Capacity: {ev.attendeesCount}/{ev.capacity} · Checked in: {ev.checkedInCount || 0}
                      </p>
                      <p className="text-[11px] font-mono text-purple-300/80 break-all">
                        Share URL: {buildHashShareUrl(`/meetups/${ev.slug}`)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
                      <button
                        onClick={() =>
                          handleQuickPatchEvent(ev.id, {
                            isAdminVerified: !ev.isAdminVerified,
                            status: !ev.isAdminVerified && ev.status === 'draft' ? 'upcoming' : ev.status,
                          })
                        }
                        className="px-3 py-2 rounded-lg bg-purple-600/25 border border-purple-400/40 text-purple-200 hover:bg-purple-600/40 font-semibold"
                      >
                        {ev.isAdminVerified ? 'Unverify' : 'Verify & Publish'}
                      </button>

                      {ev.status !== 'completed' && ev.status !== 'cancelled' && (
                        <button
                          onClick={() => handleQuickPatchEvent(ev.id, { status: 'completed' })}
                          className="px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200"
                        >
                          Mark Completed
                        </button>
                      )}

                      {ev.status !== 'cancelled' && (
                        <button
                          onClick={() =>
                            handleQuickPatchEvent(ev.id, {
                              status: 'cancelled',
                              cancellationReason: 'Cancelled by administrator.',
                            })
                          }
                          className="px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200"
                        >
                          Cancel Event
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEventForm({
                            id: ev.id,
                            title: ev.title,
                            subtitle: ev.subtitle,
                            description: ev.description,
                            emirate: ev.emirate,
                            city: ev.city,
                            venueName: ev.venueName,
                            venueAddress: ev.venueAddress,
                            eventDate: ev.eventDate,
                            startTime: ev.startTime,
                            endTime: ev.endTime,
                            category: ev.category,
                            ageRestriction: ev.ageRestriction,
                            capacity: ev.capacity,
                            status: ev.status,
                            isAdminVerified: ev.isAdminVerified,
                            coverImageUrl: ev.coverImageUrl,
                            hostName: ev.hostName,
                            guidelinesSummary: ev.guidelinesSummary,
                            cancellationPolicy: ev.cancellationPolicy,
                            cancellationReason: ev.cancellationReason || '',
                            priceAed: ev.priceAed || 0,
                          });
                          setShowEventForm(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                      >
                        Edit
                      </button>

                      {ev.isAdminVerified && ev.status !== 'draft' && (
                        <Link
                          to={`/meetups/${ev.slug}`}
                          className="px-3 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20"
                        >
                          Open Page
                        </Link>
                      )}

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-gray-400 hover:text-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RSVPs & CHECK-IN */}
        {activeTab === 'rsvps' && overview && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form
                onSubmit={handleCodeCheckin}
                className="p-4 rounded-2xl bg-[#130E20] border border-white/10 flex gap-3 items-center"
              >
                <input
                  type="text"
                  value={quickCheckinCode}
                  onChange={(e) => setQuickCheckinCode(e.target.value)}
                  placeholder="Enter RSVP Pass Code (e.g. VSC-XXXXXX)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Check In Code
                </button>
              </form>

              <div className="p-4 rounded-2xl bg-[#130E20] border border-white/10 flex items-center gap-3">
                <label className="text-xs text-gray-400 shrink-0">Filter by Meetup:</label>
                <select
                  value={rsvpFilterEventId}
                  onChange={(e) => setRsvpFilterEventId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0814] border border-white/15 text-xs text-white"
                >
                  <option value="all">All Meetups</option>
                  {overview.events.map((ev) => (
                    <option key={ev.id} value={String(ev.id)}>
                      {ev.title} ({ev.eventDate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredRsvps.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-sm text-gray-400">
                No RSVPs recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRsvps.map((r) => (
                  <div
                    key={r.id}
                    className="row-reveal p-4 rounded-2xl bg-[#130E20] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover-lift"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-purple-300">{r.rsvpCode}</span>
                        <span className="font-bold text-white text-sm">{r.fullName}</span>
                        <span
                          className={`px-2 py-0.5 rounded font-semibold uppercase ${
                            r.status === 'checked_in'
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                              : r.status === 'cancelled'
                              ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                              : 'bg-purple-950/70 text-purple-200 border border-purple-500/40'
                          }`}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-400">
                        {r.eventTitle || `Event #${r.eventId}`} · {r.email} · {r.whatsappNumber} · {r.emirate}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Consents: Email ({r.consentEmail ? 'Yes' : 'No'}), WhatsApp ({r.consentWhatsapp ? 'Yes' : 'No'})
                        {r.utmSource ? ` · UTM: ${r.utmSource}/${r.utmCampaign}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {r.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => handleToggleCheckin(r.id)}
                            className={`px-3.5 py-2 rounded-lg font-bold ${
                              r.status === 'checked_in'
                                ? 'bg-white/10 text-gray-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                          >
                            {r.status === 'checked_in' ? 'Undo Check-In' : 'Check In'}
                          </button>
                          <button
                            onClick={() => handleCancelRsvp(r.id)}
                            className="px-3 py-2 rounded-lg border border-rose-500/40 text-rose-200 hover:bg-rose-950/50"
                          >
                            Cancel RSVP
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEMBERS & UTM ATTRIBUTION */}
        {activeTab === 'members' && overview && (
          <div className="space-y-6">
            {overview.utmBreakdown.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#130E20] border border-white/10">
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3">
                  Campaign Acquisition Attribution (UTM)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {overview.utmBreakdown.map((u, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/10 flex justify-between">
                      <span className="text-gray-300 font-mono">
                        {u.source} / {u.campaign}
                      </span>
                      <span className="font-bold text-white">{u.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {overview.members.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-sm text-gray-400">
                No registered Founding Members yet.
              </div>
            ) : (
              <div className="space-y-3">
                {overview.members.map((m) => (
                  <div key={m.id} className="row-reveal p-4 rounded-2xl bg-[#130E20] border border-white/10 text-xs space-y-1 hover-lift">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-purple-300 mr-2">{m.membershipId}</span>
                        <span className="font-bold text-white text-sm">{m.fullName}</span>
                      </div>
                      <span className="text-gray-400">
                        {m.emirate}, UAE · 18+ Verified
                      </span>
                    </div>
                    <p className="text-gray-400">
                      {m.email} · {m.whatsappNumber} · Interests: {m.interests.join(', ') || 'General'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Email Consent: {m.consentEmail ? 'Opted In' : 'No'} · WhatsApp Consent:{' '}
                      {m.consentWhatsapp ? 'Opted In' : 'No'} · Source: {m.utmSource || 'direct'}
                      {m.utmCampaign ? ` (${m.utmCampaign})` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PARTNERS & HOSTS */}
        {activeTab === 'partners' && overview && (
          <div className="space-y-4">
            {overview.partners.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-sm text-gray-400">
                No partner or community host applications submitted yet.
              </div>
            ) : (
              overview.partners.map((p) => (
                <div
                  key={p.id}
                  className="row-reveal p-5 rounded-2xl bg-[#130E20] border border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs hover-lift"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-200 uppercase font-semibold">
                        {p.applicationType === 'community_host' ? 'Community Host' : 'B2B Partner'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white uppercase font-semibold">
                        {p.status}
                      </span>
                      {p.tierInterest && <span className="text-purple-300">{p.tierInterest}</span>}
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {p.fullName} {p.organization ? `— ${p.organization}` : ''}
                    </h3>
                    <p className="text-gray-400">
                      {p.email} · {p.whatsappNumber} · {p.emirate}
                      {p.instagramOrWebsite ? ` · ${p.instagramOrWebsite}` : ''}
                    </p>
                    <p className="text-gray-300 leading-relaxed">{p.experienceSummary}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdatePartnerStatus(p.id, 'approved')}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-bold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdatePartnerStatus(p.id, 'declined')}
                      className="px-3.5 py-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: SURVEYS */}
        {activeTab === 'surveys' && overview && (
          <div className="space-y-4">
            {overview.surveys.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-sm text-gray-400">
                No post-event surveys recorded yet.
              </div>
            ) : (
              overview.surveys.map((s) => (
                <div key={s.id} className="row-reveal p-5 rounded-2xl bg-[#130E20] border border-white/10 text-xs space-y-1.5 hover-lift">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-bold text-white text-sm">
                      {s.respondentName} — {s.eventTitle}
                    </span>
                    <span className="text-purple-300 font-semibold">
                      Overall {s.overallRating}/5 · Venue {s.venueRating}/5 · Safety {s.safetyWelcomeRating}/5
                    </span>
                  </div>
                  <p className="text-gray-300">{s.highlights}</p>
                  {s.improvements && <p className="text-gray-400">Suggestion: {s.improvements}</p>}
                  <p className="text-[11px] text-gray-500">
                    Email: {s.email} · Public Consent: {s.consentPublish ? 'Yes' : 'Private only'} · Would Attend Again:{' '}
                    {s.wouldAttendAgain ? 'Yes' : 'No'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 6: CONSENT-BASED NOTIFICATIONS */}
        {activeTab === 'notifications' && overview && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleDispatchNotifications}
              className="lg:col-span-5 p-6 rounded-3xl bg-[#130E20] border border-purple-500/30 space-y-4 text-xs h-fit"
            >
              <div>
                <h2 className="text-lg font-cinzel font-bold text-white">
                  Prepare Consent-Verified Broadcast
                </h2>
                <p className="text-gray-400 mt-1">
                  The server strictly filters recipients who explicitly consented to Email or WhatsApp notifications.
                </p>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Channel</label>
                <select
                  value={notifChannel}
                  onChange={(e) => setNotifChannel(e.target.value as 'email' | 'whatsapp')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0814] border border-white/15 text-white"
                >
                  <option value="email">Opted-In Email Recipients</option>
                  <option value="whatsapp">Opted-In WhatsApp Recipients</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Audience Scope</label>
                <select
                  value={notifEventId}
                  onChange={(e) => setNotifEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0814] border border-white/15 text-white"
                >
                  <option value="">All Consented Founding Members</option>
                  {overview.events.map((ev) => (
                    <option key={ev.id} value={String(ev.id)}>
                      Confirmed Attendees: {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Subject / Template Name *</label>
                <input
                  type="text"
                  required
                  value={notifSubject}
                  onChange={(e) => setNotifSubject(e.target.value)}
                  placeholder="e.g. Venue Arrival Guide — Vanhsya Social Club"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  placeholder="Write meetup arrival instructions or schedule alert..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={notifSending}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                {notifSending ? 'Preparing Consent List...' : 'Generate Dispatch Queue'}
              </button>

              {preparedDispatchLinks.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="font-bold text-emerald-300">
                    One-Click Dispatch Links ({preparedDispatchLinks.length}):
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {preparedDispatchLinks.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.actionHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10 hover:border-purple-400"
                      >
                        <span className="text-white">{item.name}</span>
                        <span className="text-purple-300 underline">{item.contact}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </form>

            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                Notification Audit Log
              </h3>
              {overview.notifications.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-sm text-gray-400">
                  No consent-based notifications prepared yet.
                </div>
              ) : (
                overview.notifications.map((n) => (
                  <div key={n.id} className="row-reveal p-4 rounded-2xl bg-[#130E20] border border-white/10 text-xs space-y-1 hover-lift">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">
                        [{n.channel.toUpperCase()}] {n.recipientName} ({n.recipientContact})
                      </span>
                      <span className="text-emerald-300">Consent Verified</span>
                    </div>
                    <p className="text-purple-200 font-medium">{n.subjectOrTemplate}</p>
                    <p className="text-gray-400">{n.messagePreview}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
