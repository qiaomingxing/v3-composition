import { track, trigger } from './effect'
import { hasChanged, hasOwn, isArray, isInteger, isObject, isSymbol } from '../shared/index'
import { reactive } from './reactive'

function createGetter() {
  // 获取对象中的属性会执行此方法
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver) // target[key]

    // 如果取值是symbol类型，忽略
    if (isSymbol(key)) {
      // 数组中有很多symbol的内置方法
      return res
    }
    // 依赖收集
    console.log(key)
    track(target, key)

    if (isObject(res)) {
      // 取值是对象再进行代理，懒递归
      return reactive(res)
    }
    return res
  }
}

function createSetter() {
  // 设置对象中的属性会执行此方法
  return function set(target, key, value, receiver) {
    // vue2不支持新增属性
    // 新增还是修改?
    const oldValue = target[key] // 如果是修改肯定有老值

    // 看一下有没有这个属性

    // 第一种是 数组新增的逻辑 第二种是对象的逻辑
    const hasKey = isArray(target) && isInteger(key) ? Number(key) < target.length : hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver) // target[key] = value

    if (!hasKey) {
      // 新增属性
      trigger(target, 'add', key, value)
    } else if (hasChanged(value, oldValue)) {
      // 修改属性
      trigger(target, 'set', key, value, oldValue)
    }
    return result
  }
}

const get = createGetter() // 为了预置参数
const set = createSetter()

export const mutableHandlers = {
  get,
  set
}
