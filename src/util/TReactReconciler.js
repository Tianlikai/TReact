/**
 * @function mountComponent 获取实例化组件，装载
 * @function receiveComponent 获取新的组件，更新
 */
const TReactReconciler = {
    mountComponent (internalInstance, container) {
        return internalInstance.mountComponent(container)
    },
    receiveComponent (internalInstance, nextElement) {
        internalInstance.receiveComponent(nextElement)
    }
}

export default TReactReconciler