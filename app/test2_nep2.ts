///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_Nep2 implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "*Nep2";
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

            var spanDecode = document.createElement("span");
            div.appendChild(spanDecode);
            spanDecode.textContent = "password:";
            var inputPass = document.createElement("input");
            div.appendChild(inputPass);
            inputPass.style.width = "300px";
            inputPass.style.position = "absoulte";
            inputPass.value = "";
            div.appendChild(document.createElement("hr"));//newline

            var spanPubkey = document.createElement("span");
            div.appendChild(spanPubkey);
            spanPubkey.textContent = "pubkey:";

            div.appendChild(document.createElement("hr"));//newline

            var spanAddress = document.createElement("span");
            div.appendChild(spanAddress);
            spanAddress.textContent = "address:";

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
                    ThinNeo.Helper.GetNep2FromPrivateKey(prikey, "paswword");

                    var hexstr = prikey.toHexString();
                    spanDecode.textContent = hexstr;
                }
                catch (e) {
                    spanDecode.textContent = e.message;
                }
                try {
                    pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(prikey);
                    var hexstr = pubkey.toHexString();
                    spanPubkey.textContent = hexstr;
                }
                catch (e) {
                    spanPubkey.textContent = e.message;
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