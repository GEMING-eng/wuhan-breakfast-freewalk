# 先看这里：武汉老街 v9

当前版本：2026-10-04。入口已经改为全程第一人称自由行走，旧 v7 的地图选择、跳过步行流程已被替代。

在线体验：https://geming-eng.github.io/wuhan-breakfast-freewalk/
公开源码：https://github.com/GEMING-eng/wuhan-breakfast-freewalk

先读 README.md 和 docs/street/v9-first-person.md。验收证据位于 docs/street/verification-v9/。历史文档保留为开发背景，以 v9 说明和当前代码为准。

源码安装：npm ci → npm test → npm run build → npm run preview。
完整预览包：安装 Node.js 22.18 或以上，双击 Start-Tour.cmd，保持服务窗口开启，访问 http://127.0.0.1:4173/。

电脑 WASD 移动、拖动转向、滚轮缩放；手机左下摇杆移动、拖动街景转向、右下加减缩放。点店铺按钮沿街走近，“继续走走”保留当前位置。全局今昔按钮会一起改变建筑、商铺、地面、行人与街具。

行走范围是街道和柜台前，不包含进入建筑后室。面窝店主为随年代变化的插画；街坊书屋等为可观察门面。实体手机性能尚未实测。

旧存档保留：食篮与到访记录继续兼容。历史原故事入口为 ?sample=classic；原故事和新街道体验的存档独立。