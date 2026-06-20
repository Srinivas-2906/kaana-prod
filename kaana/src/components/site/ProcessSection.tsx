'use client';

export default function ProcessSection() {
  return (
    <>
      
          <section id="process" className="py-20 md:py-32">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mb-16">
                <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block reveal-up">How We Work</span>
                <h2 className="text-3xl md:text-5xl text-neutral-100 font-display font-medium mb-6 reveal-up" style={{ transitionDelay: "0.1s" }}>
                  Our development process
                </h2>
                <p className="text-neutral-400 max-w-2xl reveal-up" style={{ transitionDelay: "0.2s" }}>
                  We follow a structured yet flexible approach to deliver exceptional results for every project
                </p>
              </div>
      
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                <div className="process-timeline">
                  
                  <div className="process-step active" data-step="1">
                    <span className="text-xs uppercase tracking-widest text-accent mb-2 block">Step 01</span>
                    <h3 className="text-2xl text-neutral-100 font-display font-medium mb-3">Discovery & Research</h3>
                    <p className="text-neutral-400 mb-6">
                      We begin by deeply understanding your business, goals, challenges, and vision through collaborative workshops and research.
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Discovery" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium">Collaborative Workshops</div>
                        <div className="text-sm text-neutral-400">Stakeholder Interviews</div>
                      </div>
                    </div>
                    <div className="border border-neutral-800 rounded-sm p-4 bg-dark/50">
                      <div className="text-sm text-neutral-400">
                        <i className="fas fa-quote-left text-accent mr-2 opacity-50"></i>
                        The discovery phase sets the foundation for success by aligning our understanding with your vision.
                      </div>
                    </div>
                  </div>
                  
                  
                  <div className="process-step" data-step="2">
                    <span className="text-xs uppercase tracking-widest text-accent mb-2 block">Step 02</span>
                    <h3 className="text-2xl text-neutral-100 font-display font-medium mb-3">Strategy & Planning</h3>
                    <p className="text-neutral-400 mb-6">
                      We develop a comprehensive roadmap that outlines the technical approach, timeline, and resources needed for success.
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Strategy" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium">Strategic Planning</div>
                        <div className="text-sm text-neutral-400">Roadmap Development</div>
                      </div>
                    </div>
                    <div className="border border-neutral-800 rounded-sm p-4 bg-dark/50">
                      <div className="text-sm text-neutral-400">
                        <i className="fas fa-quote-left text-accent mr-2 opacity-50"></i>
                        A well-defined strategy ensures efficient execution and alignment with business objectives.
                      </div>
                    </div>
                  </div>
                  
                  
                  <div className="process-step" data-step="3">
                    <span className="text-xs uppercase tracking-widest text-accent mb-2 block">Step 03</span>
                    <h3 className="text-2xl text-neutral-100 font-display font-medium mb-3">Design & Prototyping</h3>
                    <p className="text-neutral-400 mb-6">
                      Our designers create intuitive, visually stunning interfaces that align with your brand and enhance user engagement.
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Design" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium">UX/UI Design</div>
                        <div className="text-sm text-neutral-400">Prototyping & Testing</div>
                      </div>
                    </div>
                    <div className="border border-neutral-800 rounded-sm p-4 bg-dark/50">
                      <div className="text-sm text-neutral-400">
                        <i className="fas fa-quote-left text-accent mr-2 opacity-50"></i>
                        Design is not just how it looks, but how it works. We focus on both aesthetics and functionality.
                      </div>
                    </div>
                  </div>
                  
                  
                  <div className="process-step" data-step="4">
                    <span className="text-xs uppercase tracking-widest text-accent mb-2 block">Step 04</span>
                    <h3 className="text-2xl text-neutral-100 font-display font-medium mb-3">Development</h3>
                    <p className="text-neutral-400 mb-6">
                      Our expert developers bring the designs to life using cutting-edge technologies and best coding practices.
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Development" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium">Agile Development</div>
                        <div className="text-sm text-neutral-400">Iterative Implementation</div>
                      </div>
                    </div>
                    <div className="border border-neutral-800 rounded-sm p-4 bg-dark/50">
                      <div className="text-sm text-neutral-400">
                        <i className="fas fa-quote-left text-accent mr-2 opacity-50"></i>
                        We build with scalability, performance, and maintainability in mind for long-term success.
                      </div>
                    </div>
                  </div>
                  
                  
                  <div className="process-step" data-step="5">
                    <span className="text-xs uppercase tracking-widest text-accent mb-2 block">Step 05</span>
                    <h3 className="text-2xl text-neutral-100 font-display font-medium mb-3">Launch & Optimization</h3>
                    <p className="text-neutral-400 mb-6">
                      We rigorously test, deploy, and continuously optimize your solution to ensure ongoing success and improvement.
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Launch" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium">Deployment & Testing</div>
                        <div className="text-sm text-neutral-400">Continuous Improvement</div>
                      </div>
                    </div>
                    <div className="border border-neutral-800 rounded-sm p-4 bg-dark/50">
                      <div className="text-sm text-neutral-400">
                        <i className="fas fa-quote-left text-accent mr-2 opacity-50"></i>
                        Launch is just the beginning. We continuously optimize for peak performance and user satisfaction.
                      </div>
                    </div>
                  </div>
                </div>
                
                
                <div className="relative">
                  <div className="sticky top-32">
                    <div className="border border-neutral-800 rounded-sm overflow-hidden">
                      <div className="relative aspect-square">
                        <img id="processImage" src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Discovery Phase" className="w-full h-full object-cover transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-70"></div>
                        <div className="absolute bottom-0 left-0 p-6">
                          <span id="processStepLabel" className="inline-block text-xs uppercase tracking-widest text-accent mb-2">Step 01</span>
                          <h3 id="processStepTitle" className="text-2xl text-neutral-100 font-display font-medium">Discovery & Research</h3>
                        </div>
                      </div>
                    </div>
                    
                    
                    <div className="flex justify-between mt-6">
                      <div className="flex gap-2">
                        <button className="process-nav-btn w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent transition-colors" data-direction="prev">
                          <i className="fas fa-arrow-left text-sm"></i>
                        </button>
                        <button className="process-nav-btn w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent transition-colors" data-direction="next">
                          <i className="fas fa-arrow-right text-sm"></i>
                        </button>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="process-dot-btn w-3 h-3 rounded-full bg-neutral-800 hover:bg-accent transition-colors active" data-step="1"></button>
                        <button className="process-dot-btn w-3 h-3 rounded-full bg-neutral-800 hover:bg-accent transition-colors" data-step="2"></button>
                        <button className="process-dot-btn w-3 h-3 rounded-full bg-neutral-800 hover:bg-accent transition-colors" data-step="3"></button>
                        <button className="process-dot-btn w-3 h-3 rounded-full bg-neutral-800 hover:bg-accent transition-colors" data-step="4"></button>
                        <button className="process-dot-btn w-3 h-3 rounded-full bg-neutral-800 hover:bg-accent transition-colors" data-step="5"></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
    </>
  );
}
