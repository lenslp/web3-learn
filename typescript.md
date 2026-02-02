## ts类型有哪些
1. 基础类型：number、string、boolean、null、undefined、symbol
2. 数组类型：number[]、string[]、boolean[]、Array<number>、Array<string>、Array<boolean>
3. 元组类型：[number, string, boolean]
4. 枚举类型：enum Color { Red, Green, Blue }
5. 任意类型：any
6. 未知类型：unknown
7. 空类型：void
8. never类型：表示永远不会发生的值，如抛出异常或进入无限循环

## 交叉类型和联合类型
1. 交叉类型：将多个类型合并为一个类型，新类型包含所有类型的属性和方法。
```typescript
type A = { a: number };
type B = { b: string };

type AB = A & B; // { a: number; b: string; }
```
2. 联合类型：表示一个值可以是多个类型中的任意一个。
```typescript
type A = { a: number };
type B = { b: string };

type AB = A | B; // { a: number; } | { b: string; }
```

## type和interface的区别
1. 相同点：
    + 都可以定义对象类型
    + 都可以使用 extends 关键字进行扩展
    + 都可以使用 implements 关键字实现接口
2. 不同点：
    + type 可以定义基础类型、联合类型、交叉类型等，而 interface 只能定义对象类型。
3. 如何选择：能用 interface 实现的功能，就用 interface。否则，用 type。

## keyof 操作符
keyof 操作符用于获取一个对象类型的所有键名，返回一个联合类型。
```typescript
interface Person {
  name: string;
  age: number;
}

type PersonKeys = keyof Person; // "name" | "age"
```

## typeof 操作符
typeof 操作符用于获取一个变量或对象的类型。
```typescript
const person = {
  name: "张三",
  age: 18,
};

type PersonType = typeof person; // { name: string; age: number; }
```

## any、void、never、unknown 类型
1. any 类型：表示任意类型，关闭了类型检查。
2. void 类型：表示没有任何类型，主要用于函数没有返回值的情况。
3. never 类型：表示永远不会发生的值，如抛出异常或进入无限循环。
4. unknown 类型：表示未知类型，比any更安全，在使用时需要进行类型断言或类型检查。

## public protected private 访问修饰符
1. public：公有的，在任何地方都可以访问。
2. protected：受保护的，只能在类本身和子类中访问。
3. private：私有的，只能在类本身中访问。

## 泛型
泛型是一种在定义函数、接口或类时，不指定具体类型，而在使用时再指定类型的机制。
```typescript
// 函数
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>("hello"); // result 的类型为 string

// 接口
interface Identity<T> {
  (arg: T): T;
}

// 类
class GenericClass<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}
```
## 工具类型
1.  Partial<T>：将类型 T 的所有属性设为可选。
```typescript
interface Person {
  name: string;
  age: number;
}

type PartialPerson = Partial<Person>; // { name?: string; age?: number; }
```
2.  Required<T>：将类型 T 的所有属性设为必填。
```typescript
interface Person {
  name?: string;
  age?: number;
}

type RequiredPerson = Required<Person>; // { name: string; age: number; }
```
3.  Readonly<T>：将类型 T 的所有属性设为只读。
```typescript
interface Person {
  name: string;
  age: number;
}

type ReadonlyPerson = Readonly<Person>; // { readonly name: string; readonly age: number; }
```
4.  Record<K, T>：将类型 T 的所有属性设为 K 类型的键值对。
```typescript
type RecordPerson = Record<string, Person>; // { [key: string]: Person; }
```

## ?、??、!
1. ?：可选运算符，用于表示一个属性或参数是可选的。
2. ??：空值合并运算符，用于判断一个值是否为 null 或 undefined，如果是，则返回默认值。
3. !：非空断言运算符，用于告诉 TypeScript 编译器一个值不会为 null 或 undefined。

## implements 关键字
implements 关键字用于实现一个接口。
```typescript
interface IIndexService {
  log(str: string): void;
}

class IndexService implements IIndexService {
  log(str: string) {
    console.log(str);
  }
}
```
