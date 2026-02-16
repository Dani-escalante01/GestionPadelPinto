// --- ESTADO ---
const State = {
  loading: true,
  activeTab: "mine", // 'mine' (Mías) | 'open' (Abiertas)
  currentDate: new Date(),
  myMatches: [],
  openMatches: [],
};

// --- ACCIONES ---
const Actions = {
  init: async () => {
    Auth.init();
    if (!Auth.user) {
      window.location.href = "login.html";
      return;
    }
    await Actions.loadData();
  },

  loadData: async () => {
    State.loading = true;
    const dateStr = State.currentDate.toLocaleDateString("es-ES");

    // 1. Pedir todas las reservas del día
    const todas = await PadelData.getReservas(dateStr);

    // 2. Filtrar
    const userId = Auth.user.id;

    // A. Mis Partidas: Donde yo estoy en la lista de jugadores
    State.myMatches = todas.filter((m) =>
      m.jugadores.some((p) => parseInt(p.usuario_id) === parseInt(userId)),
    );

    // B. Partidas Abiertas: Públicas, NO estoy yo, y NO están llenas
    State.openMatches = todas.filter(
      (m) =>
        m.tipo === "public" &&
        m.estado !== "cerrada" &&
        m.jugadores.length < 4 &&
        !m.jugadores.some((p) => parseInt(p.usuario_id) === parseInt(userId)),
    );

    State.loading = false;
    m.redraw();
  },

  joinMatch: async (match) => {
    if (confirm("¿Quieres unirte a esta partida?")) {
      const res = await PadelData.unirseReserva(match.id);
      if (res.success) {
        alert("¡Te has unido!");
        Actions.loadData(); // Recargar para moverla de lista
      } else {
        alert(res.error);
      }
    }
  },

  changeDate: (offset) => {
    const newDate = new Date(State.currentDate);
    newDate.setDate(newDate.getDate() + offset);
    State.currentDate = newDate;
    Actions.loadData();
  },
};

// --- VISTA PRINCIPAL ---
function PartidasView() {
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
          m("div", { class: "page-content" }, [
            // Encabezado con selector de fecha simple
            m("div", { class: "page-header" }, [
              m(
                "div",
                {
                  style:
                    "display:flex; justify-content:space-between; align-items:center",
                },
                [
                  m("div", [
                    m("h1", { class: "page-title" }, "Partidas"),
                    m(
                      "p",
                      { class: "page-date" },
                      State.currentDate.toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }),
                    ),
                  ]),
                  m("div", { style: "display:flex; gap:10px" }, [
                    m(
                      "button",
                      {
                        class: "date-nav-btn",
                        onclick: () => Actions.changeDate(-1),
                      },
                      "← Ayer",
                    ),
                    m(
                      "button",
                      {
                        class: "date-nav-btn",
                        onclick: () => Actions.changeDate(1),
                      },
                      "Mañana →",
                    ),
                  ]),
                ],
              ),
            ]),

            // Tabs
            m("div", { class: "tabs" }, [
              m(
                "button",
                {
                  class: `tab-btn ${State.activeTab === "mine" ? "active" : ""}`,
                  onclick: () => (State.activeTab = "mine"),
                },
                `Mis Partidas (${State.myMatches.length})`,
              ),

              m(
                "button",
                {
                  class: `tab-btn ${State.activeTab === "open" ? "active" : ""}`,
                  onclick: () => (State.activeTab = "open"),
                },
                `Abiertas para hoy (${State.openMatches.length})`,
              ),
            ]),

            // Contenido Lista
            State.loading
              ? m(
                  "div",
                  {
                    style:
                      "text-align:center; padding:40px; color:var(--text-muted)",
                  },
                  "Cargando partidos...",
                )
              : State.activeTab === "mine"
                ? State.myMatches.length === 0
                  ? m("div", { class: "empty-state" }, [
                      m("h3", "No tienes partidas hoy"),
                      m(
                        "p",
                        "Reserva una pista o únete a una partida abierta.",
                      ),
                    ])
                  : m(
                      "div",
                      { class: "match-list" },
                      State.myMatches.map((match) =>
                        m(MatchCard, { match, isMyMatch: true }),
                      ),
                    )
                : State.openMatches.length === 0
                  ? m("div", { class: "empty-state" }, [
                      m("h3", "No hay partidas abiertas"),
                      m("p", "Sé el primero en crear una partida pública."),
                    ])
                  : m(
                      "div",
                      { class: "match-list" },
                      State.openMatches.map((match) =>
                        m(MatchCard, { match, isMyMatch: false }),
                      ),
                    ),
          ]),
        ],
      );
    },
  };
}

// --- INIT ---
m.mount(document.getElementById("app"), {
  oninit: Actions.init,
  view: () => m(PartidasView),
});
