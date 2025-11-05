// 存储当前组件的状态数组
let state = []; // 实际react源码中是用fiber节点的stateNode属性来存储状态数组的
// 记录当前useState调用的索引
let index = 0;

// 模拟React的渲染函数
function render(component) {
    // 每次渲染前重置索引，保证useState调用顺序与状态对应
    index = 0;
    // 执行组件并获取其返回的UI结构
    const ui = component();
    console.log('组件渲染结果:', ui);
    return ui;
}

// 简化版useState实现
function useState(initialValue) {
    // 保存当前索引（形成闭包，确保更新函数能找到正确的状态）
    const currentIndex = index;
    
    // 首次渲染时初始化状态
    if (state[currentIndex] === undefined) {
        state[currentIndex] = initialValue;
    }
    
    // 定义状态更新函数
    function setState(newValue) {
        // 处理函数式更新 (如setCount(prev => prev + 1))
        if (typeof newValue === 'function') {
            state[currentIndex] = newValue(state[currentIndex]);
        } else {
            state[currentIndex] = newValue;
        }
        // 状态更新后重新渲染组件
        render(App);
    }
    
    // 索引自增，为下一个useState调用做准备
    index++;
    
    // 返回当前状态和更新函数
    return [state[currentIndex], setState];
}

// 测试组件
function App() {
    // 声明两个状态
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState('Hello');

    // 返回组件的"UI描述"
    return {
        type: 'div',
        content: [
            `计数: ${count}`,
            `消息: ${message}`,
            { type: 'button', label: '增加计数', onClick: () => setCount(c => c + 1) },
            { type: 'button', label: '修改消息', onClick: () => setMessage('World') }
        ]
    };
}

// 首次渲染组件
console.log('首次渲染:');
const app = render(App);

// 模拟用户交互
console.log('\n点击增加计数按钮:');
app.content[2].onClick();

console.log('\n点击修改消息按钮:');
app.content[3].onClick();

console.log('\n再次点击增加计数按钮:');
app.content[2].onClick();