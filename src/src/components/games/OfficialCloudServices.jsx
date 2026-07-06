import { Cloud, ExternalLink, Gamepad2, MonitorPlay } from 'lucide-react';

const services = [
  {
    name: 'Steam',
    description: 'Open Steam games, store pages, Remote Play and your PC library in the official Steam experience.',
    url: 'https://store.steampowered.com/',
    icon: MonitorPlay
  },
  {
    name: 'Xbox Cloud Gaming',
    description: 'Launch supported Xbox Game Pass cloud titles through the official Xbox Cloud Gaming service.',
    url: 'https://www.xbox.com/play',
    icon: Cloud
  },
  {
    name: 'Xbox Games',
    description: 'Browse Xbox console and PC games, then save official links into your EliteVault Games Hub.',
    url: 'https://www.xbox.com/games',
    icon: Gamepad2
  },
  {
    name: 'PlayStation Plus Cloud',
    description: 'Open PlayStation cloud streaming and catalogue access through the official PlayStation service.',
    url: 'https://www.playstation.com/ps-plus/',
    icon: Cloud
  }
];

export default function OfficialCloudServices() {
  return (
    <section className="mb-8 rounded-3xl border border-primary/20 bg-card p-5" aria-label="Official cloud gaming services">
      <div className="mb-4">
        <h2 className="text-xl font-black text-foreground">Official Cloud & Store Launchers</h2>
        <p className="mt-1 text-sm text-muted-foreground">Steam, Xbox and PlayStation services open officially because they cannot be legally embedded inside third-party apps.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {services.map(service => {
          const Icon = service.icon;
          return (
            <a key={service.name} href={service.url} target="_blank" rel="noreferrer" className="group rounded-2xl border border-border bg-secondary/60 p-4 transition-colors hover:border-primary/50">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <h3 className="font-black text-foreground">{service.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{service.description}</p>
            </a>
          );
        })}
      </div>
    </section>
  );
}