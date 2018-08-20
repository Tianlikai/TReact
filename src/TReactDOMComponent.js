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

export default TReactDOMComponent