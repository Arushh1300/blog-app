import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { User, Mail, Link as LinkIcon, Camera, Loader2, Save } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    avatar_url: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userBlogs, setUserBlogs] = useState([]);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          // Fetch profile details matching strict rule
          let { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (!profileData && !profileError) {
             const { error: insertError } = await supabase.from('profiles').insert({ id: user.id, name: user.email });
             if (!insertError) profileData = { name: user.email, avatar_url: '', bio: '' };
          }
          
          if (profileData) {
            setProfile(profileData);
          }

          // Fetch user's blogs
          const { data: blogsData } = await supabase
            .from('blogs')
            .select('*')
            .eq('user_id', user.id);
            
          if (blogsData) {
            setUserBlogs(blogsData);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionAndProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        updated_at: new Date()
      });

      if (error) throw error;
      
      toast.success('Profile updated securely!');
    } catch (error) {
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <span className="text-[15px] font-semibold tracking-wide animate-pulse">Loading profile data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Account Settings Form */}
      <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100/80 bg-white/50 backdrop-blur-md">
          <h2 className="text-[18px] font-extrabold text-gray-900 tracking-tight">Public Profile</h2>
          <p className="text-[13.5px] font-medium text-gray-500 mt-1">Manage exactly how you appear across the blog platform.</p>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="p-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="relative group shrink-0">
              <div className="h-28 w-28 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[14px] font-bold text-gray-700">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-[15px] font-medium transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[14px] font-bold text-gray-700">Email Address (Read-Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="email" 
                      disabled
                      value={user?.email || ''} 
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 text-gray-500 rounded-xl text-[15px] font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[14px] font-bold text-gray-700">Avatar Image URL</label>
                <div className="relative">
                  <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="url" 
                    value={profile.avatar_url} 
                    onChange={(e) => setProfile(prev => ({ ...prev, avatar_url: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-[15px] font-medium transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[14px] font-bold text-gray-700">Author Bio</label>
                <textarea 
                  value={profile.bio} 
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-[15px] font-medium transition-all resize-none"
                  placeholder="Tell your readers a little about yourself..."
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[15px] shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:transform-none"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>

      {/* User's Blogs Presentation */}
      <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100/80 bg-white/50 backdrop-blur-md">
           <h2 className="text-[18px] font-extrabold text-gray-900 tracking-tight">Your Authored Blogs</h2>
        </div>
        <div className="p-8">
           {userBlogs.length === 0 ? (
             <div className="text-center py-8 text-gray-500 font-medium">
               You haven't authored any blogs via this profile ID yet!
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {userBlogs.map(blog => (
                 <div key={blog.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                   <h4 className="font-bold text-gray-900 line-clamp-1">{blog.title}</h4>
                   <p className="text-sm font-semibold text-blue-600 mt-1">{blog.category}</p>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

    </div>
  );
};

export default Profile;
