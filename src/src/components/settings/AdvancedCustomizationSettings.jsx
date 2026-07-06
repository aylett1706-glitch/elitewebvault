const OPTION_GROUPS = [
  {
    title: 'Layout Feel',
    description: 'Shape the whole app layout and spacing.',
    options: [
      { key: 'pageWidth', label: 'Page Width', choices: [['standard', 'Standard'], ['wide', 'Wide'], ['cinema', 'Cinema']] },
      { key: 'lifeDesign', label: 'Life Design', choices: [['cinema', 'Cinema'], ['wellness', 'Wellness'], ['arcade', 'Arcade']] },
      { key: 'navigationStyle', label: 'Navigation', choices: [['floating', 'Floating'], ['compact', 'Compact'], ['bold', 'Bold']] },
      { key: 'contentSpacing', label: 'Spacing', choices: [['cozy', 'Cozy'], ['balanced', 'Balanced'], ['spacious', 'Spacious']] },
      { key: 'cornerStyle', label: 'Corners', choices: [['soft', 'Soft'], ['round', 'Round'], ['sharp', 'Sharp']] },
      { key: 'textScale', label: 'Text Size', choices: [['compact', 'Compact'], ['normal', 'Normal'], ['large', 'Large']] },
    ]
  },
  {
    title: 'Cards & Browsing',
    description: 'Tune posters, rows, metadata, and library density.',
    options: [
      { key: 'cardStyle', label: 'Card Style', choices: [['poster', 'Poster'], ['glass', 'Glass'], ['minimal', 'Minimal']] },
      { key: 'posterShape', label: 'Poster Shape', choices: [['classic', 'Classic'], ['rounded', 'Rounded'], ['square', 'Square']] },
      { key: 'browseDensity', label: 'Browse Density', choices: [['compact', 'Compact'], ['balanced', 'Balanced'], ['showcase', 'Showcase']] },
      { key: 'metadataStyle', label: 'Metadata', choices: [['minimal', 'Minimal'], ['badges', 'Badges'], ['detailed', 'Detailed']] },
    ]
  },
  {
    title: 'Motion & Effects',
    description: 'Control animations, hover feel, and visual intensity.',
    options: [
      { key: 'animationStyle', label: 'Animation', choices: [['calm', 'Calm'], ['smooth', 'Smooth'], ['cinematic', 'Cinematic']] },
      { key: 'hoverEffect', label: 'Hover Effect', choices: [['lift', 'Lift'], ['zoom', 'Zoom'], ['glow', 'Glow']] },
      { key: 'accentIntensity', label: 'Accent Power', choices: [['subtle', 'Subtle'], ['balanced', 'Balanced'], ['electric', 'Electric']] },
      { key: 'backgroundDim', label: 'Background Dim', choices: [['light', 'Light'], ['medium', 'Medium'], ['deep', 'Deep']] },
    ]
  }
];

const TOGGLES = [
  ['glassPanels', 'Glass Panels'],
  ['showBadges', 'Show Badges'],
  ['showRatings', 'Show Ratings'],
  ['showTopicChips', 'Topic Chips'],
  ['autoPlayPreviews', 'Autoplay Previews'],
  ['focusMode', 'Focus Mode'],
  ['stickyNavigation', 'Sticky Navigation'],
  ['denseMobile', 'Dense Mobile'],
  ['ambientOverlays', 'Ambient Overlays'],
  ['premiumBorders', 'Premium Borders'],
  ['largeArtwork', 'Large Artwork'],
  ['quickActions', 'Quick Actions']
];

function ChoiceGroup({ settingKey, label, choices, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-background/60 p-1">
        {choices.map(([choice, choiceLabel]) => (
          <button
            key={choice}
            type="button"
            onClick={() => onChange(settingKey, choice)}
            className={`rounded-xl px-2 py-2 text-xs font-black transition-colors ${value === choice ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
          >
            {choiceLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleOption({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-2 text-left text-xs font-black transition-colors ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
    >
      {label}
    </button>
  );
}

export default function AdvancedCustomizationSettings({ settings, onChange }) {
  return (
    <section className="rounded-3xl border border-primary/20 bg-secondary/30 p-4">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Advanced Customization</p>
        <h3 className="text-lg font-black text-foreground">Mega Controls</h3>
        <p className="text-sm text-muted-foreground">A bigger mix of visual, motion, layout, and browsing options.</p>
      </div>

      <div className="space-y-5">
        {OPTION_GROUPS.map(group => (
          <div key={group.title} className="rounded-3xl border border-border bg-card/60 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-black text-foreground">{group.title}</h4>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.options.map(option => (
                <ChoiceGroup
                  key={option.key}
                  settingKey={option.key}
                  label={option.label}
                  choices={option.choices}
                  value={settings[option.key]}
                  onChange={onChange}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-3xl border border-border bg-card/60 p-4">
          <h4 className="mb-3 text-sm font-black text-foreground">Instant Toggles</h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {TOGGLES.map(([key, label]) => (
              <ToggleOption key={key} label={label} active={!!settings[key]} onClick={() => onChange(key, !settings[key])} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
