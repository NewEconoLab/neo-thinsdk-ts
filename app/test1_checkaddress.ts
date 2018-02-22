///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest {
    export class Test_CheckAddress implements ITestItem {
        constructor() {
            console.log("hello world");
        }
        getName(): string {
            return "CheckAddress";
        }
        start(div: HTMLDivElement): void {

            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Neo address below";

            div.appendChild(document.createElement("hr"));//newline

            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "ALjSnMZidJqd18iQaoCgFun6iqWRm2cVtj";

            div.appendChild(document.createElement("hr"));//newline

            var spanDecode = document.createElement("span");
            div.appendChild(spanDecode);
            spanDecode.textContent = "decodebase58:";

            div.appendChild(document.createElement("hr"));//newline

            var spanCheck = document.createElement("span");
            div.appendChild(spanCheck);
            spanCheck.textContent = "check:";

            div.appendChild(document.createElement("hr"));//newline

            var spanNewAddr = document.createElement("span");
            div.appendChild(spanNewAddr);
            spanNewAddr.textContent = "newaddr:";

            div.appendChild(document.createElement("hr"));//newline

            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "check";
            btn.onclick = () => {
                var array: Uint8Array = Neo.Cryptography.Base58.decode(input.value);
                var hexstr = array.toHexString();
                var salt = array.subarray(0, 1);
                var hash = array.subarray(1, 1 + 20);
                var check = array.subarray(21, 21 + 4);
                spanDecode.textContent = "salt:" + salt.toHexString();
                spanDecode.textContent += " hash:" + hash.clone().reverse().toHexString();
                spanDecode.textContent += " check:" + check.toHexString();

                var checkdata = array.subarray(0, 21);
                var hashd = Neo.Cryptography.Sha256.computeHash(checkdata);
                hashd = Neo.Cryptography.Sha256.computeHash(hashd);
                var hashd = hashd.slice(0, 4);
                var checked = new Uint8Array(hashd);
                spanCheck.textContent = "checked:" + checked.toHexString();

                var error = false;
                for (var i = 0; i < 4; i++) {
                    if (checked[i] != check[i]) {
                        spanCheck.textContent += "[Error Addr]";
                        error = true;
                        break;
                    }
                }
                if (error) {
                    var newarray = new Uint8Array(25);
                    for (var i = 0; i < 25; i++) {
                        if (i < 21) {
                            newarray[i] = array[i];
                        }
                        else {
                            newarray[i] = checked[i - 21];
                        }
                    }
                    var newaddr = Neo.Cryptography.Base58.encode(newarray);
                    spanNewAddr.textContent = "error addr:" + newaddr;
                }
                else {
                    spanNewAddr.textContent = "right addr";

                }
            }
        }
    }
}