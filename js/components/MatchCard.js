function MatchCard() {
  return {
    view: (vnode) => {
      const match = vnode.attrs.match;
      const isMyMatch = vnode.attrs.isMyMatch;

      return m("div", { class: "match-card animate-fade-up" }, [
        // Columna Hora
        m("div", { class: "match-time" }, [
          m("div", { class: "time-big" }, match.hora),
          m("div", { class: "court-name" }, match.pista_nombre || "Pista " + match.pista_id,),
        ]),

        // Columna Info
        m("div", { class: "match-info" }, [
          m("span", {
            class: `match-type ${match.tipo === "private" ? "type-private" : "type-public"}`,
          }, match.tipo === "private" ? "PRIVADA" : "PÚBLICA",
          ),
          match.tipo === "private" && isMyMatch
            ? m("span", { style: "font-size:10px; margin-left:10px; font-weight:bold; color:#d97706" }, `CÓDIGO: ${match.codigo_acceso}`)
            : null,

          m("div", { class: "players-row" }, [
            // Renderizar bolas de jugadores
            match.jugadores.map((p) =>
              m("div", {
                class: "player-avatar",
                title: `${p.nombre} (Nivel ${p.nivel})`,
                style: getLevelColor(p.nivel) + (p.usuario_id == Auth.user.id ? "box-shadow: 0 0 0 3px var(--primary);" : ""),
              }, Math.round(p.nivel)),
            ),
            // Huecos libres
            Array.from({ length: 4 - match.jugadores.length }).map(() =>
              m("div", {
                class: "player-avatar",
                style: "border: 2px dashed var(--border); color: transparent;"
              }, ""),
            ),
            m("span", {
              class: "court-status-text"
            }, `${match.jugadores.length}/4 Jugadores`,
            ),
          ]),
        ]),

        // Columna Acción
        m("div", { class: "match-action" }, [
          isMyMatch
            ? m("button", {
              class: "btn btn-danger",
              style: "background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 8px; font-weight: 700; cursor: pointer;",
              onclick: () => PartidasActions.leaveMatch(match)
            }, "CANCELAR")
            : m("button", {
              class: "btn btn-join",
              onclick: () => PartidasActions.joinMatch ? PartidasActions.joinMatch(match) : Actions.joinMatch(match)
            }, "UNIRSE"),
        ]),
      ]);
    },
  };
}