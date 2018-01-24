///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_Nep6 implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "Nep6 Load";
        }
        start(div: HTMLDivElement): void {
            //title
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "open a nep6 file";
            div.appendChild(document.createElement("hr"));//newline

            //openfile
            var file = document.createElement("input");
            div.appendChild(file);
            file.type = "file";
            var wallet: ThinNeo.nep6wallet;
            var reader = new FileReader();
            reader.onload = (e: Event) => {
                var walletstr = reader.result as string;
                wallet = new ThinNeo.nep6wallet();
                wallet.fromJsonStr(walletstr);
                info1.textContent = "";
                for (var i = 0; i < wallet.accounts.length; i++) {
                    info1.textContent += wallet.accounts[i].address;
                    if (wallet.accounts[i].nep2key != null)
                        info1.textContent += "(have key)";
                    info1.textContent += "\r\n";
                }
            };
            file.onchange = (ev: Event) => {
                if (file.files[0].name.includes(".json")) {
                    reader.readAsText(file.files[0]);
                }
            }
            div.appendChild(document.createElement("hr"));//newline

            //info1
            var info1 = document.createElement("textarea");
            div.appendChild(info1);
            info1.style.width = "500px";
            info1.style.height = "100px";
            div.appendChild(document.createElement("hr"));//newline


            //password
            var title1 = document.createElement("span");
            div.appendChild(title1);
            title1.textContent = "password:";
            var inputPass = document.createElement("input");
            div.appendChild(inputPass);
            inputPass.style.width = "300px";
            inputPass.style.position = "absoulte";
            inputPass.value = "";
            div.appendChild(document.createElement("hr"));//newline

            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "GetKeys";
            //info2
            var info2 = document.createElement("textarea");
            div.appendChild(info2);
            info2.style.width = "500px";
            info2.style.height = "100px";
            div.appendChild(document.createElement("hr"));//newline



            btn.onclick = () => {
                try {
                    //getPrivateKey 是异步方法，且同时只能执行一个
                    info2.textContent = "";
                    var istart = 0;
                    var getkey: (n: number) => void = null;

                    getkey = (keyindex: number) => {
                        if (istart < wallet.accounts.length) {


                            wallet.accounts[keyindex].getPrivateKey(wallet.scrypt, inputPass.value, (info, result) => {
                                if (info == "finish") {
                                    var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(result as Uint8Array);
                                    var address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                                    var hexkey = (result as Uint8Array).toHexString();
                                    info2.textContent += info + "|" + address + " key=" + hexkey;
                                }
                                else {
                                    info2.textContent += info + "|" + result;
                                }
                                istart++;
                                getkey(istart);
                            });
                        }
                    };
                    getkey(0);

                }
                catch (e) {
                }

            }
        }
    }
}