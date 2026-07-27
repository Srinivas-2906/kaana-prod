'use client';

import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function SolutionsSection() {
  return (
    <>
      
          <section id="solutions" className="py-20 md:py-32">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl">
                <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block reveal-up">Our Solutions</span>
                <h2 className="text-3xl md:text-5xl text-neutral-100 font-display font-medium mb-12 reveal-up" style={{ transitionDelay: "0.1s" }}>
                  Digital solutions<br />for modern challenges
                </h2>
              </div>
      
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="ai-feature-card p-8 card-hover stagger-item">
                  <div className="ai-feature-icon mb-6">
                    <Icon name="laptop-code" className="text-2xl text-accent" />
                  </div>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-3">Web Design</h3>
                  <p className="text-neutral-400 mb-6">
                    Create stunning, responsive websites that captivate your audience and drive conversions with our expert design team.
                  </p>
                  <Link href="/services" className="text-sm text-accent flex items-center link-trigger group">
                    Learn more
                    <Icon name="arrow-right" className="text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
                
                
                <div className="ai-feature-card p-8 card-hover stagger-item">
                  <div className="ai-feature-icon mb-6">
                    <Icon name="mobile" className="text-2xl text-accent" />
                  </div>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-3">App Development</h3>
                  <p className="text-neutral-400 mb-6">
                    Build powerful, intuitive mobile applications for iOS and Android that enhance user engagement and satisfaction.
                  </p>
                  <Link href="/services" className="text-sm text-accent flex items-center link-trigger group">
                    Learn more
                    <Icon name="arrow-right" className="text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
                
                
                <div className="ai-feature-card p-8 card-hover stagger-item">
                  <div className="ai-feature-icon mb-6">
                    <Icon name="robot" className="text-2xl text-accent" />
                  </div>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-3">Chatbot Solutions</h3>
                  <p className="text-neutral-400 mb-6">
                    Implement intelligent chatbots that enhance customer service, answer queries 24/7, and streamline operations.
                  </p>
                  <Link href="/services/whatsapp-business-automation" className="text-sm text-accent flex items-center link-trigger group">
                    Learn more
                    <Icon name="arrow-right" className="text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
                
                
                <div className="ai-feature-card p-8 card-hover stagger-item">
                  <div className="ai-feature-icon mb-6">
                    <Icon name="cart" className="text-2xl text-accent" />
                  </div>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-3">E-commerce</h3>
                  <p className="text-neutral-400 mb-6">
                    Create powerful online stores with seamless checkout experiences, inventory management, and payment processing.
                  </p>
                  <Link href="/services" className="text-sm text-accent flex items-center link-trigger group">
                    Learn more
                    <Icon name="arrow-right" className="text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
                
                
                <div className="ai-feature-card p-8 card-hover stagger-item">
                  <div className="ai-feature-icon mb-6">
                    <Icon name="bullhorn" className="text-2xl text-accent" />
                  </div>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-3">Digital & Print Marketing</h3>
                  <p className="text-neutral-400 mb-6">
                    Multimedia(photo & video) advertising, graphic design, drive growth through strategic SEO, content marketing, social media campaigns, and paid advertising strategies.
                  </p>
                  <Link href="/services" className="text-sm text-accent flex items-center link-trigger group">
                    Learn more
                    <Icon name="arrow-right" className="text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
                
                
                <div className="ai-feature-card p-8 card-hover stagger-item">
                  <div className="ai-feature-icon mb-6">
                    <Icon name="chart" className="text-2xl text-accent" />
                  </div>
                  <h3 className="text-xl text-neutral-100 font-display font-medium mb-3">Analytics & Insights</h3>
                  <p className="text-neutral-400 mb-6">
                    Gain valuable insights from your data with advanced analytics solutions that help you make informed business decisions.
                  </p>
                  <Link href="/services/multi-tenant-saas-gcp" className="text-sm text-accent flex items-center link-trigger group">
                    Learn more
                    <Icon name="arrow-right" className="text-xs ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
    </>
  );
}
