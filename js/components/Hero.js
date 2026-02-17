function Hero() {
  return {
    view: () => {
      const userName = Auth.user ? Auth.user.nombre : null;// Verificamos si el usuario existe en el objeto Auth

      return m("section", { class: "hero" }, [
        m("img", {
          src: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop",
          class: "hero-bg",
        }),
        m("div", { class: "hero-content" }, [
          m("h1", "Juega con nosotros al Padel"),
          m("p", "La mejor experiencia para reservar tu pista de padel"),
          m("button", { class: "btn-primary" }, "VER PISTAS DISPONIBLES"),
        ]),
      ]);
    },
  };
}