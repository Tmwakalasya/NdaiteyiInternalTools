/* eslint-disable @next/next/no-img-element */

export function Avatar({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl: string | null;
  size?: "md" | "lg";
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const classes =
    size === "lg"
      ? "h-20 w-20 rounded-[4px] text-xl"
      : "h-12 w-12 rounded-[4px] text-sm";

  const ring = "ring-1 ring-line";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${classes} ${ring} shrink-0 border border-line object-cover`}
      />
    );
  }

  return (
    <div
      className={`${classes} ${ring} flex shrink-0 items-center justify-center bg-stone font-medium text-coal`}
    >
      {initials}
    </div>
  );
}
