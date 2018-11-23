///<reference path="../lib/neo-ts.d.ts"/>
///<reference path="../lib/codemirror/index.d.ts"/>

module NeoTest2 {
    export class Test3_Codemirror_CursorControl implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "codemirror";
        }
        stackarr:
            {
            script: ThinNeo.SmartContract.Debug.LogScript, op: ThinNeo.SmartContract.Debug.LogOp
        }[] = [];
        dumpString: string;
        addr: ThinNeo.Debug.Helper.AddrMap;
        oplist: ThinNeo.Compiler.Op[];
        div: HTMLDivElement;
        host: HTMLTextAreaElement;
        option: CodeMirror.EditorConfiguration;
        codeEditor: CodeMirror.EditorFromTextArea;
        fulllogEditor: CodeMirror.EditorFromTextArea;
        
        addtxt(str: string) {
            console.log(str);
            //var span = document.createElement("span");
            //this.div.appendChild(span);
            //span.textContent = str;
            //this.div.appendChild(document.createElement("hr"));//newline
        }
        start(div: HTMLDivElement): void {
            //this.addtxt("this is a testcodemirror test.");
            this.div = div;
            this.div.style.display = "flex";
            let div1 = document.createElement("div");
            let div2 = document.createElement("div");
            div2.style.flex = "1";
            this.host = document.createElement("textarea");
            const host2 = document.createElement("textarea");
            div1.appendChild(host2);
            div2.appendChild(this.host);
            this.div.appendChild(div1);
            this.div.appendChild(div2);
            this.option = {};
            this.option.mode = "text/x-csharp"
            this.option.dragDrop = true;
            this.option.lineNumbers = true;
            this.option.extraKeys = { "Ctrl": "autocomplete" };
            //this.option.theme = "monokai";
            this.option.readOnly = true;
            this.codeEditor = CodeMirror.fromTextArea(this.host, this.option);
            this.fulllogEditor = CodeMirror.fromTextArea(host2, this.option);
            this.codeEditor.setSize(800, 600)
            this.fulllogEditor.setSize("auto", 600);
            this.testasync();

            this.fulllogEditor.on("cursorActivity", (res) => {
                let codeline = this.fulllogEditor.getCursor().line
                if (this.stackarr[codeline]) {
                    let script = this.stackarr[codeline].script;
                    let op = this.stackarr[codeline].op;

                    this.initCode(script.hash);
                    let index = this.oplist[codeline];
                    var line = this.addr.GetLineBack(index.addr);//尽量倒着取到对应的代码
                    this.codeEditor.setCursor(line);
                    this.codeEditor.addLineClass(line, "background", "cursor-line-highight");
                }

            })

        }
        addtxt2(str: string) {
            if (this.dumpString) {
                this.dumpString += "\n"+str;
            } else {
                this.dumpString += str;
            }
        }
        async initCode(hash: string): Promise<void> {
            var filename = "res/" + hash;
            var result = await fetch(filename + ".avm.bin", { "method": "get" });
            var hex = new Uint8Array(await result.arrayBuffer());
            this.oplist = ThinNeo.Compiler.Avm2Asm.Trans(hex);
            var result2 = await fetch(filename + ".map.json", { "method": "get" });
            var mapstr = await result2.text();
            this.addr = ThinNeo.Debug.Helper.AddrMap.FromJson(JSON.parse(mapstr));
            var result3 = await fetch(filename + ".cs.txt", { "method": "get" });
            this.codeEditor.setValue(await result3.text());
        }


        async testasync(): Promise<void> {
            let lzma: nid.LZMA = new nid.LZMA();
            this.addtxt("new LZMA");

            var result = await fetch("res/0xf8f8abba3c1c40429640868368cff6f160910ddefec44ea4a372dd3cc0710394.llvmhex.txt", { "method": "get" });
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
                let fulllog = ThinNeo.SmartContract.Debug.DumpInfo.FromJson(unpackjson);
                this.addtxt("read fulllog struct.");
                this.addtxt("run state:" + fulllog.states);
                for (var i = 0; i < fulllog.states.length; i++) {
                    this.addtxt("--->" + ThinNeo.SmartContract.Debug.VMState[fulllog.states[i]]);
                }
                this.dumpString = "";
                this.dumpScript(fulllog.script, 1);
            }
        }
        dumpScript(script: ThinNeo.SmartContract.Debug.LogScript, level: number) {
            var space = "";
            for (var i = 0; i < level; i++)
                space += "\t";
            if (level > 1)
                this.addtxt2(space + "hash : " + script.hash);
            else
                this.addtxt2("hash : " + script.hash);
            this.stackarr.push(undefined);
            for (var i = 0; i < script.ops.length; i++) {
                this.addtxt2(space + "op : " + script.ops[i].GetHeader());
                this.stackarr.push({ script: script, op: script.ops[i] });
                if (script.ops[i].subScript != null)
                    this.dumpScript(script.ops[i].subScript, level + 1);
            }
            if (level === 1) {
                this.fulllogEditor.setValue(this.dumpString);
            }
        }

    }

    class AvmInfo {
        map: string;
    }
}