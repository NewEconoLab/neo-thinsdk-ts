///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest2 {
    export class Test1_Fullog_Read implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "read dumpinfo";
        }
        div: HTMLDivElement;
        addtxt(str: string) {
            var span = document.createElement("span");
            this.div.appendChild(span);
            span.textContent = str;
            this.div.appendChild(document.createElement("hr"));//newline
        }
        start(div: HTMLDivElement): void {
            this.div = div;

            this.addtxt("this is a lzma test.");

            this.testasync();


        }
        async testasync(): Promise<void> {
            let lzma: nid.LZMA = new nid.LZMA();
            nid.utils.MEMORY.reset();//add a function for clear lzma Memory.

            this.addtxt("new LZMA");

            var result = await fetch("res/0x0000ec4f810fc65b81187ecbbd1e8a6bef6bbb645bd745f903de58ae2d895346.llvmhex.txt", { "method": "get" });
            var hexstr = await result.text();
            var srcbytes = hexstr.hexToBytes();
            this.addtxt("get llvmhex.");

            var unpackjsonstr: string = "";
            var unpackjson: {} = null;
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
                let dumpinfo = ThinNeo.SmartContract.Debug.DumpInfo.FromJson(unpackjson);
                this.addtxt("read fulllog struct.");
                this.addtxt("run state:" + dumpinfo.states);
                for (var i = 0; i < dumpinfo.states.length; i++) {
                    this.addtxt("--->" + ThinNeo.SmartContract.Debug.VMState[dumpinfo.states[i]]);
                }
                let content = document.createElement("div");
                content.style.maxHeight = "500px";
                content.style.height = "500px";
                content.style.overflow = "auto";
                let ul = document.createElement("ul");
                content.appendChild(ul);
                this.div.appendChild(content);
                this.dumpScript(dumpinfo.script, ul);
            }
        }
        dumpScript(script: ThinNeo.SmartContract.Debug.LogScript, level: HTMLUListElement) {
            let hash = document.createElement("li");
            hash.textContent = "hash : " + script.hash;
            level.appendChild(hash);
            for (var i = 0; i < script.ops.length; i++) {
                let op = document.createElement("li");
                op.textContent = "op : " + script.ops[i].GetHeader();
                level.appendChild(op);
                if (script.ops[i].subScript != null) {
                    let ops = document.createElement("ul");
                    level.appendChild(ops);
                    this.dumpScript(script.ops[i].subScript, ops);
                }
            }
        }
    }
}