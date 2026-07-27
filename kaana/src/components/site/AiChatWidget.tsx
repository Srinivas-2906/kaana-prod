'use client';

import Link from "next/link";
import { useState } from "react";
import { INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/seo/site";
import Icon from "@/components/ui/Icon";

const MARK_SRC = "/logo-mark-white.png";

const ACTIONS = [
  {
    label: "Chat on WhatsApp",
    icon: "whatsapp",
    href: WHATSAPP_URL,
    external: true,
    hint: "Business inquiries & project chat",
  },
  {
    label: "Instagram",
    icon: "instagram",
    href: INSTAGRAM_URL,
    external: true,
    hint: "Follow us for updates",
  },
  {
    label: "View our work",
    icon: "briefcase",
    href: "/work",
    external: false,
    hint: "Case studies & projects",
  },
] as const;

const BRAND_ICON_CLASS: Partial<Record<(typeof ACTIONS)[number]["icon"], string>> = {
  whatsapp: "ai-chat-icon-whatsapp",
  instagram: "ai-chat-icon-instagram",
};

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="ai-chat-widget">
      <button
        type="button"
        className="ai-chat-button"
        aria-label="Open help menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {/* Plain img avoids Next.js optimizer flattening PNG transparency to black */}
        <img
          src={MARK_SRC}
          alt=""
          width={30}
          height={30}
          className="ai-chat-button-mark"
          aria-hidden
        />
      </button>

      <div className={`ai-chat-panel ai-chat-panel-simple ${open ? "active" : ""}`}>
        <div className="ai-chat-header">
          <div className="flex items-center gap-2">
            <img
              src={MARK_SRC}
              alt=""
              width={20}
              height={20}
              className="ai-chat-header-mark"
              aria-hidden
            />
            <span>Kaana</span>
          </div>
          <button
            type="button"
            className="ai-chat-close"
            aria-label="Close help menu"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="ai-chat-messages">
          <div className="ai-message ai-message-bot">
            Hi! We can help you chat about your business on WhatsApp, check our Instagram, or
            explore our work.
          </div>
        </div>

        <div className="ai-chat-actions">
          {ACTIONS.map((action) => {
            const className =
              "ai-chat-action link-trigger flex items-center gap-3 w-full text-left px-4 py-3 rounded-sm border border-neutral-800 hover:border-accent hover:text-accent transition-colors";
            const content = (
              <>
                <span
                  className={[
                    "icon-slot ai-chat-action-icon rounded-sm bg-neutral-900 shrink-0",
                    BRAND_ICON_CLASS[action.icon] ?? "text-accent",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Icon name={action.icon} className="text-[1.125rem]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-100">{action.label}</span>
                  <span className="block text-xs text-neutral-500">{action.hint}</span>
                </span>
                <Icon name="arrow-right" className="text-xs text-neutral-600 ml-auto shrink-0" />
              </>
            );

            if (action.external) {
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={action.label}
                href={action.href}
                className={className}
                onClick={() => setOpen(false)}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
