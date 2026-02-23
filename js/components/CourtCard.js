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
          src: court.foto_url || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea",
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
            m("div", { class: "ranking-container" },
              players.map((p) =>
                m("div", {
                  class: "player-ball",
                  title: `${p.nombre} (Nivel ${p.nivel})`,
                  style: getLevelColor(p.nivel)
                }, Math.round(p.nivel || 0)),
              ),
            ),
          ]),

          m("button", {
            class: `btn-action ${isFull ? "full" : ""} ${isUserInscribed ? "btn-danger" : ""}`,
            onclick: (e) => {
              // Si el usuario ya está inscrito, la acción es SALIR
              if (isUserInscribed) {
                if (confirm("¿Estás seguro de que quieres salirte de esta partida?")) {
                  PadelData.abandonarReserva(match.id).then(res => {
                    if (res.success) {
                      location.reload();
                    } else {
                      alert(res.error);
                    }
                  });
                }
                return;
              }

              // Si no está inscrito, la acción sigue siendo UNIRSE/RESERVAR
              if (!isFull) HomeActions.openModal(court, match);
            },

            // Quitamos el disabled para que el botón sea interactivo cuando está inscrito
            disabled: !isUserInscribed && isFull,
          },
            isUserInscribed
              ? "SALIRSE DE LA PARTIDA"
              : match ? isFull
                ? "LLENO"
                : "UNIRSE"
                : "RESERVAR",
          ),
        ]),
      ]);
    },
  };
}