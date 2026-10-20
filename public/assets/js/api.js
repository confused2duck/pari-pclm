/* =============================================================
   PARI · Frontend <-> Backend API layer
   =============================================================
   Wraps every Laravel endpoint in window.PARI_API.

   Setup:
     <script>window.PARI_API_BASE = 'http://localhost:8000';</script>
     <script src="/assets/js/api.js"></script>

   When a Sanctum token is present in localStorage, this file also
   overlays window.PARI with live responses, so the mock UI works
   unchanged until it does.
   ============================================================= */

(function () {
  const BASE  = (window.PARI_API_BASE || '').replace(/\/$/, '');
  let TOKEN   = localStorage.getItem('pari.token') || null;

  function url(path, params) {
    const u = new URL((BASE || location.origin) + '/api' + path);
    if (params) for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, v);
    }
    return u.toString();
  }
  function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? decodeURIComponent(v.pop()) : '';
  }
  async function request(method, path, body, params) {
    const headers = { 'Accept': 'application/json' };
    if (body) headers['Content-Type'] = 'application/json';
    if (TOKEN) headers['Authorization'] = 'Bearer ' + TOKEN;
    const xsrf = getCookie('XSRF-TOKEN');
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf;

    const res = await fetch(url(path, params), {
      method, credentials: 'include', headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && !path.startsWith('/auth/')) {
      localStorage.removeItem('pari.token');
      TOKEN = null;
      if (!location.pathname.includes('/auth/')) location.href = '/auth/login.html';
      throw new Error('Unauthenticated');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw Object.assign(new Error(err.message || 'Request failed'), { status: res.status, body: err });
    }
    if (res.status === 204) return null;
    return await res.json();
  }

  const API = {
    setToken(t) { TOKEN = t; if (t) localStorage.setItem('pari.token', t); else localStorage.removeItem('pari.token'); },
    hasToken()  { return !!TOKEN; },
    cookie()    { return fetch((BASE || location.origin) + '/sanctum/csrf-cookie', { credentials: 'include' }); },

    register: (d) => request('POST', '/auth/register', d),
    login:    (email, password) => request('POST', '/auth/login', { email, password }).then(r => { API.setToken(r.token); return r; }),
    logout:   () => request('POST', '/auth/logout').then(() => API.setToken(null)),
    me:       () => request('GET', '/auth/me'),
    forgot:   (email) => request('POST', '/auth/forgot', { email }),
    reset:    (d) => request('POST', '/auth/reset', d),
    ssoRedirect: (provider) => location.href = `${BASE}/api/auth/${provider}/redirect`,

    dashboard:         () => request('GET', '/dashboard'),
    dashboardPulse:    () => request('GET', '/dashboard/pulse'),
    dashboardActivity: () => request('GET', '/dashboard/activity'),
    attentionCranes:   () => request('GET', '/dashboard/attention-cranes'),

    cranes:       (p) => request('GET', '/cranes', null, p),
    crane:        (id) => request('GET', `/cranes/${id}`),
    craneSummary: (id) => request('GET', `/cranes/${id}/summary`),
    createCrane:  (d) => request('POST', '/cranes', d),
    updateCrane:  (id, d) => request('PUT', `/cranes/${id}`, d),

    inspections:       (p) => request('GET', '/inspections', null, p),
    inspection:        (id) => request('GET', `/inspections/${id}`),
    createInspection:  (d) => request('POST', '/inspections', d),
    startInspection:   (id) => request('POST', `/inspections/${id}/start`),
    completeInspection:(id) => request('POST', `/inspections/${id}/complete`),
    submitResponse:    (id, r) => request('POST', `/inspections/${id}/responses`, r),

    pmSchedules: (p) => request('GET', '/pm-schedules', null, p),
    completePm:  (id, d) => request('POST', `/pm-schedules/${id}/complete`, d),
    recalcPm:    () => request('POST', '/pm-schedules/recalculate'),

    breakdowns:       (p) => request('GET', '/breakdowns', null, p),
    breakdown:        (id) => request('GET', `/breakdowns/${id}`),
    reportBreakdown:  (d) => request('POST', '/breakdowns', d),
    saveInvestigation:(id, d) => request('POST', `/breakdowns/${id}/investigation`, d),
    closeBreakdown:   (id) => request('POST', `/breakdowns/${id}/close`),

    repeatFlags: (p) => request('GET', '/repeat-failure-flags', null, p),
    repeatFlag:  (id) => request('GET', `/repeat-failure-flags/${id}`),
    scanRepeat:  () => request('POST', '/repeat-failure-flags/scan'),
    saveFiveWhy: (id, five_why) => request('POST', `/repeat-failure-flags/${id}/five-why`, { five_why }),

    actions:     (p) => request('GET', '/corrective-actions', null, p),
    closeAction: (id) => request('POST', `/corrective-actions/${id}/close`),

    documents:    (p) => request('GET', '/documents', null, p),
    documentUrl:  (id) => request('POST', `/documents/${id}/download-url`),
    certificates: (p) => request('GET', '/certificates', null, p),

    statutory:         (p) => request('GET', '/statutory-inspections', null, p),
    statutoryCalendar: () => request('GET', '/statutory/calendar'),
    auditorReport:     (state) => request('GET', '/statutory/auditor-report', null, { state }),

    spares:  (p) => request('GET', '/spare-parts', null, p),
    reorder: (id) => request('POST', `/spare-parts/${id}/reorder`),

    notifications: (p) => request('GET', '/notifications', null, p),
    markAllRead:   () => request('POST', '/notifications/mark-all-read'),
    markRead:      (id) => request('POST', `/notifications/${id}/mark-read`),
    prefs:         () => request('GET', '/notification-preferences'),
    updatePrefs:   (prefs) => request('PUT', '/notification-preferences', { prefs }),

    users:      (p) => request('GET', '/users', null, p),
    createUser: (d) => request('POST', '/users', d),
    inviteUser: (id) => request('POST', `/users/${id}/invite`),
    roles:      () => request('GET', '/roles'),
  };

  window.PARI_API = API;

  // Opportunistic live-hydration: when a token exists, overlay window.PARI
  // with real responses so Alpine expressions stay unchanged.
  if (BASE && TOKEN) {
    document.addEventListener('DOMContentLoaded', async () => {
      try {
        const [dash, pulse, cranes, activity, flags] = await Promise.all([
          API.dashboard().catch(() => null),
          API.dashboardPulse().catch(() => null),
          API.cranes({ per_page: 100 }).catch(() => null),
          API.dashboardActivity().catch(() => null),
          API.repeatFlags({ per_page: 50 }).catch(() => null),
        ]);
        window.PARI = window.PARI || {};
        if (dash?.kpis)            window.PARI.kpis           = dash.kpis;
        if (pulse?.pmTrend)        window.PARI.pmTrend        = pulse.pmTrend;
        if (pulse?.breakdownTrend) window.PARI.breakdownTrend = pulse.breakdownTrend;
        if (cranes?.data)          window.PARI.cranes         = cranes.data;
        if (activity)              window.PARI.activity       = activity;
        if (flags?.data)           window.PARI.fleetRepeatFlags = flags.data;
        document.dispatchEvent(new CustomEvent('pari:live-data'));
      } catch (e) {
        console.warn('[PARI_API] Live hydration failed, staying on mock data:', e);
      }
    });
  }
})();
