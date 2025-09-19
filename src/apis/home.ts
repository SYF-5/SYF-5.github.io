import service from "@/utils/request"

/**
 * @description: 获取所有商品模块
 * @param {*}
 * @return {*}
 */
export const getGoodsAPI = () => {
  return service({
    url: '/home/goods'
  })
}