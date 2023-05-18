import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "博客",
  description: "my blog",
  srcDir: "./src",
  outDir: "../dist",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
    ],

    sidebar: [
      {
        // text: '测试',
        // items: [
        //   // { text: 'Markdown Examples', link: '/markdown-examples' },
        //   // { text: 'Runtime API Examples', link: '/api-examples' }
        // ]
      }
    ],

    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/lyc0209' }
    // ]

    footer: {
      copyright: 'Copyright © 2023-present GoldenLee'
    }
  }
})
