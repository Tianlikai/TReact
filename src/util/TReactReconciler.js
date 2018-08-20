/**
 * @function mountComponent
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