# v6 第一人称游览：浏览器验收

核验日期：2026-10-03。使用本机独立 Chromium、Windows D3D11，运行生产构建 `http://127.0.0.1:4173/?sample=tour&v=6`。脚本：`tools/verify-tour.cjs`。

`report.json` 记录 22 项检查结果和浏览器错误；该目录的图片来自实际页面渲染。脚本通过真实按钮操作完成八站，未往 localStorage 注入跳关存档。刷新与完成后恢复也在实际页面执行。

| 截图 | 状态 |
|---|---|
| `01-arrival.png` | 第一人称入口，天空顶部接缝修复后的实景 |
| `02-gate.png` / `03-walking.png` | 巷口阅读 / 街道中央步行中 |
| `04-breakfast.png` | 过早文化页 |
| `05-noodle.png` / `06-craft.png` | 面摊与手艺站到达后的实际视线 |
| `07-eras-past.png` / `08-eras-turn.png` / `09-eras-present.png` | 昔日、翻墙中、今日；其中一帧只是动画的一瞬，不是完整动画记录 |
| `10-menu.png` / `11-neighbors.png` | 食单收藏与街坊留言 |
| `12-ending.png` / `13-journal.png` | 街尾回望 / 完成手册 |
| `14-mobile-journal.png` 至 `20-mobile-eras-present.png` | 390 × 844 竖屏的结尾、阅读、面摊、出处弹窗与两种年代 |
| `21-small-mobile.png` | 320 × 740 窄屏 |
| `tour-journal.md` | 从页面触发下载得到的实际手册 |

检验要点：镜头始终在同一眼高；转头不改变站位；步行采样位置连续变化；切换站点后必须等场景的实际站点与 UI 一致且行走结束，才截到达图。食物与今昔对照门槛、来源弹窗、恢复进度、结尾记忆选择及下载都已检查。

另运行 `tools/verify-street.cjs` 完成 23 项共享街景回归，证据在 `../verification-final/`。晨光滑杆的光源高度变化并伴随 548,034 个图像像素发生可辨识变化；人物有五种嘴型及眨眼，热气确实随时间变化，原单店与原故事入口保留。

`npm.cmd test` 共 31 项通过；`npm.cmd run build` 成功。构建仍提示 Three.js 分包超过 500 kB，这是体积提醒，不是编译失败。

实体手机 GPU 性能、触摸手感及扬声器听感未验证。本次浏览器竖屏检查不能代替实体设备验收；不据此宣称所有手机都达到桌面帧率。
