# 贡献指南

感谢你对画廊应用的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请创建一个 Issue，包含以下信息：

1. **Bug 描述**: 清晰描述问题
2. **复现步骤**: 详细的复现步骤
3. **预期行为**: 你期望发生什么
4. **实际行为**: 实际发生了什么
5. **环境信息**: 浏览器版本、操作系统等
6. **截图**: 如果可能，提供截图

### 提出新功能

如果你有新功能的想法，请创建一个 Issue，包含：

1. **功能描述**: 详细描述新功能
2. **使用场景**: 为什么需要这个功能
3. **实现建议**: 如果有，提供实现思路

### 提交代码

1. **Fork 仓库**

```bash
# Fork 后克隆到本地
git clone https://github.com/your-username/gallery-app.git
cd gallery-app
```

2. **创建分支**

```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 或创建修复分支
git checkout -b fix/your-bug-fix
```

3. **开发和测试**

- 遵循项目的代码规范
- 添加必要的注释（使用中文）
- 确保代码通过测试
- 测试新功能或修复

4. **提交代码**

```bash
git add .
git commit -m "feat: 添加新功能描述"
# 或
git commit -m "fix: 修复Bug描述"
```

提交信息格式：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具变更

5. **推送并创建 Pull Request**

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

## 代码规范

### 通用规范

1. **命名规范**
   - 变量名、函数名使用有意义的名称
   - 布尔变量使用 `is`、`has`、`can`、`should` 等前缀

2. **注释规范**
   - 所有注释使用**中文**
   - 类和公共方法必须有文档注释
   - 复杂逻辑需要添加行内注释

3. **代码质量**
   - 避免深层嵌套（最多 3 层）
   - 函数保持简洁，单一职责
   - 避免重复代码

### TypeScript 规范

```typescript
// 使用类型注解
function getUserById(id: number): Promise<User> {
  // 实现
}

// 使用接口定义数据结构
interface UserInfo {
  id: number
  username: string
  email: string
}
```

### Vue 规范

```vue
<script setup lang="ts">
// 1. 导入语句
import { ref, computed } from 'vue'

// 2. Props 和 Emits
const props = defineProps<{ userId: number }>()
const emit = defineEmits<{ update: [value: string] }>()

// 3. 响应式状态
const loading = ref(false)

// 4. 计算属性
const displayName = computed(() => '...')

// 5. 方法
const handleSubmit = () => {
  // 实现
}
</script>
```

## 开发环境设置

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

### 后端开发

```bash
cd backend
npm install

# 需要先配置 Cloudflare
wrangler login
npm run dev
```

## 测试

### 手动测试

1. 测试用户注册和登录
2. 测试作品上传
3. 测试画廊展示
4. 测试作品详情和删除

### 自动化测试

目前项目暂未包含自动化测试，欢迎贡献测试代码。

## Pull Request 检查清单

提交 PR 前，请确保：

- [ ] 代码遵循项目规范
- [ ] 添加了必要的注释（中文）
- [ ] 功能已经过测试
- [ ] 没有引入新的 Bug
- [ ] 更新了相关文档
- [ ] 提交信息清晰明确

## 社区准则

- 尊重他人
- 保持友善和专业
- 接受建设性批评
- 关注项目目标

## 许可证

通过贡献代码，你同意你的贡献将在 MIT 许可证下发布。

---

再次感谢你的贡献！🎉
