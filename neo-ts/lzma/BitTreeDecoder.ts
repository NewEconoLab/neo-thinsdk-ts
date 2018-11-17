///<reference path="LZMA.d.ts" />
module nid
{
    /**
     * LZMA Decoder
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */
    export class BitTreeDecoder
    {
        public probs:Uint16Array;
        private numBits:number;


        constructor(numBits){
            this.numBits = numBits;
            this.probs = new Uint16Array(1 << this.numBits);

        }
        public init():void{
            LZMA.INIT_PROBS(this.probs);
        }
        public decode(rc:RangeDecoder):number
        {
            var m:number = 1;//Uint16
            for (var i:number = 0; i < this.numBits; i++)
            m = (m << 1) + rc.decodeBit(this.probs,m);
            return m - (1 << this.numBits);
        }
        public reverseDecode(rc:RangeDecoder):number
        {
            return LZMA.BitTreeReverseDecode(this.probs, this.numBits, rc);
        }
        static constructArray(numBits:number,len:number):Array<BitTreeDecoder>
        {
            var vec:BitTreeDecoder[] = [];
            for(var i:number = 0; i < len; i++){
                vec[i] = new BitTreeDecoder(numBits);
            }
            return vec;
        }
    }
}
