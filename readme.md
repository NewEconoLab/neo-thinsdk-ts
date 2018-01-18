#Neo-ThinSDK(typesciprt)


Neo-ThinSDK 使用MIT开源协议

使用typescript开发，主要功能是 为 NEO网页钱包开发提供必须的加密方法。

由于我们的产品使用typescript开发，neonjs虽然很棒，但是他是js的源码，不符合我们的审美

## 依赖
Neo-thinSDK依赖这些项目

[google CryptoJS](https://code.google.com/archive/p/crypto-js/)
的aes部分

    <script src="lib/rollup/aes.js"></script>
    <script src="lib/component/aes.js"></script>
    <script src="lib/component/mode-ecb.js"></script>
    <script src="lib/component/pad-nopadding.js"></script>

[WEbScrypt 项目](https://github.com/EtherDream/WebScrypt)

    <script src="lib/scrypt.js"></script>