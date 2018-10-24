import ReactClass from "./ReactClass";
import ReactElement from "./ReactElement";

import ReactDOMTextComponent from "./ReactDOMTextComponent";
import ReactDOMComponent from "./ReactDOMComponent";
import ReactCompositeComponent from "./ReactCompositeComponent";

function instantiateReactComponent(node) {
  //文本节点的情况
  if (typeof node === "string" || typeof node === "number") {
    return new ReactDOMTextComponent(node);
  }
  //浏览器默认节点的情况
  if (typeof node === "object" && typeof node.type === "string") {
    //注意这里，使用了一种新的component
    return new ReactDOMComponent(node);
  }
  //自定义的元素节点
  if (typeof node === "object" && typeof node.type === "function") {
    //注意这里，使用新的component,专门针对自定义元素
    return new ReactCompositeComponent(node);
  }
}

const React = {
  nextReactRootIndex: 0,
  createClass: function(spec) {
    var Constructor = function(props) {
      this.props = props;
      this.state = this.getInitialState ? this.getInitialState() : null;
    };

    Constructor.prototype = new ReactClass();
    Constructor.prototype.constructor = Constructor;

    $.extend(Constructor.prototype, spec);
    return Constructor;
  },
  createElement: function(type, config, children) {
    var props = {},
      propName;
    config = config || {};

    var key = config.key || null;

    for (propName in config) {
      if (config.hasOwnProperty(propName) && propName !== "key") {
        props[propName] = config[propName];
      }
    }

    var childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = $.isArray(children) ? children : [children];
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }
    return new ReactElement(type, key, props);
  },
  render: function(element, container) {
    var componentInstance = instantiateReactComponent(element);
    var markup = componentInstance.mountComponent(React.nextReactRootIndex++);
    $(container).html(markup);

    $(document).trigger("mountReady");
  }
};

export default React;
export { instantiateReactComponent };
