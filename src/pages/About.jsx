import React from 'react';
import Layout from '../components/Layout';

const About = () => {
  return (
    <Layout>
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-['Outfit',sans-serif] text-[#0891B2] mb-6">
          关于本站
        </h1>
        <p className="text-lg text-[#164E63]/80 max-w-3xl mx-auto">
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-[#22D3EE]/20 shadow-sm">
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-[#164E63] mb-4">关于本网站</h2>
          <p className="mb-4">
            Arshdelight 是一个博客网站，用于分享我的思考、创作和学习心得。
          </p>
          <p className="mb-4">
            网站使用 React、Tailwind CSS 和 Supabase 构建，部署在 Vercel 上。
          </p>
          
          <h2 className="text-xl font-semibold text-[#164E63] mb-4">联系我们</h2>
          <p className="mb-4">
            如果您在使用过程中发现任何 bug，或者有任何建议，欢迎通过以下邮箱联系我们：
          </p>
          <p className="text-lg font-medium text-[#0891B2] mb-6">
            cjhzisme@163.com
          </p>
          
          <h2 className="text-xl font-semibold text-[#164E63] mb-4">版权信息</h2>
          <p>
            © 2026 Arshdelight. All rights reserved.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;