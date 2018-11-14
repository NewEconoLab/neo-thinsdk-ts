///<reference path="LZMA.d.ts" />
module nid {
    /**
     * LZMA Decoder
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */

    export class LenDecoder {

        private choice;
        private lowCoder:Array<BitTreeDecoder>;//3
        private midCoder:Array<BitTreeDecoder>;//3
        private highCoder:BitTreeDecoder;//8

        constructor() {
            this.lowCoder  = BitTreeDecoder.constructArray(3, 1 << LZMA.kNumPosBitsMax );
            this.midCoder  = BitTreeDecoder.constructArray(3, 1 << LZMA.kNumPosBitsMax );
            this.highCoder = new BitTreeDecoder(8);
        }

        public init():void {
            this.choice = [LZMA.PROB_INIT_VAL,LZMA.PROB_INIT_VAL];
            this.highCoder.init();
            for (var i:number = 0; i < (1 << LZMA.kNumPosBitsMax); i++)
            {
                this.lowCoder[i].init();
                this.midCoder[i].init();
            }
        }
        public decode(rc:RangeDecoder, posState:number):number
        {
            if (rc.decodeBit(this.choice,0) == 0){
                return this.lowCoder[posState].decode(rc);
            }
            if (rc.decodeBit(this.choice,1) == 0){
                return 8 + this.midCoder[posState].decode(rc);
            }
            return 16 + this.highCoder.decode(rc);
        }
    }
}