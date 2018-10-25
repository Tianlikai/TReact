import _shouldUpdateReactComponent from "./util/_shouldUpdateReactComponent";
import { instantiateReactComponent } from "./React";

/**
 * component 类
 * react 基础标签类型，类似与html中的（'div','span' 等）
 * @param {*} element 基础元素
 */
function ReactDOMComponent(element) {
  // 存下当前的element对象引用
  this._currentElement = element;
  this._rootNodeID = null;
}

/**
 * component 类 装载方法
 * @param {*} rootID 元素id
 * @param {string} 返回dom
 */
ReactDOMComponent.prototype.mountComponent = function(rootID) {
  this._rootNodeID = rootID;
  var props = this._currentElement.props;

  // 外层标签
  var tagOpen = "<" + this._currentElement.type;
  var tagClose = "</" + this._currentElement.type + ">";

  // 加上reactid标识
  tagOpen += " data-reactid=" + this._rootNodeID;

  // 拼接标签属性
  for (var propKey in props) {
    // 属性为绑定事件
    if (/^on[A-Za-z]/.test(propKey)) {
      var eventType = propKey.replace("on", "");
      // 对当前节点添加事件代理
      $(document).delegate(
        '[data-reactid="' + this._rootNodeID + '"]',
        eventType + "." + this._rootNodeID,
        props[propKey]
      );
    }

    // 对于props 上的children和事件属性不做处理
    if (
      props[propKey] &&
      propKey != "children" &&
      !/^on[A-Za-z]/.test(propKey)
    ) {
      tagOpen += " " + propKey + "=" + props[propKey];
    }
  }
  // 渲染子节点dom
  var content = "";
  var children = props.children || [];

  var childrenInstances = []; // 保存子节点component 实例
  var that = this;

  children.forEach((child, key) => {
    var childComponentInstance = instantiateReactComponent(child);
    // 为子节点添加标记
    childComponentInstance._mountIndex = key;
    childrenInstances.push(childComponentInstance);
    var curRootId = that._rootNodeID + "." + key;

    // 得到子节点的渲染内容
    var childMarkup = childComponentInstance.mountComponent(curRootId);

    // 拼接在一起
    content += " " + childMarkup;
  });

  // 保存component 实例
  this._renderedChildren = childrenInstances;

  // 拼出整个html内容
  return tagOpen + ">" + content + tagClose;
};

/**
 * component 类 更新
 * @param {*} nextElement
 */
ReactDOMComponent.prototype.receiveComponent = function(nextElement) {
  var lastProps = this._currentElement.props;
  var nextProps = nextElement.props;
  this._currentElement = nextElement;
  // 处理当前节点的属性
  this._updateDOMProperties(lastProps, nextProps);
  // 处理当前节点的子节点变动
  this._updateDOMChildren(nextElement.props.children);
};

/**
 * 更新属性
 * @param {*} lastProps
 * @param {*} nextProps
 */
ReactDOMComponent.prototype._updateDOMProperties = function(
  lastProps,
  nextProps
) {
  // 当老属性不在新属性的集合里时，需要删除属性
  var propKey;
  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey)
    ) {
      // 新属性中有，且不再老属性的原型中
      continue;
    }
    if (/^on[A-Za-z]/.test(propKey)) {
      var eventType = propKey.replace("on", "");
      // 特殊事件，需要去掉事件监听
      $(document).undelegate(
        '[data-reactid="' + this._rootNodeID + '"]',
        eventType,
        lastProps[propKey]
      );
      continue;
    }

    // 删除不需要的属性
    $('[data-reactid="' + this._rootNodeID + '"]').removeAttr(propKey);
  }

  // 对于新的事件，需要写到dom上
  for (propKey in nextProps) {
    if (/^on[A-Za-z]/.test(propKey)) {
      var eventType = propKey.replace("on", "");
      // 删除老的事件绑定
      lastProps[propKey] &&
        $(document).undelegate(
          '[data-reactid="' + this._rootNodeID + '"]',
          eventType,
          lastProps[propKey]
        );
      // 针对当前的节点添加事件代理,以_rootNodeID为命名空间
      $(document).delegate(
        '[data-reactid="' + this._rootNodeID + '"]',
        eventType + "." + this._rootNodeID,
        nextProps[propKey]
      );
      continue;
    }

    if (propKey == "children") continue;

    // 添加新的属性，重写同名属性
    $('[data-reactid="' + this._rootNodeID + '"]').prop(
      propKey,
      nextProps[propKey]
    );
  }
};

// 差异更新的几种类型
var UPDATE_TYPES = {
  MOVE_EXISTING: 1,
  REMOVE_NODE: 2,
  INSERT_MARKUP: 3
};

// 全局的更新深度标识
var updateDepth = 0;
// 全局的更新队列，所有的差异都存在这里
var diffQueue = [];

/**
 *
 * @param {*} parentNode
 * @param {*} childNode
 * @param {*} index
 */ function insertChildAt(parentNode, childNode, index) {
  var beforeChild = parentNode.children().get(index);
  beforeChild
    ? childNode.insertBefore(beforeChild)
    : childNode.appendTo(parentNode);
}

/**
 * 生成子节点 elements 的 component 集合
 * @param {object} prevChildren 前一个 component 集合
 * @param {Array} nextChildrenElements 新传入的子节点element数组
 * @return {object} 返回一个映射
 */
function generateComponentChildren(prevChildren, nextChildrenElements) {
  var nextChildren = {};
  nextChildrenElements = nextChildrenElements || [];
  $.each(nextChildrenElements, function(index, element) {
    var name = element.key ? element.key : index;
    var prevChild = prevChildren && prevChildren[name];
    var prevElement = prevChild && prevChild._currentElement;
    var nextElement = element;

    // 调用_shouldUpdateReactComponent判断是否是更新
    if (_shouldUpdateReactComponent(prevElement, nextElement)) {
      // 更新的话直接递归调用子节点的receiveComponent就好了
      prevChild.receiveComponent(nextElement);
      // 然后继续使用老的component
      nextChildren[name] = prevChild;
    } else {
      // 对于没有老的，那就重新新增一个，重新生成一个component
      var nextChildInstance = instantiateReactComponent(nextElement, null);
      // 使用新的component
      nextChildren[name] = nextChildInstance;
    }
  });

  return nextChildren;
}

/**
 * 将数组转换为映射
 * @param {Array} componentChildren
 * @return {object} 返回一个映射
 */
function flattenChildren(componentChildren) {
  var child;
  var name;
  var childrenMap = {};
  for (var i = 0; i < componentChildren.length; i++) {
    child = componentChildren[i];
    name =
      child && child._currentelement && child._currentelement.key
        ? child._currentelement.key
        : i.toString(36);
    childrenMap[name] = child;
  }
  return childrenMap;
}

ReactDOMComponent.prototype._updateDOMChildren = function(
  nextChildrenElements
) {
  updateDepth++;
  // _diff用来递归找出差别,组装差异对象,添加到更新队列diffQueue。
  this._diff(diffQueue, nextChildrenElements);
  updateDepth--;
  if (updateDepth == 0) {
    // 在需要的时候调用patch，执行具体的dom操作
    this._patch(diffQueue);
    diffQueue = [];
  }
};

/**
 * _diff用来递归找出差别,组装差异对象,添加到更新队列diffQueue。
 * @param {*} diffQueue
 * @param {*} nextChildrenElements
 */
ReactDOMComponent.prototype._diff = function(diffQueue, nextChildrenElements) {
  var self = this;
  // 拿到之前的子节点的 component类型对象的集合,这个是在刚开始渲染时赋值的，记不得的可以翻上面
  // _renderedChildren 本来是数组，我们搞成map
  var prevChildren = flattenChildren(self._renderedChildren);
  // 生成新的子节点的component对象集合，这里注意，会复用老的component对象
  var nextChildren = generateComponentChildren(
    prevChildren,
    nextChildrenElements
  );
  // 重新赋值_renderedChildren，使用最新的。
  self._renderedChildren = [];
  $.each(nextChildren, function(key, instance) {
    self._renderedChildren.push(instance);
  });

  /**注意新增代码**/
  var lastIndex = 0; // 代表访问的最后一次的老的集合的位置

  var nextIndex = 0; // 代表到达的新的节点的index
  // 通过对比两个集合的差异，组装差异节点添加到队列中
  for (name in nextChildren) {
    if (!nextChildren.hasOwnProperty(name)) {
      continue;
    }
    var prevChild = prevChildren && prevChildren[name];
    var nextChild = nextChildren[name];
    // 相同的话，说明是使用的同一个component,所以我们需要做移动的操作
    if (prevChild === nextChild) {
      // 添加差异对象，类型：MOVE_EXISTING
      /**注意新增代码**/
      prevChild._mountIndex < lastIndex &&
        diffQueue.push({
          parentId: self._rootNodeID,
          parentNode: $("[data-reactid=" + self._rootNodeID + "]"),
          type: UPDATE_TYPES.MOVE_EXISTING,
          fromIndex: prevChild._mountIndex,
          toIndex: nextIndex
        });
      /**注意新增代码**/
      lastIndex = Math.max(prevChild._mountIndex, lastIndex);
    } else {
      // 如果不相同，说明是新增加的节点
      // 但是如果老的还存在，就是element不同，但是component一样。我们需要把它对应的老的element删除。
      if (prevChild) {
        // 添加差异对象，类型：REMOVE_NODE
        diffQueue.push({
          parentId: self._rootNodeID,
          parentNode: $("[data-reactid=" + self._rootNodeID + "]"),
          type: UPDATE_TYPES.REMOVE_NODE,
          fromIndex: prevChild._mountIndex,
          toIndex: null
        });

        // 如果以前已经渲染过了，记得先去掉以前所有的事件监听，通过命名空间全部清空
        if (prevChild._rootNodeID) {
          $(document).undelegate("." + prevChild._rootNodeID);
        }

        /**注意新增代码**/
        lastIndex = Math.max(prevChild._mountIndex, lastIndex);
      }
      // 新增加的节点，也组装差异对象放到队列里
      // 添加差异对象，类型：INSERT_MARKUP
      diffQueue.push({
        parentId: self._rootNodeID,
        parentNode: $("[data-reactid=" + self._rootNodeID + "]"),
        type: UPDATE_TYPES.INSERT_MARKUP,
        fromIndex: null,
        toIndex: nextIndex,
        markup: nextChild.mountComponent(self._rootNodeID + "." + name) //新增的节点，多一个此属性，表示新节点的dom内容
      });
    }
    // 更新mount的index
    nextChild._mountIndex = nextIndex;
    nextIndex++;
  }

  // 对于老的节点里有，新的节点里没有的那些，也全都删除掉
  for (name in prevChildren) {
    if (
      prevChildren.hasOwnProperty(name) &&
      !(nextChildren && nextChildren.hasOwnProperty(name))
    ) {
      // 添加差异对象，类型：REMOVE_NODE
      diffQueue.push({
        parentId: self._rootNodeID,
        parentNode: $("[data-reactid=" + self._rootNodeID + "]"),
        type: UPDATE_TYPES.REMOVE_NODE,
        fromIndex: prevChildren[name]._mountIndex,
        toIndex: null
      });
      // 如果以前已经渲染过了，记得先去掉以前所有的事件监听
      if (prevChildren[name]._rootNodeID) {
        $(document).undelegate("." + prevChildren[name]._rootNodeID);
      }
    }
  }
};

/**
 *
 * @param {*} diffQueue
 */
ReactDOMComponent.prototype._patch = function(updates) {
  var update;
  var initialChildren = {};
  var deleteChildren = [];
  for (var i = 0; i < updates.length; i++) {
    update = updates[i];
    if (
      update.type === UPDATE_TYPES.MOVE_EXISTING ||
      update.type === UPDATE_TYPES.REMOVE_NODE
    ) {
      var updatedIndex = update.fromIndex;
      var updatedChild = $(update.parentNode.children().get(updatedIndex));
      var parentID = update.parentID;

      // 所有需要更新的节点都保存下来，方便后面使用
      initialChildren[parentID] = initialChildren[parentID] || [];
      // 使用parentID作为简易命名空间
      initialChildren[parentID][updatedIndex] = updatedChild;

      // 所有需要修改的节点先删除,对于move的，后面再重新插入到正确的位置即可
      deleteChildren.push(updatedChild);
    }
  }

  // 删除所有需要先删除的
  $.each(deleteChildren, function(index, child) {
    $(child).remove();
  });

  // 再遍历一次，这次处理新增的节点，还有修改的节点这里也要重新插入
  for (var k = 0; k < updates.length; k++) {
    update = updates[k];
    switch (update.type) {
      case UPDATE_TYPES.INSERT_MARKUP:
        insertChildAt(update.parentNode, $(update.markup), update.toIndex);
        break;
      case UPDATE_TYPES.MOVE_EXISTING:
        insertChildAt(
          update.parentNode,
          initialChildren[update.parentID][update.fromIndex],
          update.toIndex
        );
        break;
      case UPDATE_TYPES.REMOVE_NODE:
        // 什么都不需要做，因为上面已经帮忙删除掉了
        break;
    }
  }
};

export default ReactDOMComponent;
