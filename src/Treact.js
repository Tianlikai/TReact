import TReactCompositeComponentWrapper from './TReactCompositeComponentWrapper'
import TopLevelWrapper from './util/TopLevelWrapper'
import TReactReconciler from './util/TReactReconciler'

/**
 * 获取组件容器包含的组件实例
 * 创建组件时，将组件缓存在组件容器中
 * @param {ele} container 组件容器
 */
function getTopLevelComponentInContainer (container) {
    return container.__TReactComponentInstance
}

/**
 * 
 * @param {*} prevComponent 
 * @param {*} nextElement 
 */
function updateRootComponent (prevComponent, nextElement) {
    TReactReconciler.receiveComponent(prevComponent, nextElement);
}

/**
 * 渲染新的根组件
 * @param {*} element 
 * @param {*} container container中放入已经渲染的组件
 */
function renderNewRootComponent (element, container) {
    const wrapperElement = TReact.createElement(TopLevelWrapper, element)
    const componentInstance = new TReactCompositeComponentWrapper(wrapperElement)
    const markUp = TReactReconciler.mountComponent(
        componentInstance,
        container
    )
    container.__TReactComponentInstance = componentInstance._renderedComponent
    return markUp
}

/**
 * @function createElement 创建dom元素
 * @function createClass 创建复合组件
 * @function render 渲染函数
 */
const TReact = {
    createElement(type, props, children) {
        const element = {
            type,
            props: props || {}
        }
        if (children) {
            element.props.children = children
        }
        return element
    },

    createClass(spec) {
        function Constructor(props) {
            this.props = props
        }
        Constructor.prototype = Object.assign(Constructor.prototype, spec) // 加入render
        return Constructor
    },

    render(element, container) {
        const prevComponent = getTopLevelComponentInContainer(container)
        if (prevComponent) { // 如果存在则渲染新的组件
            return updateRootComponent(
                prevComponent,
                element
            )
        } else { // 如果不存在则重新开始
            return renderNewRootComponent(element, container)
        }
    }
}

export default TReact