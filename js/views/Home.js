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
const HomeState = {
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
const HomeActions = {
  init: async () => {
    Auth.init();
    const pistas = await PadelData.getPistas();
    HomeState.courts = pistas.items || pistas;
    await HomeActions.loadReservations();
    HomeState.loading = false;
    m.redraw();
  },

  loadReservations: async () => {
    const dateStr = HomeState.selectedDate.toLocaleDateString("es-ES");
    HomeState.reservations = await PadelData.getReservas(dateStr);
    m.redraw();
  },

  selectDate: (date) => {
    HomeState.selectedDate = date;
    HomeActions.loadReservations();
  },

  openModal: (court, match = null) => {
    if (!Auth.user) {
      alert("Inicia sesión primero");
      m.route.set("/login");
      return;
    }
    HomeState.modal.show = true;
    HomeState.modal.court = court;
    HomeState.modal.match = match; // Si hay match, es modo "Unirse"

    if (!match) {
      // Modo Crear
      HomeState.modal.type = "public";
      HomeState.modal.generatedCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
    } else {
      HomeState.modal.inputCode = ""; // Limpiar input para unirse
    }
  },

  submitBooking: async () => {
    const dateStr = HomeState.selectedDate.toLocaleDateString("es-ES");

    // A. UNIRSE
    if (HomeState.modal.match) {
      const res = await PadelData.unirseReserva(
        HomeState.modal.match.id,
        HomeState.modal.inputCode,
      );
      if (res.success) {
        alert("¡Te has unido!");
        HomeState.modal.show = false;
        HomeActions.loadReservations();
      } else {
        alert(res.error);
      }
      return;
    }

    // B. CREAR
    const res = await PadelData.crearReserva(
      HomeState.modal.court.id,
      HomeState.selectedTime,
      dateStr,
      HomeState.modal.type,
      HomeState.modal.generatedCode,
    );

    if (res.success) {
      alert("Reserva creada");
      HomeState.modal.show = false;
      HomeActions.loadReservations();
    } else {
      alert(res.error);
    }
  },
};

// --- LAYOUT PRINCIPAL ---
const Home = { 
  oninit: HomeActions.init, 
  view: () => {
    document.documentElement.classList.toggle("dark", ThemeState.darkMode);

    return m(
      "div",
      {
        class: ThemeActions.getMainClasses(),
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
                style: "display:flex; justify-content:space-between; align-items:center; margin-bottom:20px",
              },
              [
                m("h2", { style: "font-weight:800; margin:0" }, "Pistas Disponibles"),
                m(
                  "span",
                  {
                    style: "background:var(--primary); color:white; padding:5px 10px; border-radius:20px; font-weight:bold; font-size:12px",
                  },
                  `${HomeState.selectedTime}H`,
                ),
              ],
            ),
            HomeState.loading
              ? m("p", { style: "color:var(--text-muted)" }, "Cargando pistas...")
              : m(
                "div",
                { class: "courts-list" },
                HomeState.courts.map((court) => {
                  const match = HomeState.reservations.find(
                    (r) =>
                      parseInt(r.pista_id) === parseInt(court.id) &&
                      r.hora === HomeState.selectedTime,
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