///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest2 {
    export class Test1_Fullog_SimVM implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "run dumpinfo";
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
        //需要使用simVM来模拟执行一下，得到详细的情报
        simVM: ThinNeo.Debug.SimVM;//
        divInfo: HTMLDivElement;
        addtxtSub(str: string) {
            var span = document.createElement("span");
            this.divInfo.appendChild(span);
            span.textContent = str;
            this.divInfo.appendChild(document.createElement("hr"));//newline
        }
        async testasync(): Promise<void> {
            let lzma: nid.LZMA = new nid.LZMA();
            this.addtxt("new LZMA");

            //var result = await fetch("res/0x0000ec4f810fc65b81187ecbbd1e8a6bef6bbb645bd745f903de58ae2d895346.llvmhex.txt", { "method": "get" });
            var result = await fetch("res/0x8988078975ea1d55603791b1548d6531a7010fb605611dec9a0c8711d85723cf.llvmhex.txt", { "method": "get" });
            var hexstr = await result.text();
            var srcbytes = hexstr.hexToBytes();
            this.addtxt("get llvmhex.");

            //initDivInfo
            this.divInfo = document.createElement("div");
            this.div.appendChild(this.divInfo);

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

                //read dumpinfo
                let dumpinfo = ThinNeo.SmartContract.Debug.DumpInfo.FromJson(unpackjson);

                this.simVM = new ThinNeo.Debug.SimVM();
                this.simVM.Execute(dumpinfo);

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

                //dump simVM重新整理过的脚本，这个执行顺序才是正确的
                this.dumpScript(this.simVM.regenScript, ul);
            }
        }
        opcode2str(opcode: ThinNeo.OpCode): string {
            var str = ThinNeo.OpCode[opcode];
            if (str != undefined)
                return str;
            else return "??=" + opcode;
        }
        showOP(script: ThinNeo.SmartContract.Debug.LogScript, op: ThinNeo.SmartContract.Debug.LogOp): void {
            this.divInfo.innerText = "";
            this.addtxtSub("this op is:" + op.guid + ":" + op.GetHeader());
            this.addtxtSub("show " + script.hash + ".avm" + " addr:" + op.addr +". use this to map2 srccode.");
            let stateid = this.simVM.mapState[op.guid];
            let state = this.simVM.stateClone[stateid];
            if (state != undefined) {
                this.addtxtSub("show stack(" + +state.StateID + "):CalcStack=" + state.CalcStack.Count + " ,AltStack=" + state.AltStack.Count
                +". use this to show stack detail.");
            }
        }
        dumpScript(script: ThinNeo.SmartContract.Debug.LogScript, level: HTMLUListElement) {
            //var div = document.createElement("div");
            //div.style.height = "auto";
            //level.appendChild(div);
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
                let link = document.createElement("a");
                let _op = script.ops[i];
                let _guid = _op.guid;
                link.text = "pick this op(" + _guid + ")";
                level.appendChild(link);
                link.href = "#";
                link.onclick = () => {
                    this.showOP(script, _op);
                }
            }
        }
    }
}