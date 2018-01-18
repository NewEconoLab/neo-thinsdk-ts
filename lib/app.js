var NeoTest;
(function (NeoTest) {
    class Menu {
        constructor() {
            console.log("hello world");
        }
        start() {
            this.createMenu();
            this.addText("NEO-ThinSDK(typescript)");
            this.addLink("Github", "https://github.com/NewEconoLab/neo-thinsdk-ts");
            this.addText("基本签名运算Cryptography");
            this.addMenuItem(new NeoTest.Test_CheckAddress());
            this.addMenuItem(new NeoTest.Test_WifDecode());
            this.addMenuItem(new NeoTest.Test_Sign());
            this.addText("钱包相关Wallet");
            this.addMenuItem(new NeoTest.Test_Nep2FromPrikey());
            this.addMenuItem(new NeoTest.Test_Nep2ToPrikey());
            this.addText("交易相关Transaction");
        }
        addText(str) {
            var link = document.createElement("a");
            link.textContent = str;
            this.divMenu.appendChild(link);
            this.divMenu.appendChild(document.createElement("hr"));
        }
        addLink(str, url) {
            var link = document.createElement("a");
            link.textContent = str;
            link.href = url;
            this.divMenu.appendChild(link);
            this.divMenu.appendChild(document.createElement("hr"));
        }
        addMenuItem(item) {
            var link = document.createElement("a");
            link.textContent = item.getName();
            link.href = "#";
            this.divMenu.appendChild(link);
            link.onclick = () => {
                this.resetDiv();
                item.start(this.div);
            };
            this.divMenu.appendChild(document.createElement("hr"));
        }
        createMenu() {
            this.divMenu = document.createElement("div");
            this.divMenu.style.left = "0px";
            this.divMenu.style.width = "200px";
            this.divMenu.style.top = "0px";
            this.divMenu.style.bottom = "0px";
            this.divMenu.style.position = "absolute";
            this.divMenu.style.overflow = "hidden";
            document.body.appendChild(this.divMenu);
        }
        resetDiv() {
            if (this.div != null) {
                document.body.removeChild(this.div);
            }
            this.div = document.createElement("div");
            this.div.style.left = "200px";
            this.div.style.right = "0px";
            this.div.style.top = "0px";
            this.div.style.bottom = "0px";
            this.div.style.position = "absolute";
            this.div.style.overflow = "hidden";
            document.body.appendChild(this.div);
        }
    }
    window.onload = () => {
        var main = new Menu();
        main.start();
    };
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_CheckAddress {
        constructor() {
            console.log("hello world");
        }
        getName() {
            return "CheckAddress";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Neo address below";
            div.appendChild(document.createElement("hr"));
            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "ALjSnMZidJqd18iQaoCgFun6iqWRm2cVtj";
            div.appendChild(document.createElement("hr"));
            var spanDecode = document.createElement("span");
            div.appendChild(spanDecode);
            spanDecode.textContent = "decodebase58:";
            div.appendChild(document.createElement("hr"));
            var spanCheck = document.createElement("span");
            div.appendChild(spanCheck);
            spanCheck.textContent = "check:";
            div.appendChild(document.createElement("hr"));
            var spanNewAddr = document.createElement("span");
            div.appendChild(spanNewAddr);
            spanNewAddr.textContent = "newaddr:";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "check";
            btn.onclick = () => {
                var array = Neo.Cryptography.Base58.decode(input.value);
                var hexstr = array.toHexString();
                var salt = array.subarray(0, 1);
                var hash = array.subarray(1, 1 + 20);
                var check = array.subarray(21, 21 + 4);
                spanDecode.textContent = "salt:" + salt.toHexString();
                spanDecode.textContent += " hash:" + hash.toHexString();
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
            };
        }
    }
    NeoTest.Test_CheckAddress = Test_CheckAddress;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_Sign {
        constructor() {
        }
        getName() {
            return "Sign&Vertify";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Neo WIF below";
            div.appendChild(document.createElement("hr"));
            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.multiple = true;
            input.value = "L2CmHCqgeNHL1i9XFhTLzUXsdr5LGjag4d56YY98FqEi4j5d83Mv";
            div.appendChild(document.createElement("hr"));
            var spanDecode = document.createElement("span");
            div.appendChild(spanDecode);
            spanDecode.textContent = "private:";
            div.appendChild(document.createElement("hr"));
            var spanPubkey = document.createElement("span");
            div.appendChild(spanPubkey);
            spanPubkey.textContent = "pubkey:";
            div.appendChild(document.createElement("hr"));
            var spanAddress = document.createElement("span");
            div.appendChild(spanAddress);
            spanAddress.textContent = "address:";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "use wif";
            div.appendChild(document.createElement("hr"));
            var message = document.createElement("textarea");
            div.appendChild(message);
            message.value = "010203ff1122abcd";
            message.style.width = "500px";
            message.style.height = "100px";
            div.appendChild(document.createElement("hr"));
            var btnsign = document.createElement("button");
            div.appendChild(btnsign);
            btnsign.textContent = "sign";
            var btnvertify = document.createElement("button");
            div.appendChild(btnvertify);
            btnvertify.textContent = "vertify";
            div.appendChild(document.createElement("hr"));
            var signdata = document.createElement("textarea");
            div.appendChild(signdata);
            signdata.value = "";
            signdata.style.width = "500px";
            signdata.style.height = "100px";
            div.appendChild(document.createElement("hr"));
            btn.onclick = () => {
                var prikey;
                var pubkey;
                var address;
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
            };
            btnsign.onclick = () => {
                var str = message.value;
                var msg = str.hexToBytes();
                var sign = ThinNeo.Helper.Sign(msg, this.privateKey);
                signdata.value = sign.toHexString();
            };
            btnvertify.onclick = () => {
                var str = message.value;
                var msg = str.hexToBytes();
                var str2 = signdata.value;
                var data = str2.hexToBytes();
                var v = ThinNeo.Helper.VerifySignature(msg, data, this.publicKey);
                alert("vertify=" + v);
            };
        }
    }
    NeoTest.Test_Sign = Test_Sign;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_WifDecode {
        constructor() {
        }
        getName() {
            return "WifDecode";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Neo WIF below";
            div.appendChild(document.createElement("hr"));
            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "L2CmHCqgeNHL1i9XFhTLzUXsdr5LGjag4d56YY98FqEi4j5d83Mv";
            div.appendChild(document.createElement("hr"));
            var spanDecode = document.createElement("span");
            div.appendChild(spanDecode);
            spanDecode.textContent = "private:";
            div.appendChild(document.createElement("hr"));
            var spanPubkey = document.createElement("span");
            div.appendChild(spanPubkey);
            spanPubkey.textContent = "pubkey:";
            div.appendChild(document.createElement("hr"));
            var spanAddress = document.createElement("span");
            div.appendChild(spanAddress);
            spanAddress.textContent = "address:";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "decode";
            btn.onclick = () => {
                var prikey;
                var pubkey;
                var address;
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
            };
        }
    }
    NeoTest.Test_WifDecode = Test_WifDecode;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_Nep2FromPrikey {
        constructor() {
        }
        getName() {
            return "Prikey->Nep2";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Neo WIF below";
            div.appendChild(document.createElement("hr"));
            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "L2CmHCqgeNHL1i9XFhTLzUXsdr5LGjag4d56YY98FqEi4j5d83Mv";
            div.appendChild(document.createElement("hr"));
            var title1 = document.createElement("span");
            div.appendChild(title1);
            title1.textContent = "password:";
            var inputPass = document.createElement("input");
            div.appendChild(inputPass);
            inputPass.style.width = "300px";
            inputPass.style.position = "absoulte";
            inputPass.value = "";
            div.appendChild(document.createElement("hr"));
            var spanAddress = document.createElement("span");
            div.appendChild(spanAddress);
            spanAddress.textContent = "address:";
            div.appendChild(document.createElement("hr"));
            var spanNep2 = document.createElement("span");
            div.appendChild(spanNep2);
            spanNep2.textContent = "Nep2:";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "Convert->NEP2";
            btn.onclick = () => {
                var prikey;
                var pubkey;
                var address;
                try {
                    prikey = ThinNeo.Helper.GetPrivateKeyFromWIF(input.value);
                    var n = 16384;
                    var r = 8;
                    var p = 8;
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
            };
        }
    }
    NeoTest.Test_Nep2FromPrikey = Test_Nep2FromPrikey;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_Nep2ToPrikey {
        constructor() {
        }
        getName() {
            return "Nep2->Prikey";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Nep2 below";
            div.appendChild(document.createElement("hr"));
            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "6PYPg5zrtPBcY8YgrkLm7Zd5PprLsVKb2fxwoGukKQDrFzRjRkCZXSgkX3";
            div.appendChild(document.createElement("hr"));
            var title1 = document.createElement("span");
            div.appendChild(title1);
            title1.textContent = "password:";
            var inputPass = document.createElement("input");
            div.appendChild(inputPass);
            inputPass.style.width = "300px";
            inputPass.style.position = "absoulte";
            inputPass.value = "";
            div.appendChild(document.createElement("hr"));
            var spanAddress = document.createElement("span");
            div.appendChild(spanAddress);
            spanAddress.textContent = "address:";
            div.appendChild(document.createElement("hr"));
            var spanWif = document.createElement("span");
            div.appendChild(spanWif);
            spanWif.textContent = "wif:";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "*Convert->NEP2";
            btn.onclick = () => {
                var prikey;
                var pubkey;
                var address;
                try {
                    var nep2 = input.value;
                    var n = 16384;
                    var r = 8;
                    var p = 8;
                    ThinNeo.Helper.GetPrivateKeyFromNep2(nep2, inputPass.value, n, r, p, (info, result) => {
                        console.log("result=" + "info=" + info + " result=" + result);
                        prikey = result;
                        if (prikey != null) {
                            var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(prikey);
                            var address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                            spanAddress.textContent = address;
                            spanWif.textContent = ThinNeo.Helper.GetWifFromPrivateKey(prikey);
                        }
                        else {
                            spanWif.textContent = "result=" + "info=" + info + " result=" + result;
                        }
                    });
                }
                catch (e) {
                }
            };
        }
    }
    NeoTest.Test_Nep2ToPrikey = Test_Nep2ToPrikey;
})(NeoTest || (NeoTest = {}));
//# sourceMappingURL=app.js.map