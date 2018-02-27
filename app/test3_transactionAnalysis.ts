///<reference path="../lib/neo-ts.d.ts"/>

module NeoTest {
    export class Test_TransactionAnalysis implements ITestItem {
        constructor() {
            console.log("hello world");
        }
        getName(): string {
            return "TransactionAnalysis";
        }
        start(div: HTMLDivElement): void {

            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "type a Transaction Hex String below";

            div.appendChild(document.createElement("hr"));//newline

            var input = document.createElement("textarea");
            div.appendChild(input);
            input.style.width = "500px";
            input.style.position = "absoulte";
            input.style.height = "200px"
            input.value = "d100f54030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030423032393938343036306165336165616235646364373261396330353930636535326535646132353537366161303761343761643062373861653939623564303438650a71696e676d696e677a69047465737454c10872656769737465724030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030678432d43c27d1c06eb56b9ce505910b03e4b391c10001db60f31309ff659278fa717d8259cf8f164dd2dc89a5233ca394d21965b2c9cd000001e72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c6032775ea40000000009cc8527f1a6fb18ee021595842fadd42ab74d93";

            //div.appendChild(document.createElement("hr"));//newline

            //var spanDecode = document.createElement("span");
            //div.appendChild(spanDecode);
            //spanDecode.textContent = "decodebase58:";

            //div.appendChild(document.createElement("hr"));//newline

            //var spanCheck = document.createElement("span");
            //div.appendChild(spanCheck);
            //spanCheck.textContent = "check:";

            //div.appendChild(document.createElement("hr"));//newline

            //var spanNewAddr = document.createElement("span");
            //div.appendChild(spanNewAddr);
            //spanNewAddr.textContent = "newaddr:";

            div.appendChild(document.createElement("hr"));//newline

            function byteToString(arr) {
                if (typeof arr === 'string') {
                    return arr;
                }
                var str = '',
                    _arr = arr;
                for (var i = 0; i < _arr.length; i++) {
                    var one = _arr[i].toString(2),
                        v = one.match(/^1+?(?=0)/);
                    if (v && one.length == 8) {
                        var bytesLength = v[0].length;
                        var store = _arr[i].toString(2).slice(7 - bytesLength);
                        for (var st = 1; st < bytesLength; st++) {
                            store += _arr[st + i].toString(2).slice(2);
                        }
                        str += String.fromCharCode(parseInt(store, 2));
                        i += bytesLength - 1;
                    } else {
                        str += String.fromCharCode(_arr[i]);
                    }
                }
                return str;
            } 

            var btn = document.createElement("button");
            div.appendChild(btn);
            btn.textContent = "analysis";
            btn.onclick = () => {
                div.appendChild(document.createElement("hr"));//newline

                //类型
                var span = document.createElement("span");
                div.appendChild(span);
                span.textContent = "Transaction Type";
                span.style.color = "#000000";
                div.appendChild(document.createElement("br"));//换行
                var span = document.createElement("span");
                div.appendChild(span);
                var txTypeId = input.value.substring(0, 2);
                switch (txTypeId) {
                    case "80":
                        span.textContent = "ContractTransaction";
                        break;
                    case "d1":
                        span.textContent = "InvocationTransaction";
                        break;
                    default:
                        span.textContent = "unknow";
                }
                //span.textContent = input.value.substring(0, 2);
                span.style.color = "#FF0000";
                div.appendChild(document.createElement("br"));//换行

                //版本
                var span = document.createElement("span");
                div.appendChild(span);
                span.textContent = "Transaction Version";
                span.style.color = "#000000";
                div.appendChild(document.createElement("br"));//换行
                var span = document.createElement("span");
                div.appendChild(span);
                span.textContent = input.value.substring(2, 4);
                span.style.color = "#00FF00";

                //对象化交易体
                var tx = new ThinNeo.Transaction();
                var buf = input.value.hexToBytes();
                tx.Deserialize(new Neo.IO.BinaryReader(new Neo.IO.MemoryStream(buf.buffer, 0, buf.byteLength)));

                div.appendChild(document.createElement("hr"));//newline

                var i = 0;
                //输入
                tx.inputs.forEach(function (input) {
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = "input" + i;
                    span.style.color = "#000000";
                    div.appendChild(document.createElement("br"));//换行

                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = input.hash.reverse().toHexString();
                    span.style.color = "#FF0000";
                    div.appendChild(document.createElement("br"));//换行

                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = input.index.toString();
                    span.style.color = "#00FF00";
                    div.appendChild(document.createElement("br"));//换行

                    i++;
                });

                div.appendChild(document.createElement("hr"));//newline

                i = 0;
                //输出
                tx.outputs.forEach(function (output) {
                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = "output" + i;
                    span.style.color = "#000000";
                    div.appendChild(document.createElement("br"));//换行

                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = ThinNeo.Helper.GetAddressFromScriptHash(output.toAddress);//.toHexString();
                    span.style.color = "#FF0000";
                    div.appendChild(document.createElement("br"));//换行

                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = output.assetId.reverse().toHexString();
                    span.style.color = "#00FF00";
                    div.appendChild(document.createElement("br"));//换行

                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = output.value.toString();
                    span.style.color = "#0000FF";
                    div.appendChild(document.createElement("br"));//换行

                    i++;
                });

                div.appendChild(document.createElement("hr"));//newline

                //合约脚本
                if (txTypeId == "d1")//如果是合约调用交易
                {
                    var itd = tx.extdata as ThinNeo.InvokeTransData;

                    var span = document.createElement("span");
                    div.appendChild(span);
                    span.textContent = "script decompile";
                    span.style.color = "#000000";
                    div.appendChild(document.createElement("br"));//换行

                    //var span = document.createElement("span");
                    //div.appendChild(span);
                    //span.textContent = itd.script.toHexString();
                    //span.style.color = "#FF0000";
                    //div.appendChild(document.createElement("br"));//换行

                    //反编译
                    var info2 = document.createElement("textarea");
                    div.appendChild(info2);
                    info2.style.width = "500px";
                    info2.style.height = "300px";
                    try {
                        info2.textContent = "";
                        var data = itd.script;
                        var ops = ThinNeo.Compiler.Avm2Asm.Trans(data);
                        for (var i = 0; i < ops.length; i++) {

                            var op = ops[i];
                            info2.textContent += op.toString() + "\r\n";

                            try {

                                if (op.toString().substring(3, 10) == "APPCALL") {
                                    info2.textContent += "【" + op.toString().substring(13, 53).hexToBytes().reverse().toHexString() + "】" + "\r\n";
                                    //alert(op.toString().substring(13, 53));
                                }

                                info2.textContent += "【" + byteToString(op.AsHexString().hexToBytes()) + "】" + "\r\n";
                            }
                            catch{ }            
                        }
                    }
                    catch (e) {
                    }

                    if (itd.gas != null) {
                        var span = document.createElement("span");
                        div.appendChild(span);
                        span.textContent = itd.gas.toString();
                        span.style.color = "#00FF00";
                        div.appendChild(document.createElement("br"));//换行
                    }
                }

                //var array: Uint8Array = Neo.Cryptography.Base58.decode(input.value);
                //var hexstr = array.toHexString();
                //var salt = array.subarray(0, 1);
                //var hash = array.subarray(1, 1 + 20);
                //var check = array.subarray(21, 21 + 4);
                //spanDecode.textContent = "salt:" + salt.toHexString();
                //spanDecode.textContent += " hash:" + hash.clone().reverse().toHexString();
                //spanDecode.textContent += " check:" + check.toHexString();

                //var checkdata = array.subarray(0, 21);
                //var hashd = Neo.Cryptography.Sha256.computeHash(checkdata);
                //hashd = Neo.Cryptography.Sha256.computeHash(hashd);
                //var hashd = hashd.slice(0, 4);
                //var checked = new Uint8Array(hashd);
                //spanCheck.textContent = "checked:" + checked.toHexString();

                //var error = false;
                for (var i = 0; i < 4; i++) {
                //    if (checked[i] != check[i]) {
                //        spanCheck.textContent += "[Error Addr]";
                //        error = true;
                //        break;
                    }
                //}
                //if (error) {
                //    var newarray = new Uint8Array(25);
                //    for (var i = 0; i < 25; i++) {
                //        if (i < 21) {
                //            newarray[i] = array[i];
                //        }
                //        else {
                //            newarray[i] = checked[i - 21];
                //        }
                //    }
                //    var newaddr = Neo.Cryptography.Base58.encode(newarray);
                //    spanNewAddr.textContent = "error addr:" + newaddr;
                //}
                //else {
                //    spanNewAddr.textContent = "right addr";

                //}
            }
        }
    }
}