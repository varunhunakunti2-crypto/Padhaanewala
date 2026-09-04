export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string | null;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="font-geist-mono text-[12px] font-medium uppercase tracking-normal text-mute">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-ink">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-[16px] leading-6 text-body">{description}</p>
      ) : null}
    </div>
  );
}