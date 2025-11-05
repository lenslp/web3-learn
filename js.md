## ESM
ESM 的设计围绕 “静态化” 和 “标准化”，这也是它区别于 CommonJS 等非标准模块的关键
1. 静态语法：编译时确定依赖
  + 导入/导出语句必须在模块顶层：不能嵌套在 if、函数等动态代码块中，确保打包工具在编译阶段（而非运行时）就能分析出依赖关系。
  + 这是 ESM 最核心的特性，也是 Tree-shaking、按需加载的基础。
2. 每个 ESM 模块都是一个独立的作用域，避免全局变量污染
3. 浏览器原生使用：直接在 HTML 中通过 <script type="module" /> 引入 ESM 模块，无需打包工具
4. Node.js 中使用：
  + 文件后缀为 .mjs（明确标记为 ESM 模块）
  + 在 package.json 中添加 "type": "module"

## proxy和reflect
+ proxy：用于创建一个代理对象，用于拦截对目标对象的操作
+ reflect：用于操作目标对象的默认行为
+ 实际应用：
  + 日志记录：可以在代理对象上添加日志记录功能，记录对目标对象的操作
  + 权限控制：可以在代理对象上添加权限控制功能，限制对目标对象的访问
  + 缓存：可以在代理对象上添加缓存功能，避免重复计算
  + 数据验证：可以在代理对象上添加数据验证功能，确保对目标对象的操作符合预期
  + 响应式：可以在代理对象上添加响应式功能，当目标对象的状态发生变化时，自动更新代理对象的状态
```
const obj = { name: 'lens', age: 18 }
new Proxy(obj, ()=> {
  get(target, prop){
    console.log(`获取属性 ${prop}: ${target[prop]}`);
    return Reflect.get(target, prop);
  }
  set(target, prop, value){
    console.log(`设置属性 ${prop} 为 ${value}`);
    return Reflect.set(target, prop, value);
  }
})
```
```
// 响应式：创建可观察对象
const createObservable = (obj, callback) => {
  return new Proxy(obj, {
    get(target, prop) {
      console.log(`获取属性 ${prop}: ${target[prop]}`);
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      callback(target, prop, value);
      return Reflect.set(target, prop, value);
    }
  });
};
const observable = createObservable(obj, (target, prop, value) => {
  console.log(`属性 ${prop} 被设置为 ${value}`);
});
observable.age = 20;
```

## set、map、weakset、weakmap
+ set：用于存储唯一值的集合
+ map：用于存储键值对的集合
+ weakSet：用于存储对象的集合，对象被垃圾回收后，集合中对应的对象也会被自动删除
+ weakMap：用于存储键值对的集合，键必须是对象，值可以是任意类型，对象被垃圾回收后，集合中对应的键值对也会被自动删除

## 迭代器 iterator
+ 作用：统一各种数据结构的 “遍历” 行为（如数组、对象、Map、Set 等）
+ 方法：
  + next()：返回一个对象，包含两个属性：value（当前遍历到的元素）和 done（是否遍历完成）
  + Symbol.iterator：用于返回迭代器对象的方法，如数组、字符串、Set、Map 等都实现了该方法
  + for...of 循环：可以使用 for...of 循环遍历可迭代对象，如数组、字符串、Set、Map 等
+ 实际应用：
  + 遍历数组：可以使用迭代器遍历数组，获取数组中的每个元素
  + 遍历字符串：可以使用迭代器遍历字符串，获取字符串中的每个字符
  + 遍历 Set 或 Map：可以使用迭代器遍历 Set 或 Map，获取 Set 或 Map 中的每个元素
```
// 自定义一个可迭代的范围对象
const range = {
  start: 1,
  end: 3,
  // 部署 Symbol.iterator 方法，使其成为可迭代对象
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    // 返回迭代器（包含 next 方法）
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
};

// 用 for...of 遍历（自动调用迭代器）
for (const num of range) {
  console.log(num); // 1 → 2 → 3
}
```
  ## generator
+ 作用：可以暂停和恢复执行的函数
+ 关键特性：
  + 可以使用 yield 关键字暂停函数的执行，返回一个值
  + 可以使用 next() 方法恢复函数的执行，返回一个对象，包含两个属性：value（yield 关键字返回的值）和 done（是否执行完成）
  + next传入的值，会赋值给上一次yield的返回值
+ 实际应用：
  + 异步流程控制
+ 与async await的关系：
  + Async函数本质是Generator的语法糖
  + async ≈ function* + 自动执行器
  + await ≈ yield
```typescript
const generator = function* () {
    const a = yield 1;
    const b = yield a + 2; // a的值为1，b的值为3
    return b + 3;
}
const gen = generator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next(1)); // { value: 3, done: false }
console.log(gen.next(2)); // { value: 5, done: true }
```

## generator和iterator的关系
+ Generator 是生成 Iterator 的便捷工具
+ Iterator 是一种协议规范（定义了 next() 方法和 { value, done } 返回格式），任何符合该规范的对象都可以被 for...of 遍历
+ Generator会返回一个符合Iterator协议的对象，即包含next方法的对象

## 装饰器
+ 作用：装饰类或者类的属性和方法，在不修改原代码的情况下修改或者扩展功能
+ 关键特性：
  + 使用 @ 符号添加装饰器
  + 装饰器函数可以接收原函数作为参数，返回一个新的函数
+ 参数解析：
  + 装饰器函数可以接收多个参数，第一个参数是目标对象，第二个参数是属性名，第三个参数是属性描述符
```typescript
// 类装饰器
function classDecorator(target) {
    target.prototype.name = 'lens';
}
@classDecorator
class Person {
    constructor() {
        this.age = 18;
    }
}
console.log(new Person()); // Person { name: 'lens', age: 18 }
// 属性装饰器
function propertyDecorator(target, prop, descriptor) {
    console.log(`属性 ${prop} 被装饰了`);
}
class Person {
    @propertyDecorator
    name = 'lens';
}
```
## promise实现
1. 定义三种状态：pending、fulfilled、rejected
2. constructor初始化：
    + 在类中定义状态属性，初始值为pending
    + 定义value属性，用于存储返回值
    + 定义reason属性，用于存储失败原因
    + 定义onFulfilledCallbacks和onRejectedCallbacks数组，用于存储fulfilled和rejected状态的回调函数
    + 定义resolve和reject方法，用于改变状态和设置返回值
        + resolve方法：用于将状态改为fulfilled、设置返回值、执行onFulfilledCallbacks数组中的回调函数
        + reject方法：用于将状态改为rejected、设置失败原因、执行onRejectedCallbacks数组中的回调函数
    + 立即执行构造函数
4. 定义then方法：
    + then方法：用于添加onFulfilled和onRejected回调函数
    + 返回新的Promise对象，用于链式调用
    + 当状态为pending时，将回调函数添加到对应的数组中
    + 当状态为fulfilled或rejected时，立即执行对应的回调函数
5. 定义catch方法：
    + 调用then方法，添加onRejected回调函数
```typescript
class MyPromise {
    const PENDING = 'pending';
    const FULFILLED = 'fulfilled';
    const REJECTED = 'rejected';
    constructor(executor) {
        this.status = this.PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        try {
            executor(this.resolve, this.reject);
        } catch (error) {
            this.reject(error);
        }
    }
    resolve = (value) => {
        if (this.status === this.PENDING) {
            this.status = this.FULFILLED;
            this.value = value;
            this.onFulfilledCallbacks.forEach(callback => callback(this.value));
        }
    }
    reject = (reason) => {
        if (this.status === this.PENDING) {
            this.status = this.REJECTED;
            this.reason = reason;
            this.onRejectedCallbacks.forEach(callback => callback(this.reason));
        }
    }
    then = (onFulfilled, onRejected) => {
        const newPromise = new MyPromise((resolve, reject) => {
            const handleFulfilled = () => {
              setTimeout(() => {
                try {
                  const x = onFulfilled(this.value);
                  resolve(x);
                } catch (err) {
                  reject(err);
                }
              }, 0);
            };
            const handleRejected = () => {
              setTimeout(() => {
                try {
                  const x = onRejected(this.reason);
                  resolve(x);
                } catch (err) {
                  reject(err);
                }
              }, 0);
            };
            if (this.status === this.FULFILLED) {
                handleFulfilled();
            }
            if (this.status === this.REJECTED) {
                handleRejected();
            }
            if (this.status === this.PENDING) {
              this.onFulfilledCallbacks.push(handleFulfilled);
              this.onRejectedCallbacks.push(handleRejected);
            }
        });
        return newPromise;
    }
    catch = (onRejected) => {
        return this.then(undefined, onRejected);
    }
}
```

## requestAnimationFrame、requestIdleCallback
+ requestAnimationFrame（渲染之前执行）
  - 执行时机：浏览器每次准备开始渲染一帧前，会先执行所有通过 requestAnimationFrame 注册的回调函数，回调执行频率与屏幕刷新率一致。
  - 当任务与视觉渲染相关（动画、DOM 更新），需要高频、定时执行，且不能容忍延迟（否则会卡顿）。
  - 常用于动画、dom渲染、高频视觉更新
+ requestIdleCallback：（渲染之后执行）
  - 执行时机：主线程空闲时，当前桢渲染完成后，且浏览器有空闲时间（小于16.6ms），会执行所有通过 requestIdleCallback 注册的回调函数，如果没有空闲时间，会推迟到下一帧的空闲时间执行。
  - 当任务是非紧急、非视觉相关的（日志、预加载），可延迟执行，且需避免占用主线程资源影响核心交互。
  - 常用于性能监控数据上报、非重要计算

## 原型和原型链
1. 原型：每个函数都有一个prototype属性，指向一个对象，这个对象就是原型。
2. 原型链：每个对象都有一个__proto__属性，指向其构造函数的prototype。访问对象属性时，先在对象本身上查找，如果没有找到，就会沿着__proto__链向上查找，直到找到该属性或到达原型链的末尾（null）。原型链的顶端是 Object.prototype（null）
  + 实例对象.__proto__ === 构造函数.prototype

## 继承的实现
1. 原型链继承：
  - 子类型的原型（prototype）指向父类型的实例（new Parent()）
  - 子类型可以访问父类型的属性和方法
  - 问题：子类型实例化时，不能向父类型构造函数传递参数
2. 构造函数继承：
  - 将父类的this绑定到子类上（call或apply）
  - 问题：父类型的方法在子类型中不能共享，每个子类型实例都有自己的方法副本
3. 组合继承：
  - 结合原型链继承 + 构造函数继承，继承属性用原型链继承，继承方法用构造函数继承
  - 问题：调用了两次父类型构造函数，第一次是在创建子类型原型时，第二次是在子类型构造函数中
4. es6的class继承：
  - 使用extends关键字实现继承
  - 子类可以调用super()方法调用父类的构造函数
  - 子类可以重写父类的方法

## 事件循环
1. js是单线程的，为了避免阻塞主线程，引入了事件循环机制。
2. 执行主线程同步代码（本轮宏任务）
3. 遇到微任务放入本轮微任务队列，遇到宏任务，放入下一轮宏任务队列执行
3. 清空微任务队列（promise.then、async/await、process.nextTick）（本轮事件循环执行完毕）
4. 从宏任务队列取出第一个任务并执行（如setTimeout、setInterval、setImmediate）
5. 清空微任务队列

## 模块化规范
1. CommonJS：
  - 每个文件都是一个模块，模块内部的变量和函数默认是私有的，外部需要通过module.exports导出，通过require引入。
  - 同步加载，适用于服务端（如node.js）。
2. AMD（Asynchronous Module Definition）：
  - 异步加载模块，适用于浏览器。
  - 定义模块时，需要指定依赖的模块，加载完成后执行回调函数。
  - 可以通过script标签引入，也可以使用require.js等工具加载。
3. UMD（Universal Module Definition）：
  - 同时支持CommonJS和AMD规范，适用于浏览器和服务端。
  - 定义模块时，需要判断当前环境是CommonJS还是AMD，根据环境选择不同的导出方式。
4. ES6的模块系统(ESM)：
  - 使用import和export关键字实现模块的导入和导出。
  - 静态分析，在编译时确定模块的依赖关系，适用于浏览器和服务端。

## 错误捕获
1. try catch
2. promise.catch
3. window.addEventListener('error', (error) => {
  console.error('捕获到错误:', error);
});
4. window.onError

## web worker
1. 独立线程：web worker 运行在独立的线程中，与主线程分离，不会阻塞主线程的运行。
2. 通信机制：主线程通过postMessage方法向 web worker 发送消息，web worker 也可以通过postMessage将结果发送回主线程。通过onmessage事件监听主线程发送的消息。
3. 限制：web worker 不能直接访问 DOM 元素，也不能调用一些浏览器的 API（如 window、document），但可以使用一些浏览器提供的 API（如 fetch）。
4. 避免过度使用：
  + 小任务无需使用 web worker，初始化和通信的开销可能超过任务本身耗时。
  + 控制 Worker 数量（建议 ≤ CPU 核心数，通过 navigator.hardwareConcurrency 获取），过多线程会导致 CPU 上下文切换频繁。

## 对于一个大任务，拆分多个web worker，如何保证顺序
1. 拆分任务，按线程数平均分配任务，每个线程负责处理一部分任务。（线程数建议 ≤ CPU 核心数，通过 navigator.hardwareConcurrency 获取）
2. 每个任务都携带一个 index，worker 完成后回传 index，主线程按 index 排序再输出。
```typescript
const promises = tasks.map((task, index) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('worker.js');
    // 发送任务给子线程
    worker.postMessage({ task, index });
    // 监听子线程返回的结果
    worker.onmessage = (event) => {
      resolve(event.data)
      worker.terminate();
    };
    // 监听错误
    worker.onerror = (error) => {
      console.error('子线程发生错误:', error);
      worker.terminate();
    }
  };
});
// 子线程（worker.js）：返回结果时携带序号
self.onmessage = (e) => {
  const { index, start, end } = e.data;
  let sum = 0;
  // 计算逻辑（省略质数判断）
  for (let i = start; i <= end; i++) { /* 质数累加 */ }
  // 返回时包含原始序号
  self.postMessage({ index, sum });
  self.close();
};
// 主线程根据index进行排序、合并
const results = Promise.all(promises)
  .then((results) => {
    // 对results按照index排序
    results.sort((a, b) => a.index - b.index);
    const finalResult = results.reduce((acc, cur) => acc + cur, 0);
    console.log('最终结果:', finalResult);
  })
  .catch((error) => {
    console.error('子线程发生错误:', error);
  });
```

## 如何实现流式渲染呢，而不是拿到所有结果之后再渲染
1. 传递索引的逻辑和之前保持一致
2. 主线程拿到结果后先存在results数组中: results[index] = task
1. 定义一个全局指针，表示 “下一个应该被渲染的任务的 nextToRenderIndex”，初始值为0
2. 通过while循环判断results[nextToRenderIndex]是否存在，存在则渲染，并且nextToRenderIndex+1，不存在则
```typescript
const results = [];
const tasks = [task1, task2, task3];
let nextToRenderIndex = 0;

tasks.forEach((task, index) => {
  const worker = new Worker("worker.js");
  worker.postMessage({ index, data: task });

  worker.onmessage = (e) => {
    const { index, result } = e.data;
    results[index] = result;

    // 判断当前位置是否已经拿到结果
    while (results[nextToRenderIndex]) {
      render(results[nextToRenderIndex]);
      nextToRenderIndex++;
    }
  };
});
```

## 垃圾回收机制
1. 标记-清除算法：
  - 从根对象（如window）开始，遍历所有对象，标记所有被引用的对象，未被标记的对象就是可回收的垃圾。
  - 清除所有未被标记的对象，释放内存。
2. 引用计数算法：
  - 每个对象都有一个引用计数器，当有引用指向该对象时，计数器加1，当引用被释放时，计数器减1。
  - 当计数器为0时，对象就是可回收的垃圾。
  - 问题：循环引用会导致引用计数器 never 为0，无法被回收。
