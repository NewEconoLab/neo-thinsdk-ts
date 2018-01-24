///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_ScriptBuilder implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "ScriptBuilder";
        }
        start(div: HTMLDivElement): void {
            //title
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a scripthash below";
            div.appendChild(document.createElement("hr"));//newline

            //script_hash
            var sid = document.createElement("input");
            div.appendChild(sid);
            sid.style.width = "500px";
            sid.style.position = "absoulte";
            sid.value = "0xf389ee8159f109c9579bb950fa0a4da5b1b26b70";
            div.appendChild(document.createElement("hr"));//newline

            //paramjson
            var infoParam = document.createElement("textarea");
            div.appendChild(infoParam);
            infoParam.style.width = "500px";
            infoParam.style.height = "100px";
            infoParam.textContent = "[\n\"(str)name\",\n[\n]\n]";
            div.appendChild(document.createElement("hr"));//newline

            //button
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "makeAppCall";


            div.appendChild(document.createElement("hr"));//newline

            //info1
            var info1 = document.createElement("textarea");
            div.appendChild(info1);
            info1.style.width = "500px";
            info1.style.height = "100px";
            info1.textContent = "";
            div.appendChild(document.createElement("hr"));//newline

            //info2
            var info2 = document.createElement("textarea");
            div.appendChild(info2);
            info2.style.width = "500px";
            info2.style.height = "100px";
            div.appendChild(document.createElement("hr"));//newline



            btn.onclick = () => {
                try {
                    var ps = JSON.parse(infoParam.value) as any[];
                    var sb = new ThinNeo.ScriptBuilder();
                    for (var i = ps.length - 1; i >= 0; i--) {
                        sb.EmitParamJson(ps[i]);
                    }
                    var shash = sid.value.hexToBytes();
                    sb.EmitAppCall(shash);

                    var data = sb.ToArray();
                    info1.textContent = data.toHexString();

                    info2.textContent = "";
                    var ops = ThinNeo.Compiler.Avm2Asm.Trans(data);
                    for (var i = 0; i < ops.length; i++) {

                        var op = ops[i];
                        info2.textContent += op.toString() + "\r\n";
                    }
                }
                catch (e) {
                }

            }
        }
    }
}