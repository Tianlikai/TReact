
import TReactDOMComponent from './TReactDOMComponent'
import TReactReconciler from './util/TReactReconciler'

/**
 * 兼容处理
 * 复合组件 dom元素 等区分
 * @function mountComponent
 */
class TReactCompositeComponentWrapper {
    constructor (element) {
        this._currentElement = element
    }

    performInitialMount (container) { // 分层
        const renderedElement = this._instance.render()
        const child = instantiateTReactComponent(renderedElement) // 递归
        this._renderedComponent = child
        return TReactReconciler.mountComponent(child, container)
    }

    receiveComponent (nextElement) {
        const prevElement = this._currentElement
        this.updateComponent(prevElement, nextElement)
    }

    updateComponent (prevElement, nextElement) {
        const nextProps = nextElement.props
        const inst = this._instance

        if (inst.componentWillReceiveProps) { // 生命周期
            inst.componentWillReceiveProps(nextProps)
        }

        let shouldUpdate = true

        if (inst.shouldComponentUpdate) { // 生命周期
            shouldUpdate = inst.shouldComponentUpdate(nextProps)
        }
        if (shouldUpdate) {
            this._performComponentUpdate(nextElement, nextProps)
        } else {
            inst.props = nextProps
        }
    }

    _performComponentUpdate (nextElement, nextProps) {
        this._currentElement = nextElement
        const inst = this._instance
        inst.props = nextProps
        this._updateRenderedComponent()
    }

    _updateRenderedComponent () {
        const prevComponentInstance = this._renderedComponent
        const inst = this._instance
        const nextRenderedElement = inst.render()

        // prevComponentInstance.receiveComponent(nextRenderedElement)
        TReactReconciler.receiveComponent(prevComponentInstance, nextRenderedElement)
    }

    mountComponent (container) {
        const Component = this._currentElement.type
        const componentInstance = new Component(this._currentElement.props)
        this._instance = componentInstance

        if (componentInstance.componentWillMount) {
            componentInstance.componentWillMount()
        }
        const markup = this.performInitialMount(container)
        if (componentInstance.componentDidMount) {
            componentInstance.componentDidMount()
        }

        return markup
    }
}


/**
 * 
 * @param {*} element 
 */
function instantiateTReactComponent(element) {
    if (typeof element.type === 'string') {
        return new TReactDOMComponent(element)
    } else if(typeof element.type === 'function') { // 递归
        return new TReactCompositeComponentWrapper(element)
    }
}

export default TReactCompositeComponentWrapper