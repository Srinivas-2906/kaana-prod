import type { ComponentProps } from "react";

type IconName =
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "chevron-left"
  | "chevron-right"
  | "x"
  | "check"
  | "code"
  | "database"
  | "laptop-code"
  | "mobile"
  | "robot"
  | "cart"
  | "bullhorn"
  | "chart"
  | "quote-left"
  | "paper-plane"
  | "briefcase"
  | "instagram"
  | "whatsapp";

type IconProps = Omit<ComponentProps<"svg">, "children"> & {
  name: IconName;
  title?: string;
};

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function Icon({ name, className, title, ...props }: IconProps) {
  const labelled = Boolean(title);
  const mergedClassName = ["ui-icon", className].filter(Boolean).join(" ");
  const shared = {
    className: mergedClassName,
    role: labelled ? "img" : "presentation",
    "aria-hidden": labelled ? undefined : true,
    "aria-label": labelled ? title : undefined,
    ...props,
  };

  switch (name) {
    case "arrow-right":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M5 12h14" />
          <path {...common} d="M13 6l6 6-6 6" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M19 12H5" />
          <path {...common} d="M11 6l-6 6 6 6" />
        </svg>
      );
    case "arrow-up":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M12 19V5" />
          <path {...common} d="M5 12l7-7 7 7" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M15 18l-6-6 6-6" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M9 18l6-6-6-6" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M18 6L6 18" />
          <path {...common} d="M6 6l12 12" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "code":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M16 18l6-6-6-6" />
          <path {...common} d="M8 6l-6 6 6 6" />
        </svg>
      );
    case "database":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <ellipse {...common} cx="12" cy="5" rx="8" ry="3" />
          <path {...common} d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
          <path {...common} d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case "laptop-code":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <rect {...common} x="3" y="4" width="18" height="12" rx="2" />
          <path {...common} d="M2 20h20" />
          <path {...common} d="M10 9l-2 2 2 2" />
          <path {...common} d="M14 9l2 2-2 2" />
        </svg>
      );
    case "mobile":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <rect {...common} x="7" y="2" width="10" height="20" rx="2" />
          <path {...common} d="M11 18h2" />
        </svg>
      );
    case "robot":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M12 2v3" />
          <rect {...common} x="5" y="6" width="14" height="12" rx="3" />
          <path {...common} d="M8.5 12h.01" />
          <path {...common} d="M15.5 12h.01" />
          <path {...common} d="M9 16h6" />
        </svg>
      );
    case "cart":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M6 6h15l-1.5 9H7.5L6 6Z" />
          <path {...common} d="M6 6l-2-2" />
          <path {...common} d="M9 20h.01" />
          <path {...common} d="M18 20h.01" />
        </svg>
      );
    case "bullhorn":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M4 11v2a2 2 0 0 0 2 2h1l3 4h2l-1.5-4H18l2-3V7l-2-3H6a2 2 0 0 0-2 2v5Z" />
          <path {...common} d="M20 9l2 1-2 1" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M4 19V5" />
          <path {...common} d="M4 19h16" />
          <path {...common} d="M7 14l4-4 3 3 5-6" />
        </svg>
      );
    case "quote-left":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path {...common} d="M10 11H6V7h4v8H6" />
          <path {...common} d="M18 11h-4V7h4v8h-4" />
        </svg>
      );
    case "paper-plane":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path
            {...common}
            d="M22 2 11 13"
          />
          <path
            {...common}
            d="M22 2 15 22l-4-9-9-4 20-7Z"
          />
        </svg>
      );
    case "briefcase":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <rect {...common} x="3" y="7" width="18" height="13" rx="2" />
          <path {...common} d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <path {...common} d="M3 13h18" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="4.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="17.15" cy="6.85" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path
            fill="currentColor"
            stroke="none"
            d="M12.04 2c-5.43 0-9.85 4.41-9.85 9.84 0 1.74.46 3.43 1.33 4.92L2 22l5.39-1.41a9.86 9.86 0 0 0 4.65 1.18h.01c5.43 0 9.86-4.41 9.86-9.84C21.9 6.41 17.47 2 12.04 2zm5.58 13.86c-.29.82-1.48 1.56-2.05 1.66-.52.09-1.2.13-1.94-.12-.45-.15-.99-.35-1.71-.68-3.01-1.3-4.97-4.35-5.12-4.56-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.04-2.49.27-.3.59-.38.79-.38.2 0 .4 0 .57.01.18 0 .43-.07.67.51.24.59.82 2.01.89 2.16.07.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.32-.13.62.18.31.81 1.34 1.74 2.17 1.2 1.07 2.21 1.4 2.52 1.56.31.16.49.14.67-.08.18-.22.77-.9.98-1.21.21-.31.42-.26.71-.16.29.1 1.84.87 2.16 1.03.32.16.53.24.61.37.08.13.08.76-.21 1.58z"
          />
        </svg>
      );
    default:
      return null;
  }
}

