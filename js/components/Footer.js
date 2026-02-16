function Footer() {
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
              m(
                "p",
                { class: "footer-desc" },
                "La plataforma líder para la gestión de pistas y comunidades de pádel. Reserva, juega y conecta con otros jugadores en un solo lugar.",
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
                m(
                  "a",
                  {
                    href: "https://www.instagram.com/ayuntamientopinto",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "social-link",
                  },
                  [
                    m(
                      "svg",
                      {
                        viewBox: "0 0 24 24",
                        width: "20",
                        height: "20",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                      },
                      [
                        m("rect", {
                          x: "2",
                          y: "2",
                          width: "20",
                          height: "20",
                          rx: "5",
                          ry: "5",
                        }),
                        m("path", {
                          d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
                        }),
                        m("line", {
                          x1: "17.5",
                          y1: "6.5",
                          x2: "17.51",
                          y2: "6.5",
                        }),
                      ],
                    ),
                  ],
                ),
                m(
                  "a",
                  {
                    href: "https://x.com/AytoPinto",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "social-link",
                  },
                  [
                    m(
                      "svg",
                      {
                        viewBox: "0 0 24 24",
                        width: "18",
                        height: "18",
                        fill: "currentColor",
                      },
                      [
                        m("path", {
                          d: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z",
                        }),
                      ],
                    ),
                  ],
                ),
                m(
                  "a",
                  {
                    href: "https://www.facebook.com/AytoPinto/",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "social-link",
                  },
                  [
                    m(
                      "svg",
                      {
                        viewBox: "0 0 24 24",
                        width: "20",
                        height: "20",
                        fill: "currentColor",
                      },
                      [
                        m("path", {
                          d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                        }),
                      ],
                    ),
                  ],
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
}
