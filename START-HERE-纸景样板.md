# 先看这里：林记热干面纸景样板

> 2026-10-03 新版已转为绘本老街。请优先阅读 [START-HERE-绘本老街.md](START-HERE-绘本老街.md)。本文件以下保留 v3 历史说明；旧美术对照入口为 `?sample=noodle&art=original`。

**当前版本：2026-10-02 v3。** 修复今昔直切、人物换帧和面碗穿模，新增热气、随年代变化的完整界面与接触光影。交给朋友时，先让 Codex 阅读 `docs/atelier/升级说明-v3-2026-10-02.md`，再读基础交接文档。

此包包含完整源码、已构建页面、生成原图、运行时素材、提示词、浏览器截图和 Codex 交接说明。

## 直接观看

Windows 电脑安装 Node.js 22.18 或更新版本后，双击 `Start-Atelier.cmd`。保持窗口打开，访问：

`http://127.0.0.1:4173/?sample=noodle`

打开后可切换昔日/今日，点击人物和旧物，拖动视角，走近或展开纸层。预览已经构建，不用先安装 npm 依赖。不要直接双击 `dist/index.html`。

## 交给朋友的 Codex

请将整个文件夹交给它，并发送：

> 先阅读 `docs/atelier/升级说明-v3-2026-10-02.md` 和 `docs/atelier/README-给接手的Codex.md`，运行 `?sample=noodle` 样板，查看 `docs/atelier/verification-v3/` 的实际截图。保留样板的纸景、美术、物品特写、今昔翻墙、年代界面、蒸汽与人物局部表情原则，继续扩展另外两家店，再接入原故事流程。人物、道具和店面要分别设计，不能把三家店做成换色复制。先检查我的工作区已有变更，再有选择地整合，避免整目录覆盖。

旧故事入口仍然是 `/`。样板是独立分支页面，没有覆盖原三店剧情。

## 修改代码

执行 `npm.cmd ci`，再执行 `npm.cmd run dev -- --port 5188`，访问 `http://127.0.0.1:5188/?sample=noodle`。

执行 `npm.cmd run build` 更新打包预览。`npm.cmd test` 验证原故事及纸景逻辑。

浏览器验收脚本需要开发电脑有 Playwright、Chromium 和 sharp；不影响普通预览。可通过 `PLAYWRIGHT_MODULE`、`CHROMIUM_PATH`、`SHARP_MODULE` 指定已有安装，使用 `ATELIER_URL` 指定预览地址，然后执行 `node tools/verify-atelier-v3.cjs`。最新截图在 `docs/atelier/verification-v3/`。
