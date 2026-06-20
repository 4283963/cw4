const jwt = require('jsonwebtoken');
const { USER_ROLE } = require('../config');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'prescription_system_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const authenticate = async (ctx, next) => {
  const authHeader = ctx.headers.authorization || ctx.headers.Authorization;

  if (!authHeader) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: '未提供认证凭证，请先登录',
      data: null
    };
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: '认证凭证格式错误，应为 Bearer <token>',
      data: null
    };
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({
      where: { id: decoded.id, status: 'active' }
    });

    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '用户不存在或已被禁用，请重新登录',
        data: null
      };
      return;
    }

    ctx.state.user = {
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role,
      department: user.department,
      title: user.title
    };

    await next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '登录已过期，请重新登录',
        data: null
      };
    } else {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '无效的认证凭证，请重新登录',
        data: null
      };
    }
  }
};

const requireRole = (...allowedRoles) => {
  return async (ctx, next) => {
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '请先登录',
        data: null
      };
      return;
    }

    if (!allowedRoles.includes(ctx.state.user.role)) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: `权限不足：当前角色 ${ctx.state.user.role} 无权执行此操作（需要：${allowedRoles.join('/')}）`,
        data: null
      };
      return;
    }

    await next();
  };
};

module.exports = {
  generateToken,
  authenticate,
  requireRole,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
