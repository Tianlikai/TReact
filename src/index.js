import TReact from './TReact'

// const MyTitle = TReact.createClass({
//     render() {
//         return TReact.createElement('h1', null, this.props.message)
//     }
// })

// const mount = TReact.createElement('h1', null, 'hello world')
// const root = document.getElementById('root')

// TReact.render(
//     mount,
//     root
// )

// const mount = TReact.createElement(MyTitle, { message: 'hey there TReact' })
// const root = document.getElementById('root')

// TReact.render(
//     mount,
//     root
// )

/**
 * 元组件测试
 */
// const root = document.getElementById('root')

// TReact.render(
//     TReact.createElement('h1', null, 'hello'),
//     root
// );

// setTimeout(function() {
//     TReact.render(
//         TReact.createElement('h1', null, 'hello again'),
//         root
//     );
// }, 2000);

/**
 * 复合组件测试
 */
const root = document.getElementById('root')
const MyCoolComponent = TReact.createClass({
    render() {
        return TReact.createElement('h1', null, this.props.myProp)
    }
})

TReact.render(
    TReact.createElement(MyCoolComponent, { myProp: 'hi' }),
    root
)

// some time passes

setTimeout(function() {
    TReact.render(
        TReact.createElement(MyCoolComponent, { myProp: 'hi again' }),
        root
    )
}, 2000)