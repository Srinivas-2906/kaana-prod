import Image from "next/image";
import Link from "next/link";

type KaanaLogoProps = {
  variant?: "name" | "mark";
  href?: string | null;
  className?: string;
  height?: number;
  priority?: boolean;
};

const LOGO_DIMENSIONS = {
  name: { width: 1600, height: 1128 },
  mark: { width: 512, height: 346 },
} as const;

export default function KaanaLogo({
  variant = "name",
  href = "/",
  className = "",
  height,
  priority = false,
}: KaanaLogoProps) {
  const src = variant === "name" ? "/logo-name.png" : "/logo-only.png";
  const base = LOGO_DIMENSIONS[variant];
  const imgHeight = height ?? (variant === "name" ? 48 : 32);
  const imgWidth =
    variant === "mark"
      ? Math.round((base.width / base.height) * imgHeight)
      : Math.round((base.width / base.height) * imgHeight);

  const image = (
    <Image
      src={src}
      alt="Kaana"
      width={imgWidth}
      height={imgHeight}
      priority={priority}
      className={`object-contain ${className}`}
      style={{ width: "auto", height: imgHeight }}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center link-trigger" aria-label="Kaana home">
        {image}
      </Link>
    );
  }

  return image;
}
