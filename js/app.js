window.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");

  // Forzamos el uso de hash (#!) para las rutas
  m.route.prefix = "#!";

  m.route(root, "/", {
    "/": Home,
    "/login": Login,
    "/registro": RegisterView,
    "/partidas": PartidasView,
    "/ranking": RankingView,
  });
});