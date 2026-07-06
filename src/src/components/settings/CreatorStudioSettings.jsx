import { Brain, Gamepad2, MonitorPlay, Palette, Smartphone, Sparkles, Users } from 'lucide-react';

const HUBS = ['Movies', 'TV Shows', 'Games', 'Anime', 'Manga', 'Books', 'Live TV', 'Actors', 'Kids', 'Vault'];
const MOODS = ['Cinematic', 'Comfort', 'High Energy', 'Family', 'Dark', 'Discovery', 'Retro', 'Premium'];

const SELECT_GROUPS = [
  {
    title: 'AI Personalization',
    icon: Brain,
    description: 'Shape how the app recommends, ranks, and presents content.',
    options: [
      { key: 'personalizationMode', label: 'Personalization', choices: [['balanced', 'Balanced'], ['deep', 'Deep'], ['predictive', 'Predictive']] },
      { key: 'recommendationDepth', label: 'AI Detail', choices: [['quick', 'Quick'], ['rich', 'Rich'], ['expert', 'Expert']] },
      { key: 'preferredMood', label: 'Mood Bias', choices: MOODS.map(mood => [mood.toLowerCase().replaceAll(' ', '_'), mood]) },
      { key: 'marketMode', label: 'Market Mode', choices: [['streaming', 'Streaming'], ['gaming', 'Gaming'], ['all_in', 'All-In']] }
    ]
  },
  {
    title: 'Home Creator Studio',
    icon: Palette,
    description: 'Control the feel of the home page and browsing journey.',
    options: [
      { key: 'homeHeroStyle', label: 'Hero Style', choices: [['cinema', 'Cinema'], ['editorial', 'Editorial'], ['immersive', 'Immersive']] },
      { key: 'creatorRailFocus', label: 'Rail Focus', choices: [['balanced', 'Balanced'], ['ai_first', 'AI First'], ['continue_first', 'Resume First']] },
      { key: 'contentDiscoveryStyle', label: 'Discovery', choices: [['curated', 'Curated'], ['explorer', 'Explorer'], ['studio', 'Studio']] },
      { key: 'profileMode', label: 'Profiles', choices: [['single', 'Single'], ['family', 'Family'], ['creator', 'Creator']] }
    ]
  },
  {
    title: 'Player & Mobile',
    icon: MonitorPlay,
    description: 'Tune playback polish, mobile layout, and accessibility defaults.',
    options: [
      { key: 'playerExperience', label: 'Player', choices: [['clean', 'Clean'], ['cinema', 'Cinema'], ['pro', 'Pro']] },
      { key: 'mobileNavMode', label: 'Mobile Nav', choices: [['standard', 'Standard'], ['bottom_tabs', 'Bottom Tabs'], ['gesture', 'Gesture']] },
      { key: 'trustLevel', label: 'Trust Detail', choices: [['minimal', 'Minimal'], ['standard', 'Standard'], ['transparent', 'Transparent']] },
      { key: 'accessibilityLevel', label: 'Accessibility', choices: [['standard', 'Standard'], ['enhanced', 'Enhanced'], ['maximum', 'Maximum']] }
    ]
  }
];

const TOGGLES = [
  ['aiDiscovery', 'AI Discovery', Brain],
  ['onboardingPrompt', 'Smart Onboarding', Sparkles],
  ['familyProfiles', 'Family Profiles', Users],
  ['socialLayer', 'Social Layer', Users],
  ['watchParties', 'Watch Parties', MonitorPlay],
  ['gameAchievements', 'Game Achievements', Gamepad2],
  ['subtitleFirst', 'Captions First', MonitorPlay],
  ['sourceTransparency', 'Source Trust', Sparkles],
  ['mobileFirstMode', 'Mobile First', Smartphone],
  ['creatorInsights', 'Creator Insights', Brain]
];

function SelectControl({ settingKey, label, choices, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(settingKey, event.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm font-bold text-foreground focus:border-primary/60"
      >
        {choices.map(([choice, choiceLabel]) => <option key={choice} value={choice}>{choiceLabel}</option>)}
      </select>
    </label>
  );
}

function TogglePill({ settingKey, label, Icon, active, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(settingKey, !active)}
      aria-pressed={!!active}
      className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-xs font-black transition-colors ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

export default function CreatorStudioSettings({ settings, onChange }) {
  const toggleHub = (hub) => {
    const current = settings.preferredHubs || [];
    onChange('preferredHubs', current.includes(hub) ? current.filter(item => item !== hub) : [...current, hub]);
  };

  return (
    <section className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-4">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Creator Studio</p>
          <h3 className="text-xl font-black text-foreground">Deep Experience Controls</h3>
          <p className="text-sm text-muted-foreground">Customize AI, content discovery, mobile polish, player feel, social layers, and trust signals.</p>
        </div>
        <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>

      <div className="space-y-4">
        {SELECT_GROUPS.map(group => (
          <div key={group.title} className="rounded-3xl border border-border bg-card/70 p-4">
            <div className="mb-3 flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-2 text-primary"><group.icon className="h-4 w-4" aria-hidden="true" /></div>
              <div>
                <h4 className="text-sm font-black text-foreground">{group.title}</h4>
                <p className="text-xs text-muted-foreground">{group.description}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {group.options.map(option => (
                <SelectControl key={option.key} {...option} value={settings[option.key]} onChange={onChange} />
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-3xl border border-border bg-card/70 p-4">
          <h4 className="mb-3 text-sm font-black text-foreground">Preferred Hubs</h4>
          <div className="flex flex-wrap gap-2">
            {HUBS.map(hub => {
              const active = (settings.preferredHubs || []).includes(hub);
              return (
                <button
                  key={hub}
                  type="button"
                  onClick={() => toggleHub(hub)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-2 text-xs font-black ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-secondary/60 text-muted-foreground hover:text-foreground'}`}
                >
                  {hub}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/70 p-4">
          <h4 className="mb-3 text-sm font-black text-foreground">Market-Leading Feature Switches</h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TOGGLES.map(([key, label, Icon]) => (
              <TogglePill key={key} settingKey={key} label={label} Icon={Icon} active={!!settings[key]} onChange={onChange} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
