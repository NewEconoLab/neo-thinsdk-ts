///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest
{
    export interface ITestItem
    {
        getName(): string;
        start(div: HTMLDivElement): void
    }

    class Menu
    {
        constructor()
        {
            console.log("hello world");
        }
        div: HTMLDivElement;
        divMenu: HTMLDivElement;
        start(): void
        {
            var num = "10000000";
            var bignum = new Neo.BigInteger(num);
            var uint8 = bignum.toUint8ArrayWithSign(true);
            var bignumrev = Neo.BigInteger.fromUint8ArrayAutoSign(uint8);
            console.log("bignum=" + bignum);
            console.log("bignumhex=" + uint8.toHexString());
            console.log("bignumrev=" + bignumrev);
            var bignum2 = new Neo.BigInteger("-1");
            var uint82 = bignum2.toUint8ArrayWithSign(true);
            var bignum2rev = Neo.BigInteger.fromUint8ArrayAutoSign(uint82);

            console.log("bignum2=" + bignum2);
            console.log("bignum2hex=" + uint82.toHexString());
            console.log("bignum2rev=" + bignum2rev);

            var bignum3 = new Neo.BigInteger("-129");
            var uint83 = bignum3.toUint8ArrayWithSign(true);
            var bignum3rev = Neo.BigInteger.fromUint8ArrayAutoSign(uint83);
            console.log("bignum3=" + bignum3);
            console.log("bignum3hex=" + uint83.toHexString());
            console.log("bignum3rev=" + bignum3rev);

            this.createMenu();
            this.addText("NEO-ThinSDK(typescript)");
            this.addLink("Github", "https://github.com/NewEconoLab/neo-thinsdk-ts");
            this.addLink("TestPage2", "test2.html");
            this.addLink("TestPage3", "test3.html");
            this.addText("基本签名运算Cryptography");
            this.addMenuItem(new Test_CheckAddress());
            this.addMenuItem(new Test_Hash2Address());
            this.addMenuItem(new Test_Pubkey2Address());
            this.addMenuItem(new Test_WifDecode());
            this.addMenuItem(new Test_Sign());
            this.addText("钱包相关Wallet");
            this.addMenuItem(new Test_Nep2FromPrikey());
            this.addMenuItem(new Test_Nep2ToPrikey());
            this.addMenuItem(new Test_Nep6());
            this.addMenuItem(new Test_Nep6Gen());
            this.addText("交易相关Transaction");
            this.addLink("WalletTest", "wallet.html");
            this.addText("交易解析TransactionAnalysis");
            this.addMenuItem(new Test_TransactionAnalysis());
            this.addText("合约相关Contract");
            this.addMenuItem(new Test_ASM2AVM());
            this.addMenuItem(new Test_ScriptBuilder());
            this.addMenuItem(new Test_GetNep5Info());
            this.addText("多签");
            this.addMenuItem(new Test_MultiSign());

        }
        addText(str: string)
        {
            var link = document.createElement("a");
            link.textContent = str;
            this.divMenu.appendChild(link);
            this.divMenu.appendChild(document.createElement("hr"));//newline         
        }
        addLink(str: string, url: string)
        {
            var link = document.createElement("a");
            link.textContent = str;
            link.href = url;
            this.divMenu.appendChild(link);
            this.divMenu.appendChild(document.createElement("hr"));//newline         
        }
        addMenuItem(item: ITestItem)
        {
            var link = document.createElement("a");
            link.textContent = item.getName();
            link.href = "#";
            this.divMenu.appendChild(link);
            link.onclick = () =>
            {

                this.resetDiv();
                item.start(this.div);
            };

            this.divMenu.appendChild(document.createElement("hr"));//newline            
        }
        createMenu()
        {
            this.divMenu = document.createElement("div");
            this.divMenu.style.left = "0px";
            this.divMenu.style.width = "200px";
            this.divMenu.style.top = "0px";
            this.divMenu.style.bottom = "0px";
            this.divMenu.style.position = "absolute";
            this.divMenu.style.overflow = "hidden";
            document.body.appendChild(this.divMenu);

        }
        resetDiv()
        {
            if (this.div != null)
            {
                document.body.removeChild(this.div);
            }
            this.div = document.createElement("div");
            this.div.style.left = "200px";
            this.div.style.right = "0px";
            this.div.style.top = "0px";
            this.div.style.bottom = "0px";
            this.div.style.position = "absolute";
            this.div.style.overflow = "hidden";
            document.body.appendChild(this.div);
        }
    }
    window.onload = () =>
    {
        var main = new Menu();
        main.start();
    };
}
