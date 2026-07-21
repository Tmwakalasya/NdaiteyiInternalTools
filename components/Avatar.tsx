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
      ? "h-20 w-20 rounded-2xl text-xl"
      : "h-12 w-12 rounded-xl text-sm";

  const ring =
    "ring-2 ring-indigo-200 ring-offset-2 ring-offset-surface";

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
      className={`${classes} ${ring} flex shrink-0 items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-50 to-pink-50 font-medium text-indigo-700`}
    >
      {initials}
    </div>
  );
}
