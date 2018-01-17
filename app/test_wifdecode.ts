///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest {
    export class Test_WifDecode implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "WifDecode";
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
            input.value = "";

            div.appendChild(document.createElement("hr"));//newline

            var spanDecode = document.createElement("span");
            div.appendChild(spanDecode);
            spanDecode.textContent = "private:";

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
            btn.textContent = "check";


            btn.onclick = () => {

                var prikey: Uint8Array;
                var pubkey: Uint8Array;
                var address: string;
                try {
                    prikey = ThinNeo.Helper.GetPrivateKeyFromWIF(input.value);
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