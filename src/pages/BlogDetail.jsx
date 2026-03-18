import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Heart, Calendar, Loader2, MessageSquare, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Comments and User states
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user || null;
        setCurrentUser(user);

        const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
        if (error) throw error;
        
        if (data) {
           setBlog({
             ...data,
             date: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
             views: (data.views || 0) + 1
           });

           // Fetch Total Likes
           const { count: totalLikes } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('blog_id', id);
           setLikeCount(totalLikes || 0);

           // Fetch User Has Liked
           if (user) {
             const { data: likeData } = await supabase.from('likes').select('id').eq('blog_id', id).eq('user_id', user.id).single();
             setIsLiked(!!likeData);
           }

           // Fetch Comments (Try joining profiles to get names, otherwise just get raw comments)
           const { data: commentsData } = await supabase
             .from('comments')
             .select('*, profiles(name, avatar_url)')
             .eq('blog_id', id)
             .order('created_at', { ascending: false });
           
           if (commentsData) setComments(commentsData);
        }
      } catch (error) {
        console.error('Error fetching blog details:', error.message);
        toast.error('Showing dummy blog (API Error)');
        setBlog({
          id, title: 'Why React and Vite are the Future', category: 'Technology', image: '/blog1.png',
          content: 'This is fallback content because the Supabase API key was rejected.\n\nVite maps modules properly and uses blazing fast HMR...', date: 'Today', views: 1205
        });
        setLikeCount(45);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    if (!currentUser) {
      return toast.error("Please sign in to like this story.");
    }

    const wasLiked = isLiked;
    // Optimistic UI update
    setIsLiked(!wasLiked);
    setLikeCount(prev => prev + (wasLiked ? -1 : 1));

    try {
      if (wasLiked) {
        const { error } = await supabase.from('likes').delete().match({ user_id: currentUser.id, blog_id: id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('likes').insert({ user_id: currentUser.id, blog_id: id });
        if (error) throw error;
      }
    } catch (error) {
      toast.error('Failed to update like status: ' + error.message);
      // Revert UI Update
      setIsLiked(wasLiked);
      setLikeCount(prev => prev + (wasLiked ? 1 : -1));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error("Please sign in to comment.");
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const { data, error } = await supabase.from('comments').insert({
        blog_id: id,
        user_id: currentUser.id,
        content: newComment.trim()
      }).select('*, profiles(name, avatar_url)').single();
      
      if (error) throw error;
      
      setComments([data, ...comments]);
      setNewComment('');
      toast.success('Comment published!');
    } catch (error) {
      toast.error('Failed to post comment: ' + error.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Delete your comment securely?")) {
      try {
        const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', currentUser.id);
        if (error) throw error;
        
        setComments(comments.filter(c => c.id !== commentId));
        toast.success('Comment removed.');
      } catch (error) {
        toast.error('Failed to delete comment: ' + error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <span className="text-[15px] font-semibold tracking-wide animate-pulse">Loading story details...</span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Blog Not Found</h2>
        <p className="text-gray-500 mb-8 font-medium">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 lg:px-8 py-12 md:py-24 animate-in fade-in duration-700 ease-out">
      
      <Link to="/" className="inline-flex items-center justify-center h-10 w-10 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300 mb-12" title="Back to Articles">
        <ArrowLeft className="h-4 w-4" />
      </Link>

      {/* Header Info */}
      <div className="mb-12 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
          <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide shadow-sm">
            {blog.category}
          </span>
          <span className="flex items-center text-[14px] font-semibold text-gray-500">
            <Calendar className="h-4 w-4 mr-2" /> {blog.date}
          </span>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-gray-900 leading-[1.05] mb-10">
          {blog.title}
        </h1>

        <div className="flex items-center justify-center md:justify-start py-5 gap-8 border-t border-b border-gray-200/60 mb-12">
           <button 
             onClick={handleLike}
             className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-300 font-bold active:scale-95 ${isLiked ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:shadow-sm'}`}
           >
             <Heart className={`h-5 w-5 transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : 'hover:scale-110'}`} />
             <span className="text-[15px]">{likeCount} Likes</span>
           </button>
           <div className="text-[15px] font-bold text-gray-400">
             {blog.views || 0} Views
           </div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.image && (
        <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-gray-100 mb-16 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
          <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg md:prose-xl max-w-none text-gray-800 leading-loose font-serif prose-p:mb-8 hover:prose-a:text-blue-600 selection:bg-blue-100 selection:text-blue-900">
        {blog.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Discussion/Comments Section */}
      <div className="mt-20 pt-16 border-t border-gray-100 mb-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h2 className="text-[26px] font-extrabold text-gray-900 tracking-tight">Discussion ({comments.length})</h2>
        </div>

        {/* Comment Form */}
        {currentUser ? (
          <form onSubmit={handleAddComment} className="mb-12">
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300 overflow-hidden">
               <textarea 
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 className="w-full bg-transparent p-5 outline-none resize-none font-medium text-gray-800 text-[15px] placeholder-gray-400"
                 rows={3}
                 placeholder="Share your thoughts on this article..."
                 disabled={isSubmittingComment}
               />
               <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-100 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="flex items-center gap-2 bg-gray-900 text-white hover:bg-black px-5 py-2.5 rounded-xl text-[14px] font-bold shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                  >
                    {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Publish Comment
                  </button>
               </div>
            </div>
          </form>
        ) : (
          <div className="mb-12 p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium mb-4">Want to join the conversation?</p>
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in to leave a comment</Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group p-6 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 overflow-hidden border border-gray-200">
                    {comment.profiles?.avatar_url ? (
                      <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                    ) : (
                      <UserInitials name={comment.profiles?.name || 'U'} />
                    )}
                  </div>
                  <div>
                    <h5 className="text-[15px] font-bold text-gray-900">{comment.profiles?.name || 'Anonymous User'}</h5>
                    <p className="text-[12px] font-semibold text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {currentUser && currentUser.id === comment.user_id && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                    title="Delete your comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-gray-700 text-[15px] leading-relaxed font-medium">
                {comment.content}
              </p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-400 italic text-center py-6">No comments yet. Be the first to start the discussion!</p>
          )}
        </div>
      </div>

    </article>
  );
};

const UserInitials = ({ name }) => <span>{name[0].toUpperCase()}</span>;

export default BlogDetail;
