///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_Nep2_sign implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "Nep2_sign";
        }
        start(div: HTMLDivElement): void {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Neo NEP2key below";

            div.appendChild(document.createElement("hr"));//newline

            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "6PYPh1msaJEUvhCkVMxq2Lfu31f3PjAcfQSXQre6vbQguY7ZQeZou5TiB9";

            div.appendChild(document.createElement("hr"));//newline

            var spanDecode = document.createElement("span");
            div.appendChild(spanDecode);
            div.appendChild(document.createElement("hr"));//newline

            spanDecode.textContent = "password:";
            var inputPass = document.createElement("input");
            div.appendChild(inputPass);
            inputPass.style.width = "300px";
            inputPass.style.position = "absoulte";
            inputPass.value = "";
            div.appendChild(document.createElement("hr"));//newline

            var spanDerivedkey = document.createElement("span");
            div.appendChild(spanDerivedkey);
            div.appendChild(document.createElement("hr"));//newline

            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "NEP2->sign";

            btn.onclick = () => {
                var base58DecodeData: Uint8Array;
                var derivedkey: Uint8Array;
                var prikey: Uint8Array;
                var pubkey: Uint8Array;
                var address: string;
                try {
                    base58DecodeData = Neo.Cryptography.Base58.decode(input.value);

                    var hexstr = base58DecodeData.slice(0,            base58DecodeData.length-4).toHexString();
                    spanDecode.textContent = hexstr;
                }
                catch (e) {
                    spanDecode.textContent = e.message;
                }

                //try {
                //    derivedkey = Neo.Cryptography.(input.value);

                //    var hexstr = base58DecodeData.slice(0, base58DecodeData.length - 4).toHexString();

                //    spanDerivedkey.textContent = hexstr;
                //}
                //catch (e) {
                //    spanDerivedkey.textContent = e.message;
                //}
            }
        }
    }
}