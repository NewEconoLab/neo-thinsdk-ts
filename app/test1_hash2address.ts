///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest {
    export class Test_Hash2Address implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "Hash2Address";
        }
        start(div: HTMLDivElement): void {

            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a ScriptHash below";

            div.appendChild(document.createElement("hr"));//newline

            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "0x0b193415c6f098b02e81a3b14d0e3b08e9c3f79a";

            div.appendChild(document.createElement("hr"));//newline


            var spanNewAddr = document.createElement("span");
            div.appendChild(spanNewAddr);
            spanNewAddr.textContent = "newaddr:";

            div.appendChild(document.createElement("hr"));//newline

            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "check";
            btn.onclick = () =>
            {
                var array: Uint8Array = input.value.hexToBytes().reverse();
                var address = ThinNeo.Helper.GetAddressFromScriptHash(array);
                spanNewAddr.textContent = address;

            }
        }
    }
}