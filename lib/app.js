var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var NeoTest;
(function (NeoTest) {
    class Menu {
        constructor() {
            console.log("hello world");
        }
        start() {
            var num = "10000000";
            var bignum = new Neo.BigInteger(num);
            var uint8 = bignum.toUint8ArrayWithSign(true);
            var bignumrev = Neo.BigInteger.fromUint8ArrayAutoSign(uint8);
            console.log("bignum=" + bignum);
            console.log("bignumhex=" + uint8.toHexString());
            console.log("bignumrev=" + bignumrev);
            var bignum2 = new Neo.BigInteger("-1");
            var uint82 = bignum2.toUint8ArrayWithSign(true);
            var bignum2rev = Neo.BigInteger.fromUint8ArrayAutoSign(uint82);
            console.log("bignum2=" + bignum2);
            console.log("bignum2hex=" + uint82.toHexString());
            console.log("bignum2rev=" + bignum2rev);
            var bignum3 = new Neo.BigInteger("-129");
            var uint83 = bignum3.toUint8ArrayWithSign(true);
            var bignum3rev = Neo.BigInteger.fromUint8ArrayAutoSign(uint83);
            console.log("bignum3=" + bignum3);
            console.log("bignum3hex=" + uint83.toHexString());
            console.log("bignum3rev=" + bignum3rev);
            this.createMenu();
            this.addText("NEO-ThinSDK(typescript)");
            this.addLink("Github", "https://github.com/NewEconoLab/neo-thinsdk-ts");
            this.addText("基本签名运算Cryptography");
            this.addMenuItem(new NeoTest.Test_CheckAddress());
            this.addMenuItem(new NeoTest.Test_Hash2Address());
            this.addMenuItem(new NeoTest.Test_Pubkey2Address());
            this.addMenuItem(new NeoTest.Test_WifDecode());
            this.addMenuItem(new NeoTest.Test_Sign());
            this.addText("钱包相关Wallet");
            this.addMenuItem(new NeoTest.Test_Nep2FromPrikey());
            this.addMenuItem(new NeoTest.Test_Nep2ToPrikey());
            this.addMenuItem(new NeoTest.Test_Nep6());
            this.addMenuItem(new NeoTest.Test_Nep6Gen());
            this.addText("交易相关Transaction");
            this.addLink("WalletTest", "wallet.html");
            this.addText("交易解析TransactionAnalysis");
            this.addMenuItem(new NeoTest.Test_TransactionAnalysis());
            this.addText("合约相关Contract");
            this.addMenuItem(new NeoTest.Test_ASM2AVM());
            this.addMenuItem(new NeoTest.Test_ScriptBuilder());
            this.addMenuItem(new NeoTest.Test_GetNep5Info());
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
            };
        }
    }
    NeoTest.Test_CheckAddress = Test_CheckAddress;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_Hash2Address {
        constructor() {
        }
        getName() {
            return "Hash2Address";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a ScriptHash below";
            div.appendChild(document.createElement("hr"));
            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "0x0b193415c6f098b02e81a3b14d0e3b08e9c3f79a";
            div.appendChild(document.createElement("hr"));
            var spanNewAddr = document.createElement("span");
            div.appendChild(spanNewAddr);
            spanNewAddr.textContent = "newaddr:";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "check";
            btn.onclick = () => {
                var array = input.value.hexToBytes().reverse();
                var address = ThinNeo.Helper.GetAddressFromScriptHash(array);
                spanNewAddr.textContent = address;
            };
        }
    }
    NeoTest.Test_Hash2Address = Test_Hash2Address;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_Pubkey2Address {
        constructor() {
        }
        getName() {
            return "Test_Pubkey2Address";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a publickey below";
            div.appendChild(document.createElement("hr"));
            var input = document.createElement("input");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "02bf055764de0320c8221920d856d3d9b93dfc1dcbc759a560fd42553aa025ba5c";
            div.appendChild(document.createElement("hr"));
            var spanNewAddr = document.createElement("span");
            div.appendChild(spanNewAddr);
            spanNewAddr.textContent = "newaddr:";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "check";
            btn.onclick = () => {
                var array = input.value.hexToBytes();
                var address = ThinNeo.Helper.GetAddressFromPublicKey(array);
                spanNewAddr.textContent = address;
            };
        }
    }
    NeoTest.Test_Pubkey2Address = Test_Pubkey2Address;
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
var NeoTest;
(function (NeoTest) {
    class Test_Nep6 {
        constructor() {
        }
        getName() {
            return "Nep6 Load";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "open a nep6 file";
            div.appendChild(document.createElement("hr"));
            var file = document.createElement("input");
            div.appendChild(file);
            file.type = "file";
            var wallet;
            var reader = new FileReader();
            reader.onload = (e) => {
                var walletstr = reader.result;
                wallet = new ThinNeo.nep6wallet();
                wallet.fromJsonStr(walletstr);
                info1.textContent = "";
                for (var i = 0; i < wallet.accounts.length; i++) {
                    info1.textContent += wallet.accounts[i].address;
                    if (wallet.accounts[i].nep2key != null)
                        info1.textContent += "(have key)";
                    info1.textContent += "\r\n";
                }
            };
            file.onchange = (ev) => {
                if (file.files[0].name.includes(".json")) {
                    reader.readAsText(file.files[0]);
                }
            };
            div.appendChild(document.createElement("hr"));
            var info1 = document.createElement("textarea");
            div.appendChild(info1);
            info1.style.width = "500px";
            info1.style.height = "100px";
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
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "GetKeys";
            var info2 = document.createElement("textarea");
            div.appendChild(info2);
            info2.style.width = "500px";
            info2.style.height = "100px";
            div.appendChild(document.createElement("hr"));
            btn.onclick = () => {
                try {
                    info2.textContent = "";
                    var istart = 0;
                    var getkey = null;
                    getkey = (keyindex) => {
                        if (istart < wallet.accounts.length) {
                            wallet.accounts[keyindex].getPrivateKey(wallet.scrypt, inputPass.value, (info, result) => {
                                if (info == "finish") {
                                    var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(result);
                                    var address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                                    var hexkey = result.toHexString();
                                    info2.textContent += info + "|" + address + " key=" + hexkey;
                                }
                                else {
                                    info2.textContent += info + "|" + result;
                                }
                                istart++;
                                getkey(istart);
                            });
                        }
                    };
                    getkey(0);
                }
                catch (e) {
                }
            };
        }
    }
    NeoTest.Test_Nep6 = Test_Nep6;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_Nep6Gen {
        constructor() {
        }
        getName() {
            return "Nep6 Gen";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "gen a Nep6 wallet";
            Neo.Cryptography.RandomNumberGenerator.startCollectors();
            div.appendChild(document.createElement("hr"));
            var spanPri = document.createElement("span");
            div.appendChild(spanPri);
            spanPri.textContent = "prikey";
            div.appendChild(document.createElement("hr"));
            var spanAddr = document.createElement("span");
            div.appendChild(spanAddr);
            spanAddr.textContent = "address";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "gen key";
            var key = null;
            var addr = null;
            btn.onclick = () => {
                try {
                    var array = new Uint8Array(32);
                    key = Neo.Cryptography.RandomNumberGenerator.getRandomValues(array);
                    spanPri.textContent = key.toHexString();
                    var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(key);
                    addr = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                    spanAddr.textContent = addr;
                }
                catch (e) {
                }
            };
            div.appendChild(document.createElement("hr"));
            var span2 = document.createElement("span");
            div.appendChild(span2);
            span2.textContent = "password";
            var inputPass = document.createElement("input");
            div.appendChild(inputPass);
            inputPass.style.width = "300px";
            inputPass.style.position = "absoulte";
            inputPass.value = "";
            div.appendChild(document.createElement("hr"));
            var btnSave = document.createElement("button");
            div.appendChild(btnSave);
            btnSave.textContent = "gen wallet.json";
            var download = document.createElement("a");
            div.appendChild(download);
            download.download = "wallet.json";
            download.href = "";
            download.target = "_blank";
            download.text = "";
            btnSave.onclick = () => {
                var wallet = new ThinNeo.nep6wallet();
                wallet.scrypt = new ThinNeo.nep6ScryptParameters();
                wallet.scrypt.N = 16384;
                wallet.scrypt.r = 8;
                wallet.scrypt.p = 8;
                wallet.accounts = [];
                wallet.accounts[0] = new ThinNeo.nep6account();
                wallet.accounts[0].address = addr;
                ThinNeo.Helper.GetNep2FromPrivateKey(key, inputPass.value, wallet.scrypt.N, wallet.scrypt.r, wallet.scrypt.p, (info, result) => {
                    if (info == "finish") {
                        wallet.accounts[0].nep2key = result;
                        wallet.accounts[0].contract = new ThinNeo.contract();
                        var pubkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(key);
                        wallet.accounts[0].contract.script = ThinNeo.Helper.GetAddressCheckScriptFromPublicKey(pubkey).toHexString();
                        var jsonstr = JSON.stringify(wallet.toJson());
                        var blob = new Blob([ThinNeo.Helper.String2Bytes(jsonstr)]);
                        download.href = URL.createObjectURL(blob);
                        download.text = "download";
                    }
                });
            };
        }
    }
    NeoTest.Test_Nep6Gen = Test_Nep6Gen;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_TransactionAnalysis {
        constructor() {
            console.log("hello world");
        }
        getName() {
            return "TransactionAnalysis";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Transaction Hex String below";
            div.appendChild(document.createElement("hr"));
            var input = document.createElement("textarea");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.style.height = "200px";
            input.value = "d100f54030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030423032393938343036306165336165616235646364373261396330353930636535326535646132353537366161303761343761643062373861653939623564303438650a71696e676d696e677a69047465737454c10872656769737465724030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030678432d43c27d1c06eb56b9ce505910b03e4b391c10001db60f31309ff659278fa717d8259cf8f164dd2dc89a5233ca394d21965b2c9cd000001e72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c6032775ea40000000009cc8527f1a6fb18ee021595842fadd42ab74d93";
            div.appendChild(document.createElement("hr"));
            function byteToString(arr) {
                if (typeof arr === 'string') {
                    return arr;
                }
                var str = '', _arr = arr;
                for (var i = 0; i < _arr.length; i++) {
                    var one = _arr[i].toString(2), v = one.match(/^1+?(?=0)/);
                    if (v && one.length == 8) {
                        var bytesLength = v[0].length;
                        var store = _arr[i].toString(2).slice(7 - bytesLength);
                        for (var st = 1; st < bytesLength; st++) {
                            store += _arr[st + i].toString(2).slice(2);
                        }
                        str += String.fromCharCode(parseInt(store, 2));
                        i += bytesLength - 1;
                    }
                    else {
                        str += String.fromCharCode(_arr[i]);
                    }
                }
                return str;
            }
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "analysis";
            btn.onclick = () => {
                div.appendChild(document.createElement("hr"));
                var span = document.createElement("span");
                div.appendChild(span);
                span.textContent = "Transaction Type";
                span.style.color = "#000000";
                div.appendChild(document.createElement("br"));
                var span = document.createElement("span");
                div.appendChild(span);
                var txTypeId = input.value.substring(0, 2);
                switch (txTypeId) {
                    case "80":
                        span.textContent = "ContractTransaction";
                        break;
                    case "d1":
                        span.textContent = "InvocationTransaction";
                        break;
                    default:
                        span.textContent = "unknow";
                }
                span.style.color = "#FF0000";
                div.appendChild(document.createElement("br"));
                var span = document.createElement("span");
                div.appendChild(span);
                span.textContent = "Transaction Version";
                span.style.color = "#000000";
                div.appendChild(document.createElement("br"));
                var span = document.createElement("span");
                div.appendChild(span);
                span.textContent = input.value.substring(2, 4);
                span.style.color = "#00FF00";
                var tx = new ThinNeo.Transaction();
                var buf = input.value.hexToBytes();
                tx.Deserialize(new Neo.IO.BinaryReader(new Neo.IO.MemoryStream(buf.buffer, 0, buf.byteLength)));
                div.appendChild(document.createElement("hr"));
                var i = 0;
                tx.inputs.forEach(function (input) {
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = "input" + i;
                    span.style.color = "#000000";
                    div.appendChild(document.createElement("br"));
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = input.hash.reverse().toHexString();
                    span.style.color = "#FF0000";
                    div.appendChild(document.createElement("br"));
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = input.index.toString();
                    span.style.color = "#00FF00";
                    div.appendChild(document.createElement("br"));
                    i++;
                });
                div.appendChild(document.createElement("hr"));
                i = 0;
                tx.outputs.forEach(function (output) {
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = "output" + i;
                    span.style.color = "#000000";
                    div.appendChild(document.createElement("br"));
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = ThinNeo.Helper.GetAddressFromScriptHash(output.toAddress);
                    span.style.color = "#FF0000";
                    div.appendChild(document.createElement("br"));
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = output.assetId.reverse().toHexString();
                    span.style.color = "#00FF00";
                    div.appendChild(document.createElement("br"));
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = output.value.toString();
                    span.style.color = "#0000FF";
                    div.appendChild(document.createElement("br"));
                    i++;
                });
                div.appendChild(document.createElement("hr"));
                if (txTypeId == "d1") {
                    var itd = tx.extdata;
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = "script decompile";
                    span.style.color = "#000000";
                    div.appendChild(document.createElement("br"));
                    var info2 = document.createElement("textarea");
                    div.appendChild(info2);
                    info2.style.width = "500px";
                    info2.style.height = "300px";
                    try {
                        info2.textContent = "";
                        var data = itd.script;
                        var ops = ThinNeo.Compiler.Avm2Asm.Trans(data);
                        for (var i = 0; i < ops.length; i++) {
                            var op = ops[i];
                            info2.textContent += op.toString() + "\r\n";
                            try {
                                if (op.toString().substring(3, 10) == "APPCALL") {
                                    info2.textContent += "【" + op.toString().substring(13, 53).hexToBytes().reverse().toHexString() + "】" + "\r\n";
                                }
                                info2.textContent += "【" + byteToString(op.AsHexString().hexToBytes()) + "】" + "\r\n";
                            }
                            catch (_a) { }
                        }
                    }
                    catch (e) {
                    }
                    if (itd.gas != null) {
                        var span = document.createElement("span");
                        div.appendChild(span);
                        span.textContent = itd.gas.toString();
                        span.style.color = "#00FF00";
                        div.appendChild(document.createElement("br"));
                    }
                }
                for (var i = 0; i < 4; i++) {
                }
            };
        }
    }
    NeoTest.Test_TransactionAnalysis = Test_TransactionAnalysis;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_ASM2AVM {
        constructor() {
        }
        getName() {
            return "ASM2AVM";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a avm hexstr below";
            div.appendChild(document.createElement("hr"));
            var info1 = document.createElement("textarea");
            div.appendChild(info1);
            info1.style.width = "500px";
            info1.style.height = "100px";
            info1.textContent = "05006c18fb521459b637ee6d5355fd10eadd201d62840662ba2bb214520fe97e396671682f7a5f672ea0f4e719a61f5353c1087472616e7366657267f91d6b7085db7c5aaf09f19eeec1ca3c0db2c6ecf166f12c436084195f79";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "->asm code";
            div.appendChild(document.createElement("hr"));
            var info2 = document.createElement("textarea");
            div.appendChild(info2);
            info2.style.width = "500px";
            info2.style.height = "100px";
            div.appendChild(document.createElement("hr"));
            btn.onclick = () => {
                try {
                    info2.textContent = "";
                    var data = info1.value.hexToBytes();
                    var ops = ThinNeo.Compiler.Avm2Asm.Trans(data);
                    for (var i = 0; i < ops.length; i++) {
                        var op = ops[i];
                        info2.textContent += op.toString() + "\r\n";
                    }
                }
                catch (e) {
                }
            };
        }
    }
    NeoTest.Test_ASM2AVM = Test_ASM2AVM;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_GetNep5Info {
        constructor() {
            this.nep5decimals = 0;
        }
        getName() {
            return "GetNep5Info";
        }
        makeRpcUrl(url, method, ..._params) {
            if (url[url.length - 1] != '/')
                url = url + "/";
            var urlout = url + "?jsonrpc=2.0&id=1&method=" + method + "&params=[";
            for (var i = 0; i < _params.length; i++) {
                urlout += JSON.stringify(_params[i]);
                if (i != _params.length - 1)
                    urlout += ",";
            }
            urlout += "]";
            return urlout;
        }
        makeRpcPostBody(method, ..._params) {
            var body = {};
            body["jsonrpc"] = "2.0";
            body["id"] = 1;
            body["method"] = method;
            var params = [];
            for (var i = 0; i < _params.length; i++) {
                params.push(_params[i]);
            }
            body["params"] = params;
            return body;
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a NEP5 scripthash below";
            div.appendChild(document.createElement("hr"));
            var sid = document.createElement("input");
            div.appendChild(sid);
            sid.style.width = "500px";
            sid.style.position = "absoulte";
            sid.value = "0x3fccdb91c9bb66ef2446010796feb6ca4ed96b05";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "get Info";
            var btn2 = document.createElement("button");
            div.appendChild(btn2);
            btn2.textContent = "get balance";
            var addr = document.createElement("input");
            div.appendChild(addr);
            addr.value = "ALjSnMZidJqd18iQaoCgFun6iqWRm2cVtj";
            div.appendChild(document.createElement("hr"));
            var info1 = document.createElement("textarea");
            div.appendChild(info1);
            info1.style.width = "500px";
            info1.style.height = "100px";
            info1.textContent = "";
            div.appendChild(document.createElement("hr"));
            var info2 = document.createElement("textarea");
            div.appendChild(info2);
            info2.style.width = "500px";
            info2.style.height = "100px";
            div.appendChild(document.createElement("hr"));
            btn.onclick = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    var sb = new ThinNeo.ScriptBuilder();
                    sb.EmitParamJson(JSON.parse("[]"));
                    sb.EmitParamJson("(str)name");
                    var shash = sid.value.hexToBytes();
                    sb.EmitAppCall(shash.reverse());
                    sb.EmitParamJson(JSON.parse("[]"));
                    sb.EmitParamJson("(str)symbol");
                    var shash = sid.value.hexToBytes();
                    sb.EmitAppCall(shash.reverse());
                    sb.EmitParamJson(JSON.parse("[]"));
                    sb.EmitParamJson("(str)decimals");
                    var shash = sid.value.hexToBytes();
                    sb.EmitAppCall(shash.reverse());
                    var data = sb.ToArray();
                    info1.textContent = data.toHexString();
                    var body = this.makeRpcPostBody("invokescript", data.toHexString());
                    var url = "http://47.96.168.8:20332";
                    var response = yield fetch(url, { "method": "post", "body": JSON.stringify(body) });
                    var r = yield response.json();
                    info1.textContent = JSON.stringify(r);
                    try {
                        var state = r.result.state;
                        info2.textContent = "";
                        if (state.includes("HALT")) {
                            info2.textContent += "Succ\n";
                        }
                        var stack = r.result.stack;
                        if (stack[0].type == "String")
                            info2.textContent += "name=" + stack[0].value + "\n";
                        else if (stack[0].type == "ByteArray") {
                            var bs = stack[0].value.hexToBytes();
                            var str = ThinNeo.Helper.Bytes2String(bs);
                            info2.textContent += "name=" + str + "\n";
                        }
                        if (stack[1].type == "String")
                            info2.textContent += "symbol=" + stack[1].value + "\n";
                        else if (stack[1].type == "ByteArray") {
                            var bs = stack[1].value.hexToBytes();
                            var str = ThinNeo.Helper.Bytes2String(bs);
                            info2.textContent += "symbol=" + str + "\n";
                        }
                        if (stack[2].type == "Integer") {
                            this.nep5decimals = (new Neo.BigInteger(stack[2].value)).toInt32();
                        }
                        else if (stack[2].type == "ByteArray") {
                            var bs = stack[2].value.hexToBytes();
                            var num = Neo.BigInteger.fromUint8ArrayAutoSign(bs);
                            this.nep5decimals = num.toInt32();
                        }
                        info2.textContent += "decimals=" + this.nep5decimals + "\n";
                    }
                    catch (e) {
                    }
                }
                catch (e) {
                }
            });
            btn2.onclick = () => __awaiter(this, void 0, void 0, function* () {
                var sb = new ThinNeo.ScriptBuilder();
                sb.EmitParamJson(["(addr)" + addr.value]);
                sb.EmitParamJson("(str)balanceOf");
                var shash = sid.value.hexToBytes();
                sb.EmitAppCall(shash.reverse());
                var data = sb.ToArray();
                info1.textContent = data.toHexString();
                var body = this.makeRpcPostBody("invokescript", data.toHexString());
                var url = "http://47.96.168.8:20332";
                var response = yield fetch(url, { "method": "post", "body": JSON.stringify(body) });
                var r = yield response.json();
                info1.textContent = JSON.stringify(r);
                try {
                    var state = r.result.state;
                    info2.textContent = "";
                    if (state.includes("HALT")) {
                        info2.textContent += "Succ\n";
                    }
                    var stack = r.result.stack;
                    var bnum = new Neo.BigInteger(0);
                    if (stack[0].type == "Integer") {
                        bnum = new Neo.BigInteger(stack[0].value);
                    }
                    else if (stack[0].type == "ByteArray") {
                        var bs = stack[0].value.hexToBytes();
                        bnum = Neo.BigInteger.fromUint8ArrayAutoSign(bs);
                    }
                    var v = 1;
                    for (var i = 0; i < this.nep5decimals; i++) {
                        v *= 10;
                    }
                    var intv = bnum.divide(v).toInt32();
                    var smallv = bnum.mod(v).toInt32() / v;
                    info2.textContent += "count=" + (intv + smallv);
                }
                catch (e) {
                }
            });
        }
    }
    NeoTest.Test_GetNep5Info = Test_GetNep5Info;
})(NeoTest || (NeoTest = {}));
var NeoTest;
(function (NeoTest) {
    class Test_ScriptBuilder {
        constructor() {
        }
        getName() {
            return "ScriptBuilder";
        }
        start(div) {
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a scripthash below";
            div.appendChild(document.createElement("hr"));
            var sid = document.createElement("input");
            div.appendChild(sid);
            sid.style.width = "500px";
            sid.style.position = "absoulte";
            sid.value = "0xf389ee8159f109c9579bb950fa0a4da5b1b26b70";
            div.appendChild(document.createElement("hr"));
            var infoParam = document.createElement("textarea");
            div.appendChild(infoParam);
            infoParam.style.width = "500px";
            infoParam.style.height = "100px";
            infoParam.textContent = "[\n\"(str)name\",\n[\n]\n]";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "makeAppCall";
            div.appendChild(document.createElement("hr"));
            var info1 = document.createElement("textarea");
            div.appendChild(info1);
            info1.style.width = "500px";
            info1.style.height = "100px";
            info1.textContent = "";
            div.appendChild(document.createElement("hr"));
            var info2 = document.createElement("textarea");
            div.appendChild(info2);
            info2.style.width = "500px";
            info2.style.height = "100px";
            div.appendChild(document.createElement("hr"));
            btn.onclick = () => {
                try {
                    var ps = JSON.parse(infoParam.value);
                    var sb = new ThinNeo.ScriptBuilder();
                    for (var i = ps.length - 1; i >= 0; i--) {
                        sb.EmitParamJson(ps[i]);
                    }
                    var shash = sid.value.hexToBytes();
                    sb.EmitAppCall(shash);
                    var data = sb.ToArray();
                    info1.textContent = data.toHexString();
                    info2.textContent = "";
                    var ops = ThinNeo.Compiler.Avm2Asm.Trans(data);
                    for (var i = 0; i < ops.length; i++) {
                        var op = ops[i];
                        info2.textContent += op.toString() + "\r\n";
                    }
                }
                catch (e) {
                }
            };
        }
    }
    NeoTest.Test_ScriptBuilder = Test_ScriptBuilder;
})(NeoTest || (NeoTest = {}));
//# sourceMappingURL=app.js.map