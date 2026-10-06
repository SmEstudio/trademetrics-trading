/**
 * TradeMetrics - Lógica Interactiva
 * Banner RGPD, Acordeones FAQ y Calculadoras Cuantitativas de Trading
 */

document.addEventListener("DOMContentLoaded", () => {
  initCookieConsent();
  initMobileMenu();
  initFaqAccordion();
  initPositionCalculator();
  initExpectancyCalculator();
});

/* ==========================================================================
   Gestión de Cookies RGPD
   ========================================================================== */
function initCookieConsent() {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("cookie-accept");
  const rejectBtn = document.getElementById("cookie-reject");

  if (!banner) return;

  const consent = localStorage.getItem("trademetrics_consent");
  if (!consent) {
    banner.style.display = "block";
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem("trademetrics_consent", "accepted");
      banner.style.display = "none";
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      localStorage.setItem("trademetrics_consent", "essential_only");
      banner.style.display = "none";
    });
  }
}

/* ==========================================================================
   Menú Móvil
   ========================================================================== */
function initMobileMenu() {
  const btn = document.querySelector(".mobile-menu-btn");
  const nav = document.querySelector(".nav-links");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

/* ==========================================================================
   Acordeón FAQ
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const q = item.querySelector(".faq-question");
    if (!q) return;
    q.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });
}

/* ==========================================================================
   Calculadora de Tamaño de Posición y Riesgo
   ========================================================================== */
function initPositionCalculator() {
  const calcForm = document.getElementById("position-calc-form");
  if (!calcForm) return;

  calcForm.addEventListener("input", runPositionCalculation);
  runPositionCalculation();
}

function runPositionCalculation() {
  const balance = parseFloat(document.getElementById("calc-balance")?.value) || 0;
  const riskPct = parseFloat(document.getElementById("calc-risk-pct")?.value) || 0;
  const entry = parseFloat(document.getElementById("calc-entry")?.value) || 0;
  const stopLoss = parseFloat(document.getElementById("calc-stoploss")?.value) || 0;
  const takeProfit = parseFloat(document.getElementById("calc-takeprofit")?.value) || 0;
  const assetType = document.getElementById("calc-asset")?.value || "forex";

  const resRiskCash = document.getElementById("res-risk-cash");
  const resUnits = document.getElementById("res-units");
  const resRR = document.getElementById("res-rr");
  const resPotentialProfit = document.getElementById("res-potential-profit");

  if (!resRiskCash) return;

  const riskCash = balance * (riskPct / 100);
  resRiskCash.textContent = "$" + riskCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const slDistance = Math.abs(entry - stopLoss);
  if (slDistance <= 0 || entry <= 0) {
    if (resUnits) resUnits.textContent = "—";
    if (resRR) resRR.textContent = "—";
    if (resPotentialProfit) resPotentialProfit.textContent = "—";
    return;
  }

  let unitsText = "";
  if (assetType === "forex") {
    // Para Forex estándar (lote estándar = 100,000 unidades, 1 pip = 0.0001 = $10/lote)
    // pips = slDistance / 0.0001
    const pips = slDistance / 0.0001;
    const lotSize = riskCash / (pips * 10);
    unitsText = `${lotSize.toFixed(2)} Lotes (${Math.round(pips)} pips)`;
  } else if (assetType === "stocks") {
    const shares = Math.floor(riskCash / slDistance);
    const capitalRequired = shares * entry;
    unitsText = `${shares.toLocaleString()} Acciones ($${capitalRequired.toLocaleString()})`;
  } else {
    // Crypto
    const cryptoUnits = riskCash / slDistance;
    unitsText = `${cryptoUnits.toFixed(4)} Unidades`;
  }
  if (resUnits) resUnits.textContent = unitsText;

  // Ratio R:R y Beneficio Potencial
  if (takeProfit > 0) {
    const tpDistance = Math.abs(takeProfit - entry);
    const rr = tpDistance / slDistance;
    const potentialProfit = riskCash * rr;
    if (resRR) resRR.textContent = `1 : ${rr.toFixed(2)}`;
    if (resPotentialProfit) {
      resPotentialProfit.textContent = "+$" + potentialProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  } else {
    if (resRR) resRR.textContent = "No definido";
    if (resPotentialProfit) resPotentialProfit.textContent = "—";
  }
}

/* ==========================================================================
   Calculadora de Esperanza Matemática y Racha de Pérdidas
   ========================================================================== */
function initExpectancyCalculator() {
  const form = document.getElementById("expectancy-calc-form");
  if (!form) return;

  form.addEventListener("input", runExpectancyCalculation);
  runExpectancyCalculation();
}

function runExpectancyCalculation() {
  const winRate = parseFloat(document.getElementById("exp-winrate")?.value) || 0;
  const rr = parseFloat(document.getElementById("exp-rr")?.value) || 0;
  const trades = parseInt(document.getElementById("exp-trades")?.value) || 100;

  const resExpectancy = document.getElementById("res-expectancy");
  const resStreak = document.getElementById("res-streak");
  const resDiagnosis = document.getElementById("res-diagnosis");

  if (!resExpectancy) return;

  const pWin = winRate / 100;
  const pLoss = 1 - pWin;

  // Formula E = (pWin * RR) - (pLoss * 1) en unidades de R
  const expectancy = (pWin * rr) - (pLoss * 1);
  resExpectancy.textContent = (expectancy > 0 ? "+" : "") + expectancy.toFixed(2) + " R / op";

  // Estimación de racha de pérdidas consecutivas más probable en N operaciones
  // Streak = ln(N) / -ln(1 - winRate)
  let maxLossStreak = 0;
  if (pLoss > 0 && pLoss < 1 && trades > 1) {
    maxLossStreak = Math.round(Math.log(trades) / -Math.log(pLoss));
  }
  if (resStreak) resStreak.textContent = `~${maxLossStreak} pérdidas seguidas`;

  if (resDiagnosis) {
    if (expectancy > 0.3) {
      resDiagnosis.textContent = "Excelente ventaja estadística cuantificable (Edge robusto)";
      resDiagnosis.style.color = "#00e676";
    } else if (expectancy > 0) {
      resDiagnosis.textContent = "Ventaja matemática positiva pero sensible a comisiones (Spread/Swap)";
      resDiagnosis.style.color = "#ffab00";
    } else {
      resDiagnosis.textContent = "Esperanza negativa: Estrategia perdedora a largo plazo";
      resDiagnosis.style.color = "#ff3366";
    }
  }
}
