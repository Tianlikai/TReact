/**
 * component 类
 * 文本类型
 * @param {*} text 文本内容
 */
function ReactDOMTextComponent(text) {
  // 存下当前的字符串
  this._currentElement = "" + text;
  // 用来标识当前component
  this._rootNodeID = null;
}

/**
 * component 类 装载方法,生成 dom 结构
 * @param {number} rootID 元素id
 * @return {string} 返回dom
 */
ReactDOMTextComponent.prototype.mountComponent = function(rootID) {
  this._rootNodeID = rootID;
  return (
    '<span data-reactid="' + rootID + '">' + this._currentElement + "</span>"
  );
};

/**
 * component 类 更新
 * @param {*} newText
 */
ReactDOMTextComponent.prototype.receiveComponent = function(nextText) {
  var nextStringText = "" + nextText;
  // 跟以前保存的字符串比较
  if (nextStringText !== this._currentElement) {
    this._currentElement = nextStringText;
    // 替换整个节点
    $('[data-reactid="' + this._rootNodeID + '"]').html(this._currentElement);
  }
};

export default ReactDOMTextComponent;
