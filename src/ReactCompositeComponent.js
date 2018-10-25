import _shouldUpdateReactComponent from "./util/_shouldUpdateReactComponent";
import { instantiateReactComponent } from "./React";

/**
 * component 类
 * 复合组件类型
 * @param {*} element 元素
 */
function ReactCompositeComponent(element) {
  // 存放元素element对象
  this._currentElement = element;
  // 存放唯一标识
  this._rootNodeID = null;
  // 存放对应的ReactClass的实例
  this._instance = null;
}

/**
 * component 类 装载方法
 * @param {*} rootID 元素id
 * @param {string} 返回dom
 */
ReactCompositeComponent.prototype.mountComponent = function(rootID) {
  this._rootNodeID = rootID;

  // 当前元素属性
  var publicProps = this._currentElement.props;
  // 对应的ReactClass
  var ReactClass = this._currentElement.type;

  var inst = new ReactClass(publicProps);
  this._instance = inst;

  // 保留对当前 component的引用
  inst._reactInternalInstance = this;

  if (inst.componentWillMount) {
    // 生命周期
    inst.componentWillMount();
    //这里在原始的 reactjs 其实还有一层处理，就是  componentWillMount 调用 setstate，不会触发 rerender 而是自动提前合并，这里为了保持简单，就略去了
  }

  // 调用 ReactClass 实例的render 方法，返回一个element或者文本节点
  var renderedElement = this._instance.render();
  var renderedComponentInstance = instantiateReactComponent(renderedElement);
  this._renderedComponent = renderedComponentInstance; //存起来留作后用

  var renderedMarkup = renderedComponentInstance.mountComponent(
    this._rootNodeID
  );

  // dom 装载到html 后调用生命周期
  $(document).on("mountReady", function() {
    inst.componentDidMount && inst.componentDidMount();
  });

  return renderedMarkup;
};

/**
 * component 类 更新
 * @param {*} nextElement
 * @param {*} newState
 */
ReactCompositeComponent.prototype.receiveComponent = function(
  nextElement,
  newState
) {
  // 如果接受了新的element，则直接使用最新的element
  this._currentElement = nextElement || this._currentElement;

  var inst = this._instance;
  // 合并state
  var nextState = Object.assign(inst.state, newState);
  var nextProps = this._currentElement.props;

  // 更新state
  inst.state = nextState;

  // 生命周期方法
  if (
    inst.shouldComponentUpdate &&
    inst.shouldComponentUpdate(nextProps, nextState) === false
  ) {
    // 如果实例的 shouldComponentUpdate 返回 false，则不需要继续往下执行更新
    return;
  }

  // 生命周期方法
  if (inst.componentWillUpdate) inst.componentWillUpdate(nextProps, nextState);

  // 获取老的element
  var prevComponentInstance = this._renderedComponent;
  var prevRenderedElement = prevComponentInstance._currentElement;

  // 通过重新render 获取新的element
  var nextRenderedElement = this._instance.render();

  // 比较新旧元素
  if (_shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
    // 两种元素为相同，需要更新，执行字节点更新
    prevComponentInstance.receiveComponent(nextRenderedElement);
    // 生命周期方法
    inst.componentDidUpdate && inst.componentDidUpdate();
  } else {
    // 两种元素的类型不同，直接重新装载dom
    var thisID = this._rootNodeID;

    this._renderedComponent = this._instantiateReactComponent(
      nextRenderedElement
    );

    var nextMarkup = _renderedComponent.mountComponent(thisID);
    // 替换整个节点
    $('[data-reactid="' + this._rootNodeID + '"]').replaceWith(nextMarkup);
  }
};

export default ReactCompositeComponent;
