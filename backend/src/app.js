require('dotenv').config();
const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

const sequelize = require('./config/database');
const router = require('./routes');

const app = new Koa();
const PORT = process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || '服务器内部错误',
      data: null
    };
  }
});

app.use(async (ctx, next) => {
  await next();
  if (ctx.body && typeof ctx.body === 'object' && !('success' in ctx.body)) {
    ctx.body = {
      success: true,
      message: '操作成功',
      data: ctx.body
    };
  }
});

app.use(router.routes()).use(router.allowedMethods());

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');
    await sequelize.sync({ alter: false });
    console.log('✓ 数据库模型同步完成');
    app.listen(PORT, () => {
      console.log(`✓ 服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ 启动失败:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
