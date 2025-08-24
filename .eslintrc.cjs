// .eslintrc.cjs
module.exports = {
  // 告诉 ESLint 这个项目的运行环境是浏览器和 ES2021 规范
  env: {
    browser: true,
    es2021: true,
  },
  // 扩展共享配置：使用 Vue3 和 TypeScript 的推荐规则
  extends: [
    'eslint:recommended', // ESLint 自带推荐规则
    '@vue/eslint-config-typescript/recommended', // Vue 的 TypeScript 推荐规则
    '@vue/eslint-config-prettier', // 非常重要：禁用所有与 Prettier 冲突的 ESLint 规则，防止格式大战
  ],
  // 针对特定文件进行覆盖配置
  overrides: [
    {
      // 针对 .vue 文件
      files: ['*.vue'],
      // 在 .vue 文件中，使用 vue-eslint-parser 来解析 <template> 标签
      // 但要将 `@typescript-eslint/parser` 作为 <script> 标签的解析器
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
  // 解析选项
  parserOptions: {
    ecmaVersion: 'latest', // 使用最新的 ECMAScript 语法
    sourceType: 'module', // 使用 ES 模块
  },
  // 在这里可以添加你自己的个性化规则
  // "off" 或 0 - 关闭规则
  // "warn" 或 1 - 将规则视为警告（不影响退出码）
  // "error" 或 2 - 将规则视为错误（触发时退出码为1）
  rules: {
    // 示例：强制使用 === 和 !==，关闭 == 和 !=
    eqeqeq: ['error', 'always'],
    // 示例：允许 console.log（默认是 warn，通常生产项目会关闭）
    'no-console': 'off',
    // 你可以在这里添加更多你想要的规则
  },
};
