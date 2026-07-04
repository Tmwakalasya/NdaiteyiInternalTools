/* eslint-disable @next/next/no-img-element */

// Shows the member's photo, or their initials on a soft accent tint.
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
      ? "h-24 w-24 rounded-3xl text-2xl"
      : "h-14 w-14 rounded-2xl text-lg";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${classes} shrink-0 border border-line object-cover`}
      />
    );
  }

  return (
    <div
      className={`${classes} flex shrink-0 items-center justify-center border border-accent/15 bg-accent/10 font-semibold text-accent`}
    >
      {initials}
    </div>
  );
}
