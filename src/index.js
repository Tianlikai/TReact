import React from "./React";
import TodoList from "./component/TodoList";

var Entry = React.createElement(TodoList);
var root = document.getElementById("root");
React.render(Entry, root);
