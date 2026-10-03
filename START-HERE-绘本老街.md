# 先看这里：武汉绘本早市 v7

当前交接基线：2026-10-03。用户最终选择细线淡彩的立体绘本老街，以及自由选店的第一人称体验。此说明和 v7 文档优先于旧的八站导览、写实纸板或制作小游戏方案。

公开源码：[GitHub 交接仓库](https://github.com/Zhu4143/wuhan-breakfast-storybook-handoff)。直接可预览的完整 ZIP：[v7 Release](https://github.com/Zhu4143/wuhan-breakfast-storybook-handoff/releases/tag/v7.0.0-handoff)。这是独立交接快照，原 `GEMING-eng/wuhan-breakfast-paper-stage` 未被覆盖。

## 打开当前成品

安装 Node.js 22.18 或以上版本，双击 `Start-Tour.cmd`，打开：

**http://127.0.0.1:4173/?sample=tour&v=7**

完整交接 ZIP 含 `dist/`，预览不用先安装依赖。服务窗口需要保持开启。4173 已运行本项目时直接使用它；不要结束不明进程。GitHub 源码克隆不含 `dist/`，先运行 `npm.cmd ci`、`npm.cmd run build`。

点击封面“去街上逛逛”，点地图圆点自行选一家。镜头按行人眼高走过去，可以跳过步行，拖动画面环顾。看过的食物可放进左侧“我的过早”，也能移除、回看和下载。手机通过左上食篮按钮展开侧栏。任意时刻可回地图换店；阅读介绍没有强制完成门槛。

林记的“看今昔”保留 180° 翻墙、两代店主与年代界面；全局昔日/今日也能切换。18 位纸偶、热气、树影和日照为实时动态，点“静一静”可暂停环境动态。

## 给同学的 Codex

将整个交接包解压，或者克隆公开交接仓库。把 **`docs/street/给同学Codex-续做提示词-v7.md` 的全文**发给它。提示词列出了重复建店的具体步骤、未完成项、资料提取方法与每家店的验收标准。

先读这三个文件：

1. `docs/street/自由逛街-v7-交接.md`：当前真实实现、入口和存档。
2. `docs/street/街景与画风交接-2026-10-03.md`：美术基线、铺位坐标、资源/动画合批边界。
3. `docs/street/第一人称游览与资料-2026-10-03.md`：可复用文化资料与来源。它的顺序游览部分已废弃。

不要用旧项目整目录覆盖此包。先检查工作区变更；旧 `/` 故事与新 `?sample=tour` 的存档分开。`TourExperience.tsx` 是历史参考；当前入口是 `ExploreExperience.tsx`。

## 已完成与剩余范围

| 范围 | 当前状态 |
|---|---|
| 封面、地图、自由选店、第一人称走近 | 已实现 |
| 圆角 UI、手机食篮、保存/移除/下载 | 已实现 |
| 林记热干面：翻墙、两年代、嘴型/眨眼、热气 | 已实现，可作为复刻样板 |
| 豆皮、面窝：柜台、食物、蒸汽、静态插画背景与文化页 | 可体验；两年代细分和人物动画尚未制作 |
| 东侧中段、西侧街尾、东侧街尾 | 三处空铺位，需继续搭建 |
| 整街地面、周围楼房、游客、晨光与生活角落 | 已搭建；全部建筑和路人尚未分两年代 |
| 拍照 AI 历史复原、做面小游戏、支付下单 | 不在当前交接范围，未实现 |

`?sample=street` 是基础搭建/观察入口，仍显示五处可替换门板；v7 自由游览在其中两处挂载了豆皮/面窝。将来统一入口时要保留铺位 id 和原有样板能力，不要把这个区别误判为数据丢失。

## 开发和验收

```powershell
npm.cmd ci
npm.cmd run dev -- --port 5188
npm.cmd test
npm.cmd run build
```

浏览器验收脚本：`tools/verify-explore.cjs`；共用街景回归：`tools/verify-street.cjs`。环境变量用法和真实报告见 `docs/street/verification-explore/README.md`。截图是实际浏览器页面，素材效果图与测试证据分开保管。实体手机 GPU 性能和外放听感尚未实测。

## 素材与出处

运行时资产位于 `public/assets/storybook/`；新封面和两个柜台插画的完整生成提示词在 `docs/street/v7-generated-assets.json`，其他绘本素材在 `docs/street/storybook-generated.json`。使用内置 Imagegen 生成，背景中的新店主暂为静态插画。

美术参考只用于视觉方向，街巷与人物为创作。文化事实逐页关联资料；不能把生成图、虚构店主和虚构对白写成真实历史复原。
