import { Link } from 'react-router-dom';
import { Menu, X, BookOpen } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white border-b border-zinc-200">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-zinc-900 tracking-tight">
              BlogVerse
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Home</Link>
            <Link to="/about" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">About</Link>
            <div className="w-px h-4 bg-zinc-200"></div>
            <Link to="/login" className="text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors">
              Sign in
            </Link>
            <Link to="/login" className="bg-zinc-900 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-black transition-colors">
              Get started
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-zinc-600 hover:text-blue-600 font-medium">Home</Link>
            <Link to="/about" className="block px-3 py-2 text-zinc-600 hover:text-blue-600 font-medium">About</Link>
            <Link to="/login" className="block w-full text-left px-3 py-2 text-blue-600 font-bold italic">
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
