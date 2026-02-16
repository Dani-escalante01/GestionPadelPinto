// js/views/Login.js

// --- ESTADO ---
const LoginState = {
  email: "",
  password: "",
  loading: false,
  error: null,
};

// --- ACCIONES ---
const LoginActions = {
  login: async (e) => {
    e.preventDefault();
    LoginState.loading = true;
    LoginState.error = null;

    if (!LoginState.email || !LoginState.password) {
      LoginState.error = "Por favor, introduce tu email y contraseña.";
      LoginState.loading = false;
      return;
    }

    try {
      const res = await Auth.login(LoginState.email, LoginState.password);
      if (res.success) {
        // CORRECCIÓN: En el app.js la ruta raíz es "/"
        m.route.set("/");
      } else {
        LoginState.error = res.error || "Email o contraseña incorrectos.";
      }
    } catch (err) {
      console.error(err);
      LoginState.error = "Error al conectar con el servidor.";
    }

    LoginState.loading = false;
    m.redraw();
  },
};

// --- COMPONENTES ---

function LoginCard() {
  return {
    view: () =>
      m("div", { class: "login-card" }, [
        m("form", { onsubmit: LoginActions.login }, [
          m("div", { class: "form-header" }, [
            m("h1", "Iniciar Sesión"),
            m(
              "p",
              { class: "subtitle" },
              "Introduce tus credenciales para acceder.",
            ),
          ]),

          LoginState.error
            ? m("div", { class: "error-msg animate-fade-up" }, [
              m("span", "⚠️"),
              m("span", LoginState.error),
            ])
            : null,

          m("div", { class: "form-group" }, [
            m("label", { class: "label" }, "Correo Electrónico"),
            m("input", {
              type: "email",
              class: "input-field",
              placeholder: "ejemplo@padel.com",
              value: LoginState.email,
              oninput: (e) => (LoginState.email = e.target.value),
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
              value: LoginState.password,
              oninput: (e) => (LoginState.password = e.target.value),
            }),
          ]),

          m(
            "button",
            {
              type: "submit",
              class: "btn-primary",
              disabled: LoginState.loading,
            },
            LoginState.loading ? "Verificando..." : "ACCEDER A MI CUENTA",
          ),

          m("div", { class: "form-footer" }, [
            m("span", "¿Aún no tienes cuenta? "),
            m(
              "a",
              {
                href: "#!/registro",
                class: "link",
                onclick: (e) => { e.preventDefault(); m.route.set("/registro"); }
              },
              "Regístrate ahora",
            ),
          ]),
        ]),
      ]),
  };
}

// --- LAYOUT ---
function Login() {
  return {
    view: () => {
      // CORRECCIÓN: ThemeLoginState -> ThemeState
      document.documentElement.classList.toggle("dark", ThemeState.darkMode);

      return m("div", { class: "split-layout" }, [
        m(HeroSide),
        m("div", { class: "form-side" }, [
          m("div", { class: "navbar-floating" }, [
            m(
              "a",
              {
                href: "#!/",
                class: "nav-link-back",
                onclick: (e) => { e.preventDefault(); m.route.set("/"); }
              },
              "VOLVER AL INICIO",
            ),
            m(ThemeToggle),
          ]),
          m("a", {
            href: "#!/",
            class: "brand-mobile",
            onclick: (e) => { e.preventDefault(); m.route.set("/"); }
          }, [
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