import { art } from '../assets/art';
import type { District, ResidentId, ResidentProfile } from '../types';
import type { DistrictBlueprint } from '../lib/districtBlueprints';

interface DistrictBlueprintPanelProps {
  district: District | null;
  blueprint: DistrictBlueprint | null;
  residents: ResidentProfile[];
  onSelectResident: (id: ResidentId) => void;
  onEnterCouncil: () => void;
  onClose: () => void;
}

export function DistrictBlueprintPanel({
  district,
  blueprint,
  residents,
  onSelectResident,
  onEnterCouncil,
  onClose,
}: DistrictBlueprintPanelProps) {
  if (!district || !blueprint) return null;

  const relatedResidents = residents.filter((resident) => resident.homeDistrictId === district.id);
  const buildingImage = art.buildings[district.sprite % art.buildings.length];
  const isCouncil = district.id === 'conflict';

  return (
    <aside className="district-blueprint-panel" aria-label={`${district.name} 建筑规划档案`}>
      <button className="codex-close" type="button" onClick={onClose} aria-label="关闭建筑规划">
        ×
      </button>
      <div className="district-blueprint-hero">
        <img src={buildingImage} alt="" />
        <span>
          <small>规划档案 · 二级页面</small>
          <strong>{district.name}</strong>
        </span>
      </div>
      <h2>{blueprint.moduleName}</h2>
      <p>{blueprint.purpose}</p>

      <div className="blueprint-section">
        <strong>未来承载</strong>
        <p>{blueprint.secondaryPage}</p>
      </div>
      <div className="blueprint-section">
        <strong>点击后的交互</strong>
        <p>{blueprint.interaction}</p>
      </div>
      <div className="blueprint-section">
        <strong>美术方向</strong>
        <p>{blueprint.artDirection}</p>
      </div>
      <div className="blueprint-section">
        <strong>需要的资源</strong>
        <ul>
          {blueprint.assetIdeas.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {relatedResidents.length > 0 && (
        <div className="blueprint-residents">
          <strong>绑定居民 / prompt</strong>
          <div>
            {relatedResidents.map((resident) => (
              <button key={resident.id} type="button" onClick={() => onSelectResident(resident.id)}>
                <img src={art.characters[resident.assetKey]} alt="" />
                <span>
                  <b>{resident.title}</b>
                  <small>{resident.roleName}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button className={isCouncil ? 'codex-primary' : 'codex-primary disabled'} type="button" disabled={!isCouncil} onClick={onEnterCouncil}>
        {isCouncil ? '进入议会' : '二级场景待设计'}
      </button>
    </aside>
  );
}
