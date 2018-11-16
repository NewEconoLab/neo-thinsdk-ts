///<reference path="../../neo/BigInteger.ts"/>
///<reference path="../avm2asm/op.ts"/>

namespace ThinNeo.Debug {
    export class DebugScript {
        public srcfile: string;
        public codes: ThinNeo.Compiler.Op[];
        public maps: ThinNeo.Debug.Helper.AddrMap;
    }
    export class DebugTool {
        public scripts: { [id: string]: DebugScript } = {};
        public dumpInfo: SmartContract.Debug.DumpInfo;
        //public simvm: SimVM = new SimVM();
    }
}
