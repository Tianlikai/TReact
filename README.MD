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
