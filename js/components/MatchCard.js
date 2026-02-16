// Tarjeta de Partida Reutilizable
function MatchCard() {
  return {
    view: (vnode) => {
      const match = vnode.attrs.match;
      const isMyMatch = vnode.attrs.isMyMatch;

      return m("div", { class: "match-card animate-fade-up" }, [
        // Columna Hora
        m("div", { class: "match-time" }, [
          m("div", { class: "time-big" }, match.hora),
          m(
            "div",
            { class: "court-name" },
            match.pista_nombre || "Pista " + match.pista_id,
          ),
        ]),

        // Columna Info
        m("div", { class: "match-info" }, [
          m(
            "span",
            {
              class: `match-type ${match.tipo === "private" ? "type-private" : "type-public"}`,
            },
            match.tipo === "private" ? "PRIVADA" : "PÚBLICA",
          ),

          match.tipo === "private" && isMyMatch
            ? m(
                "span",
                {
                  style:
                    "font-size:10px; margin-left:10px; font-weight:bold; color:#d97706",
                },
                `CÓDIGO: ${match.codigo_acceso}`,
              )
            : null,

          m("div", { class: "players-row" }, [
            // Renderizar bolas de jugadores
            match.jugadores.map((p) =>
              m(
                "div",
                {
                  class: "player-avatar",
                  title: p.nombre,
                  style:
                    p.usuario_id == Auth.user.id
                      ? "border-color:var(--primary)"
                      : "",
                },
                Math.round(p.nivel),
              ),
            ),
            // Huecos libres
            Array.from({ length: 4 - match.jugadores.length }).map(() =>
              m(
                "div",
                {
                  class: "player-avatar",
                  style:
                    "border: 2px dashed var(--border); color: transparent;",
                },
                "",
              ),
            ),
            // Usamos la clase court-status-text para mantener los mismos colores claros/oscuros que en el index
            m(
              "span",
              { class: "court-status-text" },
              `${match.jugadores.length}/4 Jugadores`,
            ),
          ]),
        ]),

        // Columna Acción
        m("div", { class: "match-action" }, [
          isMyMatch
            ? m("button", { class: "btn btn-view" }, "INSCRITO")
            : m(
                "button",
                {
                  class: "btn btn-join",
                  onclick: () => Actions.joinMatch(match),
                },
                "UNIRSE",
              ),
        ]),
      ]);
    },
  };
}
