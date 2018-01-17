var Neo;
(function (Neo) {
    var Main = (function () {
        function Main() {
            console.log("hello world");
        }
        Main.prototype.start = function () {
            var span = document.createElement("span");
            document.body.appendChild(span);
            span.textContent = "type a Neo address below";
            document.body.appendChild(document.createElement("hr"));
            var input = document.createElement("input");
            document.body.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.value = "ALjSnMZidJqd18iQaoCgFun6iqWRm2cVtj";
            document.body.appendChild(document.createElement("hr"));
            var spanDecode = document.createElement("span");
            document.body.appendChild(spanDecode);
            spanDecode.textContent = "decodebase58:";
            document.body.appendChild(document.createElement("hr"));
            var spanCheck = document.createElement("span");
            document.body.appendChild(spanCheck);
            spanCheck.textContent = "check:";
            document.body.appendChild(document.createElement("hr"));
            var spanNewAddr = document.createElement("span");
            document.body.appendChild(spanNewAddr);
            spanNewAddr.textContent = "newaddr:";
            document.body.appendChild(document.createElement("hr"));
            var btn = document.createElement("button");
            document.body.appendChild(btn);
            btn.textContent = "check";
            btn.onclick = function () {
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
                for (var i = 0; i < 4; i++) {
                    if (checked[i] != check[i]) {
                        spanCheck.textContent += "[Error Addr]";
                        break;
                    }
                }
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
                spanNewAddr.textContent = newaddr;
            };
        };
        return Main;
    }());
    Neo.Main = Main;
    window.onload = function () {
        var main = new Main();
        main.start();
    };
})(Neo || (Neo = {}));
//# sourceMappingURL=app.js.map