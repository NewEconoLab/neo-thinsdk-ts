///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_GetNep5Info implements ITestItem {
        constructor() {
        }
        getName(): string {
            return "GetNep5Info";
        }
        //http://47.96.168.8:20332/?jsonrpc=2.0&id=1&method=invokescript&params=[%2200c1046e616d6567056bd94ecab6fe9607014624ef66bbc991dbcc3f%22]

        makeRpcUrl(url: string, method: string, ..._params: any[]) {


            if (url[url.length - 1] != '/')
                url = url + "/";
            var urlout = url + "?jsonrpc=2.0&id=1&method=" + method + "&params=[";
            for (var i = 0; i < _params.length; i++) {
                urlout += JSON.stringify(_params[i]);
                if (i != _params.length - 1)
                    urlout += ",";
            }
            urlout += "]";
            return urlout;
        }
        makeRpcPostBody(method: string, ..._params: any[]): {} {
            var body = {};
            body["jsonrpc"] = "2.0";
            body["id"] = 1;
            body["method"] = method;
            var params = [];
            for (var i = 0; i < _params.length; i++) {
                params.push(_params[i]);
            }
            body["params"] = params;
            return body;
        }
        nep5decimals: number = 0;
        start(div: HTMLDivElement): void {
            //title
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a NEP5 scripthash below";
            div.appendChild(document.createElement("hr"));//newline

            //script_hash
            var sid = document.createElement("input");
            div.appendChild(sid);
            sid.style.width = "500px";
            sid.style.position = "absoulte";
            sid.value = "0x3fccdb91c9bb66ef2446010796feb6ca4ed96b05";
            div.appendChild(document.createElement("hr"));//newline

            //button
            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "get Info";

            var btn2 = document.createElement("button");
            div.appendChild(btn2);
            btn2.textContent = "get balance";

            var addr = document.createElement("input");
            div.appendChild(addr);
            addr.value = "ALjSnMZidJqd18iQaoCgFun6iqWRm2cVtj";

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



            btn.onclick = async () => {
                try {
                    //拼接三次调用
                    var sb = new ThinNeo.ScriptBuilder();

                    sb.EmitParamJson(JSON.parse("[]"));//参数倒序入
                    sb.EmitParamJson("(str)name");//参数倒序入
                    var shash = sid.value.hexToBytes();
                    sb.EmitAppCall(shash.reverse());//nep5脚本

                    sb.EmitParamJson(JSON.parse("[]"));
                    sb.EmitParamJson("(str)symbol");
                    var shash = sid.value.hexToBytes();
                    sb.EmitAppCall(shash.reverse());

                    sb.EmitParamJson(JSON.parse("[]"));
                    sb.EmitParamJson("(str)decimals");
                    var shash = sid.value.hexToBytes();
                    sb.EmitAppCall(shash.reverse());

                    var data = sb.ToArray();
                    info1.textContent = data.toHexString();
                    var body = this.makeRpcPostBody("invokescript", data.toHexString());
                    var url = "http://47.96.168.8:20332";
                    var response = await fetch(url, { "method": "post", "body": JSON.stringify(body) });
                    var r = await response.json();

                    info1.textContent = JSON.stringify(r);
                    try {
                        var state = r.result.state as string;
                        info2.textContent = "";
                        if (state.includes("HALT")) {
                            info2.textContent += "Succ\n";
                        }
                        var stack = r.result.stack as any[];
                        //find name 他的type 有可能是string 或者ByteArray
                        if (stack[0].type == "String")
                            info2.textContent += "name=" + stack[0].value + "\n";
                        else if (stack[0].type == "ByteArray") {
                            var bs = (stack[0].value as string).hexToBytes();
                            var str = ThinNeo.Helper.Bytes2String(bs);
                            info2.textContent += "name=" + str + "\n";
                        }
                        //find symbol 他的type 有可能是string 或者ByteArray
                        if (stack[1].type == "String")
                            info2.textContent += "symbol=" + stack[1].value + "\n";
                        else if (stack[1].type == "ByteArray") {
                            var bs = (stack[1].value as string).hexToBytes();
                            var str = ThinNeo.Helper.Bytes2String(bs);
                            info2.textContent += "symbol=" + str + "\n";
                        }

                        //find decimals 他的type 有可能是 Integer 或者ByteArray
                        if (stack[2].type == "Integer") {
                            this.nep5decimals = (new Neo.BigInteger(stack[2].value as string)).toInt32();
                        }
                        else if (stack[2].type == "ByteArray") {
                            var bs = ( stack[2].value as string ).hexToBytes();
                            var num = Neo.BigInteger.fromUint8ArrayAutoSign( bs );
                            this.nep5decimals = num.toInt32();
                        }
                        info2.textContent += "decimals=" + this.nep5decimals + "\n";

                    }
                    catch (e) {

                    }

                }
                catch (e) {
                }

            }

            btn2.onclick = async () => {
                var sb = new ThinNeo.ScriptBuilder();
                sb.EmitParamJson(["(addr)" + addr.value]);//参数倒序入
                sb.EmitParamJson("(str)balanceOf");//参数倒序入 //name//totalSupply//symbol//decimals
                var shash = sid.value.hexToBytes();
                sb.EmitAppCall(shash.reverse());//nep5脚本

                var data = sb.ToArray();
                info1.textContent = data.toHexString();

                var body = this.makeRpcPostBody("invokescript", data.toHexString());
                var url = "http://47.96.168.8:20332";
                var response = await fetch(url, { "method": "post", "body": JSON.stringify(body) });
                var r = await response.json();

                info1.textContent = JSON.stringify(r);
                try {
                    var state = r.result.state as string;
                    info2.textContent = "";
                    if (state.includes("HALT")) {
                        info2.textContent += "Succ\n";
                    }
                    var stack = r.result.stack as any[];

                    var bnum = new Neo.BigInteger(0);
                    //find decimals 他的type 有可能是 Integer 或者ByteArray
                    if (stack[0].type == "Integer") {

                        bnum = new Neo.BigInteger(stack[0].value);
                    }
                    else if ( stack[0].type == "ByteArray" )
                    {
                        var bs = ( stack[0].value as string ).hexToBytes();
                        bnum = Neo.BigInteger.fromUint8ArrayAutoSign( bs );
                    }
                    var v = 1;
                    for (var i = 0; i < this.nep5decimals; i++) {
                        v *= 10;
                    }
                    var intv = bnum.divide(v).toInt32();
                    var smallv = bnum.mod(v).toInt32() / v;
                    info2.textContent += "count=" + (intv + smallv);

                }
                catch (e) {

                }
            }
        }
    }
}
