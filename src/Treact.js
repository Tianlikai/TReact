/**
 * 复合组件
 * 使元组件和复合组件处理方式相同
 * @param {*} props 
 */
const TopLevelWrapper = function (props) {
    this.props = props
}

TopLevelWrapper.prototype.render = function () {
    return this.props
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

function updateRootComponent (prevComponent, nextElement) {
    TReactReconciler.receiveComponent(prevComponent, nextElement);
}

/**
 * 
 * @param {*} container 
 */
function getTopLevelComponentInContainer (container) {
    return container.__TReactComponentInstance
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
 * 
 * @param {*} prevComponent 
 * @param {*} nextElement 
 */
function updateRootComponent (prevComponent, nextElement) {
    prevComponent.receiveComponent(nextElement)
}

/**
 * 创建一个简单的dom元素
 * 插入装载
 * @function mountComponent
 */
class TReactDOMComponent {
    constructor(element) {
        this._currentElement = element
    }

    _updateDOMProperties (lastProps, nextProps) {
        
    }

    _updateDOMChildren (lastProps, nextProps) {
        const lastContent = lastProps.children
        const nextContent = nextProps.children

        if (!nextContent) { // 如果元素text为空
            this.updateTextContent('')
        } else { // 非空，更新text元素
            this.updateTextContent('' + nextContent)
        }
    }

    updateTextContent (text) {
        const node = this._hostNode
        const firstChild = node.firstChild

        if (firstChild && firstChild === node.lastChild && firstChild.nodeType === 3) {
            firstChild.nodeValue = text
            return
        }
        node.textContent = text
    }

    /**
     * 
     * @param {*} nextElement 下一个元素
     */
    receiveComponent (nextElement) { // 更新组件
        const prevElement = this._currentElement // 当前的元素
        this.updateComponent(prevElement, nextElement)
    }

    /**
     * 
     * @param {*} prevElement 当前元素
     * @param {*} nextElement 下一个元素
     */
    updateComponent (prevElement, nextElement) {
        const lastProps = prevElement.props
        const nextProps = nextElement.props

        this._updateDOMProperties(lastProps, nextProps) // 更新元素样式
        this._updateDOMChildren(lastProps, nextProps) // 更新元素dom

        this._currentElement = nextElement
    }

    mountComponent (container) {
        const domElement = document.createElement(this._currentElement.type)
        const text = this._currentElement.props.children
        const textNode = document.createTextNode(text)
        
        domElement.appendChild(textNode)
        container.appendChild(domElement)

        this._hostNode = domElement
        return domElement
    }
}

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
 * @function createElement 创建dom元素
 * @function createClass 创建复合组件
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












// const MyTitle = TReact.createClass({
//     render() {
//         return TReact.createElement('h1', null, this.props.message)
//     }
// })

// const mount = TReact.createElement('h1', null, 'hello world')
// const root = document.getElementById('root')

// TReact.render(
//     mount,
//     root
// )

// const mount = TReact.createElement(MyTitle, { message: 'hey there TReact' })
// const root = document.getElementById('root')

// TReact.render(
//     mount,
//     root
// )

/**
 * 元组件测试
 */
// const root = document.getElementById('root')

// TReact.render(
//     TReact.createElement('h1', null, 'hello'),
//     root
// );

// setTimeout(function() {
//     TReact.render(
//         TReact.createElement('h1', null, 'hello again'),
//         root
//     );
// }, 2000);

/**
 * 复合组件测试
 */
const root = document.getElementById('root')
const MyCoolComponent = TReact.createClass({
    render() {
        return TReact.createElement('h1', null, this.props.myProp)
    }
})

TReact.render(
    TReact.createElement(MyCoolComponent, { myProp: 'hi' }),
    root
)

// some time passes

setTimeout(function() {
    TReact.render(
        TReact.createElement(MyCoolComponent, { myProp: 'hi again' }),
        root
    )
}, 2000)
