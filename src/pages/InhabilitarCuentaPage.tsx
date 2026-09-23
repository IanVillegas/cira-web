import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

export function InhabilitarCuentaPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmar, setConfirmar] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="pb-8">
      <PageHeader title="Inhabilitar cuenta" showBack />

      <div className="px-5">
        <div className="flex flex-col items-center gap-3 rounded-cira-card bg-cira-btn-destructive-bg p-5 text-center">
          <Icon name="warning" filled size={32} className="text-cira-btn-destructive-text" />
          <p className="font-semibold text-cira-btn-destructive-text">
            Esta acción cerrará todas tus sesiones activas
          </p>
          <p className="text-sm text-cira-text-secondary">
            Tu perfil dejará de ser visible para otros usuarios y no podrás iniciar sesión mientras
            esté inhabilitada. Tu historial se mantiene guardado.
          </p>
        </div>

        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Confirmá tu PIN"
            icon="lock"
            type="password"
            inputMode="numeric"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-sm text-cira-text-secondary">
            <input
              type="checkbox"
              checked={confirmar}
              onChange={(e) => setConfirmar(e.target.checked)}
              className="h-4 w-4 accent-cira-accent"
            />
            Entiendo que mi cuenta quedará inhabilitada
          </label>

          <Button
            type="submit"
            variant="destructive"
            fullWidth
            disabled={pin.length < 4 || !confirmar}
          >
            Inhabilitar cuenta
          </Button>
        </form>
      </div>
    </div>
  );
}
