# Neo-ThinSDK(typesciprt)


Neo-ThinSDK 使用MIT开源协议

使用typescript开发，主要功能是 为 NEO网页钱包开发提供必须的加密方法。

由于我们的产品使用typescript开发，neonjs虽然很棒，但是他是js的源码，不符合我们的审美

## 查看例子
http://sdk.nel.group/

## Neo-ThinSDK 功能
### 签名算法
WIF<->私钥->公钥->公钥->用户地址验证脚本->脚本散列<->Address
一系列计算

签名 验签 计算
### 钱包相关
NEP2私钥加密一系列计算

NEP6钱包文件一系列计算
### 交易相关
交易读写工具
### 脚本相关
脚本反编译

脚本生成器

## 脚本生成规范
NeoThinSDK增加了一个方法

    public EmitParamJson(param: any): ScriptBuilder {
            if (typeof param === "number")//bool 或小整数
            {
                this.EmitPushNumber(new Neo.BigInteger(param as number));
            }
            else if (typeof param === "boolean") {
                this.EmitPushBool(param as boolean);
            }
            else if (typeof param === "object") {
                var list = param as any[];
                for (var i = list.length - 1; i >= 0; i--) {
                    this.EmitParamJson(list[i]);
                }
                this.EmitPushNumber(new Neo.BigInteger(list.length));
                this.Emit(ThinNeo.OpCode.PACK);
            }
            else if (typeof param === "string")//复杂格式
            {
               
            }
            else {
                throw new Error("error type:" + typeof param);
            }
            return this;
        }

可以使用一个json直接配置脚本的参数，提高了便利性，支持嵌套
对于很多复杂的参数类型，直接对string定义了一套规范进行支持          

        //如果参数为string,其实是特殊值
        //(string) or(str) 开头，表示是个字符串，utf8编码为bytes
        //(bytes) or([])开头，表示就是一个bytearray
        //(address) or(addr)开头，表示是一个地址，转换为脚本hash
        //(integer) or(int) 开头，表示是一个大整数
        //(hexinteger) or (hexint) or (hex) 开头，表示是一个16进制表示的大整数，转换为bytes就是反序
        //(int256) or (hex256) 开头,表示是一个定长的256位 16进制大整数
        //(int160) or (hex160) 开头,表示是一个定长的160位 16进制大整数

比如
    
    [
        "(str)name",
        [
          "(bytes)0x112233",
          "(hex160)0x1122334455667788990011223344556677889900"
        ]
    ]
<img src=code1.png>

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