export function Loader({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-cira-text-secondary">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cira-border border-t-cira-accent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
