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

### 1. Object.defineProperty => Proxy
Vue2实现响应式的原理是通过Object.defineProperty()，最大的问题是无法监听数组数组变化

Vue2通过hack方式支持了`push()`、`pop()`、`shift()`等方法的响应式，但`this.list[index] = item`这种赋值是无法触发页面更新的。

[javascript - 记一次思否问答的问题思考：Vue为什么不能检测数组变动 - vue解析 - SegmentFault 思否](https://segmentfault.com/a/1190000015783546)



Proxy 用于修改某些操作的默认行为，可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。

[示例](https://codepen.io/xiaomuzhu/pen/KRmwRE/)

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

```vue
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

```vue
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

生命周期变化：
![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202306011455696.png)
![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202306011457001.png)

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

   ```js
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

   ```vue
   <script setup>
   import { useFetch } from './fetch.js'
   
   const { data, error } = useFetch('...')
   </script>
   ```

2. **更灵活的代码组织**

   ![](https://cdn.jsdelivr.net/gh/lyc0209/pic/blog/202305091033284.png)

### 3. 更好的TypeScript支持

像 TypeScript 这样的类型系统可以在编译时通过静态分析检测出很多常见错误。这减少了生产环境中的运行时错误，也让我们在重构大型项目的时候更有信心。通过 IDE 中基于类型的自动补全，TypeScript 还改善了开发体验和效率。

Vue 本身就是用 TypeScript 编写的，并对 TypeScript 提供了一等公民的支持。所有的 Vue 官方库都自带了类型声明文件，开箱即用。

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

   #### VNode Prop 格式化

   **2.x 语法**

   在 2.x 中，`domProps` 包含 VNode prop 中的嵌套列表：

   ```js
   // 2.x
   {
     staticClass: 'button',
     class: { 'is-outlined': isOutlined },
     staticStyle: { color: '#34495E' },
     style: { backgroundColor: buttonColor },
     attrs: { id: 'submit' },
     domProps: { innerHTML: '' },
     on: { click: submitForm },
     key: 'submit-button'
   }
   ```

   **3.x 语法**

   在 3.x 中，整个 VNode prop 的结构都是扁平的。使用上面的例子，来看看它现在的样子。

   ```js
   // 3.x 语法
   {
     class: ['button', { 'is-outlined': isOutlined }],
     style: [{ color: '#34495E' }, { backgroundColor: buttonColor }],
     id: 'submit',
     innerHTML: '',
     onClick: submitForm,
     key: 'submit-button'
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

## 新增概念

### 1. emits选项

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

vue

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

该选项也可以接收一个对象，该对象允许开发者定义传入事件参数的验证器，和 `props` 定义里的验证器类似。

### 2. Teleport组件
`<Teleport> `是一个内置组件，它可以将一个组件内部的一部分模板“传送”到该组件的 DOM 结构外层的位置去。

有以下场景：组件模板的一部分在逻辑上属于该组件，但从视图角度来看，它在 DOM 中应该被渲染在整个 Vue 应用外部的其他地方，例如弹窗。

[示例](https://play.vuejs.org/#eNrVU01v2zAM/SusgCEtsMSpgx7iucGGXXYpdim2iy+ORTfCZEuQ5DRZkf8+SrLjrMuGoacWCGKRfPzQe9QT+6T1bNshy1huKyO0A4uu06uiFY1WxsETGKzhALVRDUwIOjmG7vZ3ipcyhgo2S3qHL1iw57D0D1w6AIu2Uq110NgHuPX9LidfUEoF35WR/GJyVbR5Esejwchw2GhZOiQLIOdiC5Usrb0tmOocmoKFAIU2i9W9UtIJbeFRuA186xAWcI8S/Wx5QoAeSlX6IxnD1ZIhmozhfG1G/7ms9EzacMqT4+zsPTshbFSAULgLzHGsy06SBr4CL115eRXPQCS5zrSDBaA0thnUpbQYXQf/oT/6/Yu7deecauFjJUX1w/NHdUgDZ7wyq6/eCiPmSUSGGj3n26mo+5SCHRVoPHxUQK+ilEF8t0EI8Ys88TsW6Tw/QrwLW32WyuJJ+7NchptZt5cItqICnDyz0ClSpJUVTihPkdgh/+B9P6ei5bjLYLlcBodTOoN0/i4YEmuXwU1vPQruNhks5nO9C46mNA+inUbU9Ppm8K+V4WgyuNY7sEoKTkr5dlEGP+CJ7uEBvHLh0+fKD2+H6KK0teL7Uez/3Yq/7kV6shgvWY3fn9ww6hvelcMv4ubajA==)

当在初始 HTML 结构中使用这个组件时，会有一些潜在的问题：

position: fixed 能够相对于浏览器窗口放置有一个条件，那就是不能有任何祖先元素设置了 transform、perspective 或者 filter 样式属性。也就是说如果我们想要用 CSS transform 为祖先节点` <div class="outer">`设置动画，就会不小心破坏模态框的布局！

这个模态框的 z-index 受限于它的容器元素。如果有其他元素与`<div class="outer">`重叠并有更高的 z-index，则它会覆盖住我们的模态框。