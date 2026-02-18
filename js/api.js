/**
 * API.js - Capa de Comunicación con el Backend
 * Centraliza todas las llamadas al servidor y gestiona la sesión.
 */

const API_URL = "https://public.digitalvalue.es/github/tests2/botcamp2026/GestionPadelPinto/server/backend.php";

// --- UTILIDADES ---
const Utils = {
    // Convierte "15/08/2024" -> "2024-08-15"
    toIsoDate: (dateStr) => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month}-${day}`;
    },
    // Convierte "2024-08-15" -> "15/08/2024"
    toFrontDate: (isoDate) => {
        if (!isoDate) return "";
        const [year, month, day] = isoDate.split("-");
        return `${day}/${month}/${year}`;
    }
};

// --- GESTIÓN DE USUARIO (AUTH) ---
const Auth = {
    user: null,

    // Cargar usuario guardado al iniciar la app
    init: () => {
        const stored = localStorage.getItem("padel_user");
        if (stored) {
            try {
                Auth.user = JSON.parse(stored);
            } catch (e) {
                console.error("Error al leer sesión", e);
                localStorage.removeItem("padel_user");
            }
        }
    },

    login: async (email, password) => {
        try {
            const res = await m.request({
                method: "POST",
                url: `${API_URL}?action=login`,
                body: { email, password }
            });

            if (res.status === "ok") {
                Auth.user = res.user;
                localStorage.setItem("padel_user", JSON.stringify(Auth.user));
                return { success: true };
            }
        } catch (e) {
            return { success: false, error: e.response ? e.response.error : "Error de conexión" };
        }
    },

    register: async (userData) => {
        try {
            const res = await m.request({
                method: "POST",
                url: `${API_URL}?action=register`,
                body: userData
            });
            return { success: true, id: res.id };
        } catch (e) {
            return { success: false, error: e.response ? e.response.error : "Error al registrar" };
        }
    },

    logout: () => {
        Auth.user = null;
        localStorage.removeItem("padel_user");
    }
};

// --- LÓGICA DE PÁDEL (DATOS) ---
const PadelData = {

    // Obtener lista de ranking
    getRanking: async () => {
        try {
            return await m.request({ method: "GET", url: `${API_URL}?action=ranking` });
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    // Obtener lista de pistas
    getPistas: async () => {
        try {
            return await m.request({ method: "GET", url: `${API_URL}?action=pistas` });
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    // Obtener todas las reservas de un día
    // El backend ya devuelve los jugadores y sus rankings (JOINs)
    getReservas: async (dateStr) => {
        const isoDate = Utils.toIsoDate(dateStr);
        try {
            return await m.request({
                method: "GET",
                url: `${API_URL}?action=reservas&fecha=${isoDate}`
            });
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    // Crear una nueva partida (Pública o Privada)
    crearReserva: async (pistaId, hora, fechaStr, tipo, codigo = null) => {
        if (!Auth.user) return { success: false, error: "No estás logueado" };

        try {
            const payload = {
                pista_id: pistaId,
                creador_id: Auth.user.id,
                fecha: Utils.toIsoDate(fechaStr),
                hora: hora,
                tipo: tipo, // 'public' o 'private'
                codigo: codigo // Solo si es privada
            };

            await m.request({
                method: "POST",
                url: `${API_URL}?action=reservar`,
                body: payload
            });
            return { success: true };

        } catch (e) {
            return { success: false, error: e.response ? e.response.error : "Error al reservar" };
        }
    },

    // Unirse a una partida existente
    unirseReserva: async (reservaId, codigo = null) => {
        if (!Auth.user) return { success: false, error: "No estás logueado" };

        try {
            await m.request({
                method: "POST",
                url: `${API_URL}?action=unirse`,
                body: {
                    reserva_id: reservaId,
                    usuario_id: Auth.user.id,
                    codigo: codigo // Necesario si la partida es privada
                }
            });
            return { success: true };
        } catch (e) {
            return { success: false, error: e.response ? e.response.error : "No se pudo unir" };
        }
    },

    // Finalizar partida y actualizar Ranking (Solo el creador debería poder hacer esto)
    finalizarPartida: async (reservaId, equipoGanador, marcador) => {
        try {
            await m.request({
                method: "POST",
                url: `${API_URL}?action=finalizar_partida`,
                body: {
                    reserva_id: reservaId,
                    ganador: equipoGanador, // 'A' o 'B'
                    marcador: marcador // ej: "6-3 6-4"
                }
            });
            return { success: true };
        } catch (e) {
            return { success: false, error: "Error al guardar resultado" };
        }
    },

    abandonarReserva: async (reservaId) => {
        if (!Auth.user) return { success: false, error: "No estás logueado" };
        try {
            await m.request({
                method: "POST",
                url: `${API_URL}?action=abandonar`,
                body: {
                    reserva_id: reservaId,
                    usuario_id: Auth.user.id
                }
            });
            return { success: true };
        } catch (e) {
            return { success: false, error: e.response ? e.response.error : "No se pudo salir" };
        }
    },
};

// Inicializamos la sesión al cargar el script
Auth.init();