///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest
{
    export class Test_Nep6Gen implements ITestItem
    {
        constructor()
        {
        }
        getName(): string
        {
            return "Nep6 Gen";
        }
        start(div: HTMLDivElement): void
        {
            //title
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "gen a Nep6 wallet";
            //初始化隨機數生成器
            //該隨機數生成器的原理是收集鼠標事件，所以早點打開，效果好
            Neo.Cryptography.RandomNumberGenerator.startCollectors();


            div.appendChild(document.createElement("hr"));//newline


            var spanPri = document.createElement("span");
            div.appendChild(spanPri);
            spanPri.textContent = "prikey";
            div.appendChild(document.createElement("hr"));//newline

            var spanAddr = document.createElement("span");
            div.appendChild(spanAddr);
            spanAddr.textContent = "address";
            div.appendChild(document.createElement("hr"));//newline

            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "gen key";

            var key: Uint8Array = null;
            var addr: string = null;

            //info2
            btn.onclick = () =>
            {
                try
                {
                    //getPrivateKey 是异步方法，且同时只能执行一个
                    var array = new Uint8Array(32);
                    key = Neo.Cryptography.RandomNumberGenerator.getRandomValues<Uint8Array>(array);
                    spanPri.textContent = key.toHexString();
                    var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(key);
                    addr = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                    spanAddr.textContent = addr;
                }
                catch (e)
                {
                }

            }
            div.appendChild(document.createElement("hr"));//newline
            var span2 = document.createElement("span");
            div.appendChild(span2);
            span2.textContent = "password";
            var inputPass = document.createElement("input");
            div.appendChild(inputPass);
            inputPass.style.width = "300px";
            inputPass.style.position = "absoulte";
            inputPass.value = "";
            div.appendChild(document.createElement("hr"));//newline

            var btnSave = document.createElement("button");
            div.appendChild(btnSave);
            btnSave.textContent = "gen wallet.json";

            var download = document.createElement("a");
            div.appendChild(download);
            download.download = "wallet.json";
            download.href = "";
            download.target = "_blank";
            download.text = "";

            btnSave.onclick = () =>
            {
                var wallet = new ThinNeo.nep6wallet();
                wallet.scrypt = new ThinNeo.nep6ScryptParameters();
                wallet.scrypt.N = 16384;
                wallet.scrypt.r = 8;
                wallet.scrypt.p = 8;
                wallet.accounts = [];
                wallet.accounts[0] = new ThinNeo.nep6account();
                wallet.accounts[0].address = addr;
                ThinNeo.Helper.GetNep2FromPrivateKey(key, inputPass.value, wallet.scrypt.N, wallet.scrypt.r, wallet.scrypt.p, (info, result) =>
                {
                    if (info == "finish")
                    {
                        wallet.accounts[0].nep2key = result;
                        wallet.accounts[0].contract = new ThinNeo.contract();
                        var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(key);
                        wallet.accounts[0].contract.script = ThinNeo.Helper.GetAddressCheckScriptFromPublicKey(pubkey).toHexString();
                        var jsonstr = JSON.stringify(wallet.toJson());
                        var blob = new Blob([ThinNeo.Helper.String2Bytes(jsonstr)]);
                        download.href = URL.createObjectURL(blob);
                        download.text = "download";
                    }
                });

            }
            //var aLink = document.createElement('a');
            //var blob = new Blob([content]);
            //var evt = document.createEvent("HTMLEvents");
            //evt.initEvent("click", false, false);
            //aLink.download = fileName;
            //aLink.href = URL.createObjectURL(blob);
            //aLink.dispatchEvent(evt);
            //btn.onabort
        }
    }
}