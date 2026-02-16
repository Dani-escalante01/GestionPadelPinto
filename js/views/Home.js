const HOURS = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "16:30",
  "18:00",
  "19:30",
  "21:00",
];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// --- ESTADO GLOBAL ---
const State = {
  selectedDate: new Date(),
  selectedTime: "10:30",
  courts: [],
  reservations: [],
  loading: true,
  userMenuOpen: false,
  // Datos del Modal
  modal: {
    show: false,
    court: null,
    match: null, // Si es null, es nueva reserva. Si existe, es unirse.
    type: "public", // public / private
    generatedCode: null,
    inputCode: "",
  },
};

// --- ACCIONES (Lógica de Negocio) ---
const Actions = {
  init: async () => {
    Auth.init();
    const pistas = await PadelData.getPistas();
    State.courts = pistas.items || pistas;
    await Actions.loadReservations();
    State.loading = false;
    m.redraw();
  },

  loadReservations: async () => {
    const dateStr = State.selectedDate.toLocaleDateString("es-ES");
    State.reservations = await PadelData.getReservas(dateStr);
    m.redraw();
  },

  selectDate: (date) => {
    State.selectedDate = date;
    Actions.loadReservations();
  },

  openModal: (court, match = null) => {
    if (!Auth.user) {
      alert("Inicia sesión primero");
      window.location.href = "login.html";
      return;
    }
    State.modal.show = true;
    State.modal.court = court;
    State.modal.match = match; // Si hay match, es modo "Unirse"

    if (!match) {
      // Modo Crear
      State.modal.type = "public";
      State.modal.generatedCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
    } else {
      State.modal.inputCode = ""; // Limpiar input para unirse
    }
  },

  submitBooking: async () => {
    const dateStr = State.selectedDate.toLocaleDateString("es-ES");

    // A. UNIRSE
    if (State.modal.match) {
      const res = await PadelData.unirseReserva(
        State.modal.match.id,
        State.modal.inputCode,
      );
      if (res.success) {
        alert("¡Te has unido!");
        State.modal.show = false;
        Actions.loadReservations();
      } else {
        alert(res.error);
      }
      return;
    }

    // B. CREAR
    const res = await PadelData.crearReserva(
      State.modal.court.id,
      State.selectedTime,
      dateStr,
      State.modal.type,
      State.modal.generatedCode,
    );

    if (res.success) {
      alert("Reserva creada");
      State.modal.show = false;
      Actions.loadReservations();
    } else {
      alert(res.error);
    }
  },
};

// --- LAYOUT PRINCIPAL ---
function Layout() {
  return {
    view: () => {
      document.documentElement.classList.toggle("dark", ThemeState.darkMode);

      return m(
        "div",
        {
          class: ThemeActions.getMainClasses(), // Usamos la función de toggleTheme.js
        },
        [
          m(Navbar),
          m(Hero),
          m("main", { class: "main-layout" }, [
            m("aside", { class: "sidebar" }, [
              m(CalendarWidget),
              m(TimeSelector),
            ]),
            m("section", { class: "content" }, [
              m(
                "div",
                {
                  style:
                    "display:flex; justify-content:space-between; align-items:center; margin-bottom:20px",
                },
                [
                  m(
                    "h2",
                    { style: "font-weight:800; margin:0" },
                    "Pistas Disponibles",
                  ),
                  m(
                    "span",
                    {
                      style:
                        "background:var(--primary); color:white; padding:5px 10px; border-radius:20px; font-weight:bold; font-size:12px",
                    },
                    `${State.selectedTime}H`,
                  ),
                ],
              ),
              State.loading
                ? m(
                    "p",
                    { style: "color:var(--text-muted)" },
                    "Cargando pistas...",
                  )
                : m(
                    "div",
                    { class: "courts-list" },
                    State.courts.map((court) => {
                      const match = State.reservations.find(
                        (r) =>
                          parseInt(r.pista_id) === parseInt(court.id) &&
                          r.hora === State.selectedTime,
                      );
                      return m(CourtCard, { court, match });
                    }),
                  ),
            ]),
          ]),
          m(BookingModal),
          m(Footer),
        ],
      );
    },
  };
}

// --- INICIALIZACIÓN ---
m.mount(document.getElementById("app"), {
  oninit: Actions.init,
  view: () => m(Layout),
});
