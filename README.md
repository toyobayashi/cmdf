# cmdf

修改 cmd / powershell 默认字体。

## 步骤

1. NPM 全局安装

    ``` bat
    npm install -g toyobayashi/cmdf
    ```

2. 运行命令修改注册表，用法：

    ```
    cmdf <font> [fallback [scale]]
    ```

   示例：修改成 Consolas + 微软雅黑

    ``` bat
    cmdf "Consolas" "Microsoft YaHei" 128,96
    ```

3. 成功后注销登录，也可以重启系统

4. 打开 cmd 或 powershell，如果还没有看到字体生效，再：

    1. 切换到 437 代码页

        ``` bat
        chcp 437
        ```

    2. 点击左上角窗口图标，打开【**默认值**】，切换到【字体】选项卡，选择第 2 步用命令修改的字体，确定。这时不会有什么变化。

    3. 再次点击左上角窗口图标，打开【**属性**】，切换到【字体】选项卡，选择第 2 步用命令修改的字体，确定后重启 cmd / powershell，可看到字体成功应用。

注意：如果要修改别的选项，要切换到 437 代码页去修改。
