import Link from 'next/link';
import { Sparkles, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="md:col-span-1 space-y-4">
         <Link href="/" className="flex items-center gap-2">
  {/* Logo Image Container */}
  <div className="w-8 h-8 overflow-hidden flex items-center justify-center ">
    <img 
      src="images/logo.png" 
      alt="CareSync Logo" 
      className="w-full h-full object-contain" 
    />
  </div>
  {/* Brand Name */}
  <span className="text-xl font-bold text-slate-900">Service<span className="text-orange-600">Hub</span></span>
</Link>
          <p className="text-sm text-slate-600 leading-relaxed">
            Making home maintenance effortless with trusted professionals and seamless technology.
          </p>
        </div>

        {/* Links Columns */}
        {[
          { title: "Services", links: ["Cleaning", "Repairs", "Beauty", "Installation"] },
          { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
          { title: "Legal", links: ["Privacy", "Terms", "Security"] }
        ].map((section) => (
          <div key={section.title}>
            <h4 className="font-semibold text-slate-900 mb-4">{section.title}</h4>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">© 2026 CareSync. All rights reserved.</p>
        <div className="flex gap-6 text-slate-400">
          <Facebook className="w-5 h-5 hover:text-slate-900 cursor-pointer transition-colors" />
          <Instagram className="w-5 h-5 hover:text-slate-900 cursor-pointer transition-colors" />
          <Twitter className="w-5 h-5 hover:text-slate-900 cursor-pointer transition-colors" />
        </div>
      </div>
    </footer>
  );
}