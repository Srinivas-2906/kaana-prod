'use client';

export default function AiChatWidget() {
  return (
    <>
      
        <div className="ai-chat-widget">
          <div className="ai-chat-button" id="aiChatButton">
            <i className="fas fa-robot text-xl"></i>
          </div>
          <div className="ai-chat-panel" id="aiChatPanel">
            <div className="ai-chat-header">
              <div>Kāna AI Assistant</div>
              <div className="ai-chat-close" id="aiChatClose">×</div>
            </div>
            <div className="ai-chat-messages" id="aiChatMessages">
              <div className="ai-message ai-message-bot">
                Hello! I'm Kāna's AI assistant. How can I help you today?
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
