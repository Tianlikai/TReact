import React from "./React";
import TodoList from "./demo/TodoList";

/**
 * ReactDOMTextComponent组件
 */
// var TextComponent = "hello world!";
// var root = document.getElementById("root");

// React.render(TextComponent, root);

/**
 * ReactDOMComponent组件
 */
// function sayHello() {
//   alert("hello");
// }
// var div = React.createElement("div", {}, "jason");
// var DOMComponent = React.createElement(
//   "div",
//   { key: "jason", age: 22, onclick: sayHello },
//   "hello worlds!",
//   div
// );
// var root = document.getElementById("root");
// React.render(DOMComponent, root);

/**
 * ReactCompositeComponent组件
 */
// var CompositeComponent = React.createClass({
//   getInitialState: function() {
//     return {
//       count: 0
//     };
//   },
//   componentWillMount: function() {
//     console.log("声明周期: " + "componentWillMount");
//   },
//   componentDidMount: function() {
//     console.log("声明周期: " + "componentDidMount");
//   },
//   onChange: function(e) {
//     var count = ++this.state.count;
//     this.setState({
//       count: count
//     });
//   },
//   render: function() {
//     const count = this.state.count;
//     var h3 = React.createElement(
//       "h3",
//       { onclick: this.onChange.bind(this), class: "h3" },
//       `click me ${count}`
//     );
//     var children = [h3];

//     return React.createElement("div", null, children);
//   }
// });
// var CompositeElement = React.createElement(CompositeComponent);
// var root = document.getElementById("root");

// React.render(CompositeElement, root);

/**
 * TodoList组件
 */
var Entry = React.createElement(TodoList);
var root = document.getElementById("root");
React.render(Entry, root);
