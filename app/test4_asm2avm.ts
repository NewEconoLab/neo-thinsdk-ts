///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_ASM2AVM implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "ASM2AVM";
        }
        start(div: HTMLDivElement): void {
            //title
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a avm hexstr below";
            div.appendChild(document.createElement("hr"));//newline



            //info1
            var info1 = document.createElement("textarea");
            div.appendChild(info1);
            info1.style.width = "500px";
            info1.style.height = "100px";
            info1.textContent = "05006c18fb521459b637ee6d5355fd10eadd201d62840662ba2bb214520fe97e396671682f7a5f672ea0f4e719a61f5353c1087472616e7366657267f91d6b7085db7c5aaf09f19eeec1ca3c0db2c6ecf166f12c436084195f79";
            div.appendChild(document.createElement("hr"));//newline

            //button
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "->asm code";
            div.appendChild(document.createElement("hr"));//newline

            //info2
            var info2 = document.createElement("textarea");
            div.appendChild(info2);
            info2.style.width = "500px";
            info2.style.height = "100px";
            div.appendChild(document.createElement("hr"));//newline



            btn.onclick = () => {
                try {
                    info2.textContent = "";
                    var data = info1.value.hexToBytes();
                    var ops = ThinNeo.Compiler.Avm2Asm.Trans(data);
                    for (var i = 0; i < ops.length; i++) {

                        var op = ops[i];
                        info2.textContent += op.toString()+"\r\n";
                    }
                }
                catch (e) {
                }

            }
        }
    }
}