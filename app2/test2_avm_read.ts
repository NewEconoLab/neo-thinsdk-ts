///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest2 {
    export class Test2_AVM_Read implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "read .avm";
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
            var result = await fetch("res/nns_domaincenter.avm.bin", { "method": "get" });
            var hex = new Uint8Array(await result.arrayBuffer());
            this.addtxt("get .avm.");
            try {
                var oplist = ThinNeo.Compiler.Avm2Asm.Trans(hex);

                this.addtxt("convert to oplist .");

            }
            catch (e) {
                this.addtxt("decode error." + e);
                return;
            }



            if (oplist != null) {
                let content = document.createElement("div");
                content.style.maxHeight = "500px";
                content.style.height = "500px";
                content.style.overflow = "auto";
                let ul = document.createElement("ul");
                content.appendChild(ul);
                this.div.appendChild(content);

                for (var i = 0; i < oplist.length; i++) {
                    this.addtxt2(ul,"--->" + oplist[i].toString());
                }
            }
        }

    }
}