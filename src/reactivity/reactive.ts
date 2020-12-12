export function reactive(target) {
  // 需要将目标变成响应式对象，Proxy
  return createReactiveObject(target) // 核心操作就是当读取文件时做依赖收集，当数据变化时重新执行effect
}

function createReactiveObject(target) {}
