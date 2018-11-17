///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest2 {
    export class Test1_Lzma implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "LZMA";
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
        }
    }
}