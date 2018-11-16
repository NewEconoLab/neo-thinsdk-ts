///<reference path="../randomaccessstack.ts"/>

namespace ThinNeo.Debug {
    export class State {
        private _StateID: number;
        public get StateID(): number {
            return this._StateID;
        }
        public SetId(id: number): void {
            this._StateID = id;
        }
        public ExeStack: ThinNeo.VM.RandomAccessStack<string> = new ThinNeo.VM.RandomAccessStack<string>();
        public CalcStack: VM.RandomAccessStack<SmartContract.Debug.StackItem> = new VM.RandomAccessStack<SmartContract.Debug.StackItem>();
        public AltStack: VM.RandomAccessStack<SmartContract.Debug.StackItem> = new VM.RandomAccessStack<SmartContract.Debug.StackItem>();
        public PushExe(hash: string): void {
            this.ExeStack.Push(hash);
            this._StateID++;
        }
        public PopExe(): void {
            this.ExeStack.Pop();
            this._StateID++;
        }
        public CalcCalcStack(op: ThinNeo.OpCode): boolean {
            if (op == ThinNeo.OpCode.TOALTSTACK) {
                var p = this.CalcStack.Pop();
                this.AltStack.Push(p);
                this._StateID++;
                return true;
            }
            if (op == ThinNeo.OpCode.FROMALTSTACK) {
                var p = this.AltStack.Pop();
                this.CalcStack.Push(p);
                this._StateID++;
                return true;
            }
            if (op == ThinNeo.OpCode.XSWAP) {
                var item = this.CalcStack.Pop();
                var xn = this.CalcStack.Peek(item.AsInt());
                var swapv = this.CalcStack.Peek(0);
                this.CalcStack.Set(item.AsInt(), swapv);
                this.CalcStack.Set(0, xn);
                this._StateID++;
                return true;
            }
            if (op == ThinNeo.OpCode.SWAP) {
                var v1 = this.CalcStack.Pop();
                var v2 = this.CalcStack.Pop();
                this.CalcStack.Push(v1);
                this.CalcStack.Push(v2);
                this._StateID++;
                return true;
            }
            if (op == ThinNeo.OpCode.ROT) {
                var v3 = this.CalcStack.Pop();
                var v2 = this.CalcStack.Pop();
                var v1 = this.CalcStack.Pop();
                this.CalcStack.Push(v2);
                this.CalcStack.Push(v3);
                this.CalcStack.Push(v1);
                this._StateID++;
                return true;
            }
            //if (op == VM.OpCode.ROLL)
            //{
            //    int n = (int)CalcStack.Pop().AsInt();
            //    CalcStack.Push(CalcStack.Remove(n));
            //    return true;
            //}
            return false;
        }
        public CalcCalcStack2(stackop: ThinNeo.SmartContract.Debug.Op, item: ThinNeo.SmartContract.Debug.StackItem): void {
            if (stackop.type == ThinNeo.SmartContract.Debug.OpType.Push) {
                if (item == null)
                    throw new Error(stackop.type + "can not pass null");
                this.CalcStack.Push(item);
            }
            else if (stackop.type == ThinNeo.SmartContract.Debug.OpType.Insert) {
                if (item == null)
                    throw new Error(stackop.type + "can not pass null");
                this.CalcStack.Insert(stackop.ind, item);
            }
            else if (stackop.type == ThinNeo.SmartContract.Debug.OpType.Clear) {
                this.CalcStack.Clear();
            }
            else if (stackop.type == ThinNeo.SmartContract.Debug.OpType.Set) {
                if (item == null)
                    throw new Error(stackop.type + "can not pass null");
                this.CalcStack.Set(stackop.ind, item);
            }
            else if (stackop.type == SmartContract.Debug.OpType.Pop) {
                this.CalcStack.Pop();
            }
            else if (stackop.type == SmartContract.Debug.OpType.Peek) {
                //CalcStack.Peek(stackop.ind);
            }
            else if (stackop.type == SmartContract.Debug.OpType.Remove) {
                this.CalcStack.Remove(stackop.ind);
            }
            if (stackop.type != SmartContract.Debug.OpType.Peek)//peek 不造成状态变化
                this._StateID++;
        }
        public DoSysCall(): void {

        }
        public Clone(): State {
            //这个clone 好像会导致数据反序
            let state = new State();
            state._StateID = this._StateID;
            for (var i = 0; i < this.ExeStack.Count; i++) {
                let s = this.ExeStack.GetItem(i);
                state.ExeStack.Push(s);
            }
            for (var i = 0; i < this.CalcStack.Count; i++) {
                let s = this.CalcStack.GetItem(i);
                if (s == null)
                    state.CalcStack.Push(null);
                else
                    state.CalcStack.Push(s.Clone());
            }
            for (var i = 0; i < this.AltStack.Count; i++) {
                let s = this.AltStack.GetItem(i);

                state.AltStack.Push(s.Clone());
            }
            return state;
        }
    }
    export class CareItem {
        constructor(name: string, state: State) {
            this.name = name;
            if (name == "Neo.Runtime.CheckWitness" ||
                name == "Neo.Runtime.Notify") {
                this.item = state.CalcStack.Peek(0).Clone();
                //this.item = item.Conv2String();
            }
            else if (name == "Neo.Runtime.Log") {
                var item = state.CalcStack.Peek(0);
                this.item = new SmartContract.Debug.StackItem();
                this.item.type = "String";
                if (item.type == "String") {
                    this.item.strvalue = item.strvalue;
                }
                else if (item.type == "ByteArray") {
                    var bt = item.strvalue.hexToBytes();//  Debug.DebugTool.HexString2Bytes(item.strvalue);
                    this.item.strvalue = ThinNeo.Helper.Bytes2String(bt);// System.Text.Encoding.ASCII.GetString(bt);
                }
                else {
                    this.item.strvalue = "can't convert this.";
                    //throw new Exception("can't conver this.");
                }
            }
            else if (name == "Neo.Storage.Put") {
                var item1 = state.CalcStack.Peek(0);
                var item2 = state.CalcStack.Peek(1);
                var item3 = state.CalcStack.Peek(2);
                this.item = new SmartContract.Debug.StackItem();
                this.item.type = "Array";
                this.item.subItems = new Array<SmartContract.Debug.StackItem>();
                this.item.subItems.push(item1.Clone());
                this.item.subItems.push(item2.Clone());
                this.item.subItems.push(item3.Clone());
            }
            else {

            }

        }
        public name: string;
        public item: ThinNeo.SmartContract.Debug.StackItem;
        public ToString(): string {
            return name + "(" + this.item == null?"":this.item.ToString() + ")";
        }
    }
    //模拟虚拟机
    export class SimVM {
        public Execute(DumpInfo: SmartContract.Debug.DumpInfo): void {
            let runstate = new State();
            runstate.SetId(0);

            this.stateClone = {};
            this.mapState = {};
            this.careinfo = new Array<CareItem>();

            this.regenScript = new SmartContract.Debug.LogScript(DumpInfo.script.hash);
            this.lastScript = this.regenScript;

            this.ExecuteScript(runstate, DumpInfo.script);
        }
        lastScript: SmartContract.Debug.LogScript = null;
        public regenScript: SmartContract.Debug.LogScript;
        public stateClone: { [id: number]: State };//Dictionary<int, State> ;
        public mapState: { [id: number]: number };// Dictionary<SmartContract.Debug.LogOp, int> mapState;
        public careinfo: Array<CareItem>;
        //加入outputscript，做一個補救，以前導出的log樹層次可能是錯的
        ExecuteScript(runstate: State, script: SmartContract.Debug.LogScript): void {
            try {
                runstate.PushExe(script.hash);
                for (var i = 0; i < script.ops.length; i++)
                //foreach(var op in script.ops)
                {
                    let op = script.ops[i];
                    var _nop = op.Clone();
                    this.lastScript.ops.push(_nop);
                    try {
                        if (op.op == ThinNeo.OpCode.APPCALL)//不造成栈影响，由目标script影响
                        {
                            var _script = op.subScript;
                            var outscript = new SmartContract.Debug.LogScript(op.subScript.hash);
                            outscript.parent = this.lastScript;
                            _nop.subScript = outscript;
                            this.lastScript = outscript;
                            //有可能造成影响
                            if (op.stack != null) {

                                for (var i = 0; i < op.stack.length; i++) {
                                    if (i == op.stack.length - 1) {
                                        runstate.CalcCalcStack2(op.stack[i], op.opresult);
                                    }
                                    else {
                                        runstate.CalcCalcStack2(op.stack[i], null);
                                    }
                                }
                            }
                            runstate.PushExe(script.hash);
                            if (this.stateClone[runstate.StateID] == undefined) {
                                this.stateClone[runstate.StateID] = runstate.Clone();
                            }
                            this.ExecuteScript(runstate, _script);
                            this.mapState[_nop.guid] = runstate.StateID;
                        }
                        else if (op.op == ThinNeo.OpCode.CALL)//造成栈影响 就是个jmp
                        {
                            var _lastScript = new SmartContract.Debug.LogScript(this.lastScript.hash);
                            _lastScript.parent = this.lastScript;
                            _nop.subScript = _lastScript;

                            this.lastScript = _lastScript;
                            runstate.PushExe(this.lastScript.hash);
                            this.mapState[_nop.guid] = runstate.StateID;

                            //runstate.callcount++;
                        }
                        else if (op.op == ThinNeo.OpCode.RET) {
                            runstate.PopExe();

                            //mapState[op] = runstate.StateID;
                            //if (runstate.callcount > 0)
                            //{
                            //    runstate.callcount--;
                            //}
                            //if (runstate.callcount == 0)
                            {
                                this.lastScript = this.lastScript.parent;
                            }
                            if (this.stateClone[runstate.StateID] == undefined) {
                                this.stateClone[runstate.StateID] = runstate.Clone();
                            }
                            this.mapState[_nop.guid] = runstate.StateID;
                        }
                        else {
                            if (op.op == ThinNeo.OpCode.SYSCALL)//syscall比较独特，有些syscall 可以产生独立的log
                            {
                                var name = ThinNeo.Helper.Bytes2String(op.param);
                                this.careinfo.push(new CareItem(name, runstate));
                                //runstate.DoSysCall(op.op);
                            }
                            if (runstate.CalcCalcStack(op.op) == false) {
                                if (op.stack != null) {

                                    for (var i = 0; i < op.stack.length; i++) {
                                        if (i == op.stack.length - 1) {
                                            runstate.CalcCalcStack2(op.stack[i], op.opresult);
                                        }
                                        else {
                                            runstate.CalcCalcStack2(op.stack[i], null);
                                        }
                                    }
                                }
                            }
                            if (this.stateClone[runstate.StateID] == undefined) {
                                this.stateClone[runstate.StateID] = runstate.Clone();
                            }
                            this.mapState[_nop.guid] = runstate.StateID;
                        }
                    }
                    catch (err1) {
                        _nop.error = true;
                    }
                }
            }
            catch (err) {
                throw new Error("error in:" + err);
            }
        }
    }
}
