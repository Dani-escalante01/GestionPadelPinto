// --- ESTADO ---
const State = {
  loading: true,
  ranking: [], // Inicializado como array vacío para seguridad
};

// --- ACCIONES ---
const Actions = {
  init: async () => {
    Auth.init();
    await Actions.loadData();
  },

  loadData: async () => {
    State.loading = true;
    try {
      // Llamada segura a la API
      const users = await PadelData.getRanking();
      // Aseguramos que sea un array, si falla la API usamos []
      State.ranking = Array.isArray(users) ? users : [];
    } catch (e) {
      console.error("Error cargando ranking:", e);
      State.ranking = [];
    } finally {
      State.loading = false;
      m.redraw();
    }
  },
};

// --- VISTA PRINCIPAL ---
function RankingView() {
  return {
    view: () => {
      // PROTECCIÓN: Aseguramos que State.ranking sea un array antes de usar slice
      const safeRanking = Array.isArray(State.ranking) ? State.ranking : [];
      const top3 = safeRanking.slice(0, 3);
      const rest = safeRanking.slice(3);

      return m("div", [
        m(Navbar),
        m("div", { class: "container" }, [
          State.loading
            ? m(
                "div",
                { style: "text-align:center; padding:50px; color:#94a3b8;" },
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
                              "margin-bottom:20px; opacity:0.6; font-size:14px; text-transform:uppercase; letter-spacing:1px;",
                          },
                          "Resto de Jugadores",
                        ),
                        rest.map((user, idx) =>
                          m(RankingRow, { user, pos: idx + 4 }),
                        ),
                      ]
                    : m(
                        "div",
                        {
                          style:
                            "text-align:center; color:#94a3b8; padding:20px",
                        },
                        "No hay más jugadores clasificados.",
                      ),
                ]),
              ],
        ]),
      ]);
    },
  };
}

// --- INIT ---
m.mount(document.getElementById("app"), {
  oninit: Actions.init,
  view: () => m(RankingView),
});
