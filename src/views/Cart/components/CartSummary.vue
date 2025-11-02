<template>
  <div class="cart-summary">
    <div class="summary-header">
      <h3 class="summary-title">订单摘要</h3>
      <div class="summary-icon">📋</div>
    </div>
    
    <div class="summary-content">
      <div class="summary-row">
        <div class="row-label">
          <span>商品小计</span>
          <span class="item-count">({{ getItemCount }}件商品)</span>
        </div>
        <span class="row-value">¥{{ subtotal.toFixed(2) }}</span>
      </div>
      
      <div class="summary-row">
        <div class="row-label">
          <span>运费</span>
          <span class="shipping-info" v-if="shipping === 0">(免运费)</span>
        </div>
        <span class="row-value" :class="{ 'free-shipping': shipping === 0 }">
          {{ shipping === 0 ? '免费' : `¥${shipping.toFixed(2)}` }}
        </span>
      </div>
      
      <div class="summary-row" v-if="discount > 0">
        <div class="row-label">
          <span>优惠</span>
          <span class="discount-badge">已优惠</span>
        </div>
        <span class="row-value discount">-¥{{ discount.toFixed(2) }}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="summary-row summary-total">
        <span class="total-label">订单总计</span>
        <span class="total-value">¥{{ total.toFixed(2) }}</span>
      </div>
      
      <div class="savings-notice" v-if="discount > 0">
        您已节省 ¥{{ discount.toFixed(2) }}
      </div>
    </div>
    
    <button class="checkout-btn" @click="handleCheckout">
      <span class="btn-text"    @click="clearCart">去结算</span>
      <span class="btn-arrow">→</span>
    </button>
    
    <div class="secure-checkout">
      <div class="secure-icon">🔒</div>
      <span>安全结算 · 隐私保护</span>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
const clearCart = () => {
  // 直接清空购物车，不需要确认
  cartStore.clearCart()
}
export default {
  name: 'CartSummary',
  props: {
    subtotal: Number,
    shipping: Number,
    discount: Number,
    total: Number,
    itemCount: Number,
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    shipping: {
      type: Number,
      required: true,
      default: 0
    },
    discount: {
      type: Number,
      required: true,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      default: 0
    }
  },
  computed: {
    getItemCount() {
      // 这里可以接收一个额外的prop来显示商品数量
      // 暂时返回一个默认值，实际使用中可以由父组件传递
      return 3
    }
  },
  methods: {
    handleCheckout() {
    ElMessage({
        message: '支付成功！',
        type: 'success',
        duration: 3000,
        offset: 100
      })
      
      // 清空购物车
      this.$emit('clear-cart-instant')
    }
  }
}
</script>

<style scoped>
.cart-summary {
  width: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.summary-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.02em;
}

.summary-icon {
  font-size: 24px;
  opacity: 0.7;
}

.summary-content {
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
}

.row-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-label span:first-child {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
}

.item-count, .shipping-info {
  font-size: 13px;
  color: #94a3b8;
}

.row-value {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.free-shipping {
  color: #10b981;
  font-weight: 700;
}

.discount-badge {
  background: #fef3c7;
  color: #d97706;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.discount {
  color: #ef4444;
  font-weight: 700;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
  margin: 16px 0;
}

.summary-total {
  padding: 16px 0;
  margin-bottom: 8px;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.total-label {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.total-value {
  font-size: 24px;
  font-weight: 800;
  color: #3b82f6;
  letter-spacing: -0.02em;
}

.savings-notice {
  text-align: center;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  color: #3730a3;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 16px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.checkout-btn {
  width: 100%;
  padding: 18px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  margin: 20px 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.checkout-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.checkout-btn:hover::before {
  left: 100%;
}

.checkout-btn:active {
  transform: translateY(0);
}

.btn-text {
  letter-spacing: 0.02em;
}

.btn-arrow {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.checkout-btn:hover .btn-arrow {
  transform: translateX(4px);
}

.secure-checkout {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.secure-icon {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-summary {
    padding: 20px;
    border-radius: 12px;
  }
  
  .summary-header {
    margin-bottom: 20px;
  }
  
  .summary-title {
    font-size: 18px;
  }
  
  .total-value {
    font-size: 22px;
  }
  
  .checkout-btn {
    padding: 16px 20px;
    font-size: 16px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-summary {
  animation: fadeIn 0.5s ease-out;
}
</style>