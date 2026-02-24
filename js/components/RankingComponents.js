// Tarjeta para el Podio (Top 3)
export const PodiumCard = {
    view: (vnode) => {
      const { user, place } = vnode.attrs;
      if (!user) return null;

      let medal = "🥇";
      let cssClass = "podium-1";
      if (place === 2) {
        medal = "🥈";
        cssClass = "podium-2";
      }
      if (place === 3) {
        medal = "🥉";
        cssClass = "podium-3";
      }

      // Usar nombre o iniciales si no hay foto
      const avatarSrc =
        user.foto && user.foto.length > 10
          ? user.foto
          : `https://api.dicebear.com/7.x/initials/svg?seed=${user.nombre}`;

      return m("div", { class: `podium-card ${cssClass} animate-fade-up` }, [
        m("div", { class: "medal-icon" }, medal),
        m("img", { class: "avatar-large", src: avatarSrc, }),
        m("div", { class: "player-name" }, user.nombre),
        m("div", { class: "player-level" }, `Nivel ${parseFloat(user.nivel).toFixed(2)}`),
        m("div", { class: "player-stats" }, `${user.victorias}V - ${user.derrotas}D`),
      ]);
    },
  };


// Fila para el resto de la lista (4º en adelante)
export const RankingRow = {
    view: (vnode) => {
      const { user, pos } = vnode.attrs;

      const avatarSrc =
        user.foto && user.foto.length > 10
          ? user.foto
          : `https://api.dicebear.com/7.x/initials/svg?seed=${user.nombre}`;

      return m("div", {
        class: "rank-card animate-fade-up",
        style: `animation-delay: ${pos * 0.05}s`,
      },
        [
          m("div", { class: "rank-pos" }, pos),
          m("img", { class: "rank-avatar", src: avatarSrc, }),
          m("div", { class: "rank-info" }, [
            m("div", { class: "rank-name" }, user.nombre),
            m("div", { class: "rank-detail" }, `${user.victorias} Victorias • ${user.derrotas} Derrotas`),
          ]),
          m("div", { class: "rank-score" }, [
            m("div", { class: "score-val" }, parseFloat(user.nivel).toFixed(2)),
            m("div", { class: "score-label" }, "Nivel"),
          ]),
        ],
      );
    },
  };
