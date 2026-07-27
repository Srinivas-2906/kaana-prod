import Image from "next/image";
import Link from "next/link";

type KaanaLogoProps = {
  variant?: "name" | "mark";
  href?: string | null;
  className?: string;
  height?: number;
  priority?: boolean;
};

export default function KaanaLogo({
  variant = "name",
  href = "/",
  className = "",
  height,
  priority = false,
}: KaanaLogoProps) {
  const src = variant === "name" ? "/logo-name.png" : "/logo-only.png";
  const imgHeight = height ?? (variant === "name" ? 40 : 32);

  const image = (
    <Image
      src={src}
      alt="Kaana"
      width={variant === "name" ? 140 : imgHeight}
      height={imgHeight}
      priority={priority}
      className={`w-auto object-contain ${variant === "name" ? "h-10" : "h-8"} ${className}`}
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
