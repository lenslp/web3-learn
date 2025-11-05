// 存储所有ref对象的数组
let refs = [];
// 记录当前useRef调用的索引
let refIndex = 0;

// 模拟组件渲染函数
function render(component) {
    // 每次渲染前重置索引
    refIndex = 0;
    const ui = component();
    console.log('组件渲染结果:', ui);
    return ui;
}

// 简化版useRef实现
function useRef(initialValue) {
    // 保存当前索引
    const currentIndex = refIndex;
    
    // 首次调用时初始化ref对象
    if (!refs[currentIndex]) {
        refs[currentIndex] = { current: initialValue };
    }
    
    // 索引自增
    refIndex++;
    
    // 返回ref对象（始终是同一个引用）
    return refs[currentIndex];
}

// 测试组件
function App() {
    // 创建两个ref
    const countRef = useRef(0);
    const inputRef = useRef(null);

    // 模拟点击事件修改ref
    const handleClick = () => {
        countRef.current++;
        console.log('countRef更新后的值:', countRef.current);
    };

    // 模拟输入框聚焦
    const focusInput = () => {
        if (inputRef.current) {
            inputRef.current.focus();
            console.log('输入框已聚焦');
        }
    };

    return {
        type: 'div',
        content: [
            `当前countRef值: ${countRef.current}`,
            { type: 'button', label: '增加ref值', onClick: handleClick },
            { type: 'button', label: '聚焦输入框', onClick: focusInput },
            { type: 'input', ref: inputRef }
        ]
    };
}

// 首次渲染
console.log('=== 首次渲染 ===');
let app = render(App);

// 模拟用户交互
console.log('\n=== 点击增加ref值 ===');
app.content[1].onClick();

console.log('\n=== 再次渲染组件 ===');
app = render(App); // 重新渲染后ref值保持不变

console.log('\n=== 点击聚焦输入框 ===');
app.content[2].onClick();
