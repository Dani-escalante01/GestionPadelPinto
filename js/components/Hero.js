function Hero() {
  return {
    view: () =>
      m("section", { class: "hero" }, [
        m("img", {
          src: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop",
          class: "hero-bg",
        }),
        m("div", { class: "hero-content" }, [
          m("h1", "Juega como un Pro"),
          m("button", { class: "btn-primary" }, "VER PISTAS DISPONIBLES"),
        ]),
      ]),
  };
}
