// --- ESTADO ---
const PartidasState = {
  loading: true,
  activeTab: "mine", // 'mine' (Mías) | 'open' (Abiertas)
  currentDate: new Date(),
  myMatches: [],
  openMatches: [],
};

// --- ACCIONES ---
const PartidasActions = {
  init: async () => {
    Auth.init();
    if (!Auth.user) {
      m.route.set("/login");
      return;
    }
    await PartidasActions.loadData();
  },

  loadData: async () => {
    PartidasState.loading = true;
    const dateStr = PartidasState.currentDate.toLocaleDateString("es-ES");

    try {
      const todas = await PadelData.getReservas(dateStr);
      const userId = Auth.user.id;

      PartidasState.myMatches = todas.filter((m) =>
        m.jugadores.some((p) => parseInt(p.usuario_id) === parseInt(userId)),
      );

      PartidasState.openMatches = todas.filter(
        (m) =>
          m.tipo === "public" &&
          m.estado !== "cerrada" &&
          m.jugadores.length < 4 &&
          !m.jugadores.some((p) => parseInt(p.usuario_id) === parseInt(userId)),
      );
    } catch (e) {
      console.error("Error cargando partidas:", e);
    } finally {
      PartidasState.loading = false;
      m.redraw();
    }
  },

  joinMatch: async (match) => {
    if (confirm("¿Quieres unirte a esta partida?")) {
      const res = await PadelData.unirseReserva(match.id);
      if (res.success) {
        alert("¡Te has unido!");
        PartidasActions.loadData(); // Recargar para moverla de lista
      } else {
        alert(res.error);
      }
    }
  },

  changeDate: (offset) => {
    const newDate = new Date(PartidasState.currentDate);
    newDate.setDate(newDate.getDate() + offset);
    PartidasState.currentDate = newDate;
    PartidasActions.loadData();
  },
};

// --- VISTA PRINCIPAL ---
const PartidasView = {
  // Importante: Ejecutar init al cargar el componente
  oninit: PartidasActions.init,
  
  view: () => {
    // Corregido: ThemePartidasState -> ThemeState
    document.documentElement.classList.toggle("dark", ThemeState.darkMode);

    return m(
      "div",
      {
        // Corregido: ThemePartidasActions -> ThemeActions
        class: ThemeActions.getMainClasses(), 
      },
      [
        m(Navbar),
        m("div", { class: "page-content container", style: "padding-top: 20px;" }, [
          // Encabezado
          m("div", { class: "page-header", style: "margin-bottom: 30px;" }, [
            m(
              "div",
              {
                style: "display:flex; justify-content:space-between; align-items:center",
              },
              [
                m("div", [
                  m("h1", { class: "page-title", style: "font-size: 24px; font-weight: 800;" }, "Partidas"),
                  m(
                    "p",
                    { class: "page-date", style: "color: var(--text-muted); text-transform: capitalize;" },
                    PartidasState.currentDate.toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    }),
                  ),
                ]),
                m("div", { style: "display:flex; gap:10px" }, [
                  m(
                    "button",
                    {
                      class: "date-nav-btn",
                      onclick: () => PartidasActions.changeDate(-1),
                    },
                    "←"
                  ),
                  m(
                    "button",
                    {
                      class: "date-nav-btn",
                      onclick: () => PartidasActions.changeDate(1),
                    },
                    "→"
                  ),
                ]),
              ],
            ),
          ]),

          // Tabs
          m("div", { class: "tabs", style: "display: flex; gap: 20px; border-bottom: 1px solid var(--border); margin-bottom: 20px;" }, [
            m(
              "button",
              {
                class: `tab-btn ${PartidasState.activeTab === "mine" ? "active" : ""}`,
                style: "padding: 10px 0; border: none; background: none; cursor: pointer; font-weight: 700; color: " + (PartidasState.activeTab === "mine" ? "var(--primary)" : "var(--text-muted)"),
                onclick: () => (PartidasState.activeTab = "mine"),
              },
              `Mis Partidas (${PartidasState.myMatches.length})`,
            ),

            m(
              "button",
              {
                class: `tab-btn ${PartidasState.activeTab === "open" ? "active" : ""}`,
                style: "padding: 10px 0; border: none; background: none; cursor: pointer; font-weight: 700; color: " + (PartidasState.activeTab === "open" ? "var(--primary)" : "var(--text-muted)"),
                onclick: () => (PartidasState.activeTab = "open"),
              },
              `Abiertas (${PartidasState.openMatches.length})`,
            ),
          ]),

          // Contenido Lista
          PartidasState.loading
            ? m("div", { style: "text-align:center; padding:40px; color:var(--text-muted)" }, "Cargando partidos...")
            : PartidasState.activeTab === "mine"
              ? PartidasState.myMatches.length === 0
                ? m("div", { class: "empty-state", style: "text-align: center; padding: 40px;" }, [
                    m("h3", "No tienes partidas hoy"),
                    m("p", { style: "color: var(--text-muted)" }, "Reserva una pista o únete a una partida abierta."),
                  ])
                : m(
                    "div",
                    { class: "match-list", style: "display: flex; flex-direction: column; gap: 15px;" },
                    PartidasState.myMatches.map((match) =>
                      m(MatchCard, { match, isMyMatch: true }),
                    ),
                  )
              : PartidasState.openMatches.length === 0
                ? m("div", { class: "empty-state", style: "text-align: center; padding: 40px;" }, [
                    m("h3", "No hay partidas abiertas"),
                    m("p", { style: "color: var(--text-muted)" }, "Sé el primero en crear una partida pública."),
                  ])
                : m(
                    "div",
                    { class: "match-list", style: "display: flex; flex-direction: column; gap: 15px;" },
                    PartidasState.openMatches.map((match) =>
                      m(MatchCard, { match, isMyMatch: false }),
                    ),
                  ),
        ]),
      ],
    );
  },
};
