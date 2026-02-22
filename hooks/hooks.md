## 什么是hooks
react16后引入的新特性，用于在函数组件中使用状态和其他react特性
## 为什么只能在函数顶层调用，不能在条件语句或循环中调用
+ React 会维护一个 “Hook 链表”，按 Hooks 的调用顺序依次存储它们的状态，下次渲染时，React 会按 相同的顺序 读取这个链表，确保每个 Hook 能拿到自己对应的状态。
+ 在循环或者条件语句中调用会导致hooks的调用顺序与预期不符，从而导致错误的状态更新
+ 为什么这样设计：保证了状态管理的轻量性，又通过顺序绑定简化了 React 内部的状态匹配逻辑
## useState实现
+ 创建全局变量state数组存储每次调用useState的状态
+ 创建全局变量index，用于记录当前调用的hooks的索引
+ 创建useState函数：
    + 在函数内部声明currentIndex变量，currentIndex = index
    + index递增：index++
    + 初始赋值：如果是首次调用该位置的 useState，初始化状态为 defaultValue（如果有），否则初始化为 undefined: state[currentIndex] = defaultValue || undefined
    + 创建setState函数：
        + 将新的状态值赋值给state数组中currentIndex对应的位置：state[currentIndex] = newValue，如果是函数式更新，则将函数的返回值作为新的状态值
        + setState通过闭包记住了currentIndex的值，因此即使 useState 函数已经执行完毕，setState 仍能在后续调用时准确找到对应的状态位置
        + 触发组件重新渲染（重新渲染前将index重置为0，确保状态与 useState 调用一一对应）
    + 返回当前状态和更新函数：[state[currentIndex], setState]
## useEffect实现
1. 初始化：记录副作用和依赖
  + 组件首次渲染时，useEffect会被调用，react会创建一个副作用对象，包含副作用函数、依赖数组、上一次依赖数组、清理函数
  + 该对象会被添加到fiber的hook链表中
2. 调度副作用执行
  + 首次渲染时，会立即执行副作用函数，并将清理函数赋值给副作用对象的cleanup属性
  + 后续渲染时，先执行上一次的清理函数，再执行当前的副作用函数，并将清理函数赋值给副作用对象的cleanup属性
3. 依赖项变化检测
  + 每次渲染时，会比较当前依赖项数组与上一次的依赖项数组是否相同（通过Object.is比较）
  + 如果不同，会执行当前的副作用函数，并更新上一次的依赖项数组
  + 如果相同，会跳过当前的副作用函数执行
4. 清理副作用
  + 组件卸载或者依赖项变化时，会调用上一次的清理函数，确保资源的正确释放
## useMemo
+ 作用：用于缓存计算结果，避免重复计算
+ 使用场景：处理复杂计算（如大数据过滤、排序等），防止因频繁计算导致的性能问题
+ 和React.memo的区别
  + useMemo：缓存计算结果，避免重复的昂贵计算
  + React.memo：缓存组件渲染结果，避免重复渲染
## useCallback
+ 作用：用于缓存函数的引用，让函数引用在依赖不变时保持稳定（当依赖项数组中的值发生变化时，才会重新创建函数，否则返回缓存的函数引用）
+ 使用场景：
  + 当需要将函数传递给子组件，且子组件使用 React.memo 优化时，避免因函数引用变化导致子组件不必要的重渲染
  + 当需要将函数作为依赖项传递给 useEffect 时，避免因函数引用变化导致 useEffect 重复执行
## useContext
+ 用于在组件树中共享数据，避免通过props传递数据
## useReducer
+ 用于管理组件的状态，避免使用useState时的多个状态更新问题
## useRef
+ 用于在函数组件中保存可变值，不触发重新渲染
+ 访问dom元素
## 为什么useRef可以获取到最新的状态，useState有时候却不行呢？
- useState每次更新状态都会触发组件重新渲染，并在新的渲染周期中创建新的变量引用
- 由于JavaScript的闭包特性，异步函数中捕获的是渲染时的状态值，而非最新值
- useRef通过保持对象引用不变，同时允许修改内部属性，完美解决了这一问题
## useRef实现
+ 创建全局变量 refs 数组存储每次调用 useRef 的引用对象
+ 创建全局变量 refIndex，用于记录当前调用的 useRef 的索引
+ 创建 useRef 函数，接收一个初始值 initialValue 作为参数
    + 在函数内部声明 currentIndex 变量，并将 refIndex 赋值给 currentIndex
    + 首次调用时，初始化一个包含 current 属性的对象，值为 initialValue，存入 refs 数组对应位置
    + 非首次调用时，直接使用 refs 数组中对应位置已存在的引用对象（保持引用不变）
    + 将 refIndex 递增，为下一次 useRef 调用做准备
+ 返回 refs 数组中 currentIndex 对应的引用对象（始终是同一个对象，current 属性可修改）
+ 组件重新渲染时，将 refIndex 重置为 0，确保 useRef 调用顺序与 refs 数组索引对应
## useTransition（React 18 新增）
+ 用于将任务更新标记为 “非紧急更新”，允许 React 先处理其他紧急更新（如用户输入），再处理该任务的更新
+ 接收一个状态更新函数作为参数，返回一个数组 const [isPending, startTransition] = useTransition()
    + isPending：表示当前是否有非紧急更新在处理中
    + startTransition：用于启动一个非紧急更新，接收一个状态更新函数作为参数
```
function Search() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // 输入框变化时，先更新输入（紧急），再过渡更新查询（非紧急）
  const handleChange = (e) => {
    setInput(e.target.value); // 紧急更新：立即响应输入
    startTransition(() => {
      setQuery(e.target.value); // 非紧急：延迟执行筛选/搜索
    });
  };

  return (
    <div>
      <input value={input} onChange={handleChange} />
      {isPending ? "加载中..." : <Results query={query} />}
    </div>
  );
}
```
## useDeferredValue（React 18 新增）
+ 为值创建延迟版本，当原始值变化时，副本会滞后更新，且更新过程可被紧急任务中断
+ 替代节流和防抖，用于处理一些需要延迟更新的场景，如搜索框输入、滚动事件等
+ 实时展示原始值，延迟渲染衍生内容
+ useTransition更侧重于控制状态更新的优先级，而useDeferredValue更侧重于创建值的延迟副本
```
function Editor() {
  const [text, setText] = useState("");
  // 创建延迟版本的 text，用于渲染预览
  const deferredText = useDeferredValue(text, { timeoutMs: 200 });

  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} // 立即更新输入
      />
      {/* 用延迟值渲染复杂预览，避免输入卡顿 */}
      <Preview content={deferredText} />
    </div>
  );
}
```
## useEffect和useLayoutEffect的区别
+ useEffect：在浏览器渲染完成后异步执行，不会阻塞浏览器渲染
+ useLayoutEffect：在dom更新之后，浏览器渲染之前执行，会阻塞浏览器渲染
+ 应用场景：
    + useEffect：用于处理异步操作，如数据获取、订阅事件等
    + useLayoutEffect：读取dom信息并同步修改，确保 DOM 操作在一次绘制中完成（避免闪烁）
## 自定义hooks
+ 自定义hooks是一种将组件逻辑提取到可重用的函数中的方式
+ 自定义hooks的名称必须以use开头
+ 自定义hooks可以使用其他的hooks，也可以接收参数并返回值