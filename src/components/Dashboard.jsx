import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PrivateRoute from './PrivateRoute';
import Layout from './Layout';
import supabase from '../services/SupabaseClient';
import Loading from './Loading';

const DashboardContent = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    avatar_url: '',
    bio: ''
  });
  
  // 缓存
  const prevSessionRef = useRef(null);
  const profileCacheRef = useRef(null);

  // 获取用户资料
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          throw error;
        }

        // 更新状态和缓存
        setProfile(data);
        setFormData({
          username: data.username || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || ''
        });
        profileCacheRef.current = data;
        prevSessionRef.current = session;
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('获取个人资料失败');
      } finally {
        setLoading(false);
      }
    };

    // 检查是否需要重新加载数据
    const shouldReload = !session?.user?.id || 
                       !prevSessionRef.current?.user?.id || 
                       session.user.id !== prevSessionRef.current.user.id ||
                       !profileCacheRef.current ||
                       profileCacheRef.current.id !== session.user.id;

    if (session?.user?.id) {
      if (shouldReload) {
        fetchProfile();
      } else {
        // 使用缓存数据
        const cachedProfile = profileCacheRef.current;
        setProfile(cachedProfile);
        setFormData({
          username: cachedProfile.username || '',
          avatar_url: cachedProfile.avatar_url || '',
          bio: cachedProfile.bio || ''
        });
        setLoading(false);
      }
    }
  }, [session?.user?.id]);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setError('用户未登录');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // 验证用户名
      if (formData.username.length > 30) {
        setError('用户名长度不能超过 30 个字符');
        return;
      }

      if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(formData.username)) {
        setError('用户名只能包含汉字、英文字母、数字和下划线');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          avatar_url: formData.avatar_url,
          bio: formData.bio
        })
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      setIsEditing(false);
      setSuccess('个人资料更新成功');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.message.includes('username')) {
        setError('用户名已存在，请选择其他用户名');
      } else {
        setError('更新个人资料失败');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold font-['Outfit',sans-serif] text-[#0891B2] mb-6">
          用户仪表盘
        </h1>
        <p className="text-lg text-[#164E63]/80 max-w-3xl mx-auto">
          欢迎回来，这里是您的个人信息中心
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

      <div className="bg-white p-8 rounded-lg border border-[#22D3EE]/20 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-['Outfit',sans-serif] text-[#164E63]">
            个人信息
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors"
            >
              编辑资料
            </button>
          )}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* 用户名输入 */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[#164E63]/80 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg focus:outline-none focus:border-[#0891B2] transition-colors"
                  placeholder="请输入用户名"
                required
              />
              <p className="text-xs text-[#164E63]/60 mt-1">
                  用户名只能包含汉字、英文字母、数字和下划线（最多30个字符）
                </p>
              </div>

              {/* 头像 URL 输入 */}
              <div>
                <label htmlFor="avatar_url" className="block text-sm font-medium text-[#164E63]/80 mb-2">
                  头像 URL
                </label>
                <input
                  type="text"
                  id="avatar_url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg focus:outline-none focus:border-[#0891B2] transition-colors"
                  placeholder="请输入头像 URL（可选）"
                />
              </div>

              {/* 个人简介输入 */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-[#164E63]/80 mb-2">
                  个人简介
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg focus:outline-none focus:border-[#0891B2] transition-colors"
                  placeholder="请输入个人简介（可选）"
                ></textarea>
              </div>

              {/* 邮箱显示（不可编辑） */}
              <div>
                <label className="block text-sm font-medium text-[#164E63]/80 mb-2">
                  邮箱
                </label>
                <div className="px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg">
                  {session?.user?.email || '未设置'}
                </div>
              </div>

              {/* 按钮组 */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: profile?.username || '',
                      avatar_url: profile?.avatar_url || '',
                      bio: profile?.bio || ''
                    });
                  }}
                  className="px-4 py-2 bg-white border border-[#22D3EE]/30 hover:border-[#0891B2] rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? '保存中...' : '保存更改'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#ECFEFF] rounded-lg">
              <span className="text-[#164E63]/80">用户名：</span>
              <span className="text-[#164E63] font-medium">{profile?.username || '未设置'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#ECFEFF] rounded-lg">
              <span className="text-[#164E63]/80">邮箱：</span>
              <span className="text-[#164E63] font-medium">{session?.user?.email || '未设置'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#ECFEFF] rounded-lg">
              <span className="text-[#164E63]/80">头像 URL：</span>
              <span className="text-[#164E63] font-medium">{profile?.avatar_url || '未设置'}</span>
            </div>
            
            <div className="flex items-start justify-between p-4 bg-[#ECFEFF] rounded-lg">
              <span className="text-[#164E63]/80 mt-1">个人简介：</span>
              <span className="text-[#164E63] font-medium max-w-[70%]">{profile?.bio || '未设置'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#ECFEFF] rounded-lg">
              <span className="text-[#164E63]/80">用户 ID：</span>
              <span className="text-[#164E63] font-medium">{session?.user?.id || '未设置'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#ECFEFF] rounded-lg">
              <span className="text-[#164E63]/80">创建时间：</span>
              <span className="text-[#164E63] font-medium">
                {session?.user?.created_at 
                  ? new Date(session.user.created_at).toLocaleString() 
                  : '未设置'
                }
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white p-8 rounded-lg border border-[#22D3EE]/20 shadow-sm">
        <h2 className="text-2xl font-bold font-['Outfit',sans-serif] text-[#164E63] mb-6">账号安全</h2>
        
        <div className="space-y-4">
          <p className="text-[#164E63]/80">
            您的账号已成功登录。为了保护您的账号安全，建议您：
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#164E63]/80">
            <li>定期更换密码</li>
            <li>使用强密码，包含字母、数字和特殊字符</li>
            <li>不要与他人共享您的账号信息</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <PrivateRoute>
      <Layout>
        <DashboardContent />
      </Layout>
    </PrivateRoute>
  );
};

export default Dashboard;