// ============================================================
//  BALLISTICS CALCULATOR  -  UI Controller & App Logic
//  Depends on: data.js, ballistics.js
// ============================================================

// --- State ---
let currentWindClock = 3;
let lastResult       = null;

const WIND_DESCS = {
    0:  'No wind (CALM)',
    1:  'Wind from 1 o\'clock (slight right headwind)',
    2:  'Wind from 2 o\'clock (right quartering headwind)',
    3:  'Wind from 3 o\'clock (full right crosswind)',
    4:  'Wind from 4 o\'clock (right quartering tailwind)',
    5:  'Wind from 5 o\'clock (slight right tailwind)',
    6:  'Wind from 6 o\'clock (full tailwind)',
    7:  'Wind from 7 o\'clock (slight left tailwind)',
    8:  'Wind from 8 o\'clock (left quartering tailwind)',
    9:  'Wind from 9 o\'clock (full left crosswind)',
    10: 'Wind from 10 o\'clock (left quartering headwind)',
    11: 'Wind from 11 o\'clock (slight left headwind)',
    12: 'Wind from 12 o\'clock (full headwind)'
};

// --- Initialise ---
document.addEventListener('DOMContentLoaded', function() {
    populateFirearmTypes();
    onFirearmTypeChange();
    buildClockSVG();
    updateWindDesc();
});

// --- Section accordion ---
function toggleSection(id) {
    const header = document.getElementById('sh-' + id);
    const body   = document.getElementById('sb-' + id);
    const isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    header.classList.toggle('active', !isOpen);
    const chev = header.querySelector('.section-chevron');
    if (chev) chev.textContent = isOpen ? 'v' : '^';
}

// --- Firearm / Caliber selects ---
function populateFirearmTypes() {
    const sel = document.getElementById('firearm-type');
    FIREARM_TYPES.forEach(function(ft) {
        const o = document.createElement('option');
        o.value = ft.id;
        o.textContent = ft.label;
        sel.appendChild(o);
    });
}

function onFirearmTypeChange() {
    const type     = document.getElementById('firearm-type').value;
    const isCustom = (type === 'custom');

    const presetGrp = document.getElementById('preset-caliber-group');
    const customGrp = document.getElementById('custom-firearm-group');
    presetGrp.style.display = isCustom ? 'none' : 'flex';
    customGrp.style.display = isCustom ? 'flex' : 'none';

    if (isCustom) {
        updateCustomBulletStats();
    } else {
        const sel = document.getElementById('caliber-select');
        sel.innerHTML = '';
        (CALIBER_DATA[type] || []).forEach(function(cal) {
            const o = document.createElement('option');
            o.value       = cal.id;
            o.textContent = cal.name;
            sel.appendChild(o);
        });
        onCaliberChange();
    }
}

function onCaliberChange() {
    const type  = document.getElementById('firearm-type').value;
    const calId = document.getElementById('caliber-select').value;
    const cal   = (CALIBER_DATA[type] || []).find(function(c) { return c.id === calId; });
    if (!cal) return;
    document.getElementById('muzzle-vel').value = cal.muzzle_velocity_fps;
    document.getElementById('drag-model').value = cal.recommended_model;
    onDragModelChange(cal);
}

function onDragModelChange(calOverride) {
    const type     = document.getElementById('firearm-type').value;
    const isCustom = (type === 'custom');
    const model    = document.getElementById('drag-model').value;

    document.getElementById('bc-label').textContent = 'Ballistic Coefficient (' + model + ')';

    if (isCustom) {
        updateCustomBulletStats();
    } else {
        const calId = document.getElementById('caliber-select').value;
        const cal   = calOverride || (CALIBER_DATA[type] || []).find(function(c) { return c.id === calId; });
        if (cal) {
            document.getElementById('bc-value').value = (model === 'G7') ? cal.bc_g7 : cal.bc_g1;
            set('bs-weight', cal.bullet_weight_gr + ' gr');
            set('bs-dia',    cal.diameter_in + '"');
            set('bs-model',  model);
        }
    }
}

function updateCustomBulletStats() {
    const weight = parseFloat(document.getElementById('custom-weight').value) || 0;
    const dia    = parseFloat(document.getElementById('custom-diameter').value) || 0;
    const model  = document.getElementById('drag-model').value;
    set('bs-weight', weight ? weight + ' gr'        : '--');
    set('bs-dia',    dia    ? dia.toFixed(3) + '"'  : '--');
    set('bs-model',  model);
}

// --- Wind Clock SVG ---
function buildClockSVG() {
    const CX = 65, CY = 65, R = 56;
    const svg = document.getElementById('wind-clock');
    svg.innerHTML = '';

    appendSVG(svg, 'circle', {cx:CX, cy:CY, r:R+4, fill:'none', stroke:'#c8a84b18', 'stroke-width':'2'});
    appendSVG(svg, 'circle', {cx:CX, cy:CY, r:R,   fill:'#060a12', stroke:'#1e3050', 'stroke-width':'1.5'});
    appendSVG(svg, 'circle', {cx:CX, cy:CY, r:R-10,fill:'none',    stroke:'#0f1a2a', 'stroke-width':'1'});

    for (let h = 1; h <= 12; h++) {
        const ang    = (h * 30 - 90) * Math.PI / 180;
        const isMain = (h % 3 === 0);
        const r1 = R - 2, r2 = R - (isMain ? 12 : 8);
        appendSVG(svg, 'line', {
            x1: CX + r1*Math.cos(ang), y1: CY + r1*Math.sin(ang),
            x2: CX + r2*Math.cos(ang), y2: CY + r2*Math.sin(ang),
            stroke: isMain ? '#2a4060' : '#162030',
            'stroke-width': isMain ? '2' : '1', 'stroke-linecap':'round'
        });
        if (isMain) {
            const tr = R - 22;
            const t = makeSVGEl('text', {
                x: CX + tr*Math.cos(ang), y: CY + tr*Math.sin(ang) + 4,
                'text-anchor':'middle', fill:'#3a5070',
                'font-size':'9', 'font-family':'JetBrains Mono,monospace', 'font-weight':'600'
            });
            t.textContent = h;
            svg.appendChild(t);
        }
    }

    const arrowG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    arrowG.id = 'clock-arrow';
    svg.appendChild(arrowG);

    appendSVG(svg, 'circle', {cx:CX, cy:CY, r:4, fill:'#c8a84b'});

    // Hit zones
    for (let hh = 0; hh <= 12; hh++) {
        const ha  = hh === 0 ? 0 : (hh * 30 - 90) * Math.PI / 180;
        const hx  = hh === 0 ? CX : CX + (R - 20)*Math.cos(ha);
        const hy  = hh === 0 ? CY : CY + (R - 20)*Math.sin(ha);
        const hit = makeSVGEl('circle', {cx:hx, cy:hy, r:12,
            fill:'transparent', 'data-hour':hh, style:'cursor:pointer'});
        (function(hour) {
            hit.addEventListener('click', function(e) {
                e.stopPropagation();
                setWindClock(hour);
                document.getElementById('wind-clock-input').value = hour;
            });
        })(hh);
        svg.appendChild(hit);
    }

    updateClockArrow(currentWindClock);
}

function makeSVGEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function(k) { el.setAttribute(k, attrs[k]); });
    return el;
}

function appendSVG(parent, tag, attrs) {
    const el = makeSVGEl(tag, attrs);
    parent.appendChild(el);
    return el;
}

function setWindClock(hour) {
    currentWindClock = Math.max(0, Math.min(12, hour));
    updateClockArrow(currentWindClock);
    updateWindDesc();
}

function updateClockArrow(hour) {
    const CX = 65, CY = 65, R = 56;
    const g  = document.getElementById('clock-arrow');
    if (!g) return;
    g.innerHTML = '';

    if (hour === 0) {
        const t = makeSVGEl('text', {x:CX, y:CY+18, 'text-anchor':'middle',
            fill:'#3a5070', 'font-size':'9', 'font-family':'JetBrains Mono,monospace'});
        t.textContent = 'CALM';
        g.appendChild(t);
        return;
    }

    const ang = (hour * 30 - 90) * Math.PI / 180;
    const arrowLen = R - 14;

    appendSVG(g, 'line', {
        x1:CX, y1:CY,
        x2:CX + arrowLen*Math.cos(ang),
        y2:CY + arrowLen*Math.sin(ang),
        stroke:'#c8a84b', 'stroke-width':'2.5', 'stroke-linecap':'round'
    });

    const tipX = CX + arrowLen*Math.cos(ang),    tipY = CY + arrowLen*Math.sin(ang);
    const bX1  = CX + (arrowLen-10)*Math.cos(ang) - 5*Math.sin(ang);
    const bY1  = CY + (arrowLen-10)*Math.sin(ang) + 5*Math.cos(ang);
    const bX2  = CX + (arrowLen-10)*Math.cos(ang) + 5*Math.sin(ang);
    const bY2  = CY + (arrowLen-10)*Math.sin(ang) - 5*Math.cos(ang);
    appendSVG(g, 'polygon', {
        points: tipX+','+tipY+' '+bX1+','+bY1+' '+bX2+','+bY2,
        fill:'#c8a84b'
    });

    const lx = CX + (arrowLen+8)*Math.cos(ang);
    const ly = CY + (arrowLen+8)*Math.sin(ang) + 3.5;
    const lbl = makeSVGEl('text', {x:lx, y:ly, 'text-anchor':'middle',
        fill:'#e8c870', 'font-size':'10', 'font-weight':'700',
        'font-family':'JetBrains Mono,monospace'});
    lbl.textContent = hour;
    g.appendChild(lbl);
}

function onClockClick(evt) {
    const svg  = document.getElementById('wind-clock');
    const rect = svg.getBoundingClientRect();
    const cx = 65, cy = 65;
    const px = (evt.clientX - rect.left)  / rect.width  * 130 - cx;
    const py = (evt.clientY - rect.top)   / rect.height * 130 - cy;
    let ang = Math.atan2(py, px) * 180 / Math.PI + 90;
    if (ang < 0) ang += 360;
    const hour = Math.round(ang / 30) % 12 || 12;
    const dist = Math.sqrt(px*px + py*py);
    const h = (dist < 15) ? 0 : hour;
    setWindClock(h);
    document.getElementById('wind-clock-input').value = h;
}

function updateWindDesc() {
    const el = document.getElementById('wind-desc');
    if (el) el.textContent = WIND_DESCS[currentWindClock] || '';
}

// --- Collect all user inputs ---
function collectParams() {
    const type     = document.getElementById('firearm-type').value;
    const isCustom = (type === 'custom');
    const calId    = isCustom ? null : document.getElementById('caliber-select').value;
    const cal      = isCustom ? null : (CALIBER_DATA[type] || []).find(function(c) { return c.id === calId; });

    const bullet_weight_gr = isCustom
        ? (parseFloat(document.getElementById('custom-weight').value)   || 175)
        : (cal ? cal.bullet_weight_gr : 175);

    return {
        muzzle_velocity_fps: parseFloat(document.getElementById('muzzle-vel').value)   || 2600,
        bc:                  parseFloat(document.getElementById('bc-value').value)      || 0.264,
        drag_model:          document.getElementById('drag-model').value,
        bullet_weight_gr:    bullet_weight_gr,
        scope_height_in:     parseFloat(document.getElementById('scope-height').value)  || 1.5,

        zero_range_yds: parseFloat(document.getElementById('zero-range').value)  || 100,
        zero_temp_f:    parseFloat(document.getElementById('zero-temp').value)    || 59,
        zero_alt_ft:    parseFloat(document.getElementById('zero-alt').value)     || 0,
        zero_humidity:  parseFloat(document.getElementById('zero-humid').value)   || 50,

        curr_temp_f:    parseFloat(document.getElementById('curr-temp').value)    || 59,
        curr_alt_ft:    parseFloat(document.getElementById('curr-alt').value)     || 0,
        curr_humidity:  parseFloat(document.getElementById('curr-humid').value)   || 50,
        wind_speed_mph: parseFloat(document.getElementById('wind-speed').value)   || 0,
        wind_clock:     currentWindClock,

        max_range_yds:  parseFloat(document.getElementById('max-range').value)   || 1000,
        step_yds:       parseFloat(document.getElementById('step-yds').value)    || 10
    };
}

// --- Input Validation ---
function validateInputs(p) {
    const issues = [];

    if (p.scope_height_in > 4.0) {
        issues.push({ level:'error',
            msg: 'Scope height is ' + p.scope_height_in + '" — unusually high. Typical: 1.5"–2.5". ' +
                 'Did you enter centimeters? (1.5" = 3.81 cm) ' +
                 'A large scope height causes inflated MOA at short ranges.' });
    } else if (p.scope_height_in < 0.4) {
        issues.push({ level:'warn',
            msg: 'Scope height ' + p.scope_height_in + '" is very low. Typical minimum is ~0.5".' });
    }

    if (p.bc <= 0) {
        issues.push({ level:'error', msg: 'BC must be greater than zero.' });
    } else if (p.drag_model === 'G1' && p.bc < 0.08) {
        issues.push({ level:'warn',
            msg: 'G1 BC of ' + p.bc + ' is very low. Typical G1 range: 0.12–1.05. Did you enter a G7 value?' });
    } else if (p.drag_model === 'G7' && p.bc > 0.7) {
        issues.push({ level:'warn',
            msg: 'G7 BC of ' + p.bc + ' is very high. Typical G7 range: 0.06–0.55. Did you enter a G1 value?' });
    }

    if (p.muzzle_velocity_fps < 300) {
        issues.push({ level:'error',
            msg: 'Muzzle velocity of ' + p.muzzle_velocity_fps + ' fps is too low for ballistic modeling.' });
    } else if (p.muzzle_velocity_fps > 5500) {
        issues.push({ level:'warn',
            msg: 'Muzzle velocity ' + p.muzzle_velocity_fps + ' fps is unusually high (fastest commercial rounds ~4,800 fps).' });
    }

    if (p.zero_range_yds > p.max_range_yds) {
        issues.push({ level:'error',
            msg: 'Zero range (' + p.zero_range_yds + ' yds) is beyond max table range (' + p.max_range_yds + ' yds).' });
    }

    return issues;
}

function validateResult(result) {
    const issues = [];
    const angle  = Math.abs(result.zeroAngle_moa);

    if (angle > 90) {
        issues.push({ level:'error',
            msg: 'Computed bore angle is ' + angle.toFixed(1) + ' MOA — extremely large. ' +
                 'Check scope height (enter inches, not cm) and zero range. Typical bore angle: 1–15 MOA.' });
    } else if (angle > 30) {
        issues.push({ level:'warn',
            msg: 'Zero bore angle is ' + angle.toFixed(1) + ' MOA — unusually high. ' +
                 'Verify scope height is in inches.' });
    }

    if (result.points.length < 3) {
        issues.push({ level:'error',
            msg: 'Very few trajectory points computed. Check BC and muzzle velocity.' });
    }

    return issues;
}

function showWarnings(issues) {
    const existing = document.getElementById('warning-banner');
    if (existing) existing.remove();
    if (!issues.length) return;

    const banner   = document.createElement('div');
    banner.id      = 'warning-banner';
    banner.className = 'warning-banner';

    const hasError = issues.some(function(i) { return i.level === 'error'; });
    const headerHtml = '<div class="warning-banner-header ' + (hasError ? 'is-error' : '') + '">' +
        '<span class="warning-icon">' + (hasError ? '&#x1F6AB;' : '&#9888;') + '</span>' +
        '<span>' + (hasError ? 'INPUT ERRORS DETECTED' : 'INPUT WARNINGS') + ' — results may be unreliable</span>' +
        '</div>';
    const itemsHtml = '<ul class="warning-list">' +
        issues.map(function(i) {
            return '<li class="warning-item ' + i.level + '">' + i.msg + '</li>';
        }).join('') +
        '</ul>';
    banner.innerHTML = headerHtml + itemsHtml;

    const tableSection = document.getElementById('table-section');
    tableSection.insertBefore(banner, tableSection.querySelector('.table-header'));
}

// --- Main calculate ---
function calculate() {
    const btn = document.getElementById('calc-btn');
    btn.textContent = 'COMPUTING...';
    btn.disabled    = true;

    setTimeout(function() {
        try {
            const params      = collectParams();
            const inputIssues = validateInputs(params);
            const hasErrors   = inputIssues.some(function(i) { return i.level === 'error'; });

            if (hasErrors) {
                showWarnings(inputIssues);
                document.getElementById('empty-state').style.display   = 'flex';
                document.getElementById('table-wrapper').style.display  = 'none';
                document.getElementById('summary-bar').style.display    = 'none';
                document.getElementById('chart-section').style.display  = 'none';
            } else {
                const result       = computeTrajectory(params);
                const resultIssues = validateResult(result);
                const allIssues    = inputIssues.concat(resultIssues);
                lastResult = { params: params, result: result };
                renderResults(params, result);
                showWarnings(allIssues);
            }
        } catch (err) {
            console.error('Ballistics error:', err);
            showToast('Computation error: ' + err.message);
        }
        btn.textContent = 'COMPUTE FIRING SOLUTION';
        btn.disabled    = false;
    }, 30);
}

// --- Render all output ---
function renderResults(params, result) {
    if (!result.points || result.points.length === 0) {
        showToast('No trajectory data returned.');
        return;
    }
    updateHeaderStats(params, result);
    renderSummaryBar(params, result);
    renderChart(params, result);
    renderTable(params, result);
    document.getElementById('summary-bar').style.display   = 'flex';
    document.getElementById('chart-section').style.display = 'block';
    document.getElementById('empty-state').style.display   = 'none';
    document.getElementById('table-wrapper').style.display = 'block';
    document.getElementById('table-actions').style.display = 'flex';
}

// --- Header stats ---
function updateHeaderStats(p, r) {
    set('hdr-zero',  p.zero_range_yds + ' yds');
    set('hdr-da',    Math.round(r.currAtmo.DA_ft).toLocaleString() + ' ft');
    set('hdr-super', r.supersonicLimit_yds > 0 ? r.supersonicLimit_yds + ' yds' : '--');
    set('hdr-model', p.drag_model);
}

// --- Summary bar ---
function renderSummaryBar(p, r) {
    const bar  = document.getElementById('summary-bar');
    const last = r.points[r.points.length - 1];
    const currAtmoDA = Math.round(r.currAtmo.DA_ft);

    bar.innerHTML =
        '<div class="summary-card blue">' +
            '<span class="summary-card-label">Zero Range</span>' +
            '<span class="summary-card-value">' + p.zero_range_yds + '<span class="summary-card-unit">yds</span></span>' +
        '</div>' +
        '<div class="summary-card">' +
            '<span class="summary-card-label">Muzzle Velocity</span>' +
            '<span class="summary-card-value">' + p.muzzle_velocity_fps.toLocaleString() + '<span class="summary-card-unit">fps</span></span>' +
        '</div>' +
        '<div class="summary-card">' +
            '<span class="summary-card-label">Muzzle Energy</span>' +
            '<span class="summary-card-value">' + (r.points[0] ? r.points[0].energy_ftlbs.toLocaleString() : '--') + '<span class="summary-card-unit">ft&middot;lbs</span></span>' +
        '</div>' +
        '<div class="summary-card green">' +
            '<span class="summary-card-label">Supersonic Limit</span>' +
            '<span class="summary-card-value">' + (r.supersonicLimit_yds > 0 ? r.supersonicLimit_yds : '--') + '<span class="summary-card-unit">yds</span></span>' +
        '</div>' +
        '<div class="summary-card">' +
            '<span class="summary-card-label">Density Altitude</span>' +
            '<span class="summary-card-value">' + currAtmoDA.toLocaleString() + '<span class="summary-card-unit">ft</span></span>' +
        '</div>' +
        '<div class="summary-card">' +
            '<span class="summary-card-label">BC (' + p.drag_model + ')</span>' +
            '<span class="summary-card-value">' + p.bc.toFixed(3) + '</span>' +
        '</div>' +
        '<div class="summary-card">' +
            '<span class="summary-card-label">Wind</span>' +
            '<span class="summary-card-value">' + p.wind_speed_mph + ' <span class="summary-card-unit">mph ' + (p.wind_clock === 0 ? 'CALM' : p.wind_clock + " o'clock") + '</span></span>' +
        '</div>' +
        '<div class="summary-card amber">' +
            '<span class="summary-card-label">Max Range Drop</span>' +
            '<span class="summary-card-value">' + (last ? Math.abs(last.drop_in).toFixed(1) : '--') + '<span class="summary-card-unit">in</span></span>' +
        '</div>';
}

// --- Trajectory Chart ---
function renderChart(params, result) {
    const svg  = document.getElementById('trajectory-chart');
    const pts  = result.points;
    if (!pts.length) return;

    const W = 1000, H = 220;
    const ML = 68, MR = 20, MT = 20, MB = 40;
    const PW = W - ML - MR, PH = H - MT - MB;

    const maxX  = pts[pts.length - 1].range_m;
    const drops = pts.map(function(p) { return p.drop_in; });
    const minDrop = Math.min.apply(null, [0].concat(drops)) - 2;
    const maxDrop = Math.max.apply(null, [0].concat(drops)) + 2;

    function xS(x) { return ML + (x / maxX) * PW; }
    function yS(d) { return MT + PH - ((d - minDrop) / (maxDrop - minDrop)) * PH; }

    let html = '<defs>' +
        '<clipPath id="plot-clip"><rect x="' + ML + '" y="' + MT + '" width="' + PW + '" height="' + PH + '"/></clipPath>' +
        '</defs>';

    html += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#080b12"/>';
    html += '<rect x="' + ML + '" y="' + MT + '" width="' + PW + '" height="' + PH + '" fill="#0a0f1a" rx="2"/>';

    const regColors = { supersonic:'#052212', transonic:'#1a1000', subsonic:'#1a0505' };
    let prevRegX = ML, prevRegime = pts[0].regime;
    pts.forEach(function(pt, i) {
        if (pt.regime !== prevRegime || i === pts.length - 1) {
            const rx = xS(pt.range_m);
            html += '<rect x="' + prevRegX + '" y="' + MT + '" width="' + (rx - prevRegX) + '" height="' + PH +
                    '" fill="' + (regColors[prevRegime] || '#0a0f1a') + '" clip-path="url(#plot-clip)"/>';
            prevRegX   = rx;
            prevRegime = pt.regime;
        }
    });

    for (let i = 0; i <= 5; i++) {
        const dVal = minDrop + (maxDrop - minDrop) * (i / 5);
        const yy   = yS(dVal);
        html += '<line x1="' + ML + '" y1="' + yy + '" x2="' + (ML+PW) + '" y2="' + yy +
                '" stroke="#162030" stroke-width="1" stroke-dasharray="' + (dVal === 0 ? '0' : '4,4') + '"/>';
        if (i === 0 || i === 5 || Math.abs(dVal) < 2) {
            html += '<text x="' + (ML-5) + '" y="' + (yy+4) + '" text-anchor="end" fill="#3a5070" font-size="9" font-family="JetBrains Mono,monospace">' + Math.round(dVal) + '"</text>';
        }
    }

    const losY = yS(0);
    html += '<line x1="' + ML + '" y1="' + losY + '" x2="' + (ML+PW) + '" y2="' + losY +
            '" stroke="#2a4070" stroke-width="1.5" stroke-dasharray="6,4"/>';
    html += '<text x="' + (ML+6) + '" y="' + (losY-4) + '" fill="#2a4070" font-size="9" font-family="JetBrains Mono,monospace">LOS</text>';

    const zeroSVGX = xS(params.zero_range_yds * 0.9144);
    html += '<line x1="' + zeroSVGX + '" y1="' + MT + '" x2="' + zeroSVGX + '" y2="' + (MT+PH) +
            '" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4,3"/>';
    html += '<text x="' + (zeroSVGX+4) + '" y="' + (MT+12) + '" fill="#60a5fa" font-size="9" font-family="JetBrains Mono,monospace">ZERO</text>';

    const pathD = pts.map(function(pt, i) {
        return (i === 0 ? 'M' : 'L') + xS(pt.range_m).toFixed(1) + ',' + yS(pt.drop_in).toFixed(1);
    }).join(' ');
    const lastPt = pts[pts.length-1];
    html += '<path d="' + pathD + ' L' + xS(lastPt.range_m) + ',' + (MT+PH) + ' L' + ML + ',' + (MT+PH) + ' Z" fill="#c8a84b10" clip-path="url(#plot-clip)"/>';
    html += '<path d="' + pathD + '" fill="none" stroke="#c8a84b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#plot-clip)"/>';

    const xStep = Math.ceil(params.max_range_yds / 8 / 100) * 100;
    for (let rx = 0; rx <= params.max_range_yds; rx += xStep) {
        const sx = xS(rx * 0.9144);
        html += '<line x1="' + sx + '" y1="' + (MT+PH) + '" x2="' + sx + '" y2="' + (MT+PH+4) + '" stroke="#162030" stroke-width="1"/>';
        html += '<text x="' + sx + '" y="' + (MT+PH+16) + '" text-anchor="middle" fill="#3a5070" font-size="9" font-family="JetBrains Mono,monospace">' + rx + '</text>';
    }
    html += '<text x="' + (ML+PW/2) + '" y="' + (H-4) + '" text-anchor="middle" fill="#3a5070" font-size="9" font-family="JetBrains Mono,monospace" letter-spacing="1.5">RANGE (yds)</text>';
    html += '<text x="12" y="' + (MT+PH/2) + '" text-anchor="middle" fill="#3a5070" font-size="9" font-family="JetBrains Mono,monospace" letter-spacing="1.5" transform="rotate(-90,12,' + (MT+PH/2) + ')">DROP (in)</text>';

    svg.innerHTML = html;
}

// --- Firing Solution Table (updated: no arrows, clean numbers) ---
function renderTable(params, result) {
    const tbody     = document.getElementById('table-body');
    const zeroRange = params.zero_range_yds;
    const stepYds   = params.step_yds;
    let rows        = '';

    result.points.forEach(function(pt) {
        const isZero    = Math.abs(pt.range_yds - zeroRange) < stepYds * 0.5;
        const isHundred = !isZero && pt.range_yds % 100 === 0;
        const trClass   = isZero     ? 'zero-row'
                          : isHundred ? 'hundred-row regime-' + pt.regime
                          : 'regime-' + pt.regime;

        const dropStr   = (pt.drop_in >= 0 ? '+' : '') + pt.drop_in.toFixed(1) + '"';
        const elevStr   = pt.elev_moa.toFixed(2);
        const driftStr  = pt.drift_in.toFixed(1) + '"';
        const windStr   = pt.wind_moa.toFixed(2);

        rows += '<tr class="' + trClass + '">' +
            '<td>' + pt.range_yds + (isZero ? ' &#9733;' : '') + '</td>' +
            '<td>' + dropStr + '</td>' +
            '<td>' + elevStr + '</td>' +
            '<td>' + driftStr + '</td>' +
            '<td>' + windStr + '</td>' +
            '<td>' + pt.velocity_fps.toLocaleString() + '</td>' +
            '<td>' + pt.energy_ftlbs.toLocaleString() + '</td>' +
            '<td>' + pt.time_s.toFixed(3) + '</td>' +
            '<td>' + pt.mach.toFixed(2) + '</td>' +
        '</tr>';
    });

    tbody.innerHTML = rows;
}

// --- CSV Export (updated: pure numeric) ---
function copyCSV() {
    if (!lastResult) return;
    const pts    = lastResult.result.points;
    const header = 'Range(yds),Drop(in),Elevation(MOA),WindDrift(in),Windage(MOA),Velocity(fps),Energy(ft-lbs),TOF(s),Mach';
    const rows   = pts.map(function(p) {
        return [
            p.range_yds,
            p.drop_in,
            p.elev_moa,
            p.drift_in,
            p.wind_moa,
            p.velocity_fps,
            p.energy_ftlbs,
            p.time_s,
            p.mach
        ].join(',');
    });
    const csv = [header].concat(rows).join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(csv).then(function() {
            showToast('Firing solution copied to clipboard');
        }).catch(function() { fallbackCopy(csv); });
    } else {
        fallbackCopy(csv);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Firing solution copied to clipboard');
}

// --- Helpers ---
function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className   = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
}
