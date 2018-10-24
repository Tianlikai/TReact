/**
 * 通过比较两个元素，判断是否需要更新
 * @param {*} preElement  旧的元素
 * @param {*} nextElement 新的元素
 * @return {boolean}
 */
function _shouldUpdateReactComponent(prevElement, nextElement) {
  if (prevElement != null && nextElement != null) {
    var prevType = typeof prevElement;
    var nextType = typeof nextElement;
    if (prevType === "string" || prevType === "number") {
      return nextType === "string" || nextType === "number";
    } else {
      return (
        nextType === "object" &&
        prevElement.type === nextElement.type &&
        prevElement.key === nextElement.key
      );
    }
  }
  return false;
}

export default _shouldUpdateReactComponent;
