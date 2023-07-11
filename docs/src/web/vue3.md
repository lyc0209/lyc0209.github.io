---
{
"title": "Vue3学习记录",
"date": "2023-05-08",
"category": "技术",
"tags": ["vue3", "web"]
}
---
# Vue3学习记录

## 基础变更
- Object.defineProperty => Proxy
- OptionApi => Composition API
- 更好的TypeScript支持
- 性能优化

### 1. Object.defineProperty => Proxy

**[Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)** 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。



Vue2实现响应式的原理是通过Object.defineProperty()，最大的问题是无法监听对象中属性增删、数组变化

[javascript - 记一次思否问答的问题思考：Vue为什么不能检测数组变动 - vue解析 - SegmentFault 思否](https://segmentfault.com/a/1190000015783546)

对比vue2的实现方式，有如下好处：

1. 更精确的响应式追踪：Vue 2.x 使用 Object.defineProperty 来追踪响应式属性的变化，但它只能劫持对象的属性访问和修改操作。而 Proxy 可以劫持更多类型的操作，包括属性的添加、删除等，因此能够提供更精确的响应式追踪。

2. 减少不必要的追踪开销：Vue 2.x 的响应式系统在对象或数组上进行递归遍历，为每个属性添加 getter 和 setter。这样会导致初始化时的性能开销较大，并且对于大型对象或数组性能可能会受到影响。`Proxy` 并不能监听到内部深层次的对象变化，而 `Vue3` 的处理方式是在`getter` 中去递归响应式，这样的好处是真正访问到的内部对象才会变成响应式，而不是无脑递归

   ```js
   const obj = {
     name: "lyc",
     config: {
       msg: "123"
     }
   }
   
   const handler = {
     get(target, key, receiver) {
       if (typeof target[key] === "object") {
         target[key] = new Proxy(target[key], handler);
       }
       console.log("get: ", target, key, receiver)
       return Reflect.get(target, key, receiver);
     },
     set(target, key, newValue, receiver) {
       console.log("set: ", target, key, newValue, receiver)
       return Reflect.set(target, key, newValue, receiver);
     }
   }
   
   const proxyObj = new Proxy(obj, handler)
   proxyObj.config.msg = "yyy"
   
   // output ----------------
   get:  { name: 'lyc', config: { error: true, msg: '123' } } config { name: 'lyc', config: { error: true, msg: '123' } }
   set:  { error: true, msg: '123' } msg yyy { error: true, msg: '123' }
   ```

   

3. 支持动态新增和删除属性：由于 Proxy 可以劫持属性的添加和删除操作，因此在 Vue 3 中可以直接对响应式对象进行属性的动态新增和删除，而无需像 Vue 2.x 那样需要使用特殊的方法（如 Vue.set）来处理。

4. 更好的类型推导：Proxy 不仅提供了更好的响应式追踪能力，还可以与 TypeScript 等静态类型检查工具结合使用，使得类型推导更加准确和友好。这对于开发大型应用或团队协作非常有益。

[示例](https://codepen.io/tmyhywcw-the-builder/pen/VwVbOqE)

```javascript
const input = document.getElementById('input');
const p = document.getElementById('p');
const obj = {};

const newObj = new Proxy(obj, {
  get: function(target, key, receiver) {
    console.log(`getting ${key}!`);
    return Reflect.get(target, key, receiver);
  },
  set: function(target, key, value, receiver) {
    console.log(target, key, value, receiver);
    if (key === 'text') {
      p.innerHTML = value;
    }
    return Reflect.set(target, key, value, receiver);
  },
});

input.addEventListener('keyup', function(e) {
  newObj.text = e.target.value;
});
```

### 2. OptionApi => Composition API

组合式 API (Composition API) 是一系列 API 的集合，使我们可以使用函数而不是声明选项的方式书写 Vue 组件。它是一个概括性的术语，涵盖了以下方面的 API：

- [响应式 API](https://cn.vuejs.org/api/reactivity-core.html)：例如 `ref()` 和 `reactive()`，使我们可以直接创建响应式状态、计算属性和侦听器。
- [生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle.html)：例如 `onMounted()` 和 `onUnmounted()`，使我们可以在组件各个生命周期阶段添加逻辑。
- [依赖注入](https://cn.vuejs.org/api/composition-api-dependency-injection.html)：例如 `provide()` 和 `inject()`，使我们可以在使用响应式 API 时，利用 Vue 的依赖注入系统。

```vue
// vue2
<template>
  <button @click="increment">点击了：{{ count }} 次</button>
</template>

<script>
export default {
  data() {
    return {
      // 响应式状态
      count: 0
    }
  },
  methods: {
    // 更改状态、触发更新的函数
    increment() {
      this.count++
    }
  },
  // 生命周期钩子
  mounted() {
    console.log(`计数器初始值为 ${this.count}。`)
  }
}
</script>
```

::: code-group

```vue [Counter1.vue]
// vue3
<template>
  <button @click="increment">点击了：{{ count }} 次</button>
</template>

<script>
import { ref, onMounted } from 'vue'
export default {
  setup() {
    // 响应式状态
    const count = ref(0)

    // 更改状态、触发更新的函数
    function increment() {
      count.value++
    }

    // 生命周期钩子
    onMounted(() => {
      console.log(`计数器初始值为 ${count.value}。`)
    })
    
    return {
      count,
      increment
    }
  }
}
</script>
```

```vue [Counter2.vue]
// vue3 with script setup
<script setup>
import { ref, onMounted } from 'vue'

// 响应式状态
const count = ref(0)

// 更改状态、触发更新的函数
function increment() {
  count.value++
}

// 生命周期钩子
onMounted(() => {
  console.log(`计数器初始值为 ${count.value}。`)
})
</script>

<template>
  <button @click="increment">点击了：{{ count }} 次</button>
</template>
```

:::



生命周期变化：
<img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202306011455696.png" style="zoom: 50%;" />
<img src="https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202306011457001.png" style="zoom:80%;" />

组合式 API的优势：

1. **更好的逻辑复用**

   组合式 API 最基本的优势是它使我们能够通过[组合函数](https://cn.vuejs.org/guide/reusability/composables.html)来实现更加简洁高效的逻辑复用。在选项式 API 中我们主要的逻辑复用机制是 mixins，而组合式 API 解决了 [mixins 的所有缺陷](https://cn.vuejs.org/guide/reusability/composables.html#vs-mixins)。

   示例：

   做数据请求操作

   ```vue
   <script setup>
   import { ref } from 'vue'
   
   const data = ref(null)
   const error = ref(null)
   
   fetch('...')
     .then((res) => res.json())
     .then((json) => (data.value = json))
     .catch((err) => (error.value = err))
   </script>
   
   <template>
     <div v-if="error">Oops! Error encountered: {{ error.message }}</div>
     <div v-else-if="data">
       Data loaded:
       <pre>{{ data }}</pre>
     </div>
     <div v-else>Loading...</div>
   </template>
   ```
   抽取成组合式函数：

   :::code-group

   ```js [fetch.js]
   // fetch.js
   import { ref } from 'vue'
   
   export function useFetch(url) {
     const data = ref(null)
     const error = ref(null)
   
     fetch(url)
       .then((res) => res.json())
       .then((json) => (data.value = json))
       .catch((err) => (error.value = err))
   
     return { data, error }
   }
   ```

   ```vue [Test.vue]
   <script setup>
   import { useFetch } from './fetch.js'
   
   const { data, error } = useFetch('...')
   </script>
   ```

   :::

   

   监听鼠标移动

   :::code-group

   ```ts [useMouseHook.ts]
   // useMouseHook
   import { ref, onMounted, onUnmounted } from 'vue';
   
   export const useMouseHook = () => {
     const x = ref(0)
     const y = ref(0)
   
     const updateMousePosition = (event) => {
       x.value = event.pageX;
       y.value = event.pageY;
     };
   
     onMounted(() => {
       window.addEventListener('mousemove', updateMousePosition)
     });
   
     onUnmounted(() => {
       window.removeEventListener('mousemove', updateMousePosition)
     })
   
     return { x, y }
   }
   ```

   ```vue [Test.vue]
   <template>
     <div>
       <p>Mouse X: {{ x }}</p>
       <p>Mouse Y: {{ y }}</p>
     </div>
   </template>
   
   <script setup>
   import { useMouseHook } from './useMouseHook'
   const { x, y } = useMouseHook()
   </script>
   ```

   :::

   

2. **更灵活的代码组织**

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202305091033284.png)

### 3. 更好的TypeScript支持

像 TypeScript 这样的类型系统可以在编译时通过静态分析检测出很多常见错误。这减少了生产环境中的运行时错误，也让我们在重构大型项目的时候更有信心。通过 IDE 中基于类型的自动补全，TypeScript 还改善了开发体验和效率。

Vue 本身就是用 TypeScript 编写的，并对 TypeScript 提供了一等公民的支持。所有的 Vue 官方库都自带了类型声明文件，开箱即用。

### 4. 性能优化

1. 静态节点标记

   在Vue2.0当中，当数据发生变化，它就会新生成一个DOM树，并和之前的DOM树进行比较，找到不同的节点然后更新。但这比较的过程是全量的比较，也就是每个节点都会彼此比较。但其中很显然的是，有些节点中的内容是不会发生改变的，那我们对其进行比较就肯定消耗了时间。所以在Vue3.0当中，就对这部分内容进行了优化：在创建虚拟DOM树的时候，会根据DOM中的内容会不会发生变化，添加一个静态标记。那么之后在与上次虚拟节点进行对比的时候，就只会对比这些带有静态标记的节点。

   示例代码：

   ```vue
   <template>
     <div>
       <h3>hello World</h3>
       <p>{{msg}}</p>
     </div>
   </template>
   ```

   vue2中的VNode在进行更新patch操作diff过程为全量对比：

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202307111613966.png)

   在发生数据更新的时候，只有div标签绑定的msg为动态值，可是在进行新旧VNode diff过程中，不会发生变化的节点也会参与其中进行完整的VNode树进行diff。

   

   vue3中的静态标记在diff过程的优化：在compile阶段对VNode每一个元素做了对应的PatchFlags进行标记，所以在diff过程中，就可以根据具体哪些发生了变化，进行有目标的diff实现`靶向更新`

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202307111619700.png)

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202307111634436.png)

2. 静态提升

   指在编译器编译的过程中，将一些静态的节点或属性提升到渲染函数之外。

   1. **template**（[示例](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2PlxyXG4gIDxwPnN0YXRpYyB0ZXh0PC9wPlxyXG4gIDxwPnt7IHRpdGxlIH19PC9wPlxyXG48L2Rpdj4iLCJvcHRpb25zIjp7fX0=)）

      假设有如下模板：

      ```vue
      <div>
        <p>static text</p>
        <p>{{ title }}</p>
      </div>
      ```

      :::code-group

      ```js [无静态提升]
      function render() {
        return (openClock(), createClock('div', null,  [
          createVNode('p', null, 'static text'),
          createVNode('p', null, ctx.title, 1 /* TEXT */)
        ]))
      }
      ```

      ```js [有状态提升]
      // 把静态节点提升到渲染函数之外
      const hoist1 = createVNode('p', null, 'text')
      
      function render() {
        return (openBlock(), createBlock('div', null, [
          hoist1, // 静态节点引用
          createVNode('p', null, ctx.title, 1 /* TEXT */)
        ]))
      }
      ```

      :::

      经过静态提升后，在渲染函数内只会持有对静态节点的引用。当响应式数据发生变化，并使得渲染函数重新执行时，并不会重新创建静态的虚拟节点，从而避免了额外的性能开销。

   2. **script**（vue3.3+新增）（[示例](https://play.vuejs.org/#eNqNUV1LwzAU/SsxL1OwLThBGHNMZaA+qKjgS15qe9dlNjfhJt0mo//dNHWzmx/4lpxzknPuuWt+YUy8qIAP+NBmJI1jFlxlRgKlMpocWzOCKavZlLRiPS/tCRSYabSOKVuw84Y/7F1DWWr2oqnMD3pHGwGmCrxC8PI9E1zgMGlNRvyYt/9HKjXx3Gr0CdYCmde2hBV8wALSYN63uQs+c87YQZJkOfpnOZRyQTGCS9CoZOxlCVXopIIo12rcj0/i07Mkl9Z18Risil5JLy2Q/0Xw445P4sEFUESAORDQf333nu1473Hf/Bv7WmDta3HWVzeVxV4pmVZGlkD3xklf7U45qa9+eRswRxVsh8lmkL39gM/tqh3qgSAk6xTgUirAtfTk6Q5W/rwllc6r8nMRv5CPYHVZNRlb2WWFuY/d0YW0N2HHEotnO1k5QLsZqgka2gj6sJCrP0b/ituP+9sW6w88n/Qh)）

      假设有如下script：

      ```vue
      <script setup>
      import { ref } from 'vue'
      
      const msg = ref('Hello World!')
      const name = "lyc"
      </script>
      ```

      :::code-group

      ```vue [无静态提升]
      <script>
      import { ref } from 'vue'
      export default {
        setup() {
        	const msg = ref('Hello World!')
      	const name = "lyc"
        }
      }
      </script>
      ```

      ```vue [有静态提升]
      <script>
      import { ref } from 'vue'
      const name = "lyc"
      export default {
        setup() {
        	const msg = ref('Hello World!')
        }
      }
      </script>
      ```
      
      :::

2. 事件缓存（[示例](https://template-explorer.vuejs.org/#eyJzcmMiOiI8YnV0dG9uIEBjbGljaz1cIm9uQ2xpY2tcIj48L2J1dHRvbj4iLCJvcHRpb25zIjp7ImNhY2hlSGFuZGxlcnMiOnRydWV9fQ==)）

   默认情况下onClick会被视为动态绑定，所以每次都会去追踪它的变化，但是因为是同一个函数，所以没必要去追踪它的变化，想办法将它直接缓存起来复用就会提升性能。

   假设有如下组件：

   ```vue
   <button @click="onClick"></button>
   ```

   无事件监听缓存：

   ```js
   import { openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"
   
   export function render(_ctx, _cache, $props, $setup, $data, $options) {
     return (_openBlock(), _createElementBlock("button", { onClick: _ctx.onClick }, null, 8 /* PROPS */, ["onClick"]))
   }
   
   // Check the console for the AST
   ```

   有事件监听缓存：

   ```js
   import { openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"
   
   export function render(_ctx, _cache, $props, $setup, $data, $options) {
     return (_openBlock(), _createElementBlock("button", {
       onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.onClick && _ctx.onClick(...args)))
     }))
   }
   
   // Check the console for the AST
   ```



## 新增概念

### 1. defineProps

setup语法糖中定义props

```vue
<script setup lang="ts">
const props = defineProps<{
  name: string
  age?: number
}>()
</script>
```

```js
// 对应的选项式api
<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number
    }
  }
}
</script>
```

### 2. withDefaults

结合`defineProps`使用，定义props的默认值

```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  age?: number
}>(), {
    age: 18
})
</script>
```



### 3. emits选项(defineEmits)

Vue 3 现在提供一个 `emits` 选项，和现有的 `props` 选项类似。这个选项可以用来定义一个组件可以向其父组件触发的事件。

**2.x 的行为**

在 Vue 2 中，你可以定义一个组件可接收的 prop，但是你无法声明它可以触发哪些事件：

```vue
<template>
  <div>
    <p>{{ text }}</p>
    <button v-on:click="$emit('accepted')">OK</button>
  </div>
</template>
<script>
  export default {
    props: ['text']
  }
</script>
```

**3.x 的行为**

和 prop 类似，现在可以通过 `emits` 选项来定义组件可触发的事件：

```vue
<template>
  <div>
    <p>{{ text }}</p>
    <button v-on:click="$emit('accepted')">OK</button>
  </div>
</template>
<script>
  export default {
    props: ['text'],
    emits: ['accepted']
  }
</script>
```

```vue
// 组合式api
<template>
  <div>
    <p>{{ text }}</p>
    <button v-on:click="emit('accepted')">OK</button>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits<{
  (e: "accepted"): void
}>()
</script>
```

该选项也可以接收一个对象，该对象允许开发者定义传入事件参数的验证器，和 `props` 定义里的验证器类似。

### 4. expose选项(defineExpose)
用于声明当组件实例被父组件通过模板引用访问时暴露的公共属性。
当使用 expose 时，只有显式列出的属性将在组件实例上暴露。

expose 仅影响用户定义的属性——它不会过滤掉内置的组件实例属性。
```js
export default {
  // 只有 `publicMethod` 在公共实例上可用
  expose: ['publicMethod'],
  methods: {
    publicMethod() {
      // ...
    },
    privateMethod() {
      // ...
    }
  }
}
```

```vue
// 组合式api
<script setup lang="ts">
const publicMethod = () => {}
const privateMethod = () => {}

defineExpose({
  publicMethod
})
</script>
```

### 5. defineSlots

这个宏可以用于为 IDE 提供插槽名称和 props 类型检查的类型提示。这个宏在简单的组件中几乎用不到，但对于一些复杂的组件非常有用，尤其是这个特性与泛型组件一起使用。或是在 Volar 无法正确地推测出类型时，我们可以手动指定。

```vue
<script setup lang="ts">
// 我们手动定义了 default 组件的插槽作用域的类型。
const slots = defineSlots<{
  default(props: { foo: string; bar: number }): any
}>()
</script>
```

例子：

```vue
<script setup lang="ts" generic="T">
// 子组件 Paginator
defineProps<{
  data: T[]
}>()

defineSlots<{
  default(props: { item: T }): any
}>()
</script>
```

```vue
<template>
  <!-- 父组件 -->
  <Paginator :data="[1, 2, 3]">
    <template #default="{ item }">{{ item }}</template>
  </Paginator>
</template>
```

### 6. defineOptions

这个宏可以用来直接在 `<script setup>` 中声明组件选项，而不必使用单独的 `<script>` 块

在有 `<script setup>` 之前，如果要定义 `props`, `emits` 可以轻而易举地添加一个与 `setup` 平级的属性。

```vue
<script>
export default {
  name: "Protable"
  props: {},
  emits: [],
  setup() {
    return {}
  }
}
</script>
```

 但是用了 `<script setup>` 后，就没法这么干了—— `setup` 属性已经没有了，自然无法添加与其平级的属性。为了解决这一问题，vue引入了 `defineProps` 与 `defineEmits` 这两个宏。

```vue
<script setup lang="ts">
const props = deifneProps()
const emit = defineEmits()
</script>
```

但这只解决了 `props` 与 `emits` 这两个属性。如果我们要定义组件的 `name`、 `inheritAttrs` 或其他自定义的属性，还是得回到最原始的用法——再添加一个普通的 `<script>` 标签。这样就会存在两个 `<script>` 标签。

Vue 3.3 中新引入了 `defineOptions` 宏，主要是用来定义 Options API 的选项。我们可以用 `defineOptions` 定义任意的选项， `props`, `emits`, `expose`, `slots` 除外（因为这些可以使用 ```defineXXX``` 来做到）

例子：

```vue
<script setup>
defineOptions({
  name: 'Protable',
  inheritAttrs: false,
  // ... 更多自定义属性
})
</script>
```



::: tip

 一个完整的使用defineXXX 的组件示例

:::



::: code-group

```vue [ProTable.vue]
<script setup lang="ts" generic="T extends number">
import { onMounted } from 'vue'
import type { TableProp } from '@/components/types'

// 定义options
defineOptions({
  name: 'ProTable'
})

// 定义props
const props = withDefaults(defineProps<TableProp<T>>(), { age: 18 })

// 定义emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 定义slots
defineSlots<{
  itemSlot(props: { item: T }): any
}>()

const publicMethod = () => console.log('method')

// 定义expose
defineExpose({
  publicMethod
})

onMounted(() => console.log('onMounted'))
</script>
<template>
  <div>123</div>
  <slot name="itemSlot" :item="data[0]"></slot>
</template>
```

```ts [types.ts]
export interface TableProp<T = any> {
  modelValue: string
  data: T[]
  name: string
  age?: number
}
```

:::



### 7. Teleport组件

`<Teleport> `是一个内置组件，它可以将一个组件内部的一部分模板“传送”到该组件的 DOM 结构外层的位置去。

有以下场景：组件模板的一部分在逻辑上属于该组件，但从视图角度来看，它在 DOM 中应该被渲染在整个 Vue 应用外部的其他地方，例如弹窗。

[示例](https://play.vuejs.org/#eNrVU01v2zAM/SusgCEtsMSpgx7iucGGXXYpdim2iy+ORTfCZEuQ5DRZkf8+SrLjrMuGoacWCGKRfPzQe9QT+6T1bNshy1huKyO0A4uu06uiFY1WxsETGKzhALVRDUwIOjmG7vZ3ipcyhgo2S3qHL1iw57D0D1w6AIu2Uq110NgHuPX9LidfUEoF35WR/GJyVbR5Esejwchw2GhZOiQLIOdiC5Usrb0tmOocmoKFAIU2i9W9UtIJbeFRuA186xAWcI8S/Wx5QoAeSlX6IxnD1ZIhmozhfG1G/7ms9EzacMqT4+zsPTshbFSAULgLzHGsy06SBr4CL115eRXPQCS5zrSDBaA0thnUpbQYXQf/oT/6/Yu7deecauFjJUX1w/NHdUgDZ7wyq6/eCiPmSUSGGj3n26mo+5SCHRVoPHxUQK+ilEF8t0EI8Ys88TsW6Tw/QrwLW32WyuJJ+7NchptZt5cItqICnDyz0ClSpJUVTihPkdgh/+B9P6ei5bjLYLlcBodTOoN0/i4YEmuXwU1vPQruNhks5nO9C46mNA+inUbU9Ppm8K+V4WgyuNY7sEoKTkr5dlEGP+CJ7uEBvHLh0+fKD2+H6KK0teL7Uez/3Yq/7kV6shgvWY3fn9ww6hvelcMv4ubajA==)

当在初始 HTML 结构中使用这个组件时，会有一些潜在的问题：

position: fixed 能够相对于浏览器窗口放置有一个条件，那就是不能有任何祖先元素设置了 transform、perspective 或者 filter 样式属性。也就是说如果我们想要用 CSS transform 为祖先节点` <div class="outer">`设置动画，就会不小心破坏模态框的布局

这个模态框的 z-index 受限于它的容器元素。如果有其他元素与`<div class="outer">`重叠并有更高的 z-index，则它会覆盖住我们的模态框。



### 8. css v-bind

单文件组件的 `<style>` 标签支持使用 `v-bind` CSS 函数将 CSS 的值链接到动态的组件状态

```vue
<script setup>
const theme = {
  color: 'red'
}
const backGroundColor = "red"
</script>

<template>
  <p>hello</p>
</template>

<style scoped>
p {
  color: v-bind('theme.color');
  background-color: v-bind(backGroundColor)
}
</style>
```

实际的值会被编译成哈希化的 CSS 自定义属性，因此 CSS 本身仍然是静态的。自定义属性会通过内联样式的方式应用到组件的根元素上，并且在源值变更的时候响应式地更新。

### 9. Suspense异步组件

`<Suspense>` 是一个内置组件，用来在组件树中协调对异步依赖的处理。它让我们可以在组件树上层等待下层的多个嵌套异步依赖项解析完成，并可以在等待时渲染一个加载状态。

```
<Suspense>
└─ <Dashboard>
   ├─ <Profile>
   │  └─ <FriendStatus>（组件有异步的 setup()）
   └─ <Content>
      ├─ <ActivityFeed> （异步组件）
      └─ <Stats>（异步组件）
```

`<Suspense>` 可以等待的异步依赖有两种：

1. 带有异步 `setup()` 钩子的组件（顶层await）

   ```vue
   // 1. script setup
   <script setup lang="ts">
   const result = await fetch()
   </script>
   ```

   ```vue
   // 2. setup
   <script lang="ts">
   export default {
     async setup() {
       const result = await fetch()
       return { result }
     }
   }
   </script>
   ```

2. 异步组件

   ```js
   import { defineAsyncComponent } from 'vue'
   
   const AsyncComp = defineAsyncComponent(() => {
     return new Promise((resolve, reject) => {
       // ...从服务器获取组件
       resolve(/* 获取到的组件 */)
     })
   })
   // ... 像使用其他一般组件一样使用 `AsyncComp`
   ```

   ```js
   import { defineAsyncComponent } from 'vue'
   
   const AsyncComp = defineAsyncComponent(() =>
     import('./components/MyComponent.vue')
   )
   ```

**Suspense插槽**

```vue
<Suspense>
  <!-- 具有深层异步依赖的组件 -->
  <Dashboard />

  <!-- 在 #fallback 插槽中显示 “正在加载中” -->
  <template #fallback>
    Loading...
  </template>
</Suspense>
```

**Suspense事件**

1. pendding

   在进入挂起状态时触发

2. resolve

   在 `default` 插槽完成获取新内容时触发

3. fallback

   在 `fallback` 插槽的内容显示时触发

在初始渲染时，`<Suspense>` 将在内存中渲染其默认的插槽内容。如果在这个过程中遇到任何异步依赖，则会进入**挂起**状态。在挂起状态期间，展示的是fallback内容。当所有遇到的异步依赖都完成后，`<Suspense>` 会进入**完成**状态，并将展示出默认插槽的内容。



## 非兼容性变更

### 1. v-model

- **非兼容**：用于自定义组件时，`v-model` prop 和事件默认名称已更改：
  - prop：`value` -> `modelValue`；
  - 事件：`input` -> `update:modelValue`；
- **非兼容**：`v-bind` 的 `.sync` 修饰符和组件的 `model` 选项已移除，可在 `v-model` 上加一个参数代替；
- **新增**：现在可以在同一个组件上使用多个 `v-model` 绑定；
- **新增**：现在可以自定义 `v-model` 修饰符。

[v-model | Vue 3 迁移指南 (vuejs.org)](https://v3-migration.vuejs.org/zh/breaking-changes/v-model.html)

### 2. key

在 Vue 2.x 中，`<template>` 标签不能拥有 `key`。不过，你可以为其每个子节点分别设置 `key`。

```vue
<!-- Vue 2.x -->
<template v-for="item in list">
  <div :key="'heading-' + item.id">...</div>
  <span :key="'content-' + item.id">...</span>
</template>
```

在 Vue 3.x 中，`key` 则应该被设置在 `<template>` 标签上。

```vue
<!-- Vue 3.x -->
<template v-for="item in list" :key="item.id">
  <div>...</div>
  <span>...</span>
</template>
```

类似地，当使用 `<template v-for>` 时如果存在使用 `v-if` 的子节点，则 `key` 应改为设置在 `<template>` 标签上。

```vue
<!-- Vue 2.x -->
<template v-for="item in list">
  <div v-if="item.isVisible" :key="item.id">...</div>
  <span v-else :key="item.id">...</span>
</template>

<!-- Vue 3.x -->
<template v-for="item in list" :key="item.id">
  <div v-if="item.isVisible">...</div>
  <span v-else>...</span>
</template>
```

### 3. v-if 与v-for的优先级

- **非兼容**：两者作用于同一个元素上时，`v-if` 会拥有比 `v-for` 更高的优先级。

2.x 版本中在一个元素上同时使用 `v-if` 和 `v-for` 时，`v-for` 会优先作用。

3.x 版本中 `v-if` 总是优先于 `v-for` 生效。

### 4. v-bind合并行为

- **不兼容**：v-bind 的绑定顺序会影响渲染结果。

在一个元素上动态绑定 attribute 时，同时使用 `v-bind="object"` 语法和独立 attribute 是常见的场景。然而，这就引出了关于合并的优先级的问题。

在 2.x 中，如果一个元素同时定义了 `v-bind="object"` 和一个相同的独立 attribute，那么这个独立 attribute 总是会覆盖 `object` 中的绑定。

```vue
<!-- 模板 -->
<div id="red" v-bind="{ id: 'blue' }"></div>
<!-- 结果 -->
<div id="red"></div>
```

在 3.x 中，如果一个元素同时定义了 `v-bind="object"` 和一个相同的独立 attribute，那么绑定的声明顺序将决定它们如何被合并。

```vue
<!-- 模板 -->
<div id="red" v-bind="{ id: 'blue' }"></div>
<!-- 结果 -->
<div id="blue"></div>

<!-- 模板 -->
<div v-bind="{ id: 'blue' }" id="red"></div>
<!-- 结果 -->
<div id="red"></div>
```

### 5. 移除`v-on.native`修饰符

1. 2.x 语法

   默认情况下，传递给带有 `v-on` 的组件的事件监听器只能通过 `this.$emit` 触发。要将原生 DOM 监听器添加到子组件的根元素中，可以使用 `.native` 修饰符：

   ```vue
   <my-component
     v-on:close="handleComponentEvent"
     v-on:click.native="handleNativeClickEvent"
   />
   ```

   

2. 3.x 语法

   `v-on` 的 `.native` 修饰符已被移除。同时，[新增的 `emits` 选项](https://v3-migration.vuejs.org/zh/breaking-changes/emits-option)允许子组件定义真正会被触发的事件。

   因此，对于子组件中*未*被定义为组件触发的所有事件监听器，Vue 现在将把它们作为原生事件监听器添加到子组件的根元素中 (除非在子组件的选项中设置了 `inheritAttrs: false`)。

   ```vue
   <my-component
     v-on:close="handleComponentEvent"
     v-on:click="handleNativeClickEvent"
   />
   ```

   ```vue
   // MyComponent.vue
   <script>
     export default {
       emits: ['close']
     }
   </script>
   ```

### 6. 渲染函数api

   #### 渲染函数参数

   **2.x 语法**

   在 2.x 中，`render` 函数会自动接收 `h` 函数 (它是 `createElement` 的惯用别名) 作为参数：

   ```js
// Vue 2 渲染函数示例
export default {
  render(h) {
    return h('div')
  }
}
   ```

   **3.x 语法**

   在 3.x 中，`h` 函数现在是全局导入的，而不是作为参数自动传递。

   ```js
// Vue 3 渲染函数示例
import { h } from 'vue'

export default {
  render() {
    return h('div')
  }
}
   ```

   #### 注册组件

   **2.x 语法**

   在 2.x 中，注册一个组件后，把组件名作为字符串传递给渲染函数的第一个参数，它可以正常地工作：

   ```jsx
// 2.x
Vue.component('button-counter', {
  data() {
    return {
      count: 0
    }
  },
  template: `
    <button @click="count++">
      Clicked {{ count }} times.
    </button>
  `
})

export default {
  render(h) {
    return h('button-counter')
  }
}
   ```

   **3.x 语法**

   在 3.x 中，由于 VNode 是上下文无关的，不能再用字符串 ID 隐式查找已注册组件。取而代之的是，需要使用一个导入的 `resolveComponent` 方法：

   ```js
// 3.x
import { h, resolveComponent } from 'vue'

export default {
  setup() {
    const ButtonCounter = resolveComponent('button-counter')
    return () => h(ButtonCounter)
  }
}
   ```

### 7. 移除 `$listeners` 

**2.x 语法**

在 Vue 2 中，你可以通过 `this.$attrs` 访问传递给组件的 attribute，以及通过 `this.$listeners` 访问传递给组件的事件监听器。结合 `inheritAttrs: false`，开发者可以将这些 attribute 和监听器应用到根元素之外的其它元素：

```vue
<template>
  <label>
    <input type="text" v-bind="$attrs" v-on="$listeners" />
  </label>
</template>
<script>
  export default {
    inheritAttrs: false
  }
</script>
```

**3.x 语法**

在 Vue 3 的虚拟 DOM 中，事件监听器现在只是以 `on` 为前缀的 attribute，这样它就成为了 `$attrs` 对象的一部分，因此 `$listeners` 被移除了。

```vue
<template>
  <label>
    <input type="text" v-bind="$attrs" />
  </label>
</template>
<script>
export default {
  inheritAttrs: false
}
</script>
```

如果这个组件接收一个 `id` attribute 和一个 `v-on:close` 监听器，那么 `$attrs` 对象现在将如下所示:

```js
{
  id: 'my-input',
  onClose: () => console.log('close 事件被触发')
}
```

### 8. `$attrs` 包含 `class` & `style`

**2.x 行为**

Vue 2 的虚拟 DOM 实现对 `class` 和 `style` attribute 有一些特殊处理。因此，与其它所有 attribute 不一样，它们*没有*被包含在 `$attrs` 中。

上述行为在使用 `inheritAttrs: false` 时会产生副作用：

- `$attrs` 中的 attribute 将不再被自动添加到根元素中，而是由开发者决定在哪添加。
- 但是 `class` 和 `style` 不属于 `$attrs`，它们仍然会被应用到组件的根元素中：

```vue
<template>
  <label>
    <input type="text" v-bind="$attrs" />
  </label>
</template>
<script>
export default {
  inheritAttrs: false
}
</script>
```

像这样使用时：

```vue
<my-component id="my-id" class="my-class"></my-component>
```

将生成以下 HTML：

```vue
<label class="my-class">
  <input type="text" id="my-id" />
</label>
```

**3.x 行为**

`$attrs` 包含了*所有的* attribute，这使得把它们全部应用到另一个元素上变得更加容易了。现在上面的示例将生成以下 HTML：

```vue
<label>
  <input type="text" id="my-id" class="my-class" />
</label>
```

### 9. 按键修饰符

- **非兼容**：不再支持使用数字 (即键码) 作为 `v-on` 修饰符
- **非兼容**：不再支持 `config.keyCodes`

从 [`KeyboardEvent.keyCode` 已被废弃](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/keyCode)开始，Vue 3 继续支持这一点就不再有意义了。因此，现在建议对任何要用作修饰符的键使用 kebab-cased (短横线) 名称。

```vue
<!-- Vue 3 在 v-on 上使用按键修饰符 -->
<input v-on:keyup.page-down="nextPage">

<!-- 同时匹配 q 和 Q -->
<input v-on:keypress.q="quit">
```

### 10. 事件API

`$on`，`$off` 和 `$once` 实例方法已被移除，组件实例不再实现事件触发接口。

无法通过通过Vue示例创建事件总线

### 11. 移除过滤器

### 12. 移除`$children`

### 13. data选项

- **非兼容**：组件选项 `data` 的声明不再接收纯 JavaScript `object`，而是接收一个 `function`。
- **非兼容**：当合并来自 mixin 或 extend 的多个 `data` 返回值时，合并操作现在是浅层次的而非深层次的 (只合并根级属性)。

当来自组件的 `data()` 及其 mixin 或 extends 基类被合并时，合并操作现在将被*浅层次*地执行：

```js
const Mixin = {
  data() {
    return {
      user: {
        name: 'Jack',
        id: 1
      }
    }
  }
}

const CompA = {
  mixins: [Mixin],
  data() {
    return {
      user: {
        id: 2
      }
    }
  }
}
```

在 Vue 2.x 中，生成的 `$data` 是：

```json
{
  "user": {
    "id": 2,
    "name": "Jack"
  }
}
```

在 3.0 中，其结果将会是：

```json
{
  "user": {
    "id": 2
  }
}
```

### 14. 侦听数组

- **非兼容**: 当侦听一个数组时，只有当数组被替换时才会触发回调。如果你需要在数组被改变时触发回调，必须指定 `deep` 选项。

## 目前遇到的一些限制/注意点

### 1. defineProps泛型（Vue 3.3以下有问题，3.3已经解决）

`defineProps()` 的泛型类型参数只能使用类型字面量或者本地接口的引用。

```vue
<script setup lang="ts">
import type { ChildProps } from "./types"

// no
const props = defineProps<ChildProps>()
</script>

// -------------------------------------------

<script setup lang="ts">
import type { Config } from "./types"
    
interface ChildProps {
  config: Config
}

// no
const props = defineProps<ChildProps>()
</script>
```

```vue
<script setup lang="ts">
interface ChildProps {
  config: any
}

// yes
const props = defineProps<ChildProps>()
</script>
```



### 2. defineXXX 引用局部变量/常量

使用setup语法糖时，```defineXXX```编译器宏里引用模块里的变量时，分以下几种情况：

1. 引用import导入的外部内容：完全ok

   ```vue
   <script setup lang="ts">
   import testConfig from "./config"
   
   // yes
   const props2 = withDefaults(defineProps<ChildProp>(), {
       config: testConfig
   })
   </script>
   ```

2. 引用setup中局部**变量**（普通变量、响应式变量等）：报错

   ```vue
   <script setup lang="ts">
   import { ref } from "vue"
       
   let config: "test"
   const configRef = ref("test")
   
   // no
   const props = withDefaults(defineProps(), {
       config: config,
       config2: configRef.value
   })
   
   </script>
   ```

原因是`defineProps`和`defineProps`都是`编译器宏`，编译期间会转换成下面的代码，定义的props会提升到props选项中，没法访问setup选项中定义的变量

```vue
<script>
import testConfig from "./config"
export default {
  props: {
    config: {
      type: string,
      default: config // no
    }
  },
  setup() {
    let config = "test"
    const configRef = ref("test")
    return { config, configRef }
  }
}
</script>
```

3. 引用setup中的**常量**：vue3.3以下依然报错，vue3.3+如果该常量是基本类型（string, number, boolean, bigint, ~~symbol~~, null, ~~undefined~~）则正常

   vue3.3以下报错原因和上面第二点引用变量一致，都是作用域不同导致的。

   vue3.3+在 `script` 部分新增了 `hoistStatic` 选项，如果setup中常量的值是基本类型，则会被提升到模块顶层

   [示例](https://play.vuejs.org/#eNqNUslu2zAQ/RWClziALaFID4XgGOmSAu2hDdoedVGlscyUG2ZGtgHD/94h5biquyAHAuSb7b03POjXMRbbAXSll9SiiawIeIjKNr6/rTVTrVc11r4Nnlj5xoG6VVfvQ7hKqAVWTZ+gF6/SO50O1sbD58hGSmaHBKlcmG7H66e0neHNO1g3g2WajTUPGCItDzm5UsRofK+Oq9n1XE3aVBfNluVIfKXn2rgYkBeuicUjBS+qDqmsPgVETCWtBEmYyE7vWm+YI1Vl2XZeyjqwZouFBy59dOWdpJU4eDYOFl1wdzfFTfGy7AzxFC6A3OI7hh0BSpNazydjSgG3gAsEcQcBnzv2omw6+iL0x/g0/SgWiSlMsry16S8saYOLxgKeNvWbNY21YfcxY4wDnLW0G2h//AV/pP2o6QEhM5vo5wZ74DF8//UT7OV+DrrQDfa0hn8EvwAFOySOY9qbwXdCe5KX2X7IG5Yf843u9wyenkQlotmNnJ/38fY/0n/RFbfPLh5/Ao+OEvY=)

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202307111525608.png)

总结：**在最新版vue中：defineXXX可以引用import导入的内容、setup中基本常量，不可引用局部变量**