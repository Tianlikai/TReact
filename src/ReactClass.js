/**
 * 所有自定义组件的超类
 * @function render所有自定义组件都有该方法
 */
function ReactClass() {}

ReactClass.prototype.render = function() {};

/**
 * 更新
 * @param {*} newState 新状态
 */
ReactClass.prototype.setState = function(newState) {
  // 拿到ReactCompositeComponent的实例
  // 在装载的时候保存
  // 代码：this._reactInternalInstance = this
  this._reactInternalInstance.receiveComponent(null, newState);
};

export default ReactClass;
