interface InfoHintProps {
  text: string;
}

export function InfoHint({ text }: InfoHintProps) {
  return (
    <span className="info-hint" tabIndex={0} aria-label={text}>
      ?
      <span>{text}</span>
    </span>
  );
}
