import type { DirectiveBinding, App } from 'vue';

// 懒加载指令
const lazyLoad = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding) {
    // 设置初始占位图
    el.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+';

    // 创建 IntersectionObserver 实例
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 当图片进入视口时，加载实际图片
          el.src = binding.value;
          // 图片加载完成后停止观察
          el.onload = () => {
            observer.unobserve(el);
          };
          // 图片加载失败时也停止观察
          el.onerror = () => {
            observer.unobserve(el);
            // 可以设置一个错误占位图
            el.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2NjY2Ii8+PC9zdmc+';
          };
        }
      });
    }, {
      // 提前100px开始加载
      rootMargin: '0px 0px 100px 0px'
    });

    // 开始观察元素
    observer.observe(el);

    // 将observer保存在元素上，以便在卸载时断开连接
    (el as any)._lazyLoadObserver = observer;
  },

  unmounted(el: HTMLImageElement) {
    // 组件卸载时断开观察器
    if ((el as any)._lazyLoadObserver) {
      (el as any)._lazyLoadObserver.disconnect();
    }
  }
};

// 导出指令
export default lazyLoad;

// 导出安装函数，用于在main.ts中全局注册
export const setupLazyLoadDirective = (app: App) => {
  app.directive('lazy', lazyLoad);
};