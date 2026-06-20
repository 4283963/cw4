# 互联网医院电子处方管理系统

基于 **Vue3 + Element Plus** 前端 + **Node.js (Koa2) + PostgreSQL** 后端的电子处方管理系统，核心实现**处方多级审核模块**与**合理用药提示模块**。

---

## 一、核心功能

### 1. 处方多级审核模块
| 功能 | 说明 |
|------|------|
| **一级审核（一审）** | 药师对医生开具的处方进行首次审核，审核处方规范性、适应症、用法用量等 |
| **二级审核（二审）** | 主管药师对一审通过的处方进行复核，重点关注高风险用药、特殊人群用药 |
| **状态机流转** | 草稿 → 待一审 → 一审通过 → 待二审 → 二审通过 / 驳回 |
| **审核记录留痕** | 每步审核记录审核人、审核时间、审核意见、配伍检测结果，全程可追溯 |

### 2. 合理用药提示模块
| 功能 | 说明 |
|------|------|
| **药物配伍冲突检测** | 自动对处方中的所有药物两两配对，检测配伍禁忌表中是否有冲突记录 |
| **黄色弹窗警告** | 检测到警告级冲突时，前端立即弹出黄色警告对话框，展示冲突详情与建议 |
| **阻止通过审核** | 检测到严重级（danger）配伍冲突时，禁用「通过审核」按钮，必须驳回或修改处方 |
| **冲突分级管理** | 两级严重程度：`warning`（警告，药师判断后可通过）、`danger`（严重，强制禁止通过） |
| **证据与建议** | 每条冲突包含冲突类型、描述、证据来源、处理建议，辅助药师决策 |

---

## 二、项目目录结构

```
cw4/
├── backend/                           # 后端 (Koa2 + PostgreSQL + Sequelize)
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js                     # Koa 入口，全局中间件
│       ├── config/
│       │   ├── index.js               # 常量配置（状态、审核类型、严重度等）
│       │   └── database.js            # Sequelize 数据库连接配置
│       ├── models/
│       │   ├── index.js               # 模型关联关系
│       │   ├── Drug.js                # 药品模型
│       │   ├── Prescription.js        # 处方主表模型
│       │   ├── PrescriptionItem.js    # 处方明细表模型
│       │   ├── DrugConflict.js        # 配伍禁忌表模型
│       │   └── ReviewRecord.js        # 审核记录表模型
│       ├── services/
│       │   ├── prescriptionService.js # 处方 CRUD 服务
│       │   ├── reviewService.js       # 一/二审审核服务（核心业务逻辑）
│       │   ├── drugConflictService.js # 配伍冲突检测服务（核心算法）
│       │   └── drugService.js         # 药品服务
│       ├── controllers/
│       │   ├── prescriptionController.js
│       │   ├── reviewController.js
│       │   ├── drugConflictController.js
│       │   └── drugController.js
│       ├── routes/
│       │   ├── index.js               # 路由总入口
│       │   ├── prescription.js        # 处方 & 审核相关路由
│       │   ├── drug.js                # 药品路由
│       │   └── drugConflict.js        # 配伍禁忌路由
│       └── database/
│           └── init.js                # 数据库初始化 + 测试数据脚本
│
└── frontend/                          # 前端 (Vue3 + Element Plus + Vite)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js                    # Vue 应用入口
        ├── App.vue                    # 主布局（顶部栏 + 侧边栏 + 内容区）
        ├── router/
        │   └── index.js               # Vue Router 路由配置
        ├── api/
        │   ├── prescription.js        # 处方相关 API 封装
        │   └── drug.js                # 药品 & 配伍 API 封装
        ├── utils/
        │   ├── request.js             # Axios 拦截器封装
        │   └── constants.js           # 前端常量
        ├── components/
        │   ├── DrugConflictAlert.vue  # ⭐ 合理用药警告弹窗组件（核心）
        │   └── ReviewPanel.vue        # ⭐ 审核面板（处方列表+详情+审核操作）
        └── views/
            ├── Dashboard.vue          # 工作台 & 数据统计
            ├── prescriptions/
            │   ├── PrescriptionList.vue   # 处方列表页
            │   └── PrescriptionDetail.vue # 处方详情页
            ├── review/
            │   ├── FirstReview.vue        # 一审页面
            │   └── SecondReview.vue       # 二审页面
            ├── DrugList.vue               # 药品目录
            └── DrugConflictList.vue       # 配伍禁忌维护
```

---

## 三、快速开始

### 环境要求
- Node.js ≥ 16.x
- PostgreSQL ≥ 13.x
- npm / pnpm / yarn

### 1. 后端启动

```bash
# 1. 进入后端目录
cd backend

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 修改数据库连接信息

# 4. 确保 PostgreSQL 已启动并创建数据库
#    CREATE DATABASE prescription_system;

# 5. 初始化数据库（创建表 + 插入测试数据）
npm run init-db

# 6. 启动开发服务器
npm run dev
# 服务将运行在 http://localhost:3000
```

### 2. 前端启动

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# 服务将运行在 http://localhost:5173
```

### 3. 访问系统
- 打开浏览器访问：`http://localhost:5173`
- 默认登录用户：陈药师（主管药师），可进行一、二审操作

---

## 四、预置测试数据说明

执行 `npm run init-db` 后将自动插入以下测试数据，方便直接体验功能：

### 药品（8 种）
阿莫西林胶囊、头孢克肟分散片、布洛芬缓释胶囊、阿司匹林肠溶片、奥美拉唑肠溶胶囊、氯雷他定片、盐酸二甲双胍缓释片、硝苯地平控释片

### 配伍冲突（5 条，覆盖两档严重程度）
| 药品A | 药品B | 类型 | 严重程度 | 说明 |
|-------|-------|------|----------|------|
| 阿莫西林 | 头孢克肟 | 重复用药 | ⚠️ 警告 | 均为β内酰胺类，可能增加耐药 |
| 布洛芬 | 阿司匹林 | 配伍禁忌 | 🔴 严重 | 增加胃肠道出血风险，严禁联用 |
| 阿莫西林 | 奥美拉唑 | 药物相互作用 | ⚠️ 警告 | 影响吸收，建议间隔服用 |
| 布洛芬 | 硝苯地平 | 药物相互作用 | ⚠️ 警告 | 可能降低降压效果 |
| 二甲双胍 | 布洛芬 | 药物相互作用 | ⚠️ 警告 | 增加乳酸酸中毒风险 |

### 处方（5 条，覆盖各状态）
- **钱七（类风湿+高血压）**：`布洛芬+阿司匹林+硝苯地平`，含**严重配伍禁忌**（布洛芬+阿司匹林），用于测试**阻止审核通过**功能
- **李四（高血压+糖尿病）**：`硝苯地平+二甲双胍+布洛芬`，含警告级冲突
- **赵六（胃溃疡+HP感染）**：`阿莫西林+奥美拉唑`，待二审
- **张三（上感+发热）**：`阿莫西林+布洛芬`，待一审
- **王五（荨麻疹）**：`氯雷他定+奥美拉唑`，一审通过，无冲突

---

## 五、核心 API 接口

### 处方接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/prescriptions` | 分页查询处方列表（支持多条件筛选） |
| GET  | `/api/prescriptions/:id` | 获取处方详情（含自动配伍检测结果） |
| POST | `/api/prescriptions` | 开具新处方 |
| PUT  | `/api/prescriptions/:id` | 修改草稿/驳回的处方 |
| POST | `/api/prescriptions/:id/submit-review` | 提交处方进入一审流程 |

### 审核接口（多级审核核心）
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/prescriptions/:id/first-review` | **一审**：通过/驳回，含配伍检测拦截 |
| POST | `/api/prescriptions/:id/second-review` | **二审**：通过/驳回，含配伍检测拦截 |
| GET  | `/api/prescriptions/:id/review-records` | 获取处方的完整审核记录 |
| GET  | `/api/prescriptions/statistics` | 获取审核统计数据 |

### 合理用药接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/prescriptions/:id/check-conflicts` | 对指定处方执行配伍检测 |
| POST | `/api/drug-conflicts/check` | 传入 drugIds 数组直接检测 |
| GET  | `/api/drug-conflicts` | 查询配伍禁忌规则库 |
| POST | `/api/drug-conflicts` | 新增配伍禁忌规则 |

---

## 六、配伍冲突检测算法说明

核心实现在 `backend/src/services/drugConflictService.js`：

```
算法流程：
1. 取出处方中所有药物的 drugId 列表，长度 < 2 直接返回无冲突
2. 双层循环对所有药物两两组合：O(n²)
3. 对每组 (drugA, drugB)，双向查询 drug_conflicts 表：
   WHERE (drugAId=A AND drugBId=B) OR (drugAId=B AND drugBId=A)
4. 累加冲突结果，分别统计 danger 和 warning 的数量
5. 返回：{ hasConflicts, conflicts, dangerCount, warningCount, hasDanger }
```

**前后端双重拦截机制**：
1. **前端**：选择处方后即显示冲突状态，`danger` 级别直接禁用「通过」按钮
2. **前端**：点击「通过」时，若存在冲突，先弹窗警告，药师确认后才继续
3. **后端**：`reviewService` 中再次独立调用检测接口，保证安全性
4. **后端**：存在 `hasDanger` 时返回 400 错误，状态不流转

---

## 七、关键技术点

| 领域 | 选择 | 理由 |
|------|------|------|
| ORM | Sequelize v6 | Node.js 生态成熟的 PostgreSQL ORM，支持事务、模型关联 |
| 状态流转 | 枚举 + Service 校验 | 防止越权审核，仅允许合法状态流转 |
| 数据一致性 | 数据库事务 | 审核操作（更新处方 + 写入审核记录）在同一事务中 |
| 前端构建 | Vite 5 | 开发体验好，启动速度快 |
| UI 组件 | Element Plus | Vue3 生态中最成熟的企业级组件库 |
| 状态共享 | Pinia / Computed | 轻量级，审核面板中实时计算冲突状态 |
| 弹窗交互 | 自定义 DrugConflictAlert 组件 | 可区分 warning/danger，交互与样式独立封装 |

---

## 八、体验流程建议

1. 启动前后端服务，初始化数据库
2. 进入【工作台】查看统计卡片与配伍冲突说明
3. 进入【处方一审】，点击左侧待审处方，查看患者信息与药品详情
4. 选择「钱七」的处方 → 发现配伍检查出现**严重配伍禁忌**红色提示 → 「通过审核」按钮被禁用 → 只能填写意见后驳回
5. 选择「张三」的处方 → 配伍检测通过 → 点击通过 → 流转到待二审
6. 进入【处方二审】，选择「赵六」的处方 → 发现警告级冲突（阿莫西林+奥美拉唑）→ 点击通过，弹出黄色警告框 → 药师确认后点击「已知晓，继续操作」→ 完成二审
7. 进入【处方管理】查看处方状态变化，点击处方编号查看完整详情、审核步骤、审核意见
