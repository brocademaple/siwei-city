interface GuideButtonProps {
  onOpen: () => void;
}

export function GuideButton({ onOpen }: GuideButtonProps) {
  return (
    <button className="guide-button" type="button" onClick={onOpen} aria-label="进入指引模式">
      ?
      <span>进入指引模式</span>
    </button>
  );
}
