///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_Nep2ToPrikey implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "Nep2->Prikey";
        }
        start(div: HTMLDivElement): void {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Nep2 below";

            div.appendChild(document.createElement("hr"));//newline


            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "6PYPg5zrtPBcY8YgrkLm7Zd5PprLsVKb2fxwoGukKQDrFzRjRkCZXSgkX3";

            div.appendChild(document.createElement("hr"));//newline

            var title1 = document.createElement("span");
            div.appendChild(title1);
            title1.textContent = "password:";
            var inputPass = document.createElement("input");
            div.appendChild(inputPass);
            inputPass.style.width = "300px";
            inputPass.style.position = "absoulte";
            inputPass.value = "";


            div.appendChild(document.createElement("hr"));//newline

            var spanAddress = document.createElement("span");
            div.appendChild(spanAddress);
            spanAddress.textContent = "address:";
            div.appendChild(document.createElement("hr"));//newline

            var spanWif = document.createElement("span");
            div.appendChild(spanWif);
            spanWif.textContent = "wif:";
            div.appendChild(document.createElement("hr"));//newline


            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "*Convert->NEP2";


            btn.onclick = () => {
                var prikey: Uint8Array;
                var pubkey: Uint8Array;
                var address: string;
                try {
                    var nep2 = input.value;
                    var n = 16384;
                    var r = 8;
                    var p = 8
                    ThinNeo.Helper.GetPrivateKeyFromNep2(nep2, inputPass.value, n, r, p, (info, result) => {
                        //spanNep2.textContent = "info=" + info + " result=" + result;
                        console.log("result=" + "info=" + info + " result=" + result);
                        prikey = result as Uint8Array;
                        if (prikey != null) {
                            var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(prikey);
                            var address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                            spanAddress.textContent = address;
                            spanWif.textContent = ThinNeo.Helper.GetWifFromPrivateKey(prikey);
                        }
                        else {
                            spanWif.textContent = "result=" + "info=" + info + " result=" + result;
                        }
                    });

                }
                catch (e) {
                }

            }
        }
    }
}