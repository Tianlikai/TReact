# react 源码分析

思维导图
![](./ThinkingPirate.png)

## 写在前面
react 最基本的理解就是 
html 中有一个 root的 container 元素
通过一系列的js 函数的生命周期函数 生产新的html插入到 root元素中

## react 具有的api
* render 渲染
* TopLevelWrapper 复合组件 使元组件和复合组件处理方式相同
* createElement 创建dom元素
* createClass 创建组件
* 组件模型
* 组件模型插入html
* 复合组件模型（分层处理，控制调用具体的组件模型）

## 元素和组件
* 原生DOM元素
* 虚拟React元素
* 组件
* 用户定义的复合组件
