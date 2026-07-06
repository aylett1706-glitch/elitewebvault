export default function CinematicHeroEffects({ intensity = 'medium' }) {
  const particleCount = intensity === 'extreme' ? 36 : intensity === 'low' ? 12 : 24;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_36%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_20%_70%,rgba(245,184,61,0.12),transparent_24%)]" />
      <div className="absolute inset-0 opacity-35 mix-blend-screen [background-image:linear-gradient(110deg,transparent_0%,rgba(255,255,255,.13)_46%,transparent_58%)] motion-safe:animate-[elite-shimmer_9s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/70 to-transparent" />
      {Array.from({ length: particleCount }).map((_, index) => (
        <span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-primary/70 shadow-[0_0_12px_hsl(var(--primary))]"
          style={{
            left: `${(index * 29) % 100}%`,
            top: `${(index * 17) % 100}%`,
            animation: `wallpaper-drift ${8 + (index % 8)}s linear infinite`,
            animationDelay: `${index * -0.4}s`
          }}
        />
      ))}
    </div>
  );
}