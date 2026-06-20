const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const { USER_ROLE } = require('../config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '登录账号'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码（bcrypt加密）'
  },
  realName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '真实姓名'
  },
  role: {
    type: DataTypes.ENUM,
    values: Object.values(USER_ROLE),
    allowNull: false,
    defaultValue: USER_ROLE.PHARMACIST,
    comment: '用户角色'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '所属科室/部门'
  },
  title: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '职称'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'disabled'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['username'] }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.verifyPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = User;
