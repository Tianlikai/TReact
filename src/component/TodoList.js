import React from "../React";

// 定义一个TodoList复合组件
const TodoList = React.createClass({
  getInitialState: function() {
    return { items: [] };
  },
  add: function() {
    var nextItems = this.state.items.concat([this.state.text]);
    this.setState({ items: nextItems, text: "" });
  },
  onChange: function(e) {
    this.setState({ text: e.target.value });
  },
  render: function() {
    var createItem = function(itemText) {
      return React.createElement("div", null, itemText);
    };

    var lists = this.state.items.map(createItem);
    var input = React.createElement("input", {
      onkeyup: this.onChange.bind(this),
      value: this.state.text
    });
    var button = React.createElement(
      "p",
      { onclick: this.add.bind(this) },
      "Add#" + (this.state.items.length + 1)
    );
    var children = [input, button].concat(lists);

    return React.createElement("div", null, children);
  }
});

export default TodoList;
