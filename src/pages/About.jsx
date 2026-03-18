const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] flex flex-col justify-center items-center text-center space-y-16">
      <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom duration-700">
        <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight italic">
          More than <br/> Just a Website.
        </h2>
        <div className="h-2 w-48 bg-blue-600 rounded-full mx-auto" />
        <p className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed max-w-2xl mx-auto px-4">
          A platform built by creators, for creators. We believe every story deserves a beautiful home.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl mt-20">
        <FeatureCard 
          title="Community Driven" 
          description="Built on real stories and real connections. We thrive on the creativity of our community." 
        />
        <FeatureCard 
          title="Creative Freedom" 
          description="A design that lets your words breathe. We provide the tools, you provide the vision."
        />
        <FeatureCard 
          title="Modern Stack" 
          description="Fast, reliable, and secure. Built with the latest tech to ensure your stories reach everyone."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }) => (
  <div className="bg-white/50 backdrop-blur-sm border border-zinc-200/60 p-10 rounded-3xl shadow-xl shadow-zinc-200/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
    <h3 className="text-2xl font-black text-zinc-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic leading-tight">
      {title}
    </h3>
    <p className="text-zinc-500 font-medium leading-relaxed leading-snug">
      {description}
    </p>
  </div>
);

export default About;
