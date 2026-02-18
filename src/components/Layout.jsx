import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { session, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-[#ECFEFF] font-['Work_Sans',sans-serif] text-[#164E63]">
      <header className="py-8 px-4 md:px-6 border-b border-[#22D3EE]/20">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* 左侧：网站标题 */}
          <div>
            <Link to="/" className="hover:no-underline">
              <h1 className="text-3xl md:text-4xl font-bold font-['Outfit',sans-serif] text-[#0891B2]">
                Arshdelight
              </h1>
            </Link>
            <p className="text-lg mt-2 text-[#164E63]/80">分享我的思考与创作</p>
          </div>
          
          {/* 中间：导航链接（仅在中等屏幕及以上显示） */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-lg font-medium text-[#164E63] hover:text-[#0891B2] transition-colors">
              首页
            </Link>
            <Link to="/blog" className="text-lg font-medium text-[#164E63] hover:text-[#0891B2] transition-colors">
              博客
            </Link>
            <Link to="/about" className="text-lg font-medium text-[#164E63] hover:text-[#0891B2] transition-colors">
              关于本站
            </Link>
          </div>
          
          {/* 右侧：登录/注册或仪表盘/登出按钮 */}
          <nav className="mt-4 md:mt-0 flex space-x-4">
            {session ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 bg-white border border-[#22D3EE]/30 hover:border-[#0891B2] rounded-lg font-medium transition-colors">
                  仪表盘
                </Link>
                <Link to="/manage-posts" className="px-4 py-2 bg-white border border-[#22D3EE]/30 hover:border-[#0891B2] rounded-lg font-medium transition-colors">
                  写文章
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="px-4 py-2 bg-white border border-[#22D3EE]/30 hover:border-[#0891B2] rounded-lg font-medium transition-colors">
                  登录
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors">
                  注册
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        {children}
      </main>
      
      <footer className="py-8 px-4 md:px-6 border-t border-[#22D3EE]/20 mt-16">
        <div className="container mx-auto max-w-6xl text-center text-[#164E63]/80">
          <p>© 2026 Arshdelight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;