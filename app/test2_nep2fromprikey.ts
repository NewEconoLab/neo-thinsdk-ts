///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_Nep2FromPrikey implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "Prikey->Nep2";
        }
        start(div: HTMLDivElement): void {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Neo WIF below";

            div.appendChild(document.createElement("hr"));//newline


            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "L2CmHCqgeNHL1i9XFhTLzUXsdr5LGjag4d56YY98FqEi4j5d83Mv";

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

            var spanNep2 = document.createElement("span");
            div.appendChild(spanNep2);
            spanNep2.textContent = "Nep2:";
            div.appendChild(document.createElement("hr"));//newline

            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "Convert->NEP2";


            btn.onclick = () => {
                var prikey: Uint8Array;
                var pubkey: Uint8Array;
                var address: string;
                try {
                    prikey = ThinNeo.Helper.GetPrivateKeyFromWIF(input.value);
                    var n = 16384;
                    var r = 8;
                    var p = 8
                    ThinNeo.Helper.GetNep2FromPrivateKey(prikey, inputPass.value, n, r, p, (info, result) => {
                        spanNep2.textContent = "info=" + info + " result=" + result;
                        console.log("result=" + "info=" + info + " result=" + result);
                    });

                    var hexstr = prikey.toHexString();
                }
                catch (e) {
                }
                try {
                    pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(prikey);
                    var hexstr = pubkey.toHexString();
                }
                catch (e) {
                }
                try {
                    address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                    spanAddress.textContent = address;
                }
                catch (e) {
                    spanAddress.textContent = e.message;
                }
            }
        }
    }
}