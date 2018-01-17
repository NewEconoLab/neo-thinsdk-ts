///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest {
    export class Test_Sign implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "Sign&Vertify";
        }
        privateKey: Uint8Array;
        publicKey: Uint8Array;
        start(div: HTMLDivElement): void {

            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Neo WIF below";

            div.appendChild(document.createElement("hr"));//newline

            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.multiple = true;
            input.value = "L2CmHCqgeNHL1i9XFhTLzUXsdr5LGjag4d56YY98FqEi4j5d83Mv";

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
            btn.textContent = "use wif";



            div.appendChild(document.createElement("hr"));//newline

            var message = document.createElement("textarea");
            div.appendChild(message);
            message.value = "010203ff1122abcd";
            message.style.width = "500px";
            message.style.height = "100px";
            div.appendChild(document.createElement("hr"));//newline

            var btnsign = document.createElement("button");
            div.appendChild(btnsign);
            btnsign.textContent = "sign";

            var btnvertify = document.createElement("button");
            div.appendChild(btnvertify);
            btnvertify.textContent = "vertify";
            div.appendChild(document.createElement("hr"));//newline

            var signdata = document.createElement("textarea");
            div.appendChild(signdata);
            signdata.value = "";
            signdata.style.width = "500px";
            signdata.style.height = "100px";
            div.appendChild(document.createElement("hr"));//newline

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
                this.privateKey = prikey;
                this.publicKey = pubkey;
            }

            btnsign.onclick = () => {
                var str = message.value as string;
                var msg = str.hexToBytes();
                var sign = ThinNeo.Helper.Sign(msg, this.privateKey);
                signdata.value = sign.toHexString();
            }
            btnvertify.onclick = () => {
                var str = message.value as string;
                var msg = str.hexToBytes();
                var str2 = signdata.value as string;
                var data = str2.hexToBytes();
                var v = ThinNeo.Helper.VerifySignature(msg, data, this.publicKey);
                alert("vertify=" + v);
            }
        }
    }
}