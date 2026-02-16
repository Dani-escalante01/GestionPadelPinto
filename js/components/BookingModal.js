// js/components/BookingModal.js
function BookingModal() {
  return {
    view: () => {
      // Cambiado State -> HomeState
      if (!HomeState.modal.show) return null;

      const { type } = HomeState.modal;
      const isJoinMode = !!HomeState.modal.match;

      return m("div", { class: "modal-overlay" }, [
        m("div", { class: "modal-content" }, [
          m("div", { class: "modal-header" }, [
            m(
              "h3",
              { style: "margin:0" },
              isJoinMode ? "Unirse a Partida" : "Nueva Reserva",
            ),
            m(
              "button",
              { class: "close-btn", onclick: () => (HomeState.modal.show = false) },
              "✕",
            ),
          ]),
          m("div", { class: "modal-body" }, [
            // CASO 1: CREAR RESERVA
            !isJoinMode
              ? [
                m(
                  "div",
                  { style: "margin-bottom:20px; display:flex; gap:10px" },
                  [
                    m(
                      "button",
                      {
                        class: `time-btn ${HomeState.modal.type === "public" ? "selected" : ""}`,
                        style: "flex:1",
                        onclick: () => (HomeState.modal.type = "public"),
                      },
                      "Pública (Ranking)",
                    ),
                    m(
                      "button",
                      {
                        class: `time-btn ${HomeState.modal.type === "private" ? "selected" : ""}`,
                        style: "flex:1",
                        onclick: () => (HomeState.modal.type = "private"),
                      },
                      "Privada (Código)",
                    ),
                  ],
                ),

                HomeState.modal.type === "private"
                  ? m(
                    "div",
                    {
                      style:
                        "text-align:center; background:#f0f9ff; padding:15px; border-radius:15px; margin-bottom:20px; border:1px solid #bae6fd;",
                    },
                    [
                      m(
                        "p",
                        {
                          style:
                            "margin:0 0 5px 0; font-size:10px; font-weight:800; color:#0369a1",
                        },
                        "TU CÓDIGO DE ACCESO",
                      ),
                      m(
                        "div",
                        {
                          style:
                            "font-size:24px; font-weight:900; letter-spacing:3px; color:#0f172a;",
                        },
                        HomeState.modal.generatedCode,
                      ),
                    ],
                  )
                  : m(
                    "p",
                    {
                      style:
                        "font-size:12px; color:var(--text-muted); margin-bottom:20px",
                    },
                    "La partida será visible para todos. Se mostrará tu nivel para equilibrar el juego.",
                  ),
              ]
              : // CASO 2: UNIRSE
              [
                HomeState.modal.match.tipo === "private"
                  ? m("div", [
                    m(
                      "p",
                      {
                        style:
                          "font-size:12px; margin-bottom:10px; font-weight:700",
                      },
                      "Introduce el código de invitación:",
                    ),
                    m("input", {
                      id: "input-match-code",
                      name: "match-code",
                      class: "input-code",
                      placeholder: "CÓDIGO",
                      oninput: (e) =>
                        (HomeState.modal.inputCode = e.target.value),
                    }),
                  ])
                  : m(
                    "p",
                    { style: "margin-bottom:20px" },
                    "¿Confirmas unirte a esta partida pública?",
                  ),
              ],

            m("div", { style: "display:flex; gap:10px" }, [
              m(
                "button",
                {
                  class: "btn-action full",
                  style: "flex:1",
                  onclick: () => (HomeState.modal.show = false),
                },
                "CANCELAR",
              ),
              m(
                "button",
                {
                  class: "btn-primary",
                  style: "flex:1; border-radius:12px",
                  // Cambiado Actions -> HomeActions
                  onclick: HomeActions.submitBooking,
                },
                "CONFIRMAR",
              ),
            ]),
          ]),
        ]),
      ]);
    },
  };
}