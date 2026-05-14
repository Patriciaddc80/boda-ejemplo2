// data-bridge.js
// Cargado antes que cualquier script en index.html y panel.html.
// Configura las rutas de la API y las variables globales del proyecto.
// ⚠️  No subas claves secretas aquí. Este archivo es público.

(function () {
    // ── Clave del localStorage (misma en formulario y panel) ─────────────────
    window.YJ_RSVP_KEY = 'yj_rsvp_log';

    // ── Rutas de la API (funciones serverless de Vercel) ─────────────────────
    // El formulario envía aquí tras el submit
    window.YJ_API_SUBMIT_PATH = '/api/rsvp-submit';

    // El panel lee de aquí cuando conectas el servidor SQL
    window.YJ_API_ROWS_PATH = '/api/rsvp-rows';

    // ── WhatsApp (números de los novios) ─────────────────────────────────────
    // Formato: código de país + número, sin + ni espacios.
    window.WHATSAPP_TO_LIST = [
        '34000000000',
        '34000000000',
    ];
})();