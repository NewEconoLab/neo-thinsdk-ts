///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest {
    export class Test_Pubkey2Address implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "Test_Pubkey2Address";
        }
        start(div: HTMLDivElement): void {

            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a publickey below";

            div.appendChild(document.createElement("hr"));//newline

            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "02bf055764de0320c8221920d856d3d9b93dfc1dcbc759a560fd42553aa025ba5c";

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
                var array: Uint8Array = input.value.hexToBytes();
                var address = ThinNeo.Helper.GetAddressFromPublicKey(array);
                spanNewAddr.textContent = address;

            }
        }
    }
}