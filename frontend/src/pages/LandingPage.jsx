import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';

export default function LandingPage() {
  const token = sessionStorage.getItem('token');

  // React Hooks MUST be called at the top level before any early return!
  useEffect(() => {
    // Inject Fonts
    const font1 = document.createElement('link');
    font1.rel = 'stylesheet';
    font1.href = 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(font1);

    const font2 = document.createElement('link');
    font2.rel = 'stylesheet';
    font2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(font2);

    // Inject Tailwind CDN
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
      document.head.appendChild(script);
    }
  }, []);

  // AUTO-REDIRECT: If user is logged in, redirect to /dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md fixed top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-xl shadow-lg text-white">
              <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Collab<span className="text-blue-500">Lance</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#about" className="hover:text-blue-400 transition-colors">About Us</a>
            <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
          </div>

          {/* Auth CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all active:scale-95">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="pt-36 pb-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center flex-grow">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Enterprise Freelance Collaboration Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight mb-6">
          Connect, Hire & Collaborate with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Top Freelance Talent</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Post projects, discover verified talent, and manage work seamlessly with real-time group chat and Kanban task tracking.
        </p>

        {/* Dual Call to Actions (CTAs) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mb-16">
          <Link 
            to="/register" 
            className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all text-center flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Hire a Freelancer</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          
          <Link 
            to="/register" 
            className="flex-1 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold rounded-xl transition-all text-center flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Earn Money Freelancing</span>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl">
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">10+</h3>
            <p className="text-xs text-slate-400 font-medium">Active Freelancers</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">5+</h3>
            <p className="text-xs text-slate-400 font-medium">Projects Completed</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">₹21k+ </h3>
            <p className="text-xs text-slate-400 font-medium">Earned by Talent</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">99.8%</h3>
            <p className="text-xs text-slate-400 font-medium">Client Satisfaction</p>
          </div>
        </div>
      </header>

      {/* 3. HOW IT WORKS (DUAL WORKFLOWS) */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-900/50 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">How CollabLance Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Designed specifically for seamless interactions between Clients and Freelancers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* For Clients */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
              <div>
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                  <span className="material-symbols-outlined text-[28px]">business_center</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">For Clients & Businesses</h3>
                <p className="text-slate-400 mb-6 text-sm">Post job requirements, evaluate bids, and build dedicated teams with real-time collaboration.</p>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2">✓ Post detailed project budgets & skills needed</li>
                  <li className="flex items-center gap-2">✓ Review proposals and hire with 1-click</li>
                  <li className="flex items-center gap-2">✓ Track work visually with Kanban boards</li>
                </ul>
              </div>
              <Link to="/register" className="text-blue-400 font-semibold text-sm hover:underline flex items-center gap-1">
                <span>Start Hiring Now</span> →
              </Link>
            </div>

            {/* For Freelancers */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
              <div>
                <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
                  <span className="material-symbols-outlined text-[28px]">laptop_mac</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">For Freelancers</h3>
                <p className="text-slate-400 mb-6 text-sm">Discover high-paying client contracts, submit competitive bids, and collaborate directly.</p>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2">✓ Search projects filtered by category & budget</li>
                  <li className="flex items-center gap-2">✓ Submit proposals with custom cover letters</li>
                  <li className="flex items-center gap-2">✓ Group chat directly with project team members</li>
                </ul>
              </div>
              <Link to="/register" className="text-indigo-400 font-semibold text-sm hover:underline flex items-center gap-1">
                <span>Find Projects Now</span> →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PLATFORM FEATURES */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-3">Integrated Collaboration Suite</h2>
          <p className="text-slate-400">Everything your team needs to deliver projects on time.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="material-symbols-outlined text-blue-500 text-[36px] mb-4">view_kanban</span>
            <h4 className="text-xl font-bold text-white mb-2">Kanban Task Board</h4>
            <p className="text-slate-400 text-sm">Organize tasks across TODO, IN PROGRESS, TESTING, and COMPLETED stages easily.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="material-symbols-outlined text-indigo-500 text-[36px] mb-4">forum</span>
            <h4 className="text-xl font-bold text-white mb-2">Team Discussion Chat</h4>
            <p className="text-slate-400 text-sm">Group message room with avatars and dynamic sender labels for transparent communication.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="material-symbols-outlined text-cyan-500 text-[36px] mb-4">shield</span>
            <h4 className="text-xl font-bold text-white mb-2">Microservices Security</h4>
            <p className="text-slate-400 text-sm">Powered by Spring Cloud Gateway, Eureka service discovery, and JWT encryption.</p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER & CONTACT SECTION */}
      <footer id="contact" className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 px-6 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 flex items-center justify-center rounded-xl text-white">
                <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
              </div>
              <span className="text-2xl font-bold text-white">CollabLance</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              The complete enterprise freelancing collaboration platform. Connecting clients and talented freelancers worldwide.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h5 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Quick Links</h5>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Platform Features</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Client Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register Account</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h5 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Contact Us</h5>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[18px]">mail</span>
                <span>support@collablance.com</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[18px]">call</span>
                <span>+91-6307527450</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[18px]">location_on</span>
                <span>infoway cdac</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h5 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Stay Connected</h5>
            <p className="text-xs text-slate-400 mb-3">Subscribe to get updates on top projects and freelance tips.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to newsletter!'); }} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email" 
                required 
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-full"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-lg font-semibold transition-colors">
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 CollabLance Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Security</a>
          </div>
        </div>
      </footer>

    </div>
  );
}