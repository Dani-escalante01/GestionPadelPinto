function CourtCard() {
  return {
    view: (vnode) => {
      const { court, match } = vnode.attrs;
      const players = match ? match.jugadores : [];
      const isFull = players.length >= 4;
      const isPrivate = match && match.tipo === "private";
      const isUserInscribed = !!(
        match &&
        Auth.user &&
        players.some((p) => String(p.usuario_id) === String(Auth.user.id))
      );

      return m("div", { class: "court-card" }, [
        m("img", {
          class: "court-img",
          src:
            court.foto_url ||
            "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea",
        }),
        m("div", { class: "court-info" }, [
          m("div", [
            m("div", { class: "court-header" }, [
              m("h4", { class: "court-title" }, court.nombre),
              isPrivate
                ? m("span", { class: "badge private" }, "PRIVADA")
                : null,
            ]),
            m("div", { class: "court-status-text" }, [
              m("span", isFull ? "Completo" : "Disponible - 90 minutos"),
              m("span", `${players.length}/4 Jugadores`),
            ]),
            m("div", { class: "progress-container" }, [
              m("div", {
                class: "progress-bar",
                style: `width: ${(players.length / 4) * 100}%`,
              }),
            ]),
            m(
              "div",
              { class: "ranking-container" },
              players.map((p) =>
                m(
                  "div",
                  { class: "player-ball", title: p.nombre },
                  Math.round(p.nivel || 0),
                ),
              ),
            ),
          ]),
          m(
            "button",
            {
              class: `btn-action ${isFull ? "full" : ""} ${isUserInscribed ? "inscribed" : ""}`,
              onclick: (e) => {
                if (isUserInscribed) return;
                if (!isFull) Actions.openModal(court, match);
              },
              disabled: isUserInscribed,
            },
            isUserInscribed
              ? "INSCRITO"
              : match
                ? isFull
                  ? "LLENO"
                  : "UNIRSE"
                : "RESERVAR",
          ),
        ]),
      ]);
    },
  };
}
