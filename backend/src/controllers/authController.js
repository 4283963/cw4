const User = require('../models/user');
const { generateToken } = require('../middlewares/auth');
const { USER_ROLE_LABEL } = require('../config');

class AuthController {
  async login(ctx) {
    const { username, password } = ctx.request.body;

    if (!username || !password) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '用户名和密码不能为空',
        data: null
      };
      return;
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '用户不存在',
        data: null
      };
      return;
    }

    if (user.status !== 'active') {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: '该账号已被禁用，请联系管理员',
        data: null
      };
      return;
    }

    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '密码错误',
        data: null
      };
      return;
    }

    const token = generateToken(user);

    ctx.body = {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        roleLabel: USER_ROLE_LABEL[user.role],
        department: user.department,
        title: user.title
      }
    };
  }

  async getProfile(ctx) {
    ctx.body = {
      ...ctx.state.user,
      roleLabel: USER_ROLE_LABEL[ctx.state.user.role]
    };
  }

  async logout(ctx) {
    ctx.body = { message: '登出成功' };
  }

  async listUsers(ctx) {
    const users = await User.findAll({
      attributes: ['id', 'username', 'realName', 'role', 'department', 'title', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    ctx.body = users;
  }
}

module.exports = new AuthController();
