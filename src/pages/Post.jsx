import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '../services/SupabaseClient';
import ReactMarkdown from 'react-markdown';

const Post = () => {
  const params = useParams();
  const slug = params.slug;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log('Params:', params);
  console.log('Slug:', slug);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching post with slug:', slug);

        // 从后端数据库中查询文章
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single();

        console.log('Fetch result:', { data, error: fetchError });

        if (fetchError) {
          throw fetchError;
        }

        // 如果文章有作者ID，查询作者信息
        if (data.author_id) {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.author_id)
            .single();
          
          if (authorData) {
            data.profiles = { username: authorData.username };
          }
        }

        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message || '获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div>
        <Link to="/" className="inline-flex items-center text-[#0891B2] hover:text-[#0E7490] transition-colors font-medium mb-8">
          ← 返回首页
        </Link>
        <h2 className="text-2xl font-bold font-['Outfit',sans-serif] text-[#164E63] mb-4">加载中...</h2>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div>
        <Link to="/" className="inline-flex items-center text-[#0891B2] hover:text-[#0E7490] transition-colors font-medium mb-8">
          ← 返回首页
        </Link>
        <h2 className="text-2xl font-bold font-['Outfit',sans-serif] text-[#164E63] mb-4">文章不存在</h2>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center text-[#0891B2] hover:text-[#0E7490] transition-colors font-medium mb-8">
        ← 返回首页
      </Link>
      
      <article className="bg-white p-8 md:p-12 rounded-lg border border-[#22D3EE]/20 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold font-['Outfit',sans-serif] text-[#164E63] mb-6">{post.title}</h1>
        <div className="flex items-center text-sm text-[#164E63]/60 mb-8 pb-6 border-b border-[#22D3EE]/10">
          <span>{new Date(post.created_at).toISOString().split('T')[0]}</span>
          <span className="mx-2">·</span>
          <span>{post.profiles?.username || '未知作者'}</span>
        </div>
        <div className="prose max-w-none prose-[#164E63] prose-headings:font-['Outfit',sans-serif] prose-headings:text-[#164E63] prose-p:text-lg prose-p:leading-relaxed prose-ul:space-y-2 prose-ul:list-disc prose-ul:pl-6">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default Post;