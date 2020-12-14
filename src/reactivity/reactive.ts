import { isObject } from '../shared/index'
import { mutableHandlers } from './baseHandlers'

export function reactive(target) {
  // 需要将目标变成响应式对象，Proxy
  return createReactiveObject(target, mutableHandlers) // 核心操作就是当读取文件时做依赖收集，当数据变化时重新执行effect
}
const proxyMap = new WeakMap()
function createReactiveObject(target, baseHandlers) {
  // 如果不是对象，直接返回
  if (!isObject(target)) {
    return target
  }
  const exisitingProxy = proxyMap.get(target)
  if (exisitingProxy) {
    return exisitingProxy
  }
  // 只是对在最外层对象做地理，默认不会递归，而且不会重新重写对象中的属性，只能代理对象级
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy) // 将代理对象和代理后的结果做个映射表
  return proxy
}
