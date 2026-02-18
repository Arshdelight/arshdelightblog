import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children }) => {
  const { session, loading } = useAuth();

  // 正在加载时显示加载提示
  if (loading) {
    return <Loading />;
  }

  // 用户已登录，渲染子组件
  if (session) {
    return children;
  }

  // 用户未登录，重定向到登录页面
  return <Navigate to="/signin" replace />;
};

export default PrivateRoute;