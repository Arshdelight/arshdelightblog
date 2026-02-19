import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Editor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';
import supabase from '../services/SupabaseClient';
import Loading from '../components/Loading';
import PrivateRoute from '../components/PrivateRoute';
import Layout from '../components/Layout';

const EditPost = () => {
  const { session } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // 缓存
  const prevSessionRef = useRef(null);
  const postCacheRef = useRef(null);

  // 加载文章数据
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // 检查是否是文章作者
        if (data.author_id !== session.user.id) {
          throw new Error('你没有权限编辑这篇文章');
        }

        // 更新状态和缓存
        setTitle(data.title);
        setContent(data.content);
        setSlug(data.slug);
        setIsPublished(data.is_published);
        postCacheRef.current = data;
        prevSessionRef.current = session;
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message || '获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    // 检查是否需要重新加载数据
    const shouldReload = !session || 
                       !prevSessionRef.current || 
                       session.user.id !== prevSessionRef.current.user.id ||
                       !postCacheRef.current ||
                       postCacheRef.current.author_id !== session.user.id;

    if (session && id) {
      if (shouldReload) {
        fetchPost();
      } else {
        // 使用缓存数据
        const cachedPost = postCacheRef.current;
        setTitle(cachedPost.title);
        setContent(cachedPost.content);
        setSlug(cachedPost.slug);
        setIsPublished(cachedPost.is_published);
        setLoading(false);
      }
    }
  }, [session, id]);

  // 处理 Markdown 编辑器内容变化
  const handleEditorChange = ({ text }) => {
    setContent(text);
  };

  // 生成 slug
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // 当标题变化时，自动生成 slug
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !slug) {
      setError('请填写完整的文章信息');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      console.log('Updating post:', id);
      console.log('Data to update:', {
        title,
        content,
        slug,
        is_published: isPublished
      });

      // 更新文章
      const { data, error: updateError } = await supabase
        .from('posts')
        .update({
          title,
          content,
          slug,
          is_published: isPublished,
          author_id: session.user.id // 明确包含author_id以满足RLS策略
        })
        .eq('id', id)
        .select()
        .single();

      console.log('Update result:', { data, error: updateError });

      if (updateError) {
        throw updateError;
      }

      setSuccess('文章更新成功！');
      
      // 3秒后跳转到文章页面
      setTimeout(() => {
        navigate(`/post/${data.slug}`);
      }, 3000);
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message || '更新文章失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
        <button
          onClick={() => navigate('/manage-posts')}
          className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors"
        >
          返回管理页面
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-['Outfit',sans-serif] text-[#0891B2] mb-6">
          编辑文章
        </h1>
        <p className="text-lg text-[#164E63]/80 max-w-3xl mx-auto">
          修改你的文章内容
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="mb-6 p-3 bg-green-100 border border-green-300 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-[#22D3EE]/20 shadow-sm">
        {/* 文章标题 */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-[#164E63]/80 mb-2">
            标题
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg focus:outline-none focus:border-[#0891B2] transition-colors"
            placeholder="请输入文章标题"
            required
          />
        </div>

        {/* 文章 Slug */}
        <div className="mb-6">
          <label htmlFor="slug" className="block text-sm font-medium text-[#164E63]/80 mb-2">
            Slug (友好的 URL 路径)
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg focus:outline-none focus:border-[#0891B2] transition-colors"
            placeholder="请输入友好的 URL 路径"
            required
          />
          <p className="text-xs text-[#164E63]/60 mt-1">
            示例: my-first-post
          </p>
        </div>

        {/* 文章内容 */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-[#164E63]/80 mb-2">
            内容
          </label>
          <div className="border border-[#22D3EE]/30 rounded-lg overflow-hidden">
            <Editor
              value={content}
              onChange={handleEditorChange}
              style={{ height: '500px' }}
              renderHTML={(text) => {
                return <ReactMarkdown>{text}</ReactMarkdown>;
              }}
            />
          </div>
        </div>

        {/* 发布状态 */}
        <div className="mb-8">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-[#0891B2] focus:ring-[#0891B2] border-[#22D3EE]/30 rounded"
            />
            <span className="text-sm font-medium text-[#164E63]/80">
              立即发布
            </span>
          </label>
        </div>

        {/* 按钮组 */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/manage-posts')}
            className="px-6 py-3 bg-white border border-[#22D3EE]/30 hover:border-[#0891B2] rounded-lg font-medium transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors"
          >
            {saving ? '保存中...' : '更新文章'}
          </button>
        </div>
      </form>
    </div>
  );
};

const EditPostWithAuth = () => {
  return (
    <PrivateRoute>
      <Layout>
        <EditPost />
      </Layout>
    </PrivateRoute>
  );
};

export default EditPostWithAuth;