/**
 * @function mountComponent
 */
class TReactDOMComponent {
    constructor(element) {
        this._currentElement = element
    }

    mountComponent(container) {
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
 * @function mountComponent
 */
class TReactCompositeComponentWrapper {
    constructor (element) {
        this._currentElement = element
    }

    mountComponent(container) {
        const Component = this._currentElement.type
        const componentInstance = new Component(this._currentElement.props)
        const element = componentInstance.render()

        const domComponentInstance = new FeactDOMComponent(element)
        return domComponentInstance.mountComponent(container)
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
        Constructor.prototype.render = spec.render
        return Constructor
    },

    render(element, container) {
        const componentInstance = new TReactDOMComponent(element)
        return componentInstance.mountComponent(container)
    },

    renderCompos(element, container) {
        const componentInstance = new TReactCompositeComponentWrapper(element)
        return componentInstance.mountComponent(container)
    }
}

const MyTitle = TReact.createClass({
    render() {
        return TReact.createElement('h1', null, this.props.message)
    }
})

// const mount = TReact.createElement(MyTitle, { message: 'hey there Feact' })
// const root = document.getElementById('root')

// TReact.render(
//     mount,
//     root
// )
const mount = TReact.createElement('h1', null, 'hello world')
const root = document.getElementById('root')

TReact.render(
    mount,
    root
)

