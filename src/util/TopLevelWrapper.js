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

export default TopLevelWrapper