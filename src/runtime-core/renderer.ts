import { effect } from '../reactivity/index'
import { ShapeFlags } from '../shared/index'
import { createAppAPI } from './apiCreateApp' // 用回调用的createApp方法
import { createComponentInstance, setupComponent } from './component'

export function createRenderer(options) {
  // options 是平台传过来的方法，不同的平台可以实现不同
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options) {
  const { createElement: hostCreateElement, patchProp: hostPatchProp, setElementText: hostSetElementText, insert: hostInsert, remove: hostRemove } = options

  const mountElement = (vnode, container) => {
    // n2 虚拟节点 container 就是容器
    let { shapeFlag, props } = vnode
    let el = vnode.el = hostCreateElement(vnode.type)

    // 创建儿子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el)
    }

    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    hostInsert(el, container)
  }

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }
  const patchElement = (n1, n2, container) => {}
  const mountComponent = (initialVnode, container) => {
    // 组件挂载逻辑 1.创建组件示例 2.找到组件的render方法 3.执行render
    // 组件实例要记录当前组件的状态
    const instance = initialVnode.component = createComponentInstance(initialVnode)
    setupComponent(instance) // 找到组件的setup方法
    // 调用render方法，如果render方法中数据变化了 会重新渲染
    setupRenderEffect(instance, initialVnode, container) // 给组件创建一个effect用于渲染 == vue2 watcher
  }

  const setupRenderEffect = (instance, initialVnode, container) => {
    effect(function () {
      if (!instance.isMounted) {
        // 渲染组件中的内容
        const subTree = instance.subTree = instance.render() // 组件对应渲染的结果
        patch(null, subTree, container)
        instance.isMounted = true
      } else {
        // 更新逻辑
        let prev = instance.subTree // 上一次的渲染结果
        let next = instance.render()
        console.log(prev, next)
      }
    })
  }
  const updateComponent = (n1, n2, container) => {}

  const processElement = (n1, n2, container) => {
    if (n1 == null) {
      mountElement(n2, container)
    } else {
      patchElement(n1, n2, container)
    }
  }

  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      mountComponent(n2, container)
    } else {
      updateComponent(n1, n2, container)
    }
  }

  const render = (vnode, container) => {
    // 需要将虚拟节点，变成真实节点，挂载到容器上
    console.log(vnode,container)
    patch(null, vnode, container)
  }

  const patch = (n1, n2, container) => {
    let { shapeFlag } = n2
    // 20,12 组件孩子里有数组
    // 10100
    // 00001
    // 00000
    if (shapeFlag & ShapeFlags.ELEMENT) {
      // 都是1才是1
      processElement(n1, n2, container)
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      processComponent(n1, n2, container)
    }
  }
  return {
    createApp: createAppAPI(render)
  }
}
