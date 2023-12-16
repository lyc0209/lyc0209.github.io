---
{
"title": "CSS BEM规范以及在Vue3中的应用",
"date": "2023-12-16",
"category": "技术",
"tags": ["web", "css"]
}
---
# CSS命名规范-BEM

## 什么是BEM？

**BEM**（Block, Element, Modifier）是一种CSS命名规范，用于命名 类和选择器，提供一种一致的方式来组织和命名代码，使其易于理解、扩展和维护。BEM有以下三个基本原则：

1. 块（Block）：块是一个独立的可重用组件，它代表一个完整的实体，它是整个 BEM 结构中最高层级的部分，应该有一个唯一的类名。 示例：`.el-button`、`.el-navbar`
2. 元素（Element）：元素是块的组成部分，不能独立存在。它们依赖于块的上下文，并且有属于块的类名作为前缀。 示例：`.button__text`、`.navbar__item`
3. 修饰符（Modifier）：修饰符用于修改块或元素的外观、状态或行为。它们是可选的，可以单独使用或与块或元素的类名结合使用。 示例：`.el-button--large`、`.el-upload__item--active`

## 使用BEM的好处

BEM命名的核心就是可以清晰的描述页面的结构,从其名字就可以知道某个标记的含义，于是通过查看 class 属性就可以知道元素之间的关联，具体的好处如下：

1. 提供一种一致的命名约定，使团队可以更轻松地理解和维护代码
2. 促进可重用性和模块化开发
3. 减少 CSS 的特异性（specificity）问题，避免组件间样式冲突

## 常见用法

```html
<div class="project-list">
    <div class="project-list__item"></div>
    <div class="project-list__item--red"></div>
    <div class="project-list__item--green"></div>
</div>

<style>
    .project-list{}
    .project-list__item{}
    .project-list__item--red{}
    .project-list__item--green{}
</style>

```

## 实践

在Vue3 + Scss项目中使用BEM规范

### 1. class名称生成

class名称如果每次手写，会有非常多的重复，并且后期如果涉及到修改Block、Element等，需要批量修改，容易漏掉。所以需要一个不错的方式来生成class名称，减少工作量。

在阅读ElementPlus源码后，发现ElementPlus是结合Hooks去实现的。

```ts
import type { Ref } from "vue"
import { ref } from "vue"
export const defaultPrefix = "lee"
const statePrefix = "is-"

// 定义个_bem方法，此方法返回符合BEM规范的命名
const _bem = (
  namespace: string,
  block: string,
  blockSuffix: string,
  element: string,
  modifier: string
) => {
  let cls = `${namespace}-${block}`
  if (blockSuffix) cls += `-${blockSuffix}`
  if (element) cls += `__${element}`
  if (modifier) cls += `--${modifier}`
  return cls
}

export const useNamespace = (block: string, namespaceOverrides?: Ref<string | undefined>) => {
  const namespace = ref(defaultPrefix ?? namespaceOverrides?.value ?? "")

  const b = (blockSuffix = "") => _bem(namespace.value, block, blockSuffix, "", "")

  const e = (element?: string) => (element ? _bem(namespace.value, block, "", element, "") : "")

  const m = (modifier?: string) => (modifier ? _bem(namespace.value, block, "", "", modifier) : "")

  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element ? _bem(namespace.value, block, blockSuffix, element, "") : ""

  const em = (element?: string, modifier?: string) =>
    element && modifier ? _bem(namespace.value, block, "", element, modifier) : ""

  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier ? _bem(namespace.value, block, blockSuffix, "", modifier) : ""

  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier
      ? _bem(namespace.value, block, blockSuffix, element, modifier)
      : ""

  const is: {
    (name: string, state: boolean | undefined): string
    (name: string): string
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0]! : true
    return name && state ? `${statePrefix}${name}` : ""
  }
  return {
    namespace,
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is
  }
}

export type UseNamespaceReturn = ReturnType<typeof useNamespace>
```

### 2. 样式生成

样式如何生成呢？如果完全手写，似乎也比较繁琐。再次阅读ElementPlus源码，发现它是结合SCSS mixin做的

```scss
// config.scss
$namespace: "lee" !default;
$common-separator: "-" !default;
$element-separator: "__" !default;
$modifier-separator: "--" !default;
$state-prefix: "is-" !default;
```

```scss
// function.scss
@use "config";

// BEM support Func
@function selectorToString($selector) {
  $selector: inspect($selector);
  $selector: str-slice($selector, 2, -2);
  @return $selector;
}

@function containsModifier($selector) {
  $selector: selectorToString($selector);

  @if str-index($selector, config.$modifier-separator) {
    @return true;
  } @else {
    @return false;
  }
}

@function containWhenFlag($selector) {
  $selector: selectorToString($selector);

  @if str-index($selector, "." + config.$state-prefix) {
    @return true;
  } @else {
    @return false;
  }
}

@function containPseudoClass($selector) {
  $selector: selectorToString($selector);

  @if str-index($selector, ":") {
    @return true;
  } @else {
    @return false;
  }
}

@function hitAllSpecialNestRule($selector) {
  @return containsModifier($selector) or containWhenFlag($selector) or containPseudoClass($selector);
}

// join var name
// joinVarName(('button', 'text-color')) => '--el-button-text-color'
@function joinVarName($list) {
  $name: "--" + config.$namespace;
  @each $item in $list {
    @if $item != "" {
      $name: $name + "-" + $item;
    }
  }
  @return $name;
}

// getCssVarName('button', 'text-color') => '--el-button-text-color'
@function getCssVarName($args...) {
  @return joinVarName($args);
}

// getCssVar('button', 'text-color') => var(--el-button-text-color)
@function getCssVar($args...) {
  @return var(#{joinVarName($args)});
}

// getCssVarWithDefault(('button', 'text-color'), red) => var(--el-button-text-color, red)
@function getCssVarWithDefault($args, $default) {
  @return var(#{joinVarName($args)}, #{$default});
}

// bem('block', 'element', 'modifier') => 'el-block__element--modifier'
@function bem($block, $element: "", $modifier: "") {
  $name: config.$namespace + config.$common-separator + $block;

  @if $element != "" {
    $name: $name + config.$element-separator + $element;
  }

  @if $modifier != "" {
    $name: $name + config.$modifier-separator + $modifier;
  }

  // @debug $name;
  @return $name;
}
```

```scss
// mixin.scss
@use "function" as *;

@forward "config";
@forward "function";

@use "config" as *;

// BEM
@mixin b($block) {
  $B: $namespace + $common-separator + $block !global;

  .#{$B} {
    @content;
  }
}

@mixin e($element) {
  $E: $element !global;
  $selector: &;
  $currentSelector: "";
  @each $unit in $element {
    $currentSelector: #{$currentSelector + "." + $B + $element-separator + $unit + ","};
  }

  @if hitAllSpecialNestRule($selector) {
    @at-root {
      #{$selector} {
        #{$currentSelector} {
          @content;
        }
      }
    }
  } @else {
    @at-root {
      #{$currentSelector} {
        @content;
      }
    }
  }
}

@mixin m($modifier) {
  $selector: &;
  $currentSelector: "";
  @each $unit in $modifier {
    $currentSelector: #{$currentSelector + $selector + $modifier-separator + $unit + ","};
  }

  @at-root {
    #{$currentSelector} {
      @content;
    }
  }
}

@mixin configurable-m($modifier, $E-flag: false) {
  $selector: &;
  $interpolation: "";

  @if $E-flag {
    $interpolation: $element-separator + $E-flag;
  }

  @at-root {
    #{$selector} {
      .#{$B + $interpolation + $modifier-separator + $modifier} {
        @content;
      }
    }
  }
}

@mixin spec-selector($specSelector: "", $element: $E, $modifier: false, $block: $B) {
  $modifierCombo: "";

  @if $modifier {
    $modifierCombo: $modifier-separator + $modifier;
  }

  @at-root {
    #{&}#{$specSelector}.#{$block + $element-separator + $element + $modifierCombo} {
      @content;
    }
  }
}

@mixin meb($modifier: false, $element: false, $block: false) {
  $selector: &;
  $modifierCombo: "";
  $elementCombo: $E;
  $blockCombo: $B;

  @if $modifier {
    $modifierCombo: $modifier-separator + $modifier;
  }

  @if $block {
    $blockCombo: $namespace + $common-separator + $block;
  }

  @if $element {
    $elementCombo: $element;
  }

  @at-root {
    #{$selector} {
      .#{$blockCombo + $element-separator + $elementCombo + $modifierCombo} {
        @content;
      }
    }
  }
}

@mixin when($state) {
  @at-root {
    &.#{$state-prefix + $state} {
      @content;
    }
  }
}

@mixin extend-rule($name) {
  @extend #{"%shared-" + $name} !optional;
}

@mixin share-rule($name) {
  $rule-name: "%shared-" + $name;

  @at-root #{$rule-name} {
    @content;
  }
}

@mixin pseudo($pseudo) {
  @at-root #{&}#{":#{$pseudo}"} {
    @content;
  }
}

@mixin picker-popper($background, $border, $box-shadow) {
  &.#{$namespace}-popper {
    background: $background;
    border: $border;
    box-shadow: $box-shadow;

    .#{$namespace}-popper__arrow {
      &::before {
        border: $border;
      }
    }

    @each $placement,
      $adjacency in ("top": "left", "bottom": "right", "left": "bottom", "right": "top")
    {
      &[data-popper-placement^="#{$placement}"] {
        .#{$namespace}-popper__arrow::before {
          border-#{$placement}-color: transparent;
          border-#{$adjacency}-color: transparent;
        }
      }
    }
  }
}

// dark
@mixin dark($block) {
  html.dark {
    @include b($block) {
      @content;
    }
  }
}

@mixin inset-input-border($color, $important: false) {
  @if $important == true {
    box-shadow: 0 0 0 1px $color inset !important;
  } @else {
    box-shadow: 0 0 0 1px $color inset;
  }
}
```

