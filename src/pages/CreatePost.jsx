import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Editor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';
import supabase from '../services/SupabaseClient';
import PrivateRoute from '../components/PrivateRoute';
import Layout from '../components/Layout';
import pinyin from 'pinyin';

const CreatePost = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyModified, setIsSlugManuallyModified] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 处理 Markdown 编辑器内容变化
  const handleEditorChange = ({ text }) => {
    setContent(text);
  };

  // 生成 slug
  const generateSlug = (title) => {
    // 将中文转换为拼音
    const pinyinTitle = pinyin(title, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false
    }).flat().join(' ');
    
    // 生成年月日时间戳
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    
    // 生成 slug
    const slugWithoutTimestamp = pinyinTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    // 组合 slug 和时间戳
    return `${slugWithoutTimestamp}-${timestamp}`;
  };

  // 当标题变化时，自动生成 slug
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugManuallyModified) {
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
      setLoading(true);
      setError(null);
      setSuccess(null);

      // 确保is_published有一个明确的值
      const publishStatus = isPublished !== undefined ? isPublished : false;
      console.log('Creating post with is_published:', publishStatus);
      console.log('User ID:', session.user.id);
      console.log('Post data:', { title, content, slug, is_published: publishStatus });

      // 检查session是否有效
      if (!session || !session.user || !session.user.id) {
        throw new Error('用户会话无效，请重新登录');
      }

      // 尝试使用不同的方式创建文章
      // 先尝试不使用select，直接插入
      const { error: createError } = await supabase
        .from('posts')
        .insert({
          author_id: session.user.id,
          title,
          content,
          slug,
          is_published: publishStatus
        });

      console.log('Create error:', createError);

      if (createError) {
        console.error('Create error details:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        });
        throw createError;
      }

      setSuccess('文章创建成功！');
      console.log('Post created successfully');
      
      // 3秒后跳转到管理文章页面
      setTimeout(() => {
        navigate('/manage-posts');
      }, 3000);
    } catch (err) {
      console.error('Error creating post:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        details: err.details,
        hint: err.hint
      });
      setError(`创建文章失败: ${err.message || '未知错误'} (错误代码: ${err.code || '无'})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-['Outfit',sans-serif] text-[#0891B2] mb-6">
          写文章
        </h1>
        <p className="text-lg text-[#164E63]/80 max-w-3xl mx-auto">
          分享你的思考与创作
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
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugManuallyModified(true);
            }}
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
            onClick={() => navigate('/blog')}
            className="px-6 py-3 bg-white border border-[#22D3EE]/30 hover:border-[#0891B2] rounded-lg font-medium transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors"
          >
            {loading ? '保存中...' : '保存文章'}
          </button>
        </div>
      </form>
    </div>
  );
};

const CreatePostWithAuth = () => {
  return (
    <PrivateRoute>
      <Layout>
        <CreatePost />
      </Layout>
    </PrivateRoute>
  );
};

export default CreatePostWithAuth;