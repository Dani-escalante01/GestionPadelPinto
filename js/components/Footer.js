export function Footer() {
  return {
    view: () =>
      m("footer", { class: "footer-container" }, [
        m("div", { class: "footer-content" }, [
          m("div", { class: "footer-grid" }, [
            // Columna 1: Branding
            m("div", [
              m("div", { class: "footer-brand" }, [
                m("div", { class: "footer-logo" }, "P"),
                m("span", { class: "footer-brand-name" }, "PADELPINTO "),
              ]),
              m("p", { 
                class: "footer-desc" 
              }, "La plataforma líder para la gestión de pistas y comunidades de pádel. Reserva, juega y conecta con otros jugadores en un solo lugar.",
              ),
            ]),

            // Columna 2: Enlaces rápidos
            m("div", [
              m("h4", { class: "footer-heading" }, "Navegación"),
              m("ul", { class: "footer-nav-list" }, [
                m("li", { class: "footer-nav-item" }, "Centro de Ayuda"),
                m("li", { class: "footer-nav-item" }, "Normas del Club"),
                m("li", { class: "footer-nav-item" }, "Ranking Local"),
                m("li", { class: "footer-nav-item" }, "Torneos"),
              ]),
            ]),

            // Columna 3: Newsletter/Social
            m("div", [
              m("h4", { class: "footer-heading" }, "Mantente al día"),
              m("div", { class: "newsletter-form" }, [
                m("input[type=text]", {
                  id: "footer-newsletter-email",
                  name: "newsletter-email",
                  class: "newsletter-input",
                  placeholder: "Tu email",
                }),
                m("button", { class: "newsletter-btn" }, "OK"),
              ]), 
              m("div", { class: "social-icons" }, [
                // Instagram
                m("a", {
                  href: "https://www.instagram.com/ayuntamientopinto",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  class: "social-link",
                },
                  m("img", { src: "assets/instagram.svg", width: "20", height: "20", style: "filter: currentColor;" })
                ),
                // X (Twitter)
                m("a", {
                  href: "https://x.com/AytoPinto",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  class: "social-link",
                },
                  m("img", { src: "assets/twitter.svg", width: "18", height: "18" })
                ),
                // Facebook
                m("a", {
                  href: "https://www.facebook.com/AytoPinto/",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  class: "social-link",
                },
                  m("img", { src: "assets/facebook.svg", width: "20", height: "20" })
                ),
              ]),
            ]),
          ]),
          m("div", { class: "footer-bottom" }, [
            m(
              "span",
              "© 2026 Padel Pro International. Todos los derechos reservados.",
            ),
            m("div", { class: "footer-legal-links" }, [
              m("span", { class: "legal-link" }, "Privacidad"),
              m("span", { class: "legal-link" }, "Términos"),
              m("span", { class: "legal-link" }, "Cookies"),
            ]),
          ]),
        ]),
      ]),
  };
};
