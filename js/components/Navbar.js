import { ThemeToggle } from "../components/toggleTheme.js";
import { Auth } from "../api.js";

export const NavbarState = {
    userMenuOpen: false,
    mobileMenuOpen: false
};

export const Navbar = {
    view: () => {
        const currentRoute = m.route.get();

        return m("nav", { class: "navbar" }, [
            m("div", { class: "container nav-container" }, [

                // BOTÓN HAMBURGUESA (Solo visible en móvil vía CSS)
                m("button", {
                    class: "mobile-menu-btn",
                    onclick: () => NavbarState.mobileMenuOpen = !NavbarState.mobileMenuOpen
                }, [
                    m("span", { class: NavbarState.mobileMenuOpen ? "icon-close" : "icon-menu" }, NavbarState.mobileMenuOpen ? "✕" : "☰")
                ]),

                // Logo
                m("div", {
                    class: "brand",
                    style: "cursor: pointer;",
                    onclick: () => {
                        m.route.set("/");
                        NavbarState.userMenuOpen = false;
                        NavbarState.mobileMenuOpen = false; 
                    }
                }, [
                    m("div", { class: "logo-icon" }, "P"),
                    m("span", "PADELPINTO")
                ]),

                // Enlaces de navegación (Ahora con clase dinámica para móvil)
                m("div", { class: `nav-links ${NavbarState.mobileMenuOpen ? "active" : ""}` }, [
                    m("a", {
                        href: "#!/",
                        class: (currentRoute === "/") ? "active" : "",
                        onclick: (e) => {
                            e.preventDefault();
                            m.route.set("/");
                            NavbarState.mobileMenuOpen = false;
                        }
                    }, "Reservar"),

                    m("a", {
                        href: "#!/partidas",
                        class: (currentRoute === "/partidas") ? "active" : "",
                        onclick: (e) => {
                            e.preventDefault();
                            m.route.set("/partidas");
                            NavbarState.mobileMenuOpen = false;
                        }
                    }, "Partidas"),

                    m("a", {
                        href: "#!/ranking",
                        class: (currentRoute === "/ranking") ? "active" : "",
                        onclick: (e) => {
                            e.preventDefault();
                            m.route.set("/ranking");
                            NavbarState.mobileMenuOpen = false;
                        }
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
                                            localStorage.removeItem('padel_user');
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