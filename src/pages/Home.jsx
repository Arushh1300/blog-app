import { ArrowRight, Layout, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="w-full bg-gray-50 min-h-screen font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 pb-24 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 max-w-4xl mb-6 leading-[1.1]">
          Publish your ideas <br className="hidden md:block" /> to the world.
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed font-medium">
          A minimalist publishing platform designed for creators, developers, and writers. No distractions, just your pure content.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4">
          <Link to="/login" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
            Start Writing <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/about" className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-center">
            View Features
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <FeatureCard 
            icon={<Zap className="h-6 w-6 text-blue-600" />}
            title="Lightning Fast"
            desc="Built with React and Vite for a blazing fast writing and reading experience."
          />
          <FeatureCard 
            icon={<Layout className="h-6 w-6 text-blue-600" />}
            title="Clean Interface"
            desc="A distraction-free editor and dashboard designed like modern startup products."
          />
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-blue-600" />}
            title="Secure & Private"
            desc="Your data is saved securely using persistent local storage logic."
          />
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Latest Stories</h2>
          <Link to="/login" className="text-blue-600 font-semibold text-sm hover:underline transition-all">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <BlogPreview
            image="/blog1.png"
            title="Building Scalable Web Apps"
            desc="Learn the fundamentals of structuring large-scale React applications for startup environments."
          />
          <BlogPreview
            image="/blog2.png"
            title="Mastering UI/UX Design"
            desc="Why clean, minimalist interfaces convert better and keep users engaged longer."
          />
          <BlogPreview
            image="/blog3.png"
            title="The Future of Publishing"
            desc="Exploring how platforms like Medium and Hashnode changed the way we write."
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group">
    <div className="h-12 w-12 bg-blue-50/80 ring-1 ring-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100/80 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2.5 tracking-tight group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const BlogPreview = ({ image, title, desc }) => (
  <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer active:scale-[0.98]">
    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden border-b border-gray-100">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform" />
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-2.5 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{title}</h3>
      <p className="text-gray-500 text-[15px] leading-relaxed mb-6 flex-1 line-clamp-3">{desc}</p>
      <div className="flex items-center text-blue-600 text-sm font-bold pt-4 border-t border-gray-50 mt-auto">
        Read story <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
);

export default Home;
