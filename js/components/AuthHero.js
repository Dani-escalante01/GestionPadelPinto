function HeroSide() {
  return {
    view: () =>
      m("div", { class: "hero-side" }, [
        m("img", {
          src: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070",
          class: "hero-bg",
        }),
        m("div", { class: "hero-overlay" }),
        m("div", { class: "hero-content" }, [
          m("div", {
            style: "background: var(--primary); width: 50px; height: 50px; display:flex; align-items:center; justify-content:center; border-radius:12px; font-weight:900; font-size:24px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); color:white;",
          }, "P",
          ),
          m("h2", { class: "hero-title" }, "Bienvenido de nuevo."),
          m("p", {
            style: "font-size: 1.2rem; opacity: 0.8; font-weight:500; max-width: 400px;",
          },
            "Gestiona tus reservas y conecta con tu comunidad de pádel.",
          ),
        ]),
      ]),
  };
}
