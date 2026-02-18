import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../services/SupabaseClient';

const ManagePosts = () => {
  const { session } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      fetchUserPosts();
    }
  }, [session]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('获取文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (postId, currentStatus) => {
    try {
      console.log('Toggling publish status for post:', postId);
      console.log('Current status:', currentStatus);
      console.log('User ID:', session.user.id);
      
      // 尝试使用最简单的更新方式
      const newStatus = !currentStatus;
      console.log('New status:', newStatus);
      
      // 先获取文章的完整信息，确保我们有所有必要的字段
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      console.log('Post data:', postData);
      
      // 然后更新整个文章对象，只修改is_published字段
      const { data, error } = await supabase
        .from('posts')
        .update({
          ...postData,
          is_published: newStatus
        })
        .eq('id', postId)
        .select();

      console.log('Update result:', { data, error });

      if (error) {
        throw error;
      }

      // 重新获取文章列表，确保显示最新状态
      await fetchUserPosts();
    } catch (err) {
      console.error('Error toggling publish status:', err);
      alert(`更新发布状态失败: ${err.message || '未知错误'}`);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('确定要删除这篇文章吗？')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        throw error;
      }

      // 从本地状态中移除删除的文章
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('删除文章失败');
    }
  };

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        <h2 className="text-2xl font-bold font-['Outfit',sans-serif] text-[#164E63] mb-4">请先登录</h2>
        <Link to="/signin" className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors">
          登录
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        <h2 className="text-2xl font-bold font-['Outfit',sans-serif] text-[#164E63] mb-4">加载中...</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold font-['Outfit',sans-serif] text-[#164E63]">管理文章</h2>
        <button
          onClick={handleCreatePost}
          className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors"
        >
          新建文章
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="p-8 bg-white rounded-lg border border-[#22D3EE]/20 text-center">
          <p className="text-[#164E63]/80">你还没有发表过文章</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="p-6 bg-white rounded-lg border border-[#22D3EE]/20">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-medium text-[#164E63] mb-2">{post.title}</h3>
                  <p className="text-sm text-[#164E63]/60 mb-4">
                    创建于: {new Date(post.created_at).toISOString().split('T')[0]}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to={`/edit-post/${post.id}`}
                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full text-sm font-medium transition-colors"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(post.id, post.is_published)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      post.is_published 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    {post.is_published ? '已发布' : '未发布'}
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-full text-sm font-medium transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <Link 
                  to={`/post/${post.slug}`} 
                  className="text-sm text-[#0891B2] hover:text-[#0E7490] font-medium"
                >
                  查看文章
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagePosts;