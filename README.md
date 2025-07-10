## PicACG 哔咔漫画 定时自动签到 （打哔咔）

> 利用 Github Actions 定时任务实现自动签到。

[![PicACG-Auto-Checkin](https://github.com/ewigl/picacg-auto-checkin/actions/workflows/Checkin.yml/badge.svg)](https://github.com/ewigl/picacg-auto-checkin/actions/workflows/Checkin.yml)

### 仓库变量

- **EMAIL**：账号。
- **PASSWD**：密码。

### 使用方法

1. Fork 此仓库。
2. 在 fork 后的仓库中启用 Actions。
3. 配置仓库变量。

详细文档: https://ewigl.github.io/notes/posts/programming/github-actions/

### 注意事项

根据 [Github 的政策](https://docs.github.com/zh/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/disabling-and-enabling-a-workflow?tool=webui)，当 60 天内未发生仓库活动时，将自动禁用定时 Workflow。需要再次手动启用。
