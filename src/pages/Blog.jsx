import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../services/SupabaseClient';

const Blog = () => {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('user');
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // 获取用户资料和文章
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!username) {
        setLoading(false);
        setError('请指定用户');
        return;
      }

      try {
        setLoading(true);
        
        // 步骤1：获取用户资料
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, bio, avatar_url')
          .eq('username', username)
          .single();

        if (profileError) {
          throw new Error('用户不存在');
        }

        setUserProfile(profile);

        // 步骤2：获取用户的文章
        const { data: userPosts, error: postsError } = await supabase
          .from('posts')
          .select('id, title, content, slug, created_at, updated_at')
          .eq('author_id', profile.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (postsError) {
          throw new Error('获取文章失败');
        }

        setPosts(userPosts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [username]);

  if (loading) {
    return <div className="text-center py-16">加载中...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-[#164E63] mb-4">{error}</h2>
        <Link to="/" className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold font-['Outfit',sans-serif] text-[#0891B2] mb-6">
          {userProfile?.username} 的博客
        </h1>
        {userProfile?.bio && (
          <p className="text-lg text-[#164E63]/80 max-w-3xl mx-auto mb-6">
            {userProfile.bio}
          </p>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-[#164E63] mb-4">暂无文章</h2>
          <p className="text-[#164E63]/80 mb-8">该用户还没有发布任何文章</p>
          {session && session.user.id === userProfile?.id && (
            <Link to="/create-post" className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors">
              写文章
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map(post => (
            <article key={post.id} className="bg-white p-8 rounded-lg border border-[#22D3EE]/20 shadow-sm hover:shadow-md transition-all duration-300">
              <Link to={`/post/${post.slug}`} className="hover:no-underline">
                <h3 className="text-2xl font-bold font-['Outfit',sans-serif] text-[#164E63] hover:text-[#0891B2] transition-colors mb-4">
                  {post.title}
                </h3>
              </Link>
              <p className="text-[#164E63]/80 mb-6 line-clamp-3">
                {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
              </p>
              <div className="flex items-center text-sm text-[#164E63]/60">
                <span>{new Date(post.created_at).toLocaleString()}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;