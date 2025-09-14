// 解决main.ts中找不到声明文件，隐式具有any类型的问题
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}