import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Edit, Trash2, Plus, AlertCircle, Search, Heart, ExternalLink, Loader2, ChevronDown, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Search, Filter and Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState(null);
  const [trendingTags, setTrendingTags] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  const categories = ['All', 'Technology', 'Engineering', 'Design', 'Startup', 'Education', 'Travel', 'Culture', 'Uncategorized'];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      // Setup current user
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      // We attempt to fetch blogs with relationship metrics. Wait, Supabase count join might look like `likes(count)` if structured. 
      // Instead of failing if that join structure doesn't perfectly match their DB yet, we just grab normal blogs and manually merge fallback parameters safely.
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          likes:likes (id)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      // Map relation lengths properly
      const formattedData = (data || []).map(b => ({
        ...b,
        date: b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
        excerpt: b.content ? b.content.substring(0, 100) + '...' : '',
        likeCount: b.likes ? b.likes.length : 0,
        hasLiked: session?.user ? (b.likes || []).some(like => like.user_id === session.user.id || like.id) : false,
        tags: b.tags || ''
      }));

      // Extract Trending Tags
      const allTags = formattedData.flatMap(b => (b.tags || '').split(',').map(t => t.trim()).filter(Boolean));
      const tagCounts = allTags.reduce((acc, tag) => { acc[tag] = (acc[tag] || 0) + 1; return acc; }, {});
      const sortedTags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).map(e => e[0]).slice(0, 8);
      
      setTrendingTags(sortedTags);
      setBlogs(formattedData);
      setFilteredBlogs(formattedData);
    } catch (error) {
      console.error('Supabase error:', error.message);
      toast.error('Using offline fallback mode (API Error)');
      
      const fallback = [
          {
            id: '1', title: 'Why React and Vite are the Future', category: 'Technology', image: '/blog1.png',
            excerpt: 'Vite natively supports ES modules...', content: 'Vite maps modules properly and uses blazing fast HMR...', created_at: new Date().toISOString(), views: 1205, likeCount: 45, date: 'Today', tags: 'Performance, Frontend'
          },
          {
            id: '2', title: 'Designing Premium SaaS Interfaces', category: 'Design', image: '/blog2.png',
            excerpt: 'Spacing and typography are exactly...', content: 'In modern design, spacing scales create visual rhythm.', created_at: new Date(Date.now() - 86400000).toISOString(), views: 840, likeCount: 32, date: 'Yesterday', tags: 'UX, Typography'
          }
      ];
      setTrendingTags(['Performance', 'Frontend', 'UX', 'Typography']);
      setBlogs(fallback);
      setFilteredBlogs(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter effect
  useEffect(() => {
    let result = blogs;

    if (selectedCategory !== 'All') {
      result = result.filter(blog => blog.category === selectedCategory);
    }

    if (selectedTag) {
      result = result.filter(blog => (blog.tags || '').toLowerCase().includes(selectedTag.toLowerCase()));
    }

    if (searchTerm.trim() !== '') {
      result = result.filter(blog => 
        (blog.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (blog.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.tags || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBlogs(result);
    setVisibleCount(6); // Reset pagination on new filter
  }, [searchTerm, selectedCategory, selectedTag, blogs]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you certain you want to delete this blog post?')) {
      try {
        const { error } = await supabase.from('blogs').delete().eq('id', id);
        if (error) throw error;
        
        const updatedBlogs = blogs.filter(blog => blog.id !== id);
        setBlogs(updatedBlogs); // Filter useEffect covers the update
        toast.success('Blog deleted successfully!');
      } catch (error) {
        toast.error('Error deleting blog: ' + error.message);
      }
    }
  };

  const handleLike = async (id) => {
    if (!currentUser) return toast.error("Please sign in to like blogs.");

    const blogToUpdate = blogs.find(b => b.id === id);
    if (!blogToUpdate) return;
    
    const wasLiked = blogToUpdate.hasLiked;
    const newCount = wasLiked ? Math.max(0, blogToUpdate.likeCount - 1) : blogToUpdate.likeCount + 1;
    
    // Optimistic UI update
    const updatedBlogs = blogs.map(blog => blog.id === id ? { ...blog, likeCount: newCount, hasLiked: !wasLiked } : blog);
    setBlogs(updatedBlogs);
    
    try {
      if (wasLiked) {
        const { error } = await supabase.from('likes').delete().match({ user_id: currentUser.id, blog_id: id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('likes').insert({ user_id: currentUser.id, blog_id: id });
        if (error) throw error;
      }
    } catch (error) {
      toast.error('Engagement sync error: ' + error.message);
      // Revert on error
      setBlogs(blogs.map(blog => blog.id === id ? { ...blog, likeCount: blogToUpdate.likeCount, hasLiked: wasLiked } : blog));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="h-20 bg-gray-200/60 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm h-96 flex flex-col items-stretch space-y-4">
               <div className="h-44 bg-gray-200/70 rounded-2xl animate-pulse w-full"></div>
               <div className="h-8 bg-gray-200/70 rounded-lg animate-pulse w-3/4"></div>
               <div className="h-4 bg-gray-200/70 rounded-lg animate-pulse w-full"></div>
               <div className="h-4 bg-gray-200/70 rounded-lg animate-pulse w-5/6"></div>
               <div className="mt-auto h-10 w-full flex justify-between pt-4 border-t border-gray-100 items-center">
                 <div className="h-4 bg-gray-200/70 rounded w-16 animate-pulse"></div>
                 <div className="h-8 bg-gray-200/70 rounded-full w-24 animate-pulse"></div>
               </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  // --- Empty State ---
  if (blogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 sm:p-16 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto mt-6 sm:mt-10">
        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-gray-100">
          <AlertCircle className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-[22px] font-bold tracking-tight text-gray-900 mb-2">No blogs found</h2>
        <p className="text-[15px] text-gray-500 mb-8 font-medium max-w-sm">You haven't published any articles yet. Let's create your first piece of content.</p>
        <Link 
          to="/dashboard/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          Create Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 mb-8">
        
        <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full md:max-w-2xl">
          {/* Search Bar */}
          <div className="relative w-full sm:flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
            <input 
              type="text" 
              placeholder="Search stories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-300 hover:bg-white"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-5 pr-12 py-3.5 bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl text-[15px] font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-300 hover:bg-white cursor-pointer appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} {cat === 'All' && 'Categories'}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <Link 
          to="/dashboard/create"
          className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-7 py-3.5 rounded-2xl text-[15px] font-bold shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shrink-0 group"
        >
          <Plus className="h-4 w-4 stroke-[2.5px] group-hover:rotate-90 transition-transform duration-500 ease-out" />
          Write a Story
        </Link>
      </div>

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in duration-700 delay-100">
           <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center">
             <Tag className="h-3.5 w-3.5 mr-1.5" /> Trending
           </span>
           {selectedTag && (
             <button 
               onClick={() => setSelectedTag(null)}
               className="px-3 py-1.5 rounded-full text-[13.5px] font-bold bg-gray-800 text-white shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95 transition-all"
             >
               {selectedTag} &times;
             </button>
           )}
           {trendingTags.filter(t => t !== selectedTag).map(tag => (
             <button
               key={tag}
               onClick={() => setSelectedTag(tag)}
               className="px-3 py-1.5 rounded-full text-[13.5px] font-bold bg-white text-gray-600 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
             >
               {tag}
             </button>
           ))}
        </div>
      )}

      {/* No Results from Filter */}
      {filteredBlogs.length === 0 && (
         <div className="bg-white/50 border border-gray-200/50 border-dashed rounded-2xl p-12 text-center text-gray-500 font-bold mt-8">
            No blogs match your current search constraints.
         </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
        {filteredBlogs.slice(0, visibleCount).map(blog => (
          <div key={blog.id} className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden flex flex-col items-stretch group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-gray-200/80 hover:-translate-y-1.5 transition-all duration-500 ease-out relative">
            
            <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden border-b border-gray-100/50">
              <img 
                src={blog.image} 
                alt={blog.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-gray-800 uppercase tracking-wider shadow-sm border border-white/20">
                {blog.category}
              </div>
              
              {/* Overlay Open Button */}
              <Link to={`/blog/${blog.id}`} target="_blank" className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-blue-600 shadow-sm hover:scale-105" title="Read Article">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="p-6 sm:p-7 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-[19px] font-extrabold text-gray-900 leading-[1.3] line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                  {blog.title}
                </h3>
                {/* Like Button on Card */}
                <button 
                  onClick={() => handleLike(blog.id)}
                  className="flex flex-col items-center justify-center shrink-0 text-gray-400 hover:text-red-500 active:scale-95 transition-all duration-300 group/like mt-1"
                  title={blog.hasLiked ? "Unlike post" : "Like this post"}
                >
                  <Heart className={`h-5 w-5 transition-all duration-300 ${blog.hasLiked ? 'fill-red-500 text-red-500 scale-110' : 'group-hover/like:fill-red-100 group-hover/like:scale-110'}`} />
                  <span className="text-[11px] font-bold mt-1 text-gray-500">{blog.likeCount || 0}</span>
                </button>
              </div>

              <p className="text-gray-500 text-[15px] leading-relaxed mb-8 line-clamp-2 flex-1 font-medium">
                {blog.excerpt}
              </p>
               
               {/* Tags display on card */}
               {blog.tags && (
                 <div className="flex flex-wrap gap-2 mb-8">
                   {blog.tags.split(',').slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 shrink-0">
                        #{tag.trim()}
                      </span>
                   ))}
                 </div>
               )}
               
               <div className="flex items-center justify-between pt-5 border-t border-gray-100/80 mt-auto">
                <span className="text-[13px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">{blog.date}</span>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => navigate(`/dashboard/edit/${blog.id}`)}
                    className="flex items-center gap-1.5 text-[13px] font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-full transition-all duration-300 border border-gray-200 hover:shadow-sm"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(blog.id)}
                    className="flex items-center gap-1.5 text-[13px] font-bold text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-50 px-3 py-1.5 rounded-full transition-all duration-300 border border-red-100 hover:border-red-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* Pagination Load More */}
      {visibleCount < filteredBlogs.length && (
        <div className="flex justify-center mt-12 mb-8">
           <button 
             onClick={() => setVisibleCount(prev => prev + 6)}
             className="bg-white border text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 font-bold px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
           >
             <Loader2 className="h-4 w-4 text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
             Load More Articles
           </button>
        </div>
      )}
    </div>
  );
};

export default MyBlogs;
