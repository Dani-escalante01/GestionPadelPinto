// js/components/Navbar.js
function Navbar() {
    return {
        view: () => {
            // Obtenemos la página actual de la URL (ej: "ranking.html")
            const currentPage = window.location.pathname.split("/").pop();

            return m("nav", { class: "navbar" }, [
                m("div", { class: "container nav-container" }, [
                    // Logo con enlace a index
                    m("div", {
                        class: "brand",
                        style: "cursor: pointer;",
                        onclick: () => window.location.href = "index.html"
                    }, [
                        m("div", { class: "logo-icon" }, "P"),
                        m("span", "PADELPINTO")
                    ]),

                    // Enlaces de navegación con lógica de clase activa
                    m("div", { class: "nav-links" }, [
                        m("a", {
                            href: "index.html",
                            class: (currentPage === "index.html" || currentPage === "") ? "active" : ""
                        }, "Reservar"),

                        m("a", {
                            href: "partidas.html",
                            class: (currentPage === "partidas.html") ? "active" : ""
                        }, "Partidas"),

                        m("a", {
                            href: "ranking.html",
                            class: (currentPage === "ranking.html") ? "active" : ""
                        }, "Ranking")
                    ]),

                    m("div", { class: "nav-actions" }, [
                        m(ThemeToggle),
                        Auth.user
                            ? m("div", { class: "user-menu-container" }, [
                                // Botón con el nombre del usuario
                                m("button", {
                                    class: "user-name-btn",
                                    onclick: () => State.userMenuOpen = !State.userMenuOpen
                                }, [
                                    Auth.user.nombre,
                                    m("span", { style: "font-size: 10px; margin-left: 4px;" }, "▼")
                                ]),
                                // Desplegable
                                State.userMenuOpen ? m("div", { class: "user-dropdown" }, [
                                    m("button", {
                                        class: "dropdown-item",
                                        onclick: () => {
                                            if (typeof Auth.logout === 'function') {
                                                Auth.logout();
                                            } else {
                                                Auth.user = null;
                                                localStorage.removeItem('user');
                                            }
                                            State.userMenuOpen = false;
                                            m.redraw();
                                        }
                                    }, "Cerrar sesión")
                                ]) : null
                            ])
                            : m("button", {
                                class: "btn-primary",
                                onclick: () => window.location.href = "login.html"
                            }, "ENTRAR")
                    ])
                ])
            ]);
        }
    };
}