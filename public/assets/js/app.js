/* PARI · App glue — motion, charts, Alpine components */

(function () {
  const nav = document.querySelector('.mk-nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(el => io.observe(el));
})();

(function () {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const format = (n, suffix, decimals) => {
    if (suffix === '₹') {
      if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
      if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
      return '₹' + Math.round(n).toLocaleString('en-IN');
    }
    return (decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-IN')) + (suffix || '');
  };
  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const dur = parseInt(el.dataset.dur || '1400', 10);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased, suffix, decimals);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = format(target, suffix, decimals);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));
})();

window.PARI_CHARTS = {
  lineArea(svgEl, points, opts) {
    if (!svgEl || !points || !points.length) return;
    opts = Object.assign({
      color: '#CFAE71', areaOpacity: 0.18, showDots: true,
      yMin: null, yMax: null, padTop: 12, padBottom: 22, padLeft: 8, padRight: 8
    }, opts || {});
    const w = svgEl.clientWidth || 600, h = svgEl.clientHeight || 220;
    const values = points.map(p => p.v);
    const min = opts.yMin != null ? opts.yMin : Math.min(...values);
    const max = opts.yMax != null ? opts.yMax : Math.max(...values);
    const range = max - min || 1;
    const stepX = (w - opts.padLeft - opts.padRight) / (points.length - 1);
    const coords = points.map((p, i) => {
      const x = opts.padLeft + i * stepX;
      const y = h - opts.padBottom - ((p.v - min) / range) * (h - opts.padTop - opts.padBottom);
      return [x, y];
    });
    const line = coords.reduce((acc, [x, y], i, a) => {
      if (i === 0) return `M ${x},${y}`;
      const [x0, y0] = a[i - 1];
      const cx1 = x0 + (x - x0) * 0.5;
      const cx2 = x - (x - x0) * 0.5;
      return acc + ` C ${cx1},${y0} ${cx2},${y} ${x},${y}`;
    }, '');
    const area = line + ` L ${coords[coords.length - 1][0]},${h - opts.padBottom} L ${coords[0][0]},${h - opts.padBottom} Z`;
    svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svgEl.innerHTML = `
      <g>
        ${[0.25, 0.5, 0.75].map(f => {
          const y = opts.padTop + f * (h - opts.padTop - opts.padBottom);
          return `<line x1="${opts.padLeft}" x2="${w - opts.padRight}" y1="${y}" y2="${y}" stroke="rgba(59,88,117,0.22)" stroke-dasharray="2 4"/>`;
        }).join('')}
      </g>
      <path d="${area}" fill="${opts.color}" opacity="${opts.areaOpacity}"/>
      <path class="chart-line" d="${line}" fill="none" stroke="${opts.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${opts.showDots ? coords.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${opts.color}"/>`).join('') : ''}
      ${points.map((p, i) => `<text x="${coords[i][0]}" y="${h - 6}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#6B87A3">${p.w || ''}</text>`).join('')}
    `;
    const linePath = svgEl.querySelector('.chart-line');
    if (linePath) {
      const len = linePath.getTotalLength();
      linePath.style.setProperty('--chart-len', len);
      linePath.classList.remove('is-in');
      requestAnimationFrame(() => linePath.classList.add('is-in'));
    }
  },
  sparkline(svgEl, values, color) {
    if (!svgEl || !values || !values.length) return;
    const w = svgEl.clientWidth || 160, h = svgEl.clientHeight || 40;
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const pts = values.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2]);
    const line = pts.reduce((acc, [x, y], i, a) => {
      if (i === 0) return `M ${x},${y}`;
      const [x0, y0] = a[i - 1];
      const cx1 = x0 + (x - x0) * 0.5, cx2 = x - (x - x0) * 0.5;
      return acc + ` C ${cx1},${y0} ${cx2},${y} ${x},${y}`;
    }, '');
    const area = line + ` L ${w},${h} L 0,${h} Z`;
    svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svgEl.innerHTML = `
      <path d="${area}" fill="${color || '#CFAE71'}" opacity="0.15"/>
      <path d="${line}" fill="none" stroke="${color || '#CFAE71'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  },
  ring(svgEl, pct) {
    if (!svgEl) return;
    const r = 40, c = 2 * Math.PI * r;
    const fg = svgEl.querySelector('.ring-fg');
    if (fg) {
      fg.setAttribute('stroke-dasharray', c);
      fg.setAttribute('stroke-dashoffset', c);
      requestAnimationFrame(() => {
        fg.setAttribute('stroke-dashoffset', c * (1 - pct / 100));
      });
    }
  },
  dualLine(svgEl, seriesA, seriesB, opts) {
    if (!svgEl || !seriesA || !seriesB) return;
    opts = Object.assign({
      colorA: '#CFAE71', colorB: '#E27070', labelA: 'PM %', labelB: 'Breakdowns',
      yMinA: 0, yMaxA: 100, yMinB: 0, yMaxB: Math.max(4, ...window.PARI.breakdownTrend.map(p=>p.v)),
      padTop: 24, padBottom: 32, padLeft: 40, padRight: 40
    }, opts || {});
    const w = svgEl.clientWidth || 700, h = svgEl.clientHeight || 280;
    const build = (series, min, max) => {
      const range = max - min || 1;
      const stepX = (w - opts.padLeft - opts.padRight) / (series.length - 1);
      return series.map((p, i) => {
        const x = opts.padLeft + i * stepX;
        const y = h - opts.padBottom - ((p.v - min) / range) * (h - opts.padTop - opts.padBottom);
        return [x, y];
      });
    };
    const coordsA = build(seriesA, opts.yMinA, opts.yMaxA);
    const coordsB = build(seriesB, opts.yMinB, opts.yMaxB);
    const smooth = (coords) => coords.reduce((acc, [x, y], i, a) => {
      if (i === 0) return `M ${x},${y}`;
      const [x0, y0] = a[i - 1];
      const cx1 = x0 + (x - x0) * 0.5, cx2 = x - (x - x0) * 0.5;
      return acc + ` C ${cx1},${y0} ${cx2},${y} ${x},${y}`;
    }, '');
    const lineA = smooth(coordsA);
    const lineB = smooth(coordsB);
    const areaA = lineA + ` L ${coordsA[coordsA.length-1][0]},${h - opts.padBottom} L ${coordsA[0][0]},${h - opts.padBottom} Z`;
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => {
      const y = opts.padTop + f * (h - opts.padTop - opts.padBottom);
      return `<line x1="${opts.padLeft}" x2="${w - opts.padRight}" y1="${y}" y2="${y}" stroke="rgba(59,88,117,0.16)" stroke-dasharray="${f === 0 || f === 1 ? '0' : '2 4'}"/>`;
    }).join('');
    const yLabelsL = [opts.yMinA, Math.round((opts.yMinA+opts.yMaxA)/2), opts.yMaxA].map((v, i, arr) => {
      const y = h - opts.padBottom - (i / (arr.length-1)) * (h - opts.padTop - opts.padBottom);
      return `<text x="${opts.padLeft - 10}" y="${y + 3}" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="10" fill="#6B87A3">${v}${opts.suffixA || '%'}</text>`;
    }).join('');
    const yLabelsR = [opts.yMinB, Math.round((opts.yMinB+opts.yMaxB)/2), opts.yMaxB].map((v, i, arr) => {
      const y = h - opts.padBottom - (i / (arr.length-1)) * (h - opts.padTop - opts.padBottom);
      return `<text x="${w - opts.padRight + 10}" y="${y + 3}" text-anchor="start" font-family="IBM Plex Mono, monospace" font-size="10" fill="#6B87A3">${v}</text>`;
    }).join('');
    svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svgEl.innerHTML = `
      ${gridLines}
      ${yLabelsL}
      ${yLabelsR}
      <path d="${areaA}" fill="${opts.colorA}" opacity="0.10"/>
      <path class="chart-line pulse-a" d="${lineA}" fill="none" stroke="${opts.colorA}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="chart-line pulse-b" d="${lineB}" fill="none" stroke="${opts.colorB}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 4"/>
      ${coordsA.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${opts.colorA}"/>`).join('')}
      ${coordsB.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="${opts.colorB}"/>`).join('')}
      ${seriesA.map((p, i) => `<text x="${coordsA[i][0]}" y="${h - 10}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="#4E6F8E">${p.w || ''}</text>`).join('')}
    `;
    ['pulse-a', 'pulse-b'].forEach(cls => {
      const p = svgEl.querySelector('.' + cls);
      if (p) {
        const len = p.getTotalLength();
        p.style.setProperty('--chart-len', len);
        p.classList.remove('is-in');
        requestAnimationFrame(() => p.classList.add('is-in'));
      }
    });
  },
  rowSpark(svgEl, values, color) {
    if (!svgEl || !values || !values.length) return;
    const w = svgEl.clientWidth || 80, h = svgEl.clientHeight || 24;
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const pts = values.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2]);
    const line = pts.reduce((acc, [x, y], i, a) => {
      if (i === 0) return `M ${x},${y}`;
      const [x0, y0] = a[i - 1];
      const cx1 = x0 + (x - x0) * 0.5, cx2 = x - (x - x0) * 0.5;
      return acc + ` C ${cx1},${y0} ${cx2},${y} ${x},${y}`;
    }, '');
    const last = pts[pts.length - 1];
    svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svgEl.innerHTML = `
      <path d="${line}" fill="none" stroke="${color || '#CFAE71'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${last[0]}" cy="${last[1]}" r="2" fill="${color || '#CFAE71'}"/>
    `;
  }
};

window.PARI_UTIL = {
  timeAgo(iso) {
    try {
      const d = new Date(iso);
      const diff = Math.round((Date.now() - d.getTime()) / 60000);
      if (diff < 1) return 'just now';
      if (diff < 60) return diff + ' min ago';
      const h = Math.round(diff / 60);
      if (h < 24) return h + ' hr ago';
      const days = Math.round(h / 24);
      if (days < 7) return days + ' d ago';
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch(e) { return iso; }
  }
};

function paintPariCharts() {
  if (!window.PARI) return;
  document.querySelectorAll('[data-chart="pm-trend"]').forEach(svg => {
    window.PARI_CHARTS.lineArea(svg, window.PARI.pmTrend, { color: '#CFAE71', yMin: 0, yMax: 100 });
  });
  document.querySelectorAll('[data-chart="breakdown-trend"]').forEach(svg => {
    window.PARI_CHARTS.lineArea(svg, window.PARI.breakdownTrend, { color: '#E27070', yMin: 0, yMax: 10 });
  });
  document.querySelectorAll('[data-chart="reliability-pulse"]').forEach(svg => {
    window.PARI_CHARTS.dualLine(svg, window.PARI.pmTrend, window.PARI.breakdownTrend, {
      colorA: '#CFAE71', colorB: '#E27070',
      labelA: 'PM %', labelB: 'Breakdowns',
      yMinA: 0, yMaxA: 100, yMinB: 0, yMaxB: Math.max(4, ...window.PARI.breakdownTrend.map(p=>p.v))
    });
  });
  document.querySelectorAll('[data-spark]').forEach(svg => {
    const key = svg.dataset.spark;
    const series = key === 'pm' ? window.PARI.pmTrend : window.PARI.breakdownTrend;
    const color = key === 'pm' ? '#CFAE71' : '#E27070';
    window.PARI_CHARTS.sparkline(svg, series.map(p => p.v), color);
  });
  document.querySelectorAll('[data-row-spark]').forEach(svg => {
    const craneId = svg.dataset.rowSpark;
    const crane = window.PARI.cranes.find(c => c.id === craneId);
    if (!crane) return;
    const s = crane.score;
    const values=(crane.score_history||[]).map(entry=>Number(entry.score));
    if(values.length<2){svg.innerHTML='';svg.setAttribute('aria-label','No recorded score history');return;}
    const color = s >= 80 ? '#4FBE8C' : s >= 60 ? '#E4A24E' : '#E27070';
    window.PARI_CHARTS.rowSpark(svg, values, color);
  });
  document.querySelectorAll('[data-ring]').forEach(svg => {
    const pct = parseFloat(svg.dataset.ring);
    if(!Number.isFinite(pct)){svg.innerHTML='';return;}
    window.PARI_CHARTS.ring(svg, pct);
  });
  document.querySelectorAll('[data-bar-fill]').forEach(el => {
    const pct = parseFloat(el.dataset.barFill);
    requestAnimationFrame(() => { el.style.width = pct + '%'; });
  });
}
window.PARI_paintCharts = paintPariCharts;
window.addEventListener('load', paintPariCharts);

window.PARI_ICONS = {
  gauge:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14l4-4"/><circle cx="12" cy="12" r="10"/></svg>',
  cranes:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h8l10 6H4z"/><path d="M4 4v16"/><path d="M12 10v4"/><path d="M10 14h4"/><path d="M12 14v6"/></svg>',
  inspection:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>',
  pm:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>',
  breakdown:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>',
  flag:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  cert:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/></svg>',
  compliance:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
  spares:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>',
  bell:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  user:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  search:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
  menu:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  arrow_right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  chevron:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>',
  chevron_down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  plus:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  download:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  filter:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  brain:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z"/></svg>',
  api:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  spark:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  layers:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  eye:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    if (window.PARI_ICONS[name]) el.innerHTML = window.PARI_ICONS[name];
  });
});

