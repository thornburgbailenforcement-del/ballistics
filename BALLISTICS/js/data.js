// ============================================================
//  BALLISTICS CALCULATOR — Firearm & Caliber Preset Database
// ============================================================

const FIREARM_TYPES = [
    { id: 'rifle',  label: 'Rifle' },
    { id: 'dmr',    label: 'DMR / Marksman Rifle' },
    { id: 'sniper', label: 'Sniper Rifle' },
    { id: 'pistol', label: 'Pistol / Handgun' },
    { id: 'pcc',    label: 'PCC (Pistol Caliber Carbine)' },
    { id: 'custom', label: '⊕  Custom Firearm' }
];

const CALIBER_DATA = {
    rifle: [
        { id: 'r_223_55',  name: '.223 Rem / 5.56 NATO – 55gr FMJ',      diameter_in: 0.224, bullet_weight_gr:  55, muzzle_velocity_fps: 3240, bc_g1: 0.243, bc_g7: 0.123, recommended_model: 'G1' },
        { id: 'r_223_62',  name: '.223 Rem / 5.56 NATO – 62gr M855',      diameter_in: 0.224, bullet_weight_gr:  62, muzzle_velocity_fps: 3100, bc_g1: 0.307, bc_g7: 0.151, recommended_model: 'G7' },
        { id: 'r_223_69',  name: '.223 Rem – 69gr Sierra MatchKing',       diameter_in: 0.224, bullet_weight_gr:  69, muzzle_velocity_fps: 2950, bc_g1: 0.303, bc_g7: 0.168, recommended_model: 'G7' },
        { id: 'r_223_77',  name: '.223 Rem – 77gr Sierra MatchKing',       diameter_in: 0.224, bullet_weight_gr:  77, muzzle_velocity_fps: 2750, bc_g1: 0.372, bc_g7: 0.194, recommended_model: 'G7' },
        { id: 'r_243_87',  name: '.243 Win – 87gr Hornady HPBT',           diameter_in: 0.243, bullet_weight_gr:  87, muzzle_velocity_fps: 3100, bc_g1: 0.381, bc_g7: 0.195, recommended_model: 'G7' },
        { id: 'r_243_105', name: '.243 Win – 105gr Berger Hybrid',         diameter_in: 0.243, bullet_weight_gr: 105, muzzle_velocity_fps: 2950, bc_g1: 0.530, bc_g7: 0.271, recommended_model: 'G7' },
        { id: 'r_65g_123', name: '6.5 Grendel – 123gr Lapua Scenar',      diameter_in: 0.264, bullet_weight_gr: 123, muzzle_velocity_fps: 2590, bc_g1: 0.547, bc_g7: 0.278, recommended_model: 'G7' },
        { id: 'r_65c_120', name: '6.5 Creedmoor – 120gr Hornady ELD-M',   diameter_in: 0.264, bullet_weight_gr: 120, muzzle_velocity_fps: 2910, bc_g1: 0.490, bc_g7: 0.250, recommended_model: 'G7' },
        { id: 'r_65c_140', name: '6.5 Creedmoor – 140gr Hornady ELD-M',   diameter_in: 0.264, bullet_weight_gr: 140, muzzle_velocity_fps: 2710, bc_g1: 0.646, bc_g7: 0.315, recommended_model: 'G7' },
        { id: 'r_65c_143', name: '6.5 Creedmoor – 143gr Hornady ELD-X',   diameter_in: 0.264, bullet_weight_gr: 143, muzzle_velocity_fps: 2700, bc_g1: 0.625, bc_g7: 0.310, recommended_model: 'G7' },
        { id: 'r_260_142', name: '.260 Rem – 142gr Sierra MatchKing',      diameter_in: 0.264, bullet_weight_gr: 142, muzzle_velocity_fps: 2680, bc_g1: 0.626, bc_g7: 0.304, recommended_model: 'G7' },
        { id: 'r_308_147', name: '.308 Win / 7.62 NATO – 147gr M80 FMJ',  diameter_in: 0.308, bullet_weight_gr: 147, muzzle_velocity_fps: 2820, bc_g1: 0.395, bc_g7: 0.195, recommended_model: 'G7' },
        { id: 'r_308_168', name: '.308 Win – 168gr Sierra MatchKing',      diameter_in: 0.308, bullet_weight_gr: 168, muzzle_velocity_fps: 2650, bc_g1: 0.475, bc_g7: 0.243, recommended_model: 'G7' },
        { id: 'r_308_175', name: '.308 Win – 175gr Sierra MatchKing',      diameter_in: 0.308, bullet_weight_gr: 175, muzzle_velocity_fps: 2600, bc_g1: 0.505, bc_g7: 0.264, recommended_model: 'G7' },
        { id: 'r_3006_180',name: '.30-06 Springfield – 180gr HPBT',        diameter_in: 0.308, bullet_weight_gr: 180, muzzle_velocity_fps: 2700, bc_g1: 0.481, bc_g7: 0.243, recommended_model: 'G7' }
    ],
    dmr: [
        { id: 'd_65c_140', name: '6.5 Creedmoor – 140gr Hornady ELD-M',   diameter_in: 0.264, bullet_weight_gr: 140, muzzle_velocity_fps: 2750, bc_g1: 0.646, bc_g7: 0.315, recommended_model: 'G7' },
        { id: 'd_65c_143', name: '6.5 Creedmoor – 143gr Hornady ELD-X',   diameter_in: 0.264, bullet_weight_gr: 143, muzzle_velocity_fps: 2710, bc_g1: 0.625, bc_g7: 0.310, recommended_model: 'G7' },
        { id: 'd_260_142', name: '.260 Rem – 142gr Sierra MatchKing',      diameter_in: 0.264, bullet_weight_gr: 142, muzzle_velocity_fps: 2700, bc_g1: 0.626, bc_g7: 0.304, recommended_model: 'G7' },
        { id: 'd_308_168', name: '.308 Win – 168gr SMK (M852)',            diameter_in: 0.308, bullet_weight_gr: 168, muzzle_velocity_fps: 2680, bc_g1: 0.475, bc_g7: 0.243, recommended_model: 'G7' },
        { id: 'd_308_175', name: '.308 Win – 175gr SMK (M118LR)',          diameter_in: 0.308, bullet_weight_gr: 175, muzzle_velocity_fps: 2600, bc_g1: 0.505, bc_g7: 0.264, recommended_model: 'G7' },
        { id: 'd_300wm_190',name: '.300 Win Mag – 190gr Sierra MatchKing', diameter_in: 0.308, bullet_weight_gr: 190, muzzle_velocity_fps: 2900, bc_g1: 0.620, bc_g7: 0.310, recommended_model: 'G7' }
    ],
    sniper: [
        { id: 's_308_175', name: '.308 Win – 175gr SMK (M118LR)',          diameter_in: 0.308, bullet_weight_gr: 175, muzzle_velocity_fps: 2600, bc_g1: 0.505, bc_g7: 0.264, recommended_model: 'G7' },
        { id: 's_300wm_190',name: '.300 Win Mag – 190gr Sierra MatchKing', diameter_in: 0.308, bullet_weight_gr: 190, muzzle_velocity_fps: 2900, bc_g1: 0.620, bc_g7: 0.310, recommended_model: 'G7' },
        { id: 's_300wm_230',name: '.300 Win Mag – 230gr Berger Hybrid OTM',diameter_in: 0.308, bullet_weight_gr: 230, muzzle_velocity_fps: 2650, bc_g1: 0.743, bc_g7: 0.368, recommended_model: 'G7' },
        { id: 's_338lm_250',name: '.338 Lapua Mag – 250gr Sierra MatchKing',diameter_in:0.338, bullet_weight_gr: 250, muzzle_velocity_fps: 2900, bc_g1: 0.640, bc_g7: 0.307, recommended_model: 'G7' },
        { id: 's_338lm_285',name: '.338 Lapua Mag – 285gr Hornady ELD-M',  diameter_in: 0.338, bullet_weight_gr: 285, muzzle_velocity_fps: 2745, bc_g1: 0.789, bc_g7: 0.393, recommended_model: 'G7' },
        { id: 's_338lm_300',name: '.338 Lapua Mag – 300gr Berger Hybrid',  diameter_in: 0.338, bullet_weight_gr: 300, muzzle_velocity_fps: 2700, bc_g1: 0.761, bc_g7: 0.381, recommended_model: 'G7' },
        { id: 's_50bmg_661',name: '.50 BMG – 661gr M33 Ball FMJ',          diameter_in: 0.510, bullet_weight_gr: 661, muzzle_velocity_fps: 3029, bc_g1: 0.670, bc_g7: 0.349, recommended_model: 'G7' },
        { id: 's_50bmg_750',name: '.50 BMG – 750gr Hornady A-MAX',         diameter_in: 0.510, bullet_weight_gr: 750, muzzle_velocity_fps: 2820, bc_g1: 1.050, bc_g7: 0.530, recommended_model: 'G7' }
    ],
    pistol: [
        { id: 'p_9mm_115',  name: '9mm Luger – 115gr FMJ',                 diameter_in: 0.355, bullet_weight_gr: 115, muzzle_velocity_fps: 1180, bc_g1: 0.127, bc_g7: 0.064, recommended_model: 'G1' },
        { id: 'p_9mm_124',  name: '9mm Luger – 124gr JHP',                 diameter_in: 0.355, bullet_weight_gr: 124, muzzle_velocity_fps: 1150, bc_g1: 0.145, bc_g7: 0.073, recommended_model: 'G1' },
        { id: 'p_9mm_147',  name: '9mm Luger – 147gr JHP',                 diameter_in: 0.355, bullet_weight_gr: 147, muzzle_velocity_fps:  990, bc_g1: 0.167, bc_g7: 0.084, recommended_model: 'G1' },
        { id: 'p_40sw_165', name: '.40 S&W – 165gr FMJ',                   diameter_in: 0.400, bullet_weight_gr: 165, muzzle_velocity_fps: 1130, bc_g1: 0.185, bc_g7: 0.093, recommended_model: 'G1' },
        { id: 'p_40sw_180', name: '.40 S&W – 180gr JHP',                   diameter_in: 0.400, bullet_weight_gr: 180, muzzle_velocity_fps: 1000, bc_g1: 0.190, bc_g7: 0.095, recommended_model: 'G1' },
        { id: 'p_45acp_185',name: '.45 ACP – 185gr JHP',                   diameter_in: 0.452, bullet_weight_gr: 185, muzzle_velocity_fps: 1000, bc_g1: 0.185, bc_g7: 0.093, recommended_model: 'G1' },
        { id: 'p_45acp_230',name: '.45 ACP – 230gr FMJ',                   diameter_in: 0.452, bullet_weight_gr: 230, muzzle_velocity_fps:  850, bc_g1: 0.190, bc_g7: 0.096, recommended_model: 'G1' },
        { id: 'p_10mm_175', name: '10mm Auto – 175gr JHP',                  diameter_in: 0.400, bullet_weight_gr: 175, muzzle_velocity_fps: 1250, bc_g1: 0.190, bc_g7: 0.096, recommended_model: 'G1' },
        { id: 'p_357s_125', name: '.357 SIG – 125gr JHP',                   diameter_in: 0.355, bullet_weight_gr: 125, muzzle_velocity_fps: 1350, bc_g1: 0.145, bc_g7: 0.073, recommended_model: 'G1' },
        { id: 'p_357m_158', name: '.357 Mag – 158gr SJHP',                  diameter_in: 0.357, bullet_weight_gr: 158, muzzle_velocity_fps: 1235, bc_g1: 0.197, bc_g7: 0.099, recommended_model: 'G1' }
    ],
    pcc: [
        { id: 'c_9mm_115',  name: '9mm – 115gr FMJ (PCC)',                  diameter_in: 0.355, bullet_weight_gr: 115, muzzle_velocity_fps: 1350, bc_g1: 0.127, bc_g7: 0.064, recommended_model: 'G1' },
        { id: 'c_9mm_124',  name: '9mm – 124gr JHP (PCC)',                  diameter_in: 0.355, bullet_weight_gr: 124, muzzle_velocity_fps: 1300, bc_g1: 0.145, bc_g7: 0.073, recommended_model: 'G1' },
        { id: 'c_9mm_147',  name: '9mm – 147gr Subsonic (PCC)',             diameter_in: 0.355, bullet_weight_gr: 147, muzzle_velocity_fps: 1050, bc_g1: 0.167, bc_g7: 0.084, recommended_model: 'G1' },
        { id: 'c_40sw_180', name: '.40 S&W – 180gr FMJ (PCC)',              diameter_in: 0.400, bullet_weight_gr: 180, muzzle_velocity_fps: 1150, bc_g1: 0.190, bc_g7: 0.095, recommended_model: 'G1' },
        { id: 'c_45acp_230',name: '.45 ACP – 230gr FMJ (PCC)',              diameter_in: 0.452, bullet_weight_gr: 230, muzzle_velocity_fps: 1000, bc_g1: 0.190, bc_g7: 0.096, recommended_model: 'G1' }
    ],
    custom: []
};
