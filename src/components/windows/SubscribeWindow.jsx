import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function SubscribeWindow({ onClose, onShowPurchaseSuccess }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(null);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [error, setError] = useState(null);

  async function handleSelect(plan) {
    setError(null);
    if (!user) {
      alert("Debes iniciar sesión antes de suscribirte.");
      return;
    }

    if (plan === "basico") {
      if (
        window.confirm("¿Confirmas la selección del Plan Básico (Gratuito)?")
      ) {
        updateUser({ plan: "basico" });
        onClose();
        onShowPurchaseSuccess("basico");
      }
      return;
    }

    const prices = { premium: 99.99, vip: 999.99 };
    const names = { premium: "Plan Premium", vip: "Plan VIP" };
    const price = prices[plan];
    const planName = names[plan];

    if (!window.confirm(`¿Proceder al pago de ${planName} ($${price}/mes)?`))
      return;

    setLoading(plan);
    try {
      const res = await fetch("/api/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: planName,
          price,
          userId: user.id,
          email: user.email,
          plan,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point) {
        alert(data.error || "Error al crear el pago. Intenta de nuevo.");
        return;
      }
      const mpUrl = data.sandbox_init_point || data.init_point;
      window.open(mpUrl, "_blank");
      setPendingPlan(plan);
    } catch {
      alert("Error de conexión con el servidor de pagos.");
    } finally {
      setLoading(null);
    }
  }

  async function confirmPayment() {
    if (!user || !pendingPlan) return;
    setLoading("confirmando");
    try {
      const res = await fetch("/api/mp/success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan: pendingPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al confirmar pago");
        return;
      }
      updateUser({ plan: data.plan });
      setPendingPlan(null);
      onClose();
      onShowPurchaseSuccess(data.plan);
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="title-bar">Planes de Suscripción</div>

      <div
        className="subscripcion-opcion"
        style={{ border: "2px solid #808080" }}
      >
        <h3>Plan Básico</h3>
        <div className="precio">GRATIS</div>
        <ul>
          <li>Acceso a foros públicos</li>
          <li>Noticias básicas</li>
          <li>Soporte por email</li>
        </ul>
        <button
          className="btn"
          onClick={() => handleSelect("basico")}
          disabled={!!loading || !!pendingPlan}
        >
          Seleccionar
        </button>
      </div>

      <div
        className="subscripcion-opcion"
        style={{ border: "2px solid #000080" }}
      >
        <h3>Plan Premium</h3>
        <div className="precio">$99.99/mes</div>
        <ul>
          <li>Todo lo del plan Básico</li>
          <li>Acceso a contenido exclusivo</li>
          <li>Reproductor de música ilimitado</li>
          <li>Soporte prioritario 24/7</li>
          <li>Sin publicidad</li>
        </ul>
        <button
          className="btn"
          onClick={() => handleSelect("premium")}
          disabled={loading === "premium" || !!pendingPlan}
        >
          {loading === "premium" ? "Procesando..." : "Pagar con Mercado Pago"}
        </button>
      </div>

      <div
        className="subscripcion-opcion"
        style={{ border: "2px solid #c0a030" }}
      >
        <h3>Plan VIP</h3>
        <div className="precio">$99.99/mes</div>
        <ul>
          <li>Todo lo del plan Premium</li>
          <li>Acceso anticipado a nuevas funciones</li>
          <li>Canales privados de foros</li>
          <li>Descuentos en tiendas asociadas</li>
        </ul>
        <button
          className="btn"
          onClick={() => handleSelect("vip")}
          disabled={loading === "vip" || !!pendingPlan}
        >
          {loading === "vip" ? "Procesando..." : "Pagar con Mercado Pago"}
        </button>
      </div>

      {pendingPlan && (
        <div className="panel" style={{ marginTop: 10, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#000080", marginBottom: 8 }}>
            ✅ Pago iniciado en una nueva pestaña. Si ya pagaste, haz clic en
            confirmar:
          </p>
          <button
            className="btn"
            onClick={confirmPayment}
            disabled={loading === "confirmando"}
          >
            {loading === "confirmando"
              ? " Confirmando..."
              : " Ya pagué — Confirmar"}
          </button>
        </div>
      )}

      {error && (
        <div
          className="panel"
          style={{
            marginTop: 10,
            color: "#800000",
            fontSize: 11,
            textAlign: "center",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {!user && (
        <div
          className="panel"
          style={{
            marginTop: 10,
            textAlign: "center",
            color: "#800000",
            fontSize: 11,
          }}
        >
          ⚠️ Debes iniciar sesión para suscribirte a un plan de pago.
        </div>
      )}

      <div className="panel" style={{ marginTop: 10 }}>
        <label style={{ fontSize: 11 }}>
          <input type="checkbox" style={{ marginRight: 6 }} />
          Deseo recibir newsletters y ofertas especiales
        </label>
      </div>

      <div
        className="panel"
        style={{ marginTop: 8, fontSize: 10, color: "#666" }}
      >
        Pago procesado de forma segura por <strong>Mercado Pago</strong>.
      </div>
    </div>
  );
}
