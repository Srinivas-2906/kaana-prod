'use client';

import Image from "next/image";

export default function AiChatWidget() {
  return (
    <>
      
        <div className="ai-chat-widget">
          <div className="ai-chat-button" id="aiChatButton">
            <Image
              src="/logo-only.png"
              alt="Kaana"
              width={28}
              height={28}
              className="object-contain"
              style={{ width: 28, height: 28 }}
            />
          </div>
          <div className="ai-chat-panel" id="aiChatPanel">
            <div className="ai-chat-header">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo-only.png"
                  alt=""
                  width={20}
                  height={20}
                  className="object-contain"
                  style={{ width: 20, height: 20 }}
                  aria-hidden
                />
                <span>Kaana AI Assistant</span>
              </div>
              <div className="ai-chat-close" id="aiChatClose">×</div>
            </div>
            <div className="ai-chat-messages" id="aiChatMessages">
              <div className="ai-message ai-message-bot">
                Hello! I&apos;m Kaana&apos;s AI assistant. How can I help you today?
              </div>
            </div>
            <div className="ai-chat-input">
              <input type="text" placeholder="Type your message..." id="aiChatInput" />
              <button id="aiChatSend">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
    </>
  );
}
