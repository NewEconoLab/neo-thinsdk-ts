///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest2 {
    export class Test2_Map_Read implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "read .map.json";
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
        addtxt2(e: HTMLElement, str: string) {
            var span = document.createElement("span");
            e.appendChild(span);
            span.textContent = str;
            e.appendChild(document.createElement("hr"));//newline
        }
        async testasync(): Promise<void> {
            //var filename = "res/0x50c995bf4754a29bd27a6fc1054134bed2246b5a";
            var filename = "res/0x53b923743cf2d56486eb07e1ab0fbe56c115f1d9";
            var result = await fetch(filename + ".avm.bin", { "method": "get" });
            var hex = new Uint8Array(await result.arrayBuffer());
            this.addtxt("get .avm.");
            var result2 = await fetch(filename + ".map.json", { "method": "get" });
            var mapstr = await result2.text();
            this.addtxt("get .map.json.");

            var result3 = await fetch(filename + ".cs.txt", { "method": "get" });
            var lines = (await result3.text()).split('\n');
            this.addtxt("get .cs file.");

            try {
                var addr = ThinNeo.Debug.Helper.AddrMap.FromJson(JSON.parse(mapstr));
            }
            catch (e) {
                this.addtxt("decode .map.json error." + e);
                return;
            }
            try {
                var oplist = ThinNeo.Compiler.Avm2Asm.Trans(hex);

                this.addtxt("convert to oplist .");

            }
            catch (e) {
                this.addtxt("decode .avm error." + e);
                return;
            }
            let content = document.createElement("div");
            content.style.maxHeight = "500px";
            content.style.height = "500px";
            content.style.overflow = "auto";
            let ul = document.createElement("ul");
            content.appendChild(ul);
            this.div.appendChild(content);


            if (oplist != null) {

                for (var i = 0; i < oplist.length; i++) {
                    var op = oplist[i];
                    //var line = addr.GetLineDirect(op.addr); //只取有的
                    var line = addr.GetLineBack(op.addr);//尽量倒着取到对应的代码
                    console.log(op.addr);
                    var strout = "--->" + op.toString();

                    var code = lines[line-1];

                    if (line >= 0) {
                        console.log("-------------------------op.addr")
                        console.log(op.addr)
                        strout += " line=" + line;
                        if (code != undefined)
                            strout += "src=" + code
                    }
                    this.addtxt2(ul, strout);
                }
            }
        }

    }
}