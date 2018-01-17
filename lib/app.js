var NeoTest;
(function (NeoTest) {
    class Menu {
        constructor() {
            console.log("hello world");
        }
        start() {
            this.createMenu();
            this.addMenuItem(new NeoTest.Test_CheckAddress());
            this.addMenuItem(new NeoTest.Test_WifDecode());
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
            input.value = "";
            div.appendChild(document.createElement("hr"));
            var spanDecode = document.createElement("span");
            div.appendChild(spanDecode);
            spanDecode.textContent = "decodebase58:";
            div.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "check";
            btn.onclick = () => {
                var array = Neo.Cryptography.Base58.decode(input.value);
                var hexstr = array.toHexString();
                spanDecode.textContent = hexstr;
            };
        }
    }
    NeoTest.Test_WifDecode = Test_WifDecode;
})(NeoTest || (NeoTest = {}));
//# sourceMappingURL=app.js.map