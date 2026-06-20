'use client';

export default function CareersModal() {
  return (
    <>
      
        <div className="fixed inset-0 bg-dark/95 backdrop-blur-md z-50 opacity-0 pointer-events-none transition-opacity duration-500 overflow-y-auto" id="careersModal">
          <div className="min-h-screen py-12 md:py-20 px-6">
            <div className="container mx-auto max-w-6xl">
              
              <button className="fixed top-6 right-6 md:top-12 md:right-12 w-12 h-12 flex items-center justify-center border border-neutral-800 rounded-sm hover:border-accent hover:text-accent transition-colors z-50 careers-close-btn" id="careersCloseBtn">
                <i className="fas fa-times text-xl"></i>
              </button>
      
              
              <div className="text-center mb-12 md:mb-16">
                <span className="text-xs uppercase tracking-widest text-neutral-400 mb-3 block">Join Our Team</span>
                <h2 className="text-3xl text-neutral-100 md:text-5xl font-display font-medium mb-4">
                  Career Opportunities
                </h2>
                <p className="text-neutral-400 max-w-2xl mx-auto">
                  We're looking for talented individuals who share our passion for creating exceptional digital experiences.
                </p>
              </div>
      
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                
                <div className="border border-neutral-800 rounded-sm p-6 md:p-8 card-hover careers-job-card" style={{ opacity: "0", transform: "translateY(30px)" }}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-accent mb-2 block font-medium">Internship</span>
                      <h3 className="text-xl md:text-2xl text-neutral-100 font-display font-medium mb-2">React Frontend Developer</h3>
                      <p className="text-neutral-400 text-sm mb-4">Remote / Visakhapatnam</p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center bg-neutral-900 rounded-sm border border-neutral-800">
                      <i className="fas fa-code text-accent text-xl"></i>
                    </div>
                  </div>
                  
                  <p className="text-neutral-400 mb-6 text-sm">
                    Join our team as a React Frontend Developer Intern and gain hands-on experience building modern web applications. Work on real projects and learn from experienced developers.
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-100 mb-3">What you'll learn:</h4>
                    <ul className="space-y-2 text-sm text-neutral-400">
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>React.js fundamentals and best practices</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Modern JavaScript (ES6+) and TypeScript</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>State management and hooks</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Responsive design and CSS frameworks</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Git workflow and collaboration</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">React</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">JavaScript</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">CSS3</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">Git</span>
                  </div>
                  
                  <a href="#contact" className="btn btn-primary w-full text-center link-trigger careers-apply-btn">
                    Apply Now
                    <i className="fas fa-arrow-right text-xs ml-2 btn-icon"></i>
                  </a>
                </div>
                
                
                <div className="border border-neutral-800 rounded-sm p-6 md:p-8 card-hover careers-job-card" style={{ opacity: "0", transform: "translateY(30px)" }}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-accent mb-2 block font-medium">Internship</span>
                      <h3 className="text-xl md:text-2xl text-neutral-100 font-display font-medium mb-2">React Frontend Developer</h3>
                      <p className="text-neutral-400 text-sm mb-4">Remote / Visakhapatnam</p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center bg-neutral-900 rounded-sm border border-neutral-800">
                      <i className="fas fa-code text-accent text-xl"></i>
                    </div>
                  </div>
                  
                  <p className="text-neutral-400 mb-6 text-sm">
                    Perfect opportunity for aspiring React developers. Work on cutting-edge projects, collaborate with a talented team, and build your portfolio while making a real impact.
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-100 mb-3">Requirements:</h4>
                    <ul className="space-y-2 text-sm text-neutral-400">
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Basic knowledge of HTML, CSS, and JavaScript</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Familiarity with React basics (or willingness to learn)</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Strong problem-solving skills</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Good communication and teamwork</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Passion for web development</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">React</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">JavaScript</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">HTML5</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">CSS3</span>
                  </div>
                  
                  <a href="#contact" className="btn btn-primary w-full text-center link-trigger careers-apply-btn">
                    Apply Now
                    <i className="fas fa-arrow-right text-xs ml-2 btn-icon"></i>
                  </a>
                </div>
                
                
                <div className="border border-neutral-800 rounded-sm p-6 md:p-8 card-hover careers-job-card" style={{ opacity: "0", transform: "translateY(30px)" }}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-accent mb-2 block font-medium">Internship</span>
                      <h3 className="text-xl md:text-2xl text-neutral-100 font-display font-medium mb-2">Database Developer</h3>
                      <p className="text-neutral-400 text-sm mb-4">Remote / Visakhapatnam</p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center bg-neutral-900 rounded-sm border border-neutral-800">
                      <i className="fas fa-database text-accent text-xl"></i>
                    </div>
                  </div>
                  
                  <p className="text-neutral-400 mb-6 text-sm">
                    Join us as a Database Developer Intern and work with modern database technologies. Learn Prisma, database design, and backend development while contributing to real-world projects.
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-100 mb-3">What you'll work with:</h4>
                    <ul className="space-y-2 text-sm text-neutral-400">
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Prisma ORM and database migrations</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>SQL and NoSQL databases</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Database schema design and optimization</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>API development and integration</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-accent mr-2 mt-1 text-xs"></i>
                        <span>Backend development with Node.js</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">Prisma</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">SQL</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">Node.js</span>
                    <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-400">PostgreSQL</span>
                  </div>
                  
                  <a href="#contact" className="btn btn-primary w-full text-center link-trigger careers-apply-btn">
                    Apply Now
                    <i className="fas fa-arrow-right text-xs ml-2 btn-icon"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
