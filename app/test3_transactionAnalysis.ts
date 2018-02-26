///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest {
    export class Test_TransactionAnalysis implements ITestItem {
        constructor() {
            console.log("hello world");
        }
        getName(): string {
            return "TransactionAnalysis";
        }
        start(div: HTMLDivElement): void {

            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Transaction Hex String below";

            div.appendChild(document.createElement("hr"));//newline

            var input = document.createElement("textarea");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.style.height = "200px"
            input.value = "80000001cecfa2be5d80d8757c7c036f7a18a9840736f4ddf797d9b948e9555aad21b6a1010002e72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c6040420f00000000008c8ed58be92fd1b01896dd9e02acd45776eb3e8ce72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c60a0b938d4e8000000b7b0b2d92b970affd9567faf10205ca222e38933";

            //div.appendChild(document.createElement("hr"));//newline

            //var spanDecode = document.createElement("span");
            //div.appendChild(spanDecode);
            //spanDecode.textContent = "decodebase58:";

            //div.appendChild(document.createElement("hr"));//newline

            //var spanCheck = document.createElement("span");
            //div.appendChild(spanCheck);
            //spanCheck.textContent = "check:";

            //div.appendChild(document.createElement("hr"));//newline

            //var spanNewAddr = document.createElement("span");
            //div.appendChild(spanNewAddr);
            //spanNewAddr.textContent = "newaddr:";

            div.appendChild(document.createElement("hr"));//newline

            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "analysis";
            btn.onclick = () => {
                div.appendChild(document.createElement("hr"));//newline

                //类型
                var span = document.createElement("span");
                div.appendChild(span);
                span.textContent = input.value.substring(0, 2);
                span.style.color = "#FF0000";

                //版本
                var span = document.createElement("span");
                div.appendChild(span);
                span.textContent = input.value.substring(2, 4);
                span.style.color = "#00FF00";

                //对象化交易体
                var tx = new ThinNeo.Transaction();
                tx.Deserialize(new Neo.IO.BinaryReader(new Neo.IO.MemoryStream(input.value.hexToBytes())));

                //var array: Uint8Array = Neo.Cryptography.Base58.decode(input.value);
                //var hexstr = array.toHexString();
                //var salt = array.subarray(0, 1);
                //var hash = array.subarray(1, 1 + 20);
                //var check = array.subarray(21, 21 + 4);
                //spanDecode.textContent = "salt:" + salt.toHexString();
                //spanDecode.textContent += " hash:" + hash.clone().reverse().toHexString();
                //spanDecode.textContent += " check:" + check.toHexString();

                //var checkdata = array.subarray(0, 21);
                //var hashd = Neo.Cryptography.Sha256.computeHash(checkdata);
                //hashd = Neo.Cryptography.Sha256.computeHash(hashd);
                //var hashd = hashd.slice(0, 4);
                //var checked = new Uint8Array(hashd);
                //spanCheck.textContent = "checked:" + checked.toHexString();

                //var error = false;
                //for (var i = 0; i < 4; i++) {
                //    if (checked[i] != check[i]) {
                //        spanCheck.textContent += "[Error Addr]";
                //        error = true;
                //        break;
                //    }
                //}
                //if (error) {
                //    var newarray = new Uint8Array(25);
                //    for (var i = 0; i < 25; i++) {
                //        if (i < 21) {
                //            newarray[i] = array[i];
                //        }
                //        else {
                //            newarray[i] = checked[i - 21];
                //        }
                //    }
                //    var newaddr = Neo.Cryptography.Base58.encode(newarray);
                //    spanNewAddr.textContent = "error addr:" + newaddr;
                //}
                //else {
                //    spanNewAddr.textContent = "right addr";

                //}
            }
        }
    }
}