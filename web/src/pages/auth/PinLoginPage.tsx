import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PhoneFrame } from "@/layouts/PhoneFrame";
import { useAuth } from "@/lib/auth";

export function PinLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const telefono = (location.state as { telefono?: string } | null)?.telefono ?? "";
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < 3) inputsRef.current[index + 1]?.focus();
  };

  const handleSubmit = () => {
    // Mockup: cualquier código de 4 dígitos se acepta.
    login();
    navigate("/explorar", { replace: true });
  };

  const complete = digits.every((d) => d !== "");

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-cira-base px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cira-header-icon-bg">
          <Icon name="sms" size={30} className="text-cira-accent" />
        </div>
        <div>
          <h1 className="text-cira-title font-semibold text-cira-text-primary">
            Verificá tu número
          </h1>
          <p className="mt-1 text-sm text-cira-text-secondary">
            Enviamos un código de 4 dígitos por SMS a{" "}
            <span className="font-semibold">{telefono || "tu número"}</span>
          </p>
        </div>

        <div className="flex gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-cira-input border border-cira-input-border bg-cira-input-bg text-center text-xl font-semibold text-cira-text-primary focus:border-cira-accent focus:outline-none"
            />
          ))}
        </div>

        <Button fullWidth disabled={!complete} onClick={handleSubmit}>
          Confirmar
        </Button>

        <button className="text-sm font-semibold text-cira-accent">
          Reenviar código
        </button>
      </div>
    </PhoneFrame>
  );
}
