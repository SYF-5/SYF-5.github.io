import { App, DirectiveBinding } from 'vue';

// 存储所有观察器实例
const observers = new Map<Element, IntersectionObserver>();

export const lazyLoadDirective = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding) {
    const { value } = binding;

    // 设置占位背景
    el.style.backgroundColor = '#f5f5f5';
    el.style.opacity = '0.7';
    el.style.transition = 'opacity 0.3s ease';

    // 创建 Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 图片进入视口，开始加载
          const img = new Image();
          img.src = value;

          img.onload = () => {
            el.src = value;
            el.style.opacity = '1';
            el.style.backgroundColor = 'transparent';
            // 触发原有的 @load 事件
            el.dispatchEvent(new Event('load'));
          };

          img.onerror = () => {
            // 触发原有的 @error 事件
            el.dispatchEvent(new Event('error'));
            el.style.opacity = '1';
          };

          observer.unobserve(el);
          observers.delete(el);
        }
      });
    }, {
      rootMargin: '50px 0px', // 提前50px开始加载
      threshold: 0.1
    });

    observer.observe(el);
    observers.set(el, observer);
  },

  unmounted(el: HTMLImageElement) {
    // 清理观察器
    const observer = observers.get(el);
    if (observer) {
      observer.unobserve(el);
      observers.delete(el);
    }
  }
};

export const setupLazyLoadDirective = (app: App) => {
  app.directive('lazy', lazyLoadDirective);
};