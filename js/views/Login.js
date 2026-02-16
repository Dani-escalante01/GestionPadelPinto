// --- ESTADO ---
const State = {
  email: "",
  password: "",
  loading: false,
  error: null,
};

// --- ACCIONES ---
const Actions = {
  login: async (e) => {
    e.preventDefault();
    State.loading = true;
    State.error = null;

    if (!State.email || !State.password) {
      State.error = "Por favor, introduce tu email y contraseña.";
      State.loading = false;
      return;
    }

    try {
      const res = await Auth.login(State.email, State.password);
      if (res.success) {
        window.location.href = "index.html";
      } else {
        State.error = res.error || "Email o contraseña incorrectos.";
      }
    } catch (err) {
      console.error(err);
      State.error = "Error al conectar con el servidor.";
    }

    State.loading = false;
    m.redraw();
  },
};

// --- COMPONENTES ---

function LoginCard() {
  return {
    view: () =>
      m("div", { class: "login-card" }, [
        m("form", { onsubmit: Actions.login }, [
          m("div", { class: "form-header" }, [
            m("h1", "Iniciar Sesión"),
            m(
              "p",
              { class: "subtitle" },
              "Introduce tus credenciales para acceder.",
            ),
          ]),

          State.error
            ? m("div", { class: "error-msg animate-fade-up" }, [
                m("span", "⚠️"),
                m("span", State.error),
              ])
            : null,

          m("div", { class: "form-group" }, [
            m("label", { class: "label" }, "Correo Electrónico"),
            m("input", {
              type: "email",
              class: "input-field",
              placeholder: "ejemplo@padel.com",
              value: State.email,
              oninput: (e) => (State.email = e.target.value),
            }),
          ]),

          m("div", { class: "form-group" }, [
            m(
              "div",
              { style: "display:flex; justify-content:space-between;" },
              [
                m("label", { class: "label" }, "Contraseña"),
                m(
                  "a",
                  {
                    href: "#",
                    style:
                      "font-size:11px; color:var(--primary); font-weight:700; text-decoration:none;",
                  },
                  "¿Olvidaste la contraseña?",
                ),
              ],
            ),
            m("input", {
              type: "password",
              class: "input-field",
              placeholder: "••••••••",
              value: State.password,
              oninput: (e) => (State.password = e.target.value),
            }),
          ]),

          m(
            "button",
            {
              type: "submit",
              class: "btn-primary",
              disabled: State.loading,
            },
            State.loading ? "Verificando..." : "ACCEDER A MI CUENTA",
          ),

          m("div", { class: "form-footer" }, [
            m("span", "¿Aún no tienes cuenta? "),
            m(
              "a",
              { href: "registro.html", class: "link" },
              "Regístrate ahora",
            ),
          ]),
        ]),
      ]),
  };
}

// --- LAYOUT ---
function Layout() {
  return {
    view: () => {
      // IMPORTANTE: Esto activa el CSS del modo oscuro en el HTML
      document.documentElement.classList.toggle("dark", ThemeState.darkMode);

      return m("div", { class: "split-layout" }, [
        m(HeroSide),
        m("div", { class: "form-side" }, [
          m("div", { class: "navbar-floating" }, [
            m(
              "a",
              {
                href: "index.html",
                class: "nav-link-back", // Clase nueva para mejor hover/dark mode
              },
              "VOLVER AL INICIO",
            ),
            m(ThemeToggle),
          ]),
          m("a", { href: "index.html", class: "brand-mobile" }, [
            m(
              "div",
              {
                style:
                  "background:var(--primary); color:white; width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:bold;",
              },
              "P",
            ),
            m("span", { style: "margin-left:10px" }, "PADELPINTO"),
          ]),
          m(LoginCard),
        ]),
      ]);
    },
  };
}

m.mount(document.getElementById("app"), Layout);
