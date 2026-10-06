/**
 * Configuración Centralizada de Google AdSense - TradeMetrics
 * Permite alternar entre modo de prueba (placeholders) y modo producción real.
 */
const ADS_CONFIG = {
  // Cambiar a true cuando la cuenta esté aprobada e insertar el ID de cliente real
  PRODUCTION_MODE: false,
  CLIENT_ID: "ca-pub-XXXXXXXXXXXXXXXX",
  SLOTS: {
    HEADER_BANNER: "1111111111",
    ARTICLE_INLINE: "2222222222",
    SIDEBAR_STICKY: "3333333333",
    FOOTER_BANNER: "4444444444"
  }
};

function renderAdSenseSlot(elementId, slotType) {
  const container = document.getElementById(elementId);
  if (!container) return;

  if (ADS_CONFIG.PRODUCTION_MODE) {
    container.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${ADS_CONFIG.CLIENT_ID}"
           data-ad-slot="${ADS_CONFIG.SLOTS[slotType] || ''}"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    `;
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push error:", e);
    }
  } else {
    // Placeholder estético estilo terminal
    container.innerHTML = `
      <div class="ad-placeholder">
        <span class="ad-label">Bloque Publicitario Patrocinado [${slotType}]</span>
        <span style="font-family: monospace; font-size: 0.75rem; color: #64748b;">
          Espacio reservado para Google AdSense &bull; Cumplimiento normativo IAB / RGPD
        </span>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const slots = document.querySelectorAll("[data-ad-slot]");
  slots.forEach((slot) => {
    const slotType = slot.getAttribute("data-ad-slot");
    renderAdSenseSlot(slot.id, slotType);
  });
});
