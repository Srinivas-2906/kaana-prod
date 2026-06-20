'use client';

export default function ContactSection() {
  return (
    <>
      
          <section id="contact" className="py-20 md:py-32">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                  <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block reveal-up">Contact Us</span>
                  <h2 className="text-3xl text-neutral-100 md:text-5xl font-display font-medium mb-6 reveal-up" style={{ transitionDelay: "0.1s" }}>
                    Let's start a project together
                  </h2>
                  <p className="text-neutral-400 mb-8 reveal-up" style={{ transitionDelay: "0.2s" }}>
                    Reach out to discuss how our minimalist, cutting-edge solutions can transform your business.
                  </p>
                  
                  <div className="space-y-8 mb-12">
                    <div className="flex items-start reveal-up" style={{ transitionDelay: "0.3s" }}>
                      <div className="w-12 h-12 flex items-center justify-center mr-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#00D4FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="#00D4FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-100 mb-1">Location</h3>
                        <p className="text-neutral-400"> Balaji plaza, 39-8-77/7, near Haritha Park, Muralinagar, Madhavadhara, Visakhapatnam, Andhra Pradesh 530007</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start reveal-up" style={{ transitionDelay: "0.4s" }}>
                      <div className="w-12 h-12 flex items-center justify-center mr-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="#00D4FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-100 mb-1">Email</h3>
                        <p className="text-neutral-400">kaana.srinivas@gmail.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start reveal-up" style={{ transitionDelay: "0.5s" }}>
                      <div className="w-12 h-12 flex items-center justify-center mr-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 5.5C3 14.0604 9.93959 21 18.5 21C18.8862 21 19.2691 20.9859 19.6483 20.9581C20.0359 20.9296 20.3999 20.7347 20.6219 20.4281L22.4 17.8C22.6424 17.4622 22.608 17.0191 22.3126 16.7236L19.2222 13.6332C18.9268 13.3378 18.4837 13.3034 18.146 13.5459L16.0282 15.0634C14.6752 14.4813 13.4096 13.4722 12.3419 12.1634C11.2742 10.8545 10.5239 9.40371 10.1466 7.97125L12.0126 6.10526C12.3504 5.76749 12.3848 5.32441 12.0894 5.02901L8.99894 1.93852C8.70355 1.64312 8.26046 1.60867 7.9227 1.95105L5.57175 3.94737C5.2396 4.23809 5.0518 4.66289 5.04201 5.10668C5.01424 5.56727 5 6.03015 5 6.5" stroke="#00D4FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-100 mb-1">Phone</h3>
                        <p className="text-neutral-400">+91 9008747926</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="reveal-up" style={{ transitionDelay: "0.6s" }}>
                    <h3 className="font-medium text-neutral-100 mb-4">Follow Us</h3>
                    <div className="flex gap-4">
                      <a href="#" className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger">
                        <i className="fab fa-twitter"></i>
                      </a>
                      <a href="#" className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger">
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                      <a href="#" className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger">
                        <i className="fab fa-instagram"></i>
                      </a>
                      <a href="#" className="w-10 h-10 border border-neutral-800 rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors link-trigger">
                        <i className="fab fa-github"></i>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="reveal-up" style={{ transitionDelay: "0.4s" }}>
                  <form id="contactForm" className="border border-neutral-800 rounded-sm p-8">
                    <h3 className="text-xl text-neutral-100 font-display font-medium mb-6">Send us a message</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="name" className="block text-sm mb-2">Your Name</label>
                        <input type="text" id="name" name="name" className="w-full bg-transparent border border-neutral-800 rounded-sm p-3 focus:border-accent focus:outline-none transition-colors" placeholder="Enter your name" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm mb-2">Email Address</label>
                        <input type="email" id="email" name="email" className="w-full bg-transparent border border-neutral-800 rounded-sm p-3 focus:border-accent focus:outline-none transition-colors" placeholder="Enter your email" />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="subject" className="block text-sm mb-2">Subject</label>
                      <input type="text" id="subject" name="subject" className="w-full bg-transparent border border-neutral-800 rounded-sm p-3 focus:border-accent focus:outline-none transition-colors" placeholder="Enter subject" />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="message" className="block text-sm mb-2">Message</label>
                      <textarea id="message" name="message" className="w-full bg-transparent border border-neutral-800 rounded-sm p-3 h-32 focus:border-accent focus:outline-none transition-colors" placeholder="Enter your message"></textarea>
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-full">
                      Send Message
                      <i className="fas fa-arrow-right text-xs ml-2 btn-icon"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
    </>
  );
}
