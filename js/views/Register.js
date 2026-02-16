// --- ESTADO ---
const State = {
  form: {
    nombre: "",
    email: "",
    password: "",
    nivel: "",
  },
  loading: false,
  error: null,
};

// --- ACCIONES ---
const Actions = {
  setInput: (field, value) => {
    State.form[field] = value;
    State.error = null;
  },

  register: async (e) => {
    e.preventDefault();
    State.loading = true;
    State.error = null;

    if (!State.form.nombre || !State.form.email || !State.form.password) {
      State.error = "Todos los campos son obligatorios.";
      State.loading = false;
      return;
    }

    const res = await Auth.register(State.form);

    if (res.success) {
      alert("¡Cuenta creada con éxito! Inicia sesión.");
      window.location.href = "login.html";
    } else {
      State.error = res.error || "Error al registrarse.";
    }

    State.loading = false;
    m.redraw();
  },
};

function RegisterCard() {
  return {
    view: () =>
      m("div", { class: "register-card" }, [
        m("form", { onsubmit: Actions.register }, [
          m("div", { class: "form-header" }, [
            m("h1", "Crear Cuenta"),
            m(
              "p",
              { class: "subtitle" },
              "Completa tus datos para unirte al club.",
            ),
          ]),

          State.error
            ? m("div", { class: "error-msg animate-fade-up" }, [
                m("span", "⚠️"),
                m("span", State.error),
              ])
            : null,

          // Nombre
          m("div", { class: "form-group" }, [
            m("label", { class: "label" }, "Nombre Completo"),
            m("input", {
              type: "text",
              class: "input-field",
              placeholder: "Ej. Carlos Pérez",
              value: State.form.nombre,
              oninput: (e) => Actions.setInput("nombre", e.target.value),
            }),
          ]),

          // Email
          m("div", { class: "form-group" }, [
            m("label", { class: "label" }, "Correo Electrónico"),
            m("input", {
              type: "email",
              class: "input-field",
              placeholder: "tu@email.com",
              value: State.form.email,
              oninput: (e) => Actions.setInput("email", e.target.value),
            }),
          ]),

          // Password
          m("div", { class: "form-group" }, [
            m("label", { class: "label" }, "Contraseña"),
            m("input", {
              type: "password",
              class: "input-field",
              placeholder: "Mínimo 6 caracteres",
              value: State.form.password,
              oninput: (e) => Actions.setInput("password", e.target.value),
            }),
          ]),

          // Nivel
          m("div", { class: "form-group" }, [
            m("label", { class: "label" }, "Nivel Inicial"),
            m(
              "select",
              {
                class: "input-field",
                required: true,
                value: State.form.nivel,
                onchange: (e) => Actions.setInput("nivel", e.target.value),
              },
              [
                m("option", { value: "1.0" }, "1.0 - Iniciación"),
                m("option", { value: "2.0" }, "2.0 - Principiante"),
                m("option", { value: "3.0" }, "3.0 - Intermedio"),
                m("option", { value: "4.0" }, "4.0 - Avanzado"),
                m("option", { value: "5.0" }, "5.0 - Profesional"),
              ],
            ),
          ]),

          m(
            "button",
            {
              type: "submit",
              class: "btn-primary",
              disabled: State.loading,
            },
            State.loading ? "Creando perfil..." : "REGISTRARME GRATIS",
          ),

          m("div", { class: "form-footer" }, [
            m("span", "¿Ya eres miembro? "),
            m("a", { href: "login.html", class: "link" }, "Inicia sesión aquí"),
          ]),
        ]),
      ]),
  };
}

// --- LAYOUT ---
function Layout() {
  return {
    view: () =>
      m("div", { class: "split-layout" }, [
        // Izquierda
        m(HeroSide),

        // Derecha
        m("div", { class: "form-side" }, [
          // Navbar flotante
          m("div", { class: "navbar-floating" }, [
            m(
              "a",
              {
                href: "index.html",
                style:
                  "text-decoration:none; color:var(--text-muted); font-size:12px; font-weight:700;",
              },
              "VOLVER",
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
            m("span", "PADELPINTO"),
          ]),

          m(RegisterCard),
        ]),
      ]),
  };
}

// --- INIT ---
m.mount(document.getElementById("app"), Layout);
