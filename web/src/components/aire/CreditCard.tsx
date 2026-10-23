import { cx } from "./cx";
import { Icon } from "./Icon";

export interface CreditCardProps {
  /** "Visa", "Mastercard", "American Express" u otro texto. */
  brand: string;
  /** Número ya formateado (en grupos de 4); puede llevar puntos para lo que falta. */
  number: string;
  holder: string;
  /** MM/AA */
  expiry: string;
  /** Código de seguridad que se ve en el reverso (puntos o vacío). */
  cvv?: string;
  /** Muestra el reverso. */
  flipped: boolean;
  /** Tocar la tarjeta; normalmente la hace girar un momento. */
  onClick?: () => void;
  /** Texto accesible. */
  label?: string;
  /** Textos de la tarjeta (por defecto en español). */
  labels?: { holder: string; expires: string; namePlaceholder: string; fine: string };
}

const ETIQUETAS = { holder: "Titular", expires: "Vence", namePlaceholder: "NOMBRE APELLIDO", fine: "CIRA · Tarjeta simulada" };

function Logo({ brand }: { brand: string }) {
  if (brand === "Mastercard") {
    return (
      <svg className="ca-ccard__logo" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z" />
        <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z" />
        <path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48C20.376,15.05,18,19.245,18,24z" />
      </svg>
    );
  }
  if (brand === "Visa") return <span className="ca-ccard__wordmark ca-ccard__wordmark--visa">VISA</span>;
  if (brand === "American Express") return <span className="ca-ccard__wordmark ca-ccard__wordmark--amex">AMEX</span>;
  return <Icon name="credit_card" size={28} />;
}

/**
 * Tarjeta de crédito realista (adición a CIRA Aire): chip, contactless, número, titular y vencimiento
 * al frente; banda magnética y código atrás. Al cambiar `flipped` gira 180° con la curva de resorte.
 */
export function CreditCard({ brand, number, holder, expiry, cvv = "", flipped, onClick, label, labels = ETIQUETAS }: CreditCardProps) {
  return (
    <button type="button" className={cx("ca-ccard", flipped && "is-flipped")} onClick={onClick} aria-label={label ?? brand} aria-pressed={flipped}>
      <span className="ca-ccard__inner">
        <span className="ca-ccard__face ca-ccard__front">
          <span className="ca-ccard__top">
            <svg className="ca-ccard__chip" viewBox="0 0 50 38" aria-hidden="true">
              <rect width="50" height="38" rx="7" fill="var(--aire-warning)" />
              <path d="M0 13h14v12H0M36 13h14v12H36M18 0v38M32 0v38M14 13h22M14 25h22" fill="none" stroke="var(--aire-ink)" strokeOpacity=".35" strokeWidth="1.5" />
            </svg>
            <Icon name="contactless" size={28} className="ca-ccard__nfc" />
            <span className="ca-ccard__brand">{brand === "Tarjeta" ? "" : brand}</span>
          </span>
          <span className="ca-ccard__number">{number}</span>
          <span className="ca-ccard__bottom">
            <span className="ca-ccard__meta">
              <small>{labels.holder}</small>
              <b>{holder || labels.namePlaceholder}</b>
            </span>
            <span className="ca-ccard__meta">
              <small>{labels.expires}</small>
              <b>{expiry || "MM/AA"}</b>
            </span>
            <Logo brand={brand} />
          </span>
        </span>

        <span className="ca-ccard__face ca-ccard__back">
          <span className="ca-ccard__strip" />
          <span className="ca-ccard__sign">
            <span className="ca-ccard__signline" />
            <span className="ca-ccard__code">{cvv || "•••"}</span>
          </span>
          <span className="ca-ccard__fine">{labels.fine}</span>
        </span>
      </span>
    </button>
  );
}
