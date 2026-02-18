import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signInUser, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      const result = await signInUser(email, password);
      
      if (result.success) {
        // 登录成功后跳转到首页
        navigate('/');
      } else {
        setError(result.error || '登录失败，请稍后重试');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-['Outfit',sans-serif] text-[#0891B2] mb-6">
            登录账号
          </h1>
          <p className="text-lg text-[#164E63]/80">
            欢迎回来，请登录您的账号
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-[#22D3EE]/20 shadow-sm">
          <form onSubmit={handleSubmit}>
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
              />
            </div>

            {/* 密码输入 */}
            <div className="mb-8">
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
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0891B2] hover:bg-[#0E7490] text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                '登录中...'
              ) : (
                '登录'
              )}
            </button>

            {/* 注册链接 */}
            <div className="mt-6 text-center">
              <p className="text-[#164E63]/60">
                没有账号？
                <Link to="/signup" className="text-[#0891B2] ml-1 hover:underline font-medium">
                  立即注册
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;