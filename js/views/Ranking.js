// --- ESTADO ---
const RankingState = {
  loading: true,
  ranking: [],
};

// --- ACCIONES ---
const RankingActions = {
  init: async () => {
    Auth.init();
    await RankingActions.loadData();
  },

  loadData: async () => {
    RankingState.loading = true;
    try {
      const users = await PadelData.getRanking();
      RankingState.ranking = Array.isArray(users) ? users : [];
    } catch (e) {
      console.error("Error cargando ranking:", e);
      RankingState.ranking = [];
    } finally {
      RankingState.loading = false;
      m.redraw(); // Forzamos el redibujado para quitar el mensaje de carga
    }
  },
};

// --- VISTA PRINCIPAL ---
const RankingView = {
  // CLAVE: Ejecuta la carga de datos al iniciar el componente
  oninit: RankingActions.init,

  view: () => {
    // Aplicamos el tema oscuro si está activo
    if (typeof ThemeState !== 'undefined') {
      document.documentElement.classList.toggle("dark", ThemeState.darkMode);
    }

    const safeRanking = Array.isArray(RankingState.ranking) ? RankingState.ranking : [];
    const top3 = safeRanking.slice(0, 3);
    const rest = safeRanking.slice(3);

    return m("div", { class: typeof ThemeActions !== 'undefined' ? ThemeActions.getMainClasses() : "" }, [
      m(Navbar),
      m("div", { class: "container", style: "padding-top: 40px;" }, [
        RankingState.loading
          ? m(
            "div",
            { style: "text-align:center; padding:100px; color:var(--text-muted);" },
            "Calculando posiciones...",
          )
          : [
            // SECCIÓN PODIO
            m("div", { class: "podium-section" }, [
              top3[1] ? m(PodiumCard, { user: top3[1], place: 2 }) : null,
              top3[0] ? m(PodiumCard, { user: top3[0], place: 1 }) : null,
              top3[2] ? m(PodiumCard, { user: top3[2], place: 3 }) : null,
            ]),

            // SECCIÓN LISTA
            m("div", { class: "ranking-list" }, [
              rest.length > 0
                ? [
                  m(
                    "h3",
                    {
                      style:
                        "margin-bottom:20px; opacity:0.6; font-size:14px; text-transform:uppercase; letter-spacing:1px; color: var(--text-muted)",
                    },
                    "Resto de Jugadores",
                  ),
                  rest.map((user, idx) =>
                    m(RankingRow, { user, pos: idx + 4 }),
                  ),
                ]
                : safeRanking.length > 0
                  ? m("div", { style: "text-align:center; color:var(--text-muted); padding:20px" }, "No hay más jugadores clasificados.")
                  : m("div", { style: "text-align:center; color:var(--text-muted); padding:20px" }, "No se encontraron datos de ranking.")
            ]),
          ],
      ]),
    ]);
  },
};