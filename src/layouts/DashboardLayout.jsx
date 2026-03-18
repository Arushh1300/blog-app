import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard, FileText, PenSquare, LogOut, Hexagon, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUser(user);
      
      // Fetch avatar/name from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileData && !profileError) {
        // Auto create profile
        await supabase.from('profiles').insert({ id: user.id, name: user.email });
        setProfile({ name: user.email });
      } else if (profileData) {
        setProfile(profileData);
      }
    };
    
    checkAuth();
    
    // Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out securely');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'My Blogs', path: '/dashboard/blogs', icon: <FileText className="h-5 w-5" /> },
    { name: 'Create Blog', path: '/dashboard/create', icon: <PenSquare className="h-5 w-5" /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User className="h-5 w-5" /> },
  ];

  const getPageTitle = () => {
    if (location.pathname.includes('/edit')) return 'Edit Blog';
    if (location.pathname.includes('/create')) return 'Create Blog';
    if (location.pathname.includes('/profile')) return 'My Profile';
    const match = menuItems.find(i => i.path === location.pathname);
    return match ? match.name : 'Dashboard';
  };

  return (
    <div className="flex bg-gray-50 font-sans text-gray-900 transition-all duration-200">
      
      {/* Left Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-gray-200 shadow-sm z-20 fixed inset-y-0 left-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-100/80">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-gray-900">Workspace</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-95 hover:translate-x-1 ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-500/10'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className={({ isActive }) => isActive ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</div>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 border border-gray-200 mb-3">
             <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[15px] border-2 border-white shadow-sm shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user?.email?.[0]?.toUpperCase() || 'U'
                )}
             </div>
             <div className="overflow-hidden">
                <p className="text-[13px] font-bold text-gray-900 truncate tracking-tight">{profile?.name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-[11px] font-semibold text-gray-500 truncate">{user?.email || 'Creator Account'}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-[14px] font-bold text-gray-500 hover:bg-red-50 hover:text-red-700 active:scale-95 transition-all duration-200 group"
          >
            <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-[260px] bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 md:hidden flex flex-col shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100/80">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Hexagon className="h-5 w-5 text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-gray-900">Workspace</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-95 ${
                  isActive ? 'bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-500/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-[260px] min-h-screen relative">
        {/* Top Header */}
        <header className="h-16 bg-gray-50/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-6 sm:px-10 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-1 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-[18px] font-extrabold tracking-tight text-gray-900">{getPageTitle()}</h1>
          </div>
          
           <Link to="/dashboard/profile" className="h-9 w-9 rounded-full bg-white text-gray-900 flex md:hidden items-center justify-center font-bold text-sm border border-gray-200 shadow-sm overflow-hidden hover:opacity-80 transition-opacity">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                user?.email?.[0]?.toUpperCase() || 'U'
              )}
           </Link>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 w-full p-6 sm:p-8 lg:p-12 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
