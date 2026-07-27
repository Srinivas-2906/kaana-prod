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
  const shared = {
    className,
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
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <rect {...common} x="6" y="6" width="12" height="12" rx="3" />
          <path {...common} d="M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
          <path {...common} d="M16.5 7.5h.01" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" width="1em" height="1em" {...shared}>
          {labelled ? <title>{title}</title> : null}
          <path
            {...common}
            d="M20 11.5a7.5 7.5 0 0 1-11.7 6.2L4 19l1.3-4.1A7.5 7.5 0 1 1 20 11.5Z"
          />
          <path
            {...common}
            d="M9.2 9.2c.2-.4.3-.4.6-.4h.5c.2 0 .4 0 .5.3l.7 1.7c.1.2.1.5 0 .6l-.4.5c-.1.1-.2.3-.1.5.2.4.6 1 1.1 1.4.5.5 1.2.9 1.6 1 .2.1.3 0 .4-.1l.6-.7c.1-.1.4-.2.6-.1l1.7.8c.3.1.3.3.3.5v.6c0 .2 0 .4-.3.6-.3.3-1 .8-2 .8-1 0-2.2-.4-3.6-1.6-1.4-1.2-2.3-2.7-2.6-3.6-.3-1 .2-1.7.5-2.1Z"
          />
        </svg>
      );
    default:
      return null;
  }
}

