---
{
"title": "重学TypeScript",
"date": "2024-03-01",
"category": "技术",
"tags": ["web", "TypeScript"]
}
---
# 重学TypeScript

## TypeScript 类型

### any、known、never

一些区别：

1. `any`: 表示任意类型，可以赋值给任何类型，不会有类型检查。

2. `unknown`: 表示未知类型，和`any`一样，任何类型都可以赋值给`unknown`类型的对象。但是不能直接赋值给其他类型，需要类型断言或者类型判断后才能使用。在需要更加严格的类型检查时可以使用 unknown。

3. `never`: 表示永远不会出现的值的类型，是`ts`类型系统的底部类型，除了`never`，任何其他类型的变量都不能赋值给`never`

   通常在函数返回类型中使用，表示函数永远不会正常结束，或者抛出异常，或者无限循环等。或者用于类型检查

### infer

作用：可以用在`extends`后的条件语句中，用于推断待推断的类型



为什么需要这个关键字？试想一下**获取函数返回值类型**的场景：

```ts
type MyReturnTypeM<T> = T extends (...args: any[]) => R ? R : never
```

你可能会这么写，但是ts会报一个错误：`Cannot can name R. ts(2304)`。这是因为编译器不知道R是待导入的类型还是拼写错误。

如果我们手动定义了类型R呢？

```ts
type R = any
type MyReturnTypeM<T> = T extends (...args: any[]) => R ? R : never
```

这显然是不对的，无法获取到正确的返回值类型。那要怎么做？

```ts
type MyReturnTypeM<T> = T extends (...args: any[]) => infer R ? R : never
```

`infer R`表示待推断的返回值类型。若`T`是`(...args: any[]) => infer R`的子集，则返回函数返回值类型`R`，否则返回`never`



一些例子：

1. 获取`Promise`的泛型类型：

   ```ts
   type PromiseType = T extends Promise<infer>
   ```

2. **tuple** 转 **union** ，如：`[string, number]` -> `string | number`

   ```ts
   type TupleItem<T> = T extends Array<infer E> ? E : never
   ```



### keyof

作用：取类型中键名作为联合类型

```ts
interface User {
    id: number
    name: string
    age: number
}

type Keys = keyof User
// Keys: "id" | "name" | "age"
```

一些例子：

1. 实现较为安全的get方法：

   ```ts
   interface User {
     id: number
     name: string
     age: number
   }
   
   // 这么写key的类型扩大为 string 无法限制 key 为 User中的键名
   const getValue = (item: user, key: string) => {
       return item[key]
   }
   
   // OK 不但可以限制 key 必须时 object 中的键名，而且返回值可以根据传入的 key 收窄为对应的 value 类型
   const getValue = <T extends object, K extends keyof T>(item: T, key: K): T[K] => {
     return item[key]
   }
   ```

### in

作用：取联合类型的值，主要用于数组、对象的构建

一些例子：

1. 构建对象

   ```ts
   type KeyName = "name" | "desc"
   type TempObj = {
       [key in KeyName]: string
   }
   
   // TempObj 和 TempObj2没有区别
   // type TempObj2 = {
   //   name: string
   //   desc: string
   // }
   ```

2. 结合`keyof`实现Pick

   ```ts
   type MyPick<T, K extends keyof T> = {
     [Key in K]: T[Key]
   }
   ```

### readonly

作用：限制属性只读

一些例子：

1. 实现`ReadOnly`

   ```ts
   type MyReadonly<T> = {
     readonly [key in keyof T]: T[key]
   }
   ```

### Indexed Access Types

索引访问类型

一些例子：

1. 获取对象中属性类型

   ```ts
   type Person = { 
     age: number
     name: string
     alive: boolean
   }
   type Age = Person["age"]
   
   // type Age = number
   ```

2. 获取对象数组中对象的某个属性的类型

   ```ts
   const MyArray = [
     { name: "Alice", age: 15 },
     { name: "Bob", age: 23 },
     { name: "Eve", age: 38 },
   ];
    
   // 注意这个 number，用于获取数组中元素的类型
   type Person = typeof MyArray[number];
   
   type Age = typeof MyArray[number]["age"];
   ```

###  Conditional Types

前面的还都好理解，这个就有点整活了

[分布式条件类型](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)是 TypeScript 中条件类型的特殊功能之一，也被称为条件类型的分布式特性。



来看一下内置类型`Extract`:

```ts
// 从T中提取类型U，组成新的类型
type MyExtract<T, U> = T extends U ? T : never
```

问题来了：

```ts
// type A = "a" | "b"
type A = MyExtract<"a" | "b" | "c", "a" | "b">

// type B = never
type B = "a" | "b" | "c" extends "a" | "b" ? "a" | "b" | "c" : never
```

对于类型`A`的结果，是满足需求的。但是再来看一下类型`B`，`B`同样是判断`T extends U`是否成立，为什么结果不一致？当然B也没错，`"a" | "b" | "c" ` 确实不是 `"a" | "b"` 的子集。

问题出现在哪里？

比较一下 `A`、`B` 的差异，发现 `A` 中联合类型传入泛型参数，再通过泛型参数判断的，而 `B` 直接用联合类型判断。



再看一个问题：

```ts
type ToArray<Type> = Type extends number ? 1 : 0
// type A = 0 | 1
type A = ToArray<string | number>

type ToArrayNonDist<Type> = [Type] extends [number] ? 1 : 0
// type B = 0
type B = ToArrayNonDist<string | number>
```

`A` 和 `B` 不一致，对于 `B`，`[string | number]` 确实不是 `[number]` 的子集。来观察下A，结果是 `0 | 1`，是不是分别拿 `string`、`number` 去判断是否是 `number` 的子集？正好得到结果 `0 | 1`。



总结一下这两个差异：**是否作为泛型参数**、**泛型参数在条件类型中是否被数组包裹**。

”当传入的类型参数为联合类型时，他们会被分配类型。” 即联合类型的每一个类型会被单独拿出来依次做条件类型的判断，结果再组合成联合类型。



一些例子：

1. 实现一个 `Merge<T extends Recordable, U extends Recordable>`类型，将类型 `U` 中的属性合并到 `T` 中，得到一个新类型。遇到属性名相同但类型不同的情况，以 `U` 为准。

   ```ts
   type Recordable = Record<string, any>;
   
   export type ObjectIntersection<
     T extends Recordable,
     U extends Recordable
   > = Pick<T, Extract<keyof T, keyof U>>;
   
   export type ObjectDifference<
     T extends Recordable,
     U extends Recordable
   > = Pick<T, Exclude<keyof T, keyof U>>;
   
   type Merge<
     T extends Recordable,
     U extends Recordable
     // T 比 U 多的部分，加上 T 与 U 交集的部分(类型不同则以 U 优先级更高)，再加上 U 比 T 多的部分即可
   > = ObjectDifference<T, U> & ObjectIntersection<U, T> & ObjectDifference<U, T>
   ```

   举一反三，如何做到遇到属性名相同但类型不同的情况，以 `T` 为准呢？

   ```ts
   type Merge<
     T extends Recordable,
     U extends Recordable
     // T 比 U 多的部分，加上 T 与 U 交集的部分(类型不同则以 U 优先级更高)，再加上 U 比 T 多的部分即可
   > = ObjectDifference<T, U> & ObjectIntersection<T, U> & ObjectDifference<U, T>
   ```

   **注意**：这里是不能直接用 `|`  或者 `&` 实现上述需求的。 `&` 交叉类型 ：数学当中的并集；`| ` 联合类型：编程当中的“或”操作

