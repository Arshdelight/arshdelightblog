import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import supabase from '../services/SupabaseClient';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { signUpNewUser, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }

    if (!username) {
      setError('请输入用户名');
      return;
    }

    if (username.length > 30) {
      setError('用户名长度不能超过 30 个字符');
      return;
    }

    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
      setError('用户名只能包含汉字、英文字母、数字和下划线');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      // 步骤1：检查用户名是否已存在
      const { data: existingProfiles, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .limit(1);

      if (checkError) {
        throw new Error('检查用户名失败');
      }

      if (existingProfiles && existingProfiles.length > 0) {
        setError('用户名已存在，请选择其他用户名');
        return;
      }

      // 步骤2：注册新用户
      const result = await signUpNewUser(email, password, username);
      
      if (result.success) {
        if (result.needsConfirmation) {
          // 显示邮件验证提醒
          setSuccess('注册成功！请检查您的邮箱并点击验证链接以完成注册。');
          // 3秒后跳转到登录页面
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
        } else {
          // 注册成功且自动登录，跳转到首页
          navigate('/');
        }
      } else {
        // 处理具体错误
        if (result.error.includes('username')) {
          setError('用户名已存在，请选择其他用户名');
        } else {
          setError(result.error || '注册失败，请稍后重试');
        }
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setError('注册失败，请稍后重试');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-['Outfit',sans-serif] text-[#0891B2] mb-6">
            注册账号
          </h1>
          <p className="text-lg text-[#164E63]/80">
            创建新账号，开始使用我们的服务
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-[#22D3EE]/20 shadow-sm">
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* 用户名输入 */}
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-[#164E63]/80 mb-2">
                用户名
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg focus:outline-none focus:border-[#0891B2] transition-colors"
                placeholder="请输入用户名"
                required
                autoComplete="off"
              />
              <p className="text-xs text-[#164E63]/60 mt-1">
                用户名只能包含汉字、英文字母、数字和下划线（最多30个字符）
              </p>
            </div>

            {/* 邮箱输入 */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-[#164E63]/80 mb-2">
                邮箱
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg focus:outline-none focus:border-[#0891B2] transition-colors"
                placeholder="请输入邮箱"
                required
                autoComplete="off"
              />
            </div>

            {/* 密码输入 */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-[#164E63]/80 mb-2">
                密码
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg focus:outline-none focus:border-[#0891B2] transition-colors"
                placeholder="请输入密码"
                required
                autoComplete="new-password"
              />
            </div>

            {/* 确认密码输入 */}
            <div className="mb-8">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#164E63]/80 mb-2">
                确认密码
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#ECFEFF] text-[#164E63] border border-[#22D3EE]/30 rounded-lg focus:outline-none focus:border-[#0891B2] transition-colors"
                placeholder="请再次输入密码"
                required
                autoComplete="new-password"
              />
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

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0891B2] hover:bg-[#0E7490] text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                '注册中...'
              ) : (
                '注册'
              )}
            </button>

            {/* 登录链接 */}
            <div className="mt-6 text-center">
              <p className="text-[#164E63]/60">
                已有账号？
                <Link to="/signin" className="text-[#0891B2] ml-1 hover:underline font-medium">
                  立即登录
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;