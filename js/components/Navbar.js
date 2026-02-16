// js/components/Navbar.js
const NavbarState = {
    userMenuOpen: false
};

function Navbar() {
    return {
        view: () => {
            const currentRoute = m.route.get();

            return m("nav", { class: "navbar" }, [
                m("div", { class: "container nav-container" }, [
                    // Logo
                    m("div", {
                        class: "brand",
                        style: "cursor: pointer;",
                        onclick: () => { m.route.set("/"); NavbarState.userMenuOpen = false; }
                    }, [
                        m("div", { class: "logo-icon" }, "P"),
                        m("span", "PADELPINTO")
                    ]),

                    // Enlaces de navegación con m.route.set
                    m("div", { class: "nav-links" }, [
                        m("a", {
                            href: "#!/",
                            class: (currentRoute === "/") ? "active" : "",
                            onclick: (e) => { e.preventDefault(); m.route.set("/"); }
                        }, "Reservar"),

                        m("a", {
                            href: "#!/partidas",
                            class: (currentRoute === "/partidas") ? "active" : "",
                            onclick: (e) => { e.preventDefault(); m.route.set("/partidas"); }
                        }, "Partidas"),

                        m("a", {
                            href: "#!/ranking",
                            class: (currentRoute === "/ranking") ? "active" : "",
                            onclick: (e) => { e.preventDefault(); m.route.set("/ranking"); }
                        }, "Ranking")
                    ]),

                    m("div", { class: "nav-actions" }, [
                        m(ThemeToggle),
                        Auth.user
                            ? m("div", { class: "user-menu-container" }, [
                                m("button", {
                                    class: "user-name-btn",
                                    onclick: () => NavbarState.userMenuOpen = !NavbarState.userMenuOpen
                                }, [
                                    Auth.user.nombre,
                                    m("span", { style: "font-size: 10px; margin-left: 4px;" }, "▼")
                                ]),
                                NavbarState.userMenuOpen ? m("div", { class: "user-dropdown" }, [
                                    m("button", {
                                        class: "dropdown-item",
                                        onclick: () => {
                                            if (typeof Auth.logout === 'function') {
                                                Auth.logout();
                                            } else {
                                                Auth.user = null;
                                                localStorage.removeItem('user');
                                            }
                                            NavbarState.userMenuOpen = false;
                                            m.route.set("/");
                                        }
                                    }, "Cerrar sesión")
                                ]) : null
                            ])
                            : m("button", {
                                class: "btn-primary",
                                onclick: () => m.route.set("/login")
                            }, "ENTRAR")
                    ])
                ])
            ]);
        }
    };
}