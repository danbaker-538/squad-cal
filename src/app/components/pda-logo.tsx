export function PdaLogo({ size = "lg" }: { size?: "sm" | "lg" }) {
  if (size === "sm") {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span className="text-lg font-extrabold gradient-text">ΦΔΑ</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <span className="text-5xl font-extrabold gradient-text tracking-wider">
          ΦΔΑ
        </span>
      </div>
      <h1 className="text-3xl font-extrabold text-foreground">
        PD<span className="gradient-text">c</span>Alendar
      </h1>
      <p className="text-sm text-foreground/50 font-medium">
        Spring Quarter 2026
      </p>
    </div>
  );
}
