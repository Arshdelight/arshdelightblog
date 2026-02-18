import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center py-24">
      <h1 className="text-3xl md:text-5xl font-bold font-['Outfit',sans-serif] text-[#164E63] mb-8">
        欢迎来到 Arshdelight 博客
      </h1>
      <p className="text-xl text-[#164E63]/80 max-w-2xl mx-auto mb-12">
        发现精彩内容，探索创意世界
      </p>
      <Link 
        to="/blog?user=詹涵" 
        className="inline-block px-8 py-4 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors text-lg"
      >
        进入博客
      </Link>
    </div>
  );
};

export default Home;