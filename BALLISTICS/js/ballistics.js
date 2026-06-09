// ============================================================
//  BALLISTICS ENGINE  –  RK4 Point-Mass Trajectory Solver
//  Units: all internal SI, converted at input/output boundaries
// ============================================================

const G1_TABLE = [
    [0.00, 0.2629],[0.05, 0.2558],[0.10, 0.2487],[0.15, 0.2413],
    [0.20, 0.2335],[0.25, 0.2253],[0.30, 0.2166],[0.35, 0.2075],
    [0.40, 0.1980],[0.45, 0.1881],[0.50, 0.1786],[0.55, 0.1695],
    [0.60, 0.1610],[0.65, 0.1535],[0.70, 0.1470],[0.75, 0.1418],
    [0.80, 0.1382],[0.825,0.1355],[0.85, 0.1353],[0.875,0.1369],
    [0.90, 0.1421],[0.925,0.1522],[0.95, 0.1663],[0.975,0.1869],
    [1.00, 0.2174],[1.025,0.2626],[1.05, 0.2977],[1.075,0.3169],
    [1.10, 0.3281],[1.125,0.3345],[1.15, 0.3378],[1.20, 0.3392],
    [1.25, 0.3387],[1.30, 0.3376],[1.35, 0.3350],[1.40, 0.3298],
    [1.45, 0.3213],[1.50, 0.3107],[1.55, 0.2998],[1.60, 0.2889],
    [1.65, 0.2785],[1.70, 0.2686],[1.75, 0.2594],[1.80, 0.2507],
    [1.85, 0.2425],[1.90, 0.2348],[1.95, 0.2278],[2.00, 0.2213],
    [2.10, 0.2101],[2.20, 0.2010],[2.30, 0.1934],[2.40, 0.1872],
    [2.50, 0.1823],[2.60, 0.1783],[2.70, 0.1750],[2.80, 0.1720],
    [2.90, 0.1694],[3.00, 0.1671],[3.25, 0.1615],[3.50, 0.1577],
    [4.00, 0.1516],[4.50, 0.1467],[5.00, 0.1446]
];

const G7_TABLE = [
    [0.00, 0.1198],[0.05, 0.1197],[0.10, 0.1196],[0.15, 0.1194],
    [0.20, 0.1193],[0.25, 0.1194],[0.30, 0.1194],[0.35, 0.1194],
    [0.40, 0.1193],[0.45, 0.1193],[0.50, 0.1194],[0.55, 0.1193],
    [0.60, 0.1194],[0.65, 0.1197],[0.70, 0.1202],[0.725,0.1207],
    [0.75, 0.1215],[0.775,0.1226],[0.80, 0.1242],[0.825,0.1266],
    [0.85, 0.1306],[0.875,0.1368],[0.90, 0.1464],[0.925,0.1660],
    [0.95, 0.2054],[0.975,0.2993],[1.00, 0.3803],[1.025,0.4015],
    [1.05, 0.4043],[1.075,0.4034],[1.10, 0.4014],[1.125,0.3987],
    [1.15, 0.3955],[1.20, 0.3884],[1.25, 0.3810],[1.30, 0.3732],
    [1.35, 0.3657],[1.40, 0.3580],[1.50, 0.3440],[1.55, 0.3376],
    [1.60, 0.3315],[1.65, 0.3260],[1.70, 0.3209],[1.75, 0.3160],
    [1.80, 0.3115],[1.85, 0.3072],[1.90, 0.3032],[1.95, 0.2994],
    [2.00, 0.2959],[2.10, 0.2898],[2.20, 0.2850],[2.30, 0.2813],
    [2.40, 0.2789],[2.50, 0.2774],[2.60, 0.2762],[2.70, 0.2745],
    [2.80, 0.2718],[2.90, 0.2682],[3.00, 0.2642],[3.50, 0.2441],
    [4.00, 0.2258],[4.50, 0.2091],[5.00, 0.1952]
];

function interpolateDrag(mach, table) {
    if (mach <= table[0][0])                   return table[0][1];
    if (mach >= table[table.length - 1][0])    return table[table.length - 1][1];
    let lo = 0, hi = table.length - 1;
    while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (table[mid][0] <= mach) lo = mid; else hi = mid;
    }
    const t = (mach - table[lo][0]) / (table[hi][0] - table[lo][0]);
    return table[lo][1] + t * (table[hi][1] - table[lo][1]);
}

function computeAtmosphere(temp_f, alt_ft, humidity_pct) {
    const T_C = (temp_f - 32) * (5 / 9);
    const T_K = T_C + 273.15;
    const alt_m = alt_ft * 0.3048;

    const P0 = 101325;
    const P  = P0 * Math.pow(1 - 2.25577e-5 * alt_m, 5.25588);

    const Psat = 610.78 * Math.exp(17.2694 * T_C / (T_C + 237.29));
    const Pv   = (humidity_pct / 100) * Psat;
    const Pd   = P - Pv;

    const rho = (Pd / 287.058 + Pv / 461.495) / T_K;

    const c = 20.0457 * Math.sqrt(T_K * (1 + 0.0019 * (humidity_pct / 100)));

    const rho0 = 1.225;
    const DA_ft = (1 - Math.pow(rho / rho0, 0.234969)) / 6.87559e-6;

    return { rho, c, T_K, P, DA_ft };
}

function derivatives(state, p) {
    const [x, y, z, vx, vy, vz] = state;
    const rvx = vx - p.wind_vx;
    const rvy = vy;
    const rvz = vz - p.wind_vz;
    const v2  = rvx * rvx + rvy * rvy + rvz * rvz;
    const v_r = Math.sqrt(v2);

    if (v_r < 0.1) return [vx, vy, vz, 0, -p.g, 0];

    const mach  = v_r / p.c;
    const Cd    = interpolateDrag(mach, p.dragTable);
    const drag  = 0.5 * p.rho * v2 * Cd / p.BC_SI;

    return [
        vx, vy, vz,
        -drag * rvx / v_r,
        -p.g - drag * rvy / v_r,
        -drag * rvz / v_r
    ];
}

function rk4Step(state, p, dt) {
    const k1 = derivatives(state, p);
    const s2 = state.map((s, i) => s + 0.5 * dt * k1[i]);
    const k2 = derivatives(s2, p);
    const s3 = state.map((s, i) => s + 0.5 * dt * k2[i]);
    const k3 = derivatives(s3, p);
    const s4 = state.map((s, i) => s + dt * k3[i]);
    const k4 = derivatives(s4, p);
    return state.map((s, i) => s + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

function integrateToRange(targetX, initVx, initVy, p, dt) {
    let state = [0, 0, 0, initVx, initVy, 0];
    let t = 0;
    const maxT = 60;

    while (t < maxT) {
        const x = state[0];
        if (x >= targetX) {
            return {
                y: state[1], z: state[2],
                vx: state[3], vy: state[4], vz: state[5],
                speed: Math.sqrt(state[3] ** 2 + state[4] ** 2 + state[5] ** 2),
                t
            };
        }
        const v = Math.sqrt(state[3] ** 2 + state[4] ** 2 + state[5] ** 2);
        if (v < 30) return null;
        state = rk4Step(state, p, dt);
        t += dt;
    }
    return null;
}

function findZeroAngle(MV_ms, BC_SI, dragTable, scopeH_m, zeroRange_m, atmo) {
    const p = {
        rho: atmo.rho, c: atmo.c, BC_SI, dragTable,
        wind_vx: 0, wind_vz: 0, g: 9.80665
    };
    const dt = 0.0005;

    let lo = -0.08, hi = 0.18;
    for (let iter = 0; iter < 80; iter++) {
        const mid    = (lo + hi) / 2;
        const initVx = MV_ms * Math.cos(mid);
        const initVy = MV_ms * Math.sin(mid);
        const res    = integrateToRange(zeroRange_m, initVx, initVy, p, dt);
        if (!res) { hi = mid; continue; }
        if (res.y > scopeH_m) hi = mid;
        else                  lo = mid;
        if (hi - lo < 1e-9)  break;
    }
    return (lo + hi) / 2;
}

function computeTrajectory(up) {
    const MV_ms    = up.muzzle_velocity_fps * 0.3048;
    const BC_SI    = up.bc * 703.07;
    const scopeH   = up.scope_height_in * 0.0254;
    const zero_m   = up.zero_range_yds * 0.9144;
    const max_m    = up.max_range_yds  * 0.9144;
    const step_m   = up.step_yds       * 0.9144;
    const mass_kg  = up.bullet_weight_gr * 6.47989e-5;

    const windSpd   = (up.wind_clock === 0) ? 0 : up.wind_speed_mph * 0.44704;
    const windAngle = up.wind_clock * (Math.PI / 6);
    const wind_vx   = -windSpd * Math.cos(windAngle);
    const wind_vz   = -windSpd * Math.sin(windAngle);

    const dragTable = (up.drag_model === 'G7') ? G7_TABLE : G1_TABLE;

    const zeroAtmo = computeAtmosphere(up.zero_temp_f, up.zero_alt_ft, up.zero_humidity);
    const currAtmo = computeAtmosphere(up.curr_temp_f, up.curr_alt_ft, up.curr_humidity);

    const zeroAngle_rad = findZeroAngle(MV_ms, BC_SI, dragTable, scopeH, zero_m, zeroAtmo);

    const initVx = MV_ms * Math.cos(zeroAngle_rad);
    const initVy = MV_ms * Math.sin(zeroAngle_rad);

    const p = {
        rho: currAtmo.rho, c: currAtmo.c, BC_SI, dragTable,
        wind_vx, wind_vz, g: 9.80665
    };

    const dt = 0.0002;
    let state  = [0, 0, 0, initVx, initVy, 0];
    let t      = 0;
    let nextX  = step_m;
    const points = [];
    let supersonicLimit_yds = 0;
    let transitionRecorded  = false;

    const SUPERSONIC_MACH = 1.2;
    const TRANSONIC_MACH  = 0.9;
    const MACH_12_M_S  = 1.2 * currAtmo.c;

    while (t < 60) {
        const [x, y, z, vx, vy, vz] = state;
        const spd  = Math.sqrt(vx * vx + vy * vy + vz * vz);
        const mach = spd / currAtmo.c;

        if (spd < 30 || x > max_m + step_m * 0.5) break;

        if (x >= nextX - 0.001) {
            const drop_m   = scopeH - y;
            const drop_in  = drop_m / 0.0254;
            const drift_in = z / 0.0254;

            const range_yds = x / 0.9144;

            const moaFactor = range_yds * 1.04720 / 100;
            const elev_moa  = drop_in  / moaFactor;
            const wind_moa  = -drift_in / moaFactor;

            const vel_fps  = spd / 0.3048;
            const ke_ftlbs = (0.5 * mass_kg * spd * spd) / 1.35582;

            let regime = 'supersonic';
            if (mach < TRANSONIC_MACH)       regime = 'subsonic';
            else if (mach < SUPERSONIC_MACH) regime = 'transonic';

            if (!transitionRecorded && spd < MACH_12_M_S) {
                supersonicLimit_yds = Math.round(range_yds);
                transitionRecorded  = true;
            }

            points.push({
                range_yds:    Math.round(range_yds),
                range_m:      x,
                drop_in:      +drop_in.toFixed(2),
                elev_moa:     +elev_moa.toFixed(2),
                drift_in:     +drift_in.toFixed(2),
                wind_moa:     +wind_moa.toFixed(2),
                velocity_fps: Math.round(vel_fps),
                energy_ftlbs: Math.round(ke_ftlbs),
                time_s:       +t.toFixed(3),
                mach:         +mach.toFixed(2),
                regime
            });

            nextX += step_m;
            if (nextX > max_m + step_m * 0.5) break;
        }

        state = rk4Step(state, p, dt);
        t    += dt;
    }

    return {
        points,
        zeroAngle_moa:    (zeroAngle_rad * (180 / Math.PI)) * 60,
        zeroAtmo,
        currAtmo,
        supersonicLimit_yds
    };
}
