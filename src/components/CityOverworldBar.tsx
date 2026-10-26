import { art } from '../assets/art';
import type { HarnessPreset } from '../data/harnessData';

interface CityOverworldBarProps {
  presets: HarnessPreset[];
  activePreset: HarnessPreset;
  onSelectPreset: (presetId: string) => void;
  onEnterCouncilSandbox: () => void;
  onEnterLibraryVault: () => void;
}

export function CityOverworldBar({
  presets,
  activePreset,
  onSelectPreset,
  onEnterCouncilSandbox,
  onEnterLibraryVault,
}: CityOverworldBarProps) {
  return (
    <div className="overworld-harness-layer" aria-label="城邦双层空间与学派集结视窗">
      <header className="overworld-top-plaque">
        <div className="overworld-brand">
          <span className="overworld-code">SIWEI CITY · THOUGHT HARNESS 2.0</span>
          <h1>思维城邦 · 外景城邦与室内石刻沙盘</h1>
        </div>
        <div className="overworld-preset-switcher" role="tablist" aria-label="城邦召集 Preset">
          {presets.map((preset) => {
            const active = preset.id === activePreset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`overworld-preset-tab${active ? ' active' : ''}`}
                onClick={() => onSelectPreset(preset.id)}
              >
                <span className="preset-tab-code">{preset.code}</span>
                <strong>{preset.shortName}</strong>
              </button>
            );
          })}
        </div>
        <div className="overworld-building-Portals">
          <button type="button" className="portal-btn primary" onClick={onEnterCouncilSandbox}>
            踏入议会厅 · 石刻沙盘
          </button>
          <button type="button" className="portal-btn secondary" onClick={onEnterLibraryVault}>
            踏入大图书馆 · 档案木匣
          </button>
        </div>
      </header>

      <aside className="overworld-convergence-banner" aria-label="当前 Preset 学派集结状态">
        <div className="convergence-head">
          <span className="convergence-tag">{activePreset.code} · 学派集结令</span>
          <strong>{activePreset.name}</strong>
          <small>{activePreset.badge}</small>
        </div>
        <div className="convergence-seats">
          {activePreset.seats.map((seat) => (
            <div key={seat.seatCode} className="convergence-seat-chip">
              <img src={art.characters[seat.residentId]} alt={seat.residentName} />
              <div>
                <b>{seat.seatTitle}</b>
                <span>由「{seat.schoolName}」赴议会厅入席</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
