'use client';

export default function AiDemoSection() {
  return (
    <>
      
          <section id="ai-demo" className="py-20 md:py-32 bg-dark/80">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mb-16">
                <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block reveal-up">Interactive AI</span>
                <h2 className="text-3xl md:text-5xl text-neutral-100 font-display font-medium mb-6 reveal-up" style={{ transitionDelay: "0.1s" }}>
                  Try our AI in action
                </h2>
                <p className="text-neutral-400 max-w-2xl reveal-up" style={{ transitionDelay: "0.2s" }}>
                  Experience the power of our AI solutions with these interactive demos
                </p>
              </div>
      
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
                
                <div className="ai-demo-container reveal-up" style={{ transitionDelay: "0.3s" }}>
                  <div className="ai-demo-header">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent-secondary flex items-center justify-center">
                        <i className="fas fa-robot text-dark text-xs"></i>
                      </div>
                      <div className="font-medium">AI Text Generator</div>
                    </div>
                  </div>
                  <div className="ai-demo-content">
                    <p className="text-neutral-400 mb-4">Enter a topic or prompt, and our AI will generate content for you.</p>
                    <div className="ai-demo-input">
                      <input type="text" id="textGeneratorInput" placeholder="Enter a topic (e.g., 'Benefits of responsive web design')" />
                      <button id="textGeneratorButton">Generate</button>
                    </div>
                    <div className="ai-demo-output" id="textGeneratorOutput">
                      <p className="text-neutral-400 text-sm">Your AI-generated content will appear here...</p>
                    </div>
                  </div>
                </div>
      
                
                <div className="ai-demo-container reveal-up" style={{ transitionDelay: "0.4s" }}>
                  <div className="ai-demo-header">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent-secondary flex items-center justify-center">
                        <i className="fas fa-comments text-dark text-xs"></i>
                      </div>
                      <div className="font-medium">AI Chatbot Demo</div>
                    </div>
                  </div>
                  <div className="ai-demo-content">
                    <p className="text-neutral-400 mb-4">Ask our chatbot about our services and see how it can help your customers.</p>
                    <div className="ai-chat-messages p-4 border border-neutral-800 rounded-sm bg-dark/30 h-40 overflow-y-auto mb-4" id="demoChatMessages">
                      <div className="ai-message ai-message-bot">
                        Hello! I'm the Kāna demo chatbot. How can I help you today?
                      </div>
                    </div>
                    <div className="ai-demo-input">
                      <input type="text" id="demoChatInput" placeholder="Ask about our web design services..." />
                      <button id="demoChatSend">Send</button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2" id="demoQuickReplies"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
    </>
  );
}
