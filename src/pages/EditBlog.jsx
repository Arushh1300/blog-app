import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const EditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
        if (error) throw error;
        
        if (data) {
          setTitle(data.title || '');
          setCategory(data.category || 'Technology');
          setContent(data.content || '');
          setImageUrl(data.image || '');
          setTags(data.tags || '');
        }
      } catch (error) {
        toast.error('Blog not found or error loading!');
        navigate('/dashboard/blogs');
      } finally {
        setIsInitializing(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('blogs').update({
        title,
        category,
        content,
        tags: tags.trim(),
        image: imageUrl.trim() !== '' ? imageUrl : undefined
      }).eq('id', id);

      if (error) throw error;

      toast.success('Blog successfully updated!');
      navigate('/dashboard/blogs');
    } catch (error) {
       toast.error('Error updating blog: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <span className="text-[15px] font-semibold tracking-wide animate-pulse">Loading blog details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/blogs')}
          className="flex items-center text-[14px] font-bold text-gray-500 hover:text-gray-900 active:scale-95 hover:-translate-x-1 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Blogs
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 transition-all duration-200">
        <h2 className="text-[24px] font-bold tracking-tight text-gray-900 mb-8 pb-4 border-b border-gray-100">Edit Blog</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-[14px] font-bold text-gray-700">Blog Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
              />
            </div>

            <div className="space-y-2">
               <label className="block text-[14px] font-bold text-gray-700">Category</label>
               <select
                 value={category}
                 onChange={(e) => setCategory(e.target.value)}
                 disabled={isSubmitting}
                 className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 cursor-pointer appearance-none"
               >
                 <option value="Technology">Technology</option>
                 <option value="Engineering">Engineering</option>
                 <option value="Design">Design</option>
                 <option value="Startup">Startup</option>
                 <option value="Education">Education</option>
                 <option value="Travel">Travel</option>
                 <option value="Culture">Culture</option>
                 <option value="Uncategorized">Uncategorized</option>
               </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[14px] font-bold text-gray-700">Cover Image URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isSubmitting}
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 placeholder-gray-400"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
             {/* Image Preview Block */}
             <div className="col-span-1 md:col-span-2">
               {imageUrl.trim() !== '' ? (
                 <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group">
                   <img src={imageUrl} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = ''; e.target.className = 'hidden';}} />
                   <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/60 to-transparent p-3 hidden group-hover:block transition-all">
                     <p className="text-white text-xs font-bold">Current Image View</p>
                   </div>
                 </div>
               ) : (
                 <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 shadow-sm">
                   <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                   <span className="text-[13px] font-bold">Original placeholder image will be kept.</span>
                 </div>
               )}
            </div>
            
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-[14px] font-bold text-gray-700">Article Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 placeholder-gray-400"
                placeholder="e.g. React, Frontend, Web Development (comma separated)"
                disabled={isSubmitting}
              />
            </div>

          </div>
          
          <div className="space-y-2 pt-2">
            <label className="block text-[14px] font-bold text-gray-700">Content</label>
            <textarea
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              className="block w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 resize-none"
            />
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 sm:gap-4 border-t border-gray-100 flex-wrap">
            <button 
              type="button"
              onClick={() => navigate('/dashboard/blogs')}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-[14.5px] font-bold text-gray-500 hover:text-gray-900 active:scale-95 transition-all disabled:opacity-50"
            >
               Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-[14.5px] font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px] disabled:transform-none"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {isSubmitting ? 'Updating...' : 'Update Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;
