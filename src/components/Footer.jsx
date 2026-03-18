import { Facebook, Twitter, Instagram, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-zinc-200 py-12 text-zinc-900 font-sans">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 text-blue-600 mb-6 font-bold text-2xl tracking-tight">
              <span>BlogVerse</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium">
              A space for creative minds to share, explore, and connect through the power of stories.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Twitter className="h-5 w-5" />} href="#" />
              <SocialIcon icon={<Facebook className="h-5 w-5" />} href="#" />
              <SocialIcon icon={<Instagram className="h-5 w-5" />} href="#" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-6 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-4">
              <li><FooterLink text="Features" href="#" /></li>
              <li><FooterLink text="Integrations" href="#" /></li>
              <li><FooterLink text="Pricing" href="#" /></li>
              <li><FooterLink text="Changelog" href="#" /></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-6 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-4">
              <li><FooterLink text="About" href="/about" /></li>
              <li><FooterLink text="Blog" href="#" /></li>
              <li><FooterLink text="Careers" href="#" /></li>
              <li><FooterLink text="Privacy" href="#" /></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-6 text-sm uppercase tracking-wider">Stay Updated</h4>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium">Get the latest stories and product updates delivered to your inbox.</p>
            <form className="relative group">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all placeholder-zinc-400"
              />
              <button className="absolute right-1 top-1 bg-zinc-900 hover:bg-black text-white px-3 py-1.5 rounded text-xs font-medium transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-400 text-sm font-medium">
            © {new Date().getFullYear()} BlogVerse Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <FooterLink text="Terms" href="#" />
            <FooterLink text="Privacy" href="#" />
            <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm transition-all duration-300 font-medium">
              <Globe className="h-4 w-4" />
              English (US)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, href }) => (
  <a 
    href={href} 
    className="h-8 w-8 flex items-center justify-center bg-zinc-50 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors border border-zinc-200"
  >
    {icon}
  </a>
);

const FooterLink = ({ text, href }) => (
  <Link 
    to={href} 
    className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors inline-block"
  >
    {text}
  </Link>
);

export default Footer;
