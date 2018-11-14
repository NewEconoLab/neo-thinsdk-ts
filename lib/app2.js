var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var NeoTest2;
(function (NeoTest2) {
    class Menu {
        constructor() {
            console.log("hello world");
        }
        start() {
            this.createMenu();
            this.addText("NEO-ThinSDK(typescript) test2 debugpage");
            this.addLink("Github", "https://github.com/NewEconoLab/neo-thinsdk-ts");
            this.addLink("TestPage1", "index.html");
            this.addText("==llvmhex.txt 解析相关==");
            this.addMenuItem(new NeoTest2.Test1_Lzma());
            this.addMenuItem(new NeoTest2.Test1_Fullog_Read());
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
})(NeoTest2 || (NeoTest2 = {}));
var NeoTest2;
(function (NeoTest2) {
    class Test1_Fullog_Read {
        constructor() {
        }
        getName() {
            return "read fulllog";
        }
        addtxt(str) {
            var span = document.createElement("span");
            this.div.appendChild(span);
            span.textContent = str;
            this.div.appendChild(document.createElement("hr"));
        }
        start(div) {
            this.div = div;
            this.addtxt("this is a lzma test.");
            this.testasync();
        }
        testasync() {
            return __awaiter(this, void 0, void 0, function* () {
                let lzma = new nid.LZMA();
                this.addtxt("new LZMA");
                var result = yield fetch("res/0x0000ec4f810fc65b81187ecbbd1e8a6bef6bbb645bd745f903de58ae2d895346.llvmhex.txt", { "method": "get" });
                var hexstr = yield result.text();
                var srcbytes = hexstr.hexToBytes();
                this.addtxt("get llvmhex.");
                var unpackjsonstr = "";
                var unpackjson = null;
                try {
                    var destbytes = lzma.decode(srcbytes);
                    this.addtxt("decode got: srcsize=" + srcbytes.length + " destsize=" + destbytes.length);
                    unpackjsonstr = ThinNeo.Helper.Bytes2String(destbytes);
                    console.log("jsonstr =" + unpackjsonstr);
                    unpackjson = JSON.parse(unpackjsonstr);
                    this.addtxt("convert to json . log to console");
                }
                catch (e) {
                    this.addtxt("decode error." + e);
                    return;
                }
                if (unpackjson != null) {
                    let fulllog = ThinNeo.SmartContract.Debug.FullLog.FromJson(unpackjson);
                    this.addtxt("read fulllog struct.");
                    this.addtxt("run state:" + fulllog.states);
                    for (var i = 0; i < fulllog.states.length; i++) {
                        this.addtxt("--->" + ThinNeo.SmartContract.Debug.VMState[fulllog.states[i]]);
                    }
                    this.dumpScript(fulllog.script, 1);
                }
            });
        }
        dumpScript(script, level) {
            var space = "";
            for (var i = 0; i < level; i++)
                space += "____";
            this.addtxt(space + "hash=" + script.hash);
            for (var i = 0; i < script.ops.length; i++) {
                this.addtxt(space + "op=" + script.ops[i].GetHeader());
                if (script.ops[i].subScript != null)
                    this.dumpScript(script.ops[i].subScript, level + 1);
            }
        }
    }
    NeoTest2.Test1_Fullog_Read = Test1_Fullog_Read;
})(NeoTest2 || (NeoTest2 = {}));
var NeoTest2;
(function (NeoTest2) {
    class Test1_Lzma {
        constructor() {
        }
        getName() {
            return "LZMA";
        }
        addtxt(str) {
            var span = document.createElement("span");
            this.div.appendChild(span);
            span.textContent = str;
            this.div.appendChild(document.createElement("hr"));
        }
        start(div) {
            this.div = div;
            this.addtxt("this is a lzma test.");
            this.testasync();
        }
        testasync() {
            return __awaiter(this, void 0, void 0, function* () {
                let lzma = new nid.LZMA();
                this.addtxt("new LZMA");
                var result = yield fetch("res/0x0000ec4f810fc65b81187ecbbd1e8a6bef6bbb645bd745f903de58ae2d895346.llvmhex.txt", { "method": "get" });
                var hexstr = yield result.text();
                var srcbytes = hexstr.hexToBytes();
                this.addtxt("get llvmhex.");
                var unpackjsonstr = "";
                var unpackjson = null;
                try {
                    var destbytes = lzma.decode(srcbytes);
                    this.addtxt("decode got: srcsize=" + srcbytes.length + " destsize=" + destbytes.length);
                    unpackjsonstr = ThinNeo.Helper.Bytes2String(destbytes);
                    console.log("jsonstr =" + unpackjsonstr);
                    unpackjson = JSON.parse(unpackjsonstr);
                    this.addtxt("convert to json . log to console");
                }
                catch (e) {
                    this.addtxt("decode error." + e);
                    return;
                }
            });
        }
    }
    NeoTest2.Test1_Lzma = Test1_Lzma;
})(NeoTest2 || (NeoTest2 = {}));
//# sourceMappingURL=app2.js.map