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
          m("h1", userName
            ? `Bienvenido, ${userName}`
            : "Juega como un Pro"
          ),
          m("button", {
            class: "btn-primary",
            onclick: () => {
              // Ejemplo: Scroll suave hacia las pistas o redirección
              const el = document.getElementById("reservas");
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }, "VER PISTAS DISPONIBLES"),
        ]),
      ]);
    },
  };
}