import { HomeState, Home, HomeActions, HOURS, MONTHS } from "./views/Home.js";
import { Login } from './views/Login.js';
import { RegisterView } from './views/Register.js';
import { PartidasView } from './views/Partidas.js';
import { RankingView } from './views/Ranking.js';
import './components/toggleTheme.js';

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