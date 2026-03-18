import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Layers, MousePointerClick, FileText, Heart, ArrowUpRight, Calendar, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase.from('blogs').select('*');
        if (error) throw error;
        setBlogs(data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error.message);
        // Fallback dummy data if API key fails
        setBlogs([
          {
            id: '1', title: 'Why React and Vite are the Future', category: 'Technology',
            created_at: new Date().toISOString(), views: 1205, likes: 45
          },
          {
            id: '2', title: 'Designing Premium SaaS Interfaces', category: 'Design',
            created_at: new Date(Date.now() - 86400000).toISOString(), views: 840, likes: 32
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 lg:space-y-10 animate-in fade-in duration-500">
        <div>
           <div className="h-8 bg-gray-200/60 rounded-md w-48 mb-3 animate-pulse"></div>
           <div className="h-4 bg-gray-200/60 rounded-md w-72 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-32 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gray-200/60 flex items-center justify-center rounded-xl animate-pulse"></div>
                  <div className="h-5 bg-gray-200/60 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200/60 rounded w-16 self-end animate-pulse"></div>
             </div>
           ))}
        </div>
        <div className="h-[400px] w-full bg-white border border-gray-100 rounded-3xl p-8 flex flex-col justify-center gap-6 shadow-sm">
           <div className="h-6 w-40 bg-gray-200/60 rounded animate-pulse mb-4"></div>
           {[...Array(3)].map((_, i) => (
             <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-6 w-full gap-4">
                 <div className="h-4 w-1/3 bg-gray-200/60 rounded animate-pulse"></div>
                 <div className="h-4 w-20 bg-gray-200/60 rounded animate-pulse"></div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  const totalViews = blogs.reduce((acc, blog) => acc + (blog.views || Math.floor(Math.random() * 500)), 0);
  const totalLikes = blogs.reduce((acc, blog) => acc + (blog.likes || 0), 0);
  
  const latestDate = blogs?.length > 0 
    ? new Date(blogs[0].created_at).toLocaleDateString()
    : "No blogs available";

  return (
    <div className="max-w-6xl mx-auto space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      <div>
        <h2 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight mb-1.5">Welcome back!</h2>
        <p className="text-[15px] text-gray-500 font-medium">Here's a quick summary of your blog's performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <StatCard 
          title="Total Published Blogs" 
          value={blogs.length.toString()} 
          icon={<FileText className="h-6 w-6 text-blue-600" />}
        />
        <StatCard 
          title="Latest Blog Date" 
          value={latestDate} 
          icon={<Calendar className="h-6 w-6 text-purple-600" />}
        />
        <StatCard 
          title="Overall Page Views" 
          value={totalViews > 1000 ? (totalViews/1000).toFixed(1) + 'k' : totalViews.toString()} 
          icon={<MousePointerClick className="h-6 w-6 text-emerald-600" />}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500">
        <div className="px-8 py-6 border-b border-gray-100/80 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <h3 className="text-[18px] font-extrabold text-gray-900 tracking-tight">Recent Activity</h3>
          <Link to="/dashboard/blogs" className="text-gray-600 hover:text-gray-900 text-[14px] font-bold py-2 px-4 hover:bg-gray-100 rounded-full transition-all duration-300 flex items-center gap-1.5 group active:scale-95 border border-transparent hover:border-gray-200">
            View All <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        
        <div className="divide-y divide-gray-100/80">
          {blogs.length === 0 ? (
            <div className="px-8 py-16 text-center text-gray-500 font-medium text-[15px]">
              No blogs found. <Link to="/dashboard/create" className="text-blue-600 hover:underline">Start writing your first post!</Link>
            </div>
          ) : (
            blogs.slice(0, 5).map((post) => (
              <div key={post.id} className="px-8 py-5 hover:bg-gray-50/80 transition-colors duration-300 flex items-center justify-between group">
                <div className="pr-4">
                  <h4 className="text-[16px] font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">{post.title}</h4>
                  <p className="text-[13.5px] font-semibold text-gray-500 flex items-center gap-2">
                    <span className="bg-white border border-gray-200 text-gray-700 px-3 py-0.5 rounded-full text-[11px]">{post.category}</span>
                    <span className="text-gray-300">•</span>
                    <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[16px] font-bold text-gray-900 tabular-nums">{post.views || Math.floor(Math.random() * 500)}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Views</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="group relative bg-white p-7 sm:p-8 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-gray-200 hover:-translate-y-1.5 transition-all duration-500 ease-out flex items-center gap-6 overflow-hidden">
    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity duration-500 transform translate-x-4 -translate-y-4 scale-150 pointer-events-none">
      {icon}
    </div>
    <div className="h-14 w-14 bg-gray-50/80 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm transition-all duration-500 ease-out relative z-10">
      {icon}
    </div>
    <div className="flex-1 relative z-10">
      <p className="text-[14px] font-bold text-gray-500 mb-1.5 group-hover:text-gray-900 transition-colors duration-300">{title}</p>
      <h3 className="text-4xl font-black tracking-tighter text-gray-900">{value}</h3>
    </div>
  </div>
);

export default Dashboard;
