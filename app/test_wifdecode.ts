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
            spanDecode.textContent = "decodebase58:";

            div.appendChild(document.createElement("hr"));//newline

            //var spanCheck = document.createElement("span");
            //div.appendChild(spanCheck);
            //spanCheck.textContent = "check:";

            //div.appendChild(document.createElement("hr"));//newline

            //var spanNewAddr = document.createElement("span");
            //div.appendChild(spanNewAddr);
            //spanNewAddr.textContent = "newaddr:";

            //div.appendChild(document.createElement("hr"));//newline

            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "check";
            btn.onclick = () => {
                var array: Uint8Array = Neo.Cryptography.Base58.decode(input.value);
                var hexstr = array.toHexString();
                spanDecode.textContent = hexstr;


            }
        }
    }
}