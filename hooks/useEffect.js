function useEffect(effect, deps) {
  // 1. 获取上一次渲染的 Hook 节点（来自 current 树）
  const prevHook = currentFiber.alternate?.hooks; 
  // 2. 创建本次渲染的 Hook 节点（workInProgress 树）
  const currentHook = {
    effect,
    cleanup: prevHook?.cleanup, // 暂存上一次的清理函数
    prevDeps: prevHook?.deps,   // 保存上一次的依赖
    deps: deps,                 // 保存本次的新依赖
  };

  // 3. 对比新旧依赖
  const depsChanged = !currentHook.prevDeps || 
    currentHook.deps.some((d, i) => !Object.is(d, currentHook.prevDeps[i]));

  if (depsChanged) {
    // 依赖变化：调度执行副作用（含清理旧副作用）
    scheduleEffect(() => {
      currentHook.prevCleanup?.(); // 执行上一次的清理函数
      currentHook.cleanup = effect(); // 执行新副作用，保存新清理函数
    });
  }

  // 4. 更新链表，准备下一次渲染
  currentFiber.hooks = currentHook;
}

const scheduleEffect = (effect) => {
  // 模拟异步调度，实际 React 会使用任务队列
  setTimeout(effect, 0);
};