# React 源码分析

## 写在前面

React 开发一年多，最近仔细研究了 React 源码，在这里总结一下原理。React 源码比较复杂不适合初学者去学习。所以本文通过实现一套简易版的 React，使得理解原理更加容易（本文基于 React v15）。包括：

- React 的几种组件以及首次渲染实现
- React 更新机制的实现以及 React diff 算法

React 的代码还是非常复杂的，虽然这里是一个简化版本。但是还是需要有不错的面向对象思维的。React 的核心主要有一下几点。

- 虚拟 dom 对象（Virtual DOM）
- 虚拟 dom 差异化算法（diff algorithm）
- 单向数据流
- 组件声明周期
- 事件处理

## 实现一个‘hello React！’的渲染

看如下代码：

```
// js
React.render('hello React！',document.getElementById("root"))

// html
<div id="root"></div>

// 生成代码
<div id="root">
    <span data-reactid="0">hello React!</span>
</div>
```

针对上面代码的具体实现

```
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
 * 根据元素类型实例化一个具体的component
 * @param {*} node ReactElement
 * @return {*} 返回一个具体的component实例
 */
function instantiateReactComponent(node) {
  //文本节点的情况
  if (typeof node === "string" || typeof node === "number") {
    return new ReactDOMTextComponent(node);
  }
}

const React = {
 nextReactRootIndex: 0,

 /**
  * 接收一个React元素，和一个dom节点
  * @param {*} element React元素
  * @param {*} container 负责装载的dom
  */
  render: function(element, container) {
    // 实例化组件
    var componentInstance = instantiateReactComponent(element);
    // 组件完成dom装载
    var markup = componentInstance.mountComponent(React.nextReactRootIndex++);
    // 将装载好的 dom 放入 container 中
    $(container).html(markup);
    $(document).trigger("mountReady");
  }
};
```

这里代码分为三个部分：

- 1 React.render 作为入口接受一个 React 元素和游览器中的 dom 负责调用渲染,nextReactRootIndex 为每个 component 的唯一标识
- 2 引入 component 类的概念，ReactDOMTextComponent 是一个 component 类定义。ReactDOMTextComponent 针对于文本节点进行处理。并且在 ReactDOMTextComponent 的原型上实现了 mountComponent 方法，用于对组件的渲染，返回组件的 dom 结构。当然 component 还具有更新和删除操作，这里将在后续讲解。
- 3 instantiateReactComponent 用来根据 element 的类型（现在只有一种 string 类型），返回一个 component 的实例。其实就是个类工厂。

> 在这里我们把逻辑分为几个部分，渲染逻辑则由 component 内部定义，React.render 负责调度整个流程，在调用 instantiateReactComponent 生成一个对应 component 类型的实例对象，再调用对象的 mountComponent 返回 dom，最后再写到 container 节点中

## 虚拟 dom

虚拟 dom 无疑是 React 的核心概念，在代码中我们会使用 React.createElement 来创建一个虚拟 dom 元素。

虚拟 dom 分为两种一种是游览器自带的基本元素比如 div，还有一种是自定义元素（文本节点不算虚拟 dom）

虚拟节点的使用方式

```
// 绑定事件监听方法
function sayHello(){
    alert('hello!')
}
var element = React.createElement('div',{id:'jason',onclick:hello},'click me')
React.render(element,document.getElementById("root"))

// 最终生成的html

<div data-reactid="0" id="jason">
    <span data-reactid="0.0">click me</span>
</div>
```

我们使用 React.createElement 来创建一个虚拟 dom 元素，以下是简易实现

```
/**
 * ReactElement 就是虚拟节点的概念
 * @param {*} key 虚拟节点的唯一标识，后期可以进行优化
 * @param {*} type 虚拟节点类型，type可能是字符串（'div', 'span'），也可能是一个function，function时为一个自定义组件
 * @param {*} props 虚拟节点的属性
 */
function ReactElement(type, key, props) {
  this.type = type;
  this.key = key;
  this.props = props;
}

const React = {
  nextReactRootIndex: 0,
  /**
   * @param {*} type 元素的 component 类型
   * @param {*} config 元素配置
   * @param {*} children 元素的子元素
   */
  createElement: function(type, config, children) {
    var props = {};
    var propName;
    config = config || {};

    var key = config.key || null;

    for (propName in config) {
      if (config.hasOwnProperty(propName) && propName !== "key") {
        props[propName] = config[propName];
      }
    }

    var childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = Array.isArray(children) ? children : [children];
    } else if (childrenLength > 1) {
      var childArray = [];
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }
    return new ReactElement(type, key, props);
  },

  /**
   * 自行添加上文中的render方法
   */
};
```

> createElement 方法对传入的参数做了一些处理，最终会返回一个 ReactElement 虚拟元素实例，key 的定义可以提高更新时的效率

有了虚拟元素实例，我们需要改造一下 instantiateReactComponent 方法

```
/**
 * 根据元素类型实例化一个具体的component
 * @param {*} node ReactElement
 * @return {*} 返回一个具体的component实例
 */
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
}
```

> 我们增加了一个判断，这样当 render 的不是文本而是浏览器的基本元素时。我们使用另外一种 component 来处理它渲染时应该返回的内容。这里就体现了工厂方法 instantiateReactComponent 的好处了，不管来了什么类型的 node，都可以负责生产出一个负责渲染的 component 实例。这样 render 完全不需要做任何修改，只需要再做一种对应的 component 类型（这里是 ReactDOMComponent）就行了。

`ReactDOMComponent`的具体实现

```
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
```

对于虚拟 dom 的渲染逻辑，本质上还是个递归渲染的东西，reactElement 会递归渲染自己的子节点。可以看到我们通过 instantiateReactComponent 屏蔽了子节点的差异，只需要使用不同的 component 类，这样都能保证通过 mountComponent 最终拿到渲染后的内容。

另外这边的事件也要说下，可以在传递 props 的时候传入{onClick:function(){}}这样的参数，这样就会在当前元素上添加事件，代理到 document。由于 React 本身全是在写 js，所以监听的函数的传递变得特别简单。

> 这里很多东西没有考虑，这里为了保持简单就不再扩展了，另外 React 的事件处理其实很复杂，实现了一套标准的 w3c 事件。这里偷懒直接使用 jQuery 的事件代理到 document 上了。

`自定义元素`的实现
随着前端技术的发展浏览器的那些基本元素已经满足不了我们的需求了，如果你对 web components 有一定的了解，就会知道人们一直在尝试扩展一些自己的标记。

React 通过虚拟 dom 做到了类似的功能，还记得我们上面 node.type 只是个简单的字符串，如果是个类呢？如果这个类恰好还有自己的生命周期管理，那扩展性就很高了。

在 React 中使用自定义元素

```
var CompositeComponent = React.createClass({
  getInitialState: function() {
    return {
      count: 0
    };
  },
  componentWillMount: function() {
    console.log("声明周期: " + "componentWillMount");
  },
  componentDidMount: function() {
    console.log("声明周期: " + "componentDidMount");
  },
  onChange: function(e) {
    var count = ++this.state.count;
    this.setState({
      count: count
    });
  },
  render: function() {
    const count = this.state.count;
    var h3 = React.createElement(
      "h3",
      { onclick: this.onChange.bind(this), class: "h3" },
      `click me ${count}`
    );
    var children = [h3];

    return React.createElement("div", null, children);
  }
});

var CompositeElement = React.createElement(CompositeComponent);

var root = document.getElementById("container");

React.render(CompositeElement, root);
```

`React.createElement`接受的不再是字符串，而是一个 class。
React.createClass 生成一个自定义标记类，带有基本的生命周期：

- getInitialState 获取最初的属性值 this.state
- componentWillmount 在组件准备渲染时调用
- componentDidMount 在组件渲染完成后调用

React.createClass 的实现

```
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
  this._reactInternalInstance.receiveComponent(null, newState);
};

const React = {
  nextReactRootIndex: 0,

  /**
   * 创建 ReactClass
   * @param {*} spec 传入的对象
   */
  createClass: function(spec) {
    var Constructor = function(props) {
      this.props = props;
      this.state = this.getInitialState ? this.getInitialState() : null;
    };

    Constructor.prototype = new ReactClass();
    Constructor.prototype.constructor = Constructor;

    Object.assign(Constructor.prototype, spec);
    return Constructor;
  },

  /**
   * 自己上文的createElement方法
   */

  /**
   * 自己上文的render方法
   */
};
```

这里 createClass 生成了一个继承 ReactClass 的子类，在构造函数里调用 this.getInitialState 获得最初的 state。

> 为了演示方便,我们这边的 ReactClass 相当简单，实际上原始的代码处理了很多东西，比如类的 mixin 的组合继承支持,比如 componentDidMount 等可以定义多次，需要合并调用等等，有兴趣的去翻源码吧，不是本文的主要目的，这里就不详细展开了。

看看我们上面的两种类型就知道，我们是时候为自定义元素也提供一个 component 类了，在那个类里我们会实例化 ReactClass，并且管理生命周期，还有父子组件依赖。

首先改造 instantiateReactComponent

```
/**
 * 根据元素类型实例化一个具体的component
 * @param {*} node ReactElement
 * @return {*} 返回一个具体的component实例
 */
function instantiateReactComponent(node) {
  // 文本节点的情况
  if (typeof node === "string" || typeof node === "number") {
    return new ReactDOMTextComponent(node);
  }
  //浏览器默认节点的情况
  if (typeof node === "object" && typeof node.type === "string") {
    // 注意这里，使用了一种新的component
    return new ReactDOMComponent(node);
  }
  // 自定义的元素节点
  if (typeof node === "object" && typeof node.type === "function") {
    // 注意这里，使用新的component,专门针对自定义元素
    return new ReactCompositeComponent(node);
  }
}
```

> 这里我们添加了一个判断，处理自定义类型的 component

ReactCompositeComponent 的具体实现如下

```
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
```

自定义元素本身不负责具体的内容，他更多的是负责生命周期。具体的内容是由它的 render 方法返回的虚拟节点来负责渲染的。

> 本质上也是递归的去渲染内容的过程。同时因为这种递归的特性，父组件的 componentWillMount 一定在某个子组件的 componentWillMount 之前调用，而父组件的 componentDidMount 肯定在子组件之后，因为监听 mountReady 事件，肯定是子组件先监听的。

> 需要注意的是自定义元素并不会处理我们 createElement 时传入的子节点，它只会处理自己 render 返回的节点作为自己的子节点。不过我们在 render 时可以使用 this.props.children 拿到那些传入的子节点，可以自己处理。其实有点类似 web components 里面的 shadow dom 的作用。

初始化渲染的大致流程如下:

![](./WechatIMG8.jpeg)
