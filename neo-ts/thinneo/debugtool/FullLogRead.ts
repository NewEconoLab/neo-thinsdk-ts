///<reference path="../../neo/BigInteger.ts"/>
module ThinNeo.SmartContract.Debug {

    export enum VMState {
        NONE = 0,

        HALT = 1 << 0,
        FAULT = 1 << 1,
        BREAK = 1 << 2,
    }
    enum OpType {
        Non,
        Clear,
        Insert,
        Peek,
        Pop,
        Push,
        Remove,
        Set,
    }
    ///op 是虛擬機最小的操作
    export class Op {
        constructor(type: OpType, ind: number = -1) {
            this.type = type;
            this.ind = ind;
        }
        public type: OpType;
        public ind: number;
        public Clone(): Op {
            var op = new Op(this.type, this.ind);
            return op;
        }
    }

    export class StackItem {
        public type: string;
        public strvalue: string;
        public subItems: Array<StackItem>;
        public Clone(): StackItem {
            if (this.type != "Struct")
                return this;
            let item = new StackItem();
            item.type = this.type;
            item.strvalue = this.strvalue;
            if (this.subItems != null) {
                item.subItems = [];
                for (var i = 0; i < this.subItems.length; i++) {
                    item.subItems.push(this.subItems[i].Clone());
                }
            }
            return item;
        }
        public AsInt(): number {
            return parseInt(this.strvalue);
        }
        public AsBigInteger(): Neo.BigInteger {
            return Neo.BigInteger.parse(this.strvalue);
        }
        public asBytes(): Uint8Array {
            return null;
        }
        public ToString(): string {
            if (this.type == "Array" || this.type == "Struct") {
                let outstr: string = this.type + "[";
                for (var i = 0; i < this.subItems.length; i++) {
                    outstr += this.subItems[i].ToShortString();
                    if (i != this.subItems.length - 1) {
                        outstr += ",";
                    }
                }
                outstr += "]";
                return outstr;
            }
            else {
                return this.type + ":" + this.strvalue;
            }
        }
        public ToShortString(): string {
            if (this.type == "Array" || this.type == "Struct") {
                let outstr = "[";
                for (var i = 0; i < this.subItems.length; i++) {
                    outstr += this.subItems[i].ToShortString();
                    if (i != this.subItems.length - 1) {
                        outstr += ",";
                    }
                }
                outstr += "]";
                return outstr;
            }
            else {
                return this.strvalue;
            }
        }
        //public static MyJson.JsonNode_Object StatkItemToJson(StackItem item)
        //{
        //    //MyJson.JsonNode_Object json = new MyJson.JsonNode_Object();
        //    //var type = item.GetType().Name;
        //    //if (type == "InteropInterface")
        //    //{
        //    //    json.SetDictValue(type, item.GetInterface<VM.IInteropInterface>().GetType().Name);
        //    //}
        //    //else if (type == "Boolean")
        //    //{
        //    //    json.SetDictValue(type, item.GetBoolean().ToString());
        //    //}
        //    //else if (type == "ByteArray")
        //    //{
        //    //    json.SetDictValue(type, item.GetByteArray().ToHexString());
        //    //}
        //    //else if (type == "Integer")
        //    //{
        //    //    json.SetDictValue(type, item.GetBigInteger().ToString());
        //    //}
        //    //else if (item.IsArray || item.IsStruct)
        //    //{
        //    //    MyJson.JsonNode_Array array = new MyJson.JsonNode_Array();
        //    //    json.SetDictValue(type, array);
        //    //    foreach (var i in item.GetArray())
        //    //    {
        //    //        array.Add(StatkItemToJson(i));
        //    //    }
        //    //}
        //    //return json;
        //}
        public static FromJson(json: {}): StackItem {
            let item = new StackItem();

            for (var key in json) {
                item.type = key;
                break;
            }
            //item.type = json.Keys.ToArray()[0];
            var strvalue: string = json[item.type];
            var isarrayvalue = json[item.type] instanceof Array;
            if (isarrayvalue == false) {
                item.strvalue = strvalue;
            }
            else {
                var arrayvalue = json[item.type] as any[];
                item.subItems = [];
                for (var i = 0; i < arrayvalue.length; i++) {
                    item.subItems.push(StackItem.FromJson(arrayvalue[i] as {}));
                }
                //    foreach(var subitem in arrayvalue)
                //    {
                //        item.subItems.Add(StackItem.FromJson(subitem as MyJson.JsonNode_Object));
                //    }
                //}
                return item;
            }
        }
    }


    export class LogScript {
        constructor(hash: string) {
            this.hash = hash;
        }
        public GetAllScriptName(names: Array<string>): number {
            names.push(this.hash);
            let scount = 1;
            for (var i = 0; i < this.ops.length; i++) {
                let op = this.ops[i];
                if (op.subScript != null) {
                    scount += op.subScript.GetAllScriptName(names);
                }
            }
            return scount;
        }
        public parent: LogScript;
        public hash: string;
        public ops: Array<LogOp> = new Array<LogOp>();

        //public MyJson.JsonNode_Object ToJson()
        //{
        //    MyJson.JsonNode_Object script = new MyJson.JsonNode_Object();
        //    script.SetDictValue("hash", this.hash);
        //    MyJson.JsonNode_Array array = new MyJson.JsonNode_Array();
        //    script.SetDictValue("ops", array);
        //    foreach (var op in ops)
        //    {
        //        array.Add(op.ToJson());
        //    }
        //    return script;
        //}
        public static FromJson(json: {}): LogScript {
            var hash: string = json["hash"];
            let script = new LogScript(hash);
            var array = json["ops"] as any[];
            for (var i = 0; i < array.length; i++) {
                let op = array[i];
                script.ops.push(LogOp.FromJson(op));
                var ss = script.ops[script.ops.length - 1].subScript;
                if (ss != null)
                    ss.parent = script;

            }

            return script;

        }
        public Clone(): LogScript {
            let s = new LogScript(this.hash);
            s.parent = this;
            s.ops = new Array<LogOp>();
            for (var i = 0; i < this.ops.length; i++)
            //foreach(var o in this.ops)
            {
                let o = this.ops[i];
                s.ops.push(o.Clone());
            }

            return s;
        }
    }



    export class LogOp {
        constructor(addr: number, op: ThinNeo.OpCode) {
            this.addr = addr;
            this.op = op;
            if (op == undefined) {

                console.log("what a fuck");
            }
        }
        public addr: number;//int
        public op: ThinNeo.OpCode;
        public error: boolean;
        //public string syscall;
        //public string[] syscallinfo;
        public stack: Op[];
        public param: Uint8Array;
        public opresult: StackItem;
        public GetHeader(): string {
            var addrstr = this.addr.toString(16);
            while (addrstr.length < 4)
                addrstr = "0" + addrstr;
            //let name = this.addr.toString("x04") + ":";
            let name = this.addr + ":";
            if (this.op > ThinNeo.OpCode.PUSHBYTES1 && this.op < ThinNeo.OpCode.PUSHBYTES75)
                return name + "PUSHBYTES" + (this.op - ThinNeo.OpCode.PUSHBYTES1);
            else {
                var trystr = ThinNeo.OpCode[this.op];
                if (trystr == undefined)
                    trystr = "" + this.op;
                return name + trystr;//.toString();
            }
        }

        public subScript: LogScript;
        //public static MyJson.JsonNode_Object StatkItemToJson(StackItem item)
        //{
        //    //MyJson.JsonNode_Object json = new MyJson.JsonNode_Object();
        //    //var type = item.GetType().Name;
        //    //if (type == "InteropInterface")
        //    //{
        //    //    json.SetDictValue(type, item.GetInterface<VM.IInteropInterface>().GetType().Name);
        //    //}
        //    //else if (type == "Boolean")
        //    //{
        //    //    json.SetDictValue(type, item.GetBoolean().ToString());
        //    //}
        //    //else if (type == "ByteArray")
        //    //{
        //    //    json.SetDictValue(type, item.GetByteArray().ToHexString());
        //    //}
        //    //else if (type == "Integer")
        //    //{
        //    //    json.SetDictValue(type, item.GetBigInteger().ToString());
        //    //}
        //    //else if (item.IsArray || item.IsStruct)
        //    //{
        //    //    MyJson.JsonNode_Array array = new MyJson.JsonNode_Array();
        //    //    json.SetDictValue(type, array);
        //    //    foreach (var i in item.GetArray())
        //    //    {
        //    //        array.Add(StatkItemToJson(i));
        //    //    }
        //    //}
        //    //return json;
        //}
        //public MyJson.JsonNode_Object ToJson()
        //{
        //    MyJson.JsonNode_Object _op = new MyJson.JsonNode_Object();
        //    _op.SetDictValue("addr", addr);
        //    _op.SetDictValue("op", op.ToString());
        //    if (this.stack != null)
        //    {
        //        MyJson.JsonNode_Array array = new MyJson.JsonNode_Array();
        //        _op.SetDictValue("stack", array);
        //        foreach (var r in stack)
        //        {
        //            if (r.ind > 0)
        //            {
        //                array.AddArrayValue(r.type.ToString() + "|" + r.ind);
        //            }
        //            else
        //            {
        //                array.AddArrayValue(r.type.ToString());
        //            }
        //        }
        //    }
        //    if (opresult != null)
        //    {
        //        _op.SetDictValue("result", StatkItemToJson(opresult));
        //    }
        //    if (subScript != null)
        //    {
        //        _op.SetDictValue("subscript", subScript.ToJson());
        //    }
        //    return _op;
        //}
        public static FromJson(json: {}): LogOp {
            var opstr = json["op"] as string;
            var addr = json["addr"] as number;

            let op: ThinNeo.OpCode = ThinNeo.OpCode[opstr];
            if (op == undefined)
                op = parseInt(opstr) as ThinNeo.OpCode;
            let _op = new LogOp(addr, op);
            if (json["stack"] != undefined) {

                var array = json["stack"] as any[];
                _op.stack = new Array<Op>(array.length);
                for (var i = 0; i < array.length; i++) {
                    var str = array[i] as string;
                    var ind = -1;
                    if (str.indexOf('|') >= 0) {
                        var strs = str.split('|');
                        ind = parseInt(strs[1]);
                        str = strs[0];
                    }
                    var type = OpType[opstr] as any as OpType;
                    _op.stack[i] = new Op(type, ind);
                }
            }
            if (json["param"] != undefined) {
                _op.param = (json["param"] as string).hexToBytes();
                //ThinNeo.Helper.ThinNeo.Debug.DebugTool.HexString2Bytes(json["param"].AsString());
            }
            if (json["result"] != undefined) {
                _op.opresult = StackItem.FromJson(json["result"]);
            }
            if (json["subscript"] != undefined) {
                _op.subScript = LogScript.FromJson(json["subscript"]);
            }
            return _op;
        }
        public Clone(): LogOp {
            let op = new LogOp(this.addr, this.op);
            op.error = this.error;
            if (this.stack != null) {
                op.stack = new Op[this.stack.length];
                for (var i = 0; i < this.stack.length; i++) {
                    op.stack[i] = this.stack[i].Clone();
                }
            }
            if (this.param != null) {
                op.param = this.param.clone();
            }
            if (this.opresult != null) {
                op.opresult = this.opresult.Clone();
            }
            op.subScript = this.subScript;
            return op;
        }
    }

    export class FullLog {
        public script: LogScript = null;
        public error: string = null;
        public states: VMState[];

        curScript: LogScript = null;
        curOp: LogOp = null;
        //public void LoadScript(string hash)
        //{
        //    if (script == null)
        //    {
        //        script = new LogScript(hash);
        //        curScript = script;
        //    }
        //    else
        //    {
        //        curOp.subScript = new LogScript(hash);
        //        curOp.subScript.parent = curScript;
        //        curScript = curOp.subScript;
        //    }
        //}
        //public void NextOp(int addr, VM.OpCode op)
        //{
        //    LogOp _op = new LogOp(addr, op);
        //    curScript.ops.Add(_op);
        //    curOp = _op;
        //    if (op == VM.OpCode.RET || op == VM.OpCode.TAILCALL)
        //    {
        //        curScript = curScript.parent;
        //    }
        //}
        //public void OPStackRecord(Op[] records)
        //{
        //    curOp.stack = records;
        //}
        //public void OpResult(StackItem item)
        //{
        //    curOp.opresult = item;
        //}
        //public void Error(string info)
        //{
        //    this.error = info;
        //}
        //public void Finish(VMState state)
        //{
        //    this.state = state;
        //}
        //public void Save(string filename)
        //{
        //    var path = System.IO.Path.GetDirectoryName(filename);
        //    if (System.IO.Directory.Exists(path) == false)
        //        System.IO.Directory.CreateDirectory(path);

        //    System.IO.File.Delete(filename + ".json");
        //    System.IO.File.Delete(filename);

        //    var json = new MyJson.JsonNode_Object();
        //    json.SetDictValue("script", script.ToJson());
        //    if (string.IsNullOrEmpty(error) == false)
        //        json.SetDictValue("error", error);
        //    json.SetDictValue("VMState", state.ToString());

        //    StringBuilder sb = new StringBuilder();
        //    json.ConvertToStringWithFormat(sb, 0);
        //    System.IO.File.WriteAllText(filename + ".json", sb.ToString());

        //    var compressor = new SevenZip.SevenZipCompressor();
        //    compressor.CompressionMethod = SevenZip.CompressionMethod.Lzma2;
        //    compressor.CompressionLevel = SevenZip.CompressionLevel.Fast;
        //    compressor.FastCompression = true;

        //    //compressor.path = path;
        //    compressor.CompressFiles(filename, System.IO.Path.GetFullPath(filename + ".json"));
        //    System.IO.File.Delete(filename + ".json");

        //}
        public static FromJson(json: {}): FullLog {
            let fulllog = new FullLog();
            if (json["error"] != undefined)
                fulllog.error = json["error"] as string;
            if (json["VMState"] != undefined) {
                var state = json["VMState"] as string;
                var words = state.split(",");
                fulllog.states = [];
                for (var i = 0; i < words.length; i++) {
                    var item = words[i].replace(" ", "");
                    fulllog.states.push(VMState[item]);
                }

            }
            if (json["script"] != undefined) {
                fulllog.script = LogScript.FromJson(json["script"]);
            }
            return fulllog;
        }
    }
}