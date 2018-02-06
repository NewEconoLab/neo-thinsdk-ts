///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_Nep6Gen implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "Nep6 Gen";
        }
        start(div: HTMLDivElement): void {
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
            btn.textContent = "gen";
            //info2
            btn.onclick = () => {
                try {
                    //getPrivateKey 是异步方法，且同时只能执行一个
                    var array = new Uint8Array(32);
                    var key = Neo.Cryptography.RandomNumberGenerator.getRandomValues<Uint8Array>(array);
                    spanPri.textContent = key.toHexString();
                    var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(key);
                    var addr = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                    spanAddr.textContent = addr;
                }
                catch (e) {
                }

            }
        }
    }
}