import React from "./React";
import TodoList from "./TodoList";

var Entry = React.createElement(TodoList);
var root = document.getElementById("root");
React.render(Entry, root);
