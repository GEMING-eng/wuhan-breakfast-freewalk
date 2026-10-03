# v7 实际浏览器验收

2026-10-03，Windows 独立 Chromium，WebGL D3D11。用户已授权使用独立浏览器。所有图片为本地实际页面截图，不是生成效果图。

- `report.json`：21 项自由选店与食篮流程检查，全部通过，运行时错误 0。覆盖先去面窝、再豆皮、再林记；没有固定顺序门槛。
- `cover-report.json`：最后一轮封面排版检查，1440×960、390×844、320×740；确认两行标题、进入按钮可见和三个剩余空铺位。
- `../verification-final/report.json`：23 项共用街景/林记回归，全部通过。热气、嘴型与眨眼、翻墙中间态、晨光实际像素变化均有检查。
- `npm.cmd test`：36 项通过；`npm.cmd run build` 通过。Three.js 主包仍有大于 500 kB 的 Vite 分包提示，不是构建错误。

## 截图

01 封面；02 自由地图；03 行走中；04 面窝；05 豆皮；06 林记；07 翻墙中间态；08 今日；09 刷新后的食篮；10 手机地图；11 手机店铺；12 手机食篮；13 手机封面；14 小屏封面。`basket.md` 是真实下载结果。封面截图由最后一轮排版检查更新，其他截图由完整流程脚本保存。

第一轮曾发现手机菜摊圆点出界、食篮缺少明确关闭按钮，已修复后重新跑通全部流程；`first-pass-mobile-failure.png` 仅保留修复前诊断，不是最终效果。

## 复跑

先构建并用 `node tools/preview.cjs` 启动 4173，再运行：

```powershell
# 以下路径需替换为接手机器的实际安装位置；不要照搬开发机用户名。
$env:PLAYWRIGHT_MODULE='C:/path/to/node_modules/playwright'
$env:CHROMIUM_PATH='C:/path/to/chrome.exe'
$env:SHARP_MODULE='C:/path/to/node_modules/sharp'
node tools/verify-explore.cjs
node tools/capture-explore-cover.cjs
node tools/verify-street.cjs
```

也可使用能够解析 `playwright`、`sharp` 的本机 Node 环境，并让 Playwright 使用已安装浏览器。脚本记录实际页面报错与截图。不能仅通过修改报告 JSON 获得“通过”。

## 边界

这些检查证明列出的交互和布局在该浏览器执行成功，不代表所有实体手机的性能、触摸手感和音频外放已验证。当前共用街景报告约 2579 次 draw call、182 万三角形；该次 headless 采样为 3.21 秒 88 帧，不能称为跨设备性能基准。继续扩店前应优化轮廓线、合批、阴影和透明层开销，并实测目标设备。

两处新增店主目前是背景中的静态绘画，嘴型回归只针对林记。三个剩余空店、整街所有年代差异和拍照 AI 不在已完成项中。
