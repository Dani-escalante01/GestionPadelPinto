/* --- ESTADO --- */
const RegisterState = {
  form: { nombre: "", email: "", password: "", nivel: "", },
  loading: false,
  error: null,
};

/* --- ACCIONES --- */
const RegisterActions = {
  setInput: (field, value) => {
    RegisterState.form[field] = value;
    RegisterState.error = null;
  },
  register: async (e) => {
    e.preventDefault();
    RegisterState.loading = true;
    RegisterState.error = null;
    if (!RegisterState.form.nombre || !RegisterState.form.email || !RegisterState.form.password) {
      RegisterState.error = "Todos los campos son obligatorios.";
      RegisterState.loading = false;
      return;
    }
    try {
      const res = await Auth.register(RegisterState.form);
      if (res.success) {
        alert("¡Cuenta creada con éxito! Inicia sesión.");
        m.route.set("/login");
      } else {
        RegisterState.error = res.error || "Error al registrarse.";
      }
    } catch (err) {
      console.error(err);
      RegisterState.error = "Error de conexión.";
    }
    RegisterState.loading = false;
    m.redraw();
  },
};

/* --- COMPONENTES --- */
function RegisterCard() {
  return {
    view: () => m("div", { class: "register-card" }, [
      m("form", { onsubmit: RegisterActions.register }, [
        m("div", { class: "form-header" }, [
          m("h1", "Crear Cuenta"),
          m("p", { class: "subtitle" }, "Completa tus datos para unirte al club."),
        ]),
        RegisterState.error ? m("div", { class: "error-msg animate-fade-up" }, [
          m("span", "⚠️"), m("span", RegisterState.error),
        ]) : null,
        m("div", { class: "form-group" }, [
          m("label", { class: "label" }, "Nombre Completo"),
          m("input", {
            type: "text", class: "input-field",
            value: RegisterState.form.nombre, oninput: (e) => RegisterActions.setInput("nombre", e.target.value)
          }),
        ]),
        m("div", { class: "form-group" }, [
          m("label", { class: "label" }, "Correo Electrónico"),
          m("input", {
            type: "email", class: "input-field",
            value: RegisterState.form.email, oninput: (e) => RegisterActions.setInput("email", e.target.value)
          }),
        ]),
        m("div", { class: "form-group" }, [
          m("label", { class: "label" }, "Contraseña"),
          m("input", {
            type: "password", class: "input-field",
            value: RegisterState.form.password, oninput: (e) => RegisterActions.setInput("password", e.target.value)
          }),
        ]),
        m("div", { class: "form-group" }, [
          m("label", { class: "label" }, "Nivel Inicial"),
          m("select", {
            class: "input-field", required: true, value: RegisterState.form.nivel,
            onchange: (e) => RegisterActions.setInput("nivel", e.target.value)
          }, [
            m("option", { value: "1.0" }, "1.0 - Iniciación"),
            m("option", { value: "2.0" }, "2.0 - Principiante"),
            m("option", { value: "3.0" }, "3.0 - Intermedio"),
            m("option", { value: "4.0" }, "4.0 - Avanzado"),
            m("option", { value: "5.0" }, "5.0 - Profesional"),
          ]),
        ]),
        m("button", { type: "submit", class: "btn-primary", disabled: RegisterState.loading },
          RegisterState.loading ? "Creando perfil..." : "REGISTRARME GRATIS"
        ),
        m("div", { class: "form-footer" }, [
          m("span", "¿Ya eres miembro? "),
          m("a", {
            href: "#!/login", class: "link",
            onclick: (e) => { e.preventDefault(); m.route.set("/login"); }
          }, "Inicia sesión aquí"),
        ]),
      ]),
    ]),
  };
}

/* --- LAYOUT --- */
const RegisterView = {
  view: () => {
    if (typeof ThemeState !== 'undefined') {
      document.documentElement.classList.toggle("dark", ThemeState.darkMode);
    }
    return m("div", { class: "split-layout" }, [
      m(HeroSide),
      m("div", { class: "form-side" }, [
        m("div", { class: "navbar-floating" }, [
          m("a", {
            href: "#!/", style: "text-decoration:none; color:var(--text-muted); font-size:12px; font-weight:700;",
            onclick: (e) => { e.preventDefault(); m.route.set("/"); }
          }, "VOLVER AL INICIO"),
          m(ThemeToggle),
        ]),
        m("a", {
          href: "#!/", class: "brand-mobile",
          onclick: (e) => { e.preventDefault(); m.route.set("/"); }
        }, [
          m("div", { style: "background:var(--primary); color:white; width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:bold;" }, "P"),
          m("span", { style: "margin-left: 10px" }, "PADELPINTO"),
        ]),
        m(RegisterCard),
      ]),
    ]);
  }
};