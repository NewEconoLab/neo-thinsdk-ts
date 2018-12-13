var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var nid;
(function (nid) {
    var BitTreeDecoder = (function () {
        function BitTreeDecoder(numBits) {
            this.numBits = numBits;
            this.probs = new Uint16Array(1 << this.numBits);
        }
        BitTreeDecoder.prototype.init = function () {
            nid.LZMA.INIT_PROBS(this.probs);
        };
        BitTreeDecoder.prototype.decode = function (rc) {
            var m = 1;
            for (var i = 0; i < this.numBits; i++)
                m = (m << 1) + rc.decodeBit(this.probs, m);
            return m - (1 << this.numBits);
        };
        BitTreeDecoder.prototype.reverseDecode = function (rc) {
            return nid.LZMA.BitTreeReverseDecode(this.probs, this.numBits, rc);
        };
        BitTreeDecoder.constructArray = function (numBits, len) {
            var vec = [];
            for (var i = 0; i < len; i++) {
                vec[i] = new BitTreeDecoder(numBits);
            }
            return vec;
        };
        return BitTreeDecoder;
    }());
    nid.BitTreeDecoder = BitTreeDecoder;
})(nid || (nid = {}));
var nid;
(function (nid) {
    var LenDecoder = (function () {
        function LenDecoder() {
            this.lowCoder = nid.BitTreeDecoder.constructArray(3, 1 << nid.LZMA.kNumPosBitsMax);
            this.midCoder = nid.BitTreeDecoder.constructArray(3, 1 << nid.LZMA.kNumPosBitsMax);
            this.highCoder = new nid.BitTreeDecoder(8);
        }
        LenDecoder.prototype.init = function () {
            this.choice = [nid.LZMA.PROB_INIT_VAL, nid.LZMA.PROB_INIT_VAL];
            this.highCoder.init();
            for (var i = 0; i < (1 << nid.LZMA.kNumPosBitsMax); i++) {
                this.lowCoder[i].init();
                this.midCoder[i].init();
            }
        };
        LenDecoder.prototype.decode = function (rc, posState) {
            if (rc.decodeBit(this.choice, 0) == 0) {
                return this.lowCoder[posState].decode(rc);
            }
            if (rc.decodeBit(this.choice, 1) == 0) {
                return 8 + this.midCoder[posState].decode(rc);
            }
            return 16 + this.highCoder.decode(rc);
        };
        return LenDecoder;
    }());
    nid.LenDecoder = LenDecoder;
})(nid || (nid = {}));
var nid;
(function (nid) {
    "use strict";
    var LZMA = (function () {
        function LZMA() {
            this.decoder = new nid.LzmaDecoder();
        }
        LZMA.INIT_PROBS = function (p) {
            for (var i = 0; i < p.length; i++) {
                p[i] = this.PROB_INIT_VAL;
            }
        };
        LZMA.BitTreeReverseDecode = function (probs, numBits, rc, offset) {
            if (offset === void 0) { offset = 0; }
            var m = 1;
            var symbol = 0;
            for (var i = 0; i < numBits; i++) {
                var bit = rc.decodeBit(probs, offset + m);
                m <<= 1;
                m += bit;
                symbol |= (bit << i);
            }
            return symbol;
        };
        LZMA.prototype.decode = function (data) {
            this.data = data;
            var header = new Uint8Array(13);
            var i;
            for (i = 0; i < 13; i++) {
                header[i] = data[i];
            }
            this.decoder.decodeProperties(header);
            var unpackSize = 0;
            var unpackSizeDefined = true;
            for (i = 0; i < 4; i++) {
                var b = header[5 + i];
                unpackSize |= b << (8 * i);
            }
            var packSize = 0;
            for (i = 0; i < 4; i++) {
                var b = header[9 + i];
                packSize |= b << (8 * i);
            }
            this.decoder.markerIsMandatory = !unpackSizeDefined;
            this.decoder.rangeDec.inStream = data;
            this.decoder.create();
            var res = this.decoder.decode(unpackSizeDefined, unpackSize);
            if (res == LZMA.LZMA_RES_ERROR) {
                throw "LZMA decoding error";
            }
            else if (res == LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER) {
            }
            else if (res == LZMA.LZMA_RES_FINISHED_WITH_MARKER) {
                if (unpackSizeDefined) {
                    if (this.decoder.outWindow.out_pos != unpackSize) {
                        throw "Finished with end marker before than specified size";
                    }
                }
            }
            else {
                throw "Internal Error";
            }
            if (this.decoder.rangeDec.corrupted) {
                console.log("Warning: LZMA stream is corrupted");
            }
            return this.decoder.outWindow.outStream;
        };
        LZMA.LZMA_DIC_MIN = (1 << 12);
        LZMA.LZMA_RES_ERROR = 0;
        LZMA.LZMA_RES_FINISHED_WITH_MARKER = 1;
        LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER = 2;
        LZMA.kNumBitModelTotalBits = 11;
        LZMA.kNumMoveBits = 5;
        LZMA.PROB_INIT_VAL = ((1 << LZMA.kNumBitModelTotalBits) / 2);
        LZMA.kNumPosBitsMax = 4;
        LZMA.kNumStates = 12;
        LZMA.kNumLenToPosStates = 4;
        LZMA.kNumAlignBits = 4;
        LZMA.kStartPosModelIndex = 4;
        LZMA.kEndPosModelIndex = 14;
        LZMA.kNumFullDistances = (1 << (LZMA.kEndPosModelIndex >>> 1));
        LZMA.kMatchMinLen = 2;
        return LZMA;
    }());
    nid.LZMA = LZMA;
})(nid || (nid = {}));
var nid;
(function (nid) {
    var RangeDecoder = (function () {
        function RangeDecoder() {
            this.rangeI = 0;
            this.codeI = 1;
            this.loc1 = 2;
            this.loc2 = 3;
            this.in_pos = 13;
        }
        RangeDecoder.prototype.isFinishedOK = function () {
            return this.U32[this.codeI] == 0;
        };
        RangeDecoder.prototype.init = function () {
            this.U32 = new Uint32Array(4);
            this.U16 = new Uint16Array(4);
            this.corrupted = false;
            if (this.inStream[this.in_pos++] != 0) {
                this.corrupted = true;
            }
            this.U32[this.rangeI] = 0xFFFFFFFF;
            this.U32[this.codeI] = 0;
            for (var i = 0; i < 4; i++) {
                this.U32[this.codeI] = (this.U32[this.codeI] << 8) | this.inStream[this.in_pos++];
            }
            if (this.U32[this.codeI] == this.U32[this.rangeI]) {
                this.corrupted = true;
            }
        };
        RangeDecoder.prototype.normalize = function () {
            if (this.U32[this.rangeI] < RangeDecoder.kTopValue) {
                this.U32[this.rangeI] <<= 8;
                this.U32[this.codeI] = (this.U32[this.codeI] << 8) | this.inStream[this.in_pos++];
            }
        };
        RangeDecoder.prototype.decodeDirectBits = function (numBits) {
            this.U32[this.loc1] = 0;
            do {
                this.U32[this.rangeI] >>>= 1;
                this.U32[this.codeI] -= this.U32[this.rangeI];
                this.U32[this.loc2] = 0 - (this.U32[this.codeI] >>> 31);
                this.U32[this.codeI] += this.U32[this.rangeI] & this.U32[this.loc2];
                if (this.U32[this.codeI] == this.U32[this.rangeI]) {
                    this.corrupted = true;
                }
                this.normalize();
                this.U32[this.loc1] <<= 1;
                this.U32[this.loc1] += this.U32[this.loc2] + 1;
            } while (--numBits);
            return this.U32[this.loc1];
        };
        RangeDecoder.prototype.decodeBit = function (prob, index) {
            this.U16[0] = prob[index];
            this.U32[2] = (this.U32[0] >>> 11) * this.U16[0];
            if (this.U32[1] < this.U32[2]) {
                this.U16[0] += ((1 << 11) - this.U16[0]) >>> 5;
                this.U32[0] = this.U32[2];
                this.U16[1] = 0;
            }
            else {
                this.U16[0] -= this.U16[0] >>> 5;
                this.U32[1] -= this.U32[2];
                this.U32[0] -= this.U32[2];
                this.U16[1] = 1;
            }
            prob[index] = this.U16[0];
            if (this.U32[0] < 16777216) {
                this.U32[0] <<= 8;
                this.U32[1] = (this.U32[1] << 8) | this.inStream[this.in_pos++];
            }
            return this.U16[1];
        };
        RangeDecoder.kTopValue = (1 << 24);
        return RangeDecoder;
    }());
    nid.RangeDecoder = RangeDecoder;
})(nid || (nid = {}));
var nid;
(function (nid) {
    var OutWindow = (function () {
        function OutWindow() {
            this.out_pos = 0;
        }
        OutWindow.prototype.create = function (dictSize) {
            this.buf = new Uint8Array(dictSize);
            this.pos = 0;
            this.size = dictSize;
            this.isFull = false;
            this.totalPos = 0;
        };
        OutWindow.prototype.putByte = function (b) {
            this.totalPos++;
            this.buf[this.pos++] = b;
            if (this.pos == this.size) {
                this.pos = 0;
                this.isFull = true;
            }
            this.outStream[this.out_pos++] = b;
        };
        OutWindow.prototype.getByte = function (dist) {
            return this.buf[dist <= this.pos ? this.pos - dist : this.size - dist + this.pos];
        };
        OutWindow.prototype.copyMatch = function (dist, len) {
            for (; len > 0; len--) {
                this.putByte(this.getByte(dist));
            }
        };
        OutWindow.prototype.checkDistance = function (dist) {
            return dist <= this.pos || this.isFull;
        };
        OutWindow.prototype.isEmpty = function () {
            return this.pos == 0 && !this.isFull;
        };
        return OutWindow;
    }());
    nid.OutWindow = OutWindow;
})(nid || (nid = {}));
var nid;
(function (nid) {
    var LzmaDecoder = (function () {
        function LzmaDecoder() {
            this.posSlotDecoder = nid.BitTreeDecoder.constructArray(6, nid.LZMA.kNumLenToPosStates);
            this.alignDecoder = new nid.BitTreeDecoder(nid.LZMA.kNumAlignBits);
            this.posDecoders = new Uint16Array(1 + nid.LZMA.kNumFullDistances - nid.LZMA.kEndPosModelIndex);
            this.isMatch = new Uint16Array(nid.LZMA.kNumStates << nid.LZMA.kNumPosBitsMax);
            this.isRep = new Uint16Array(nid.LZMA.kNumStates);
            this.isRepG0 = new Uint16Array(nid.LZMA.kNumStates);
            this.isRepG1 = new Uint16Array(nid.LZMA.kNumStates);
            this.isRepG2 = new Uint16Array(nid.LZMA.kNumStates);
            this.isRep0Long = new Uint16Array(nid.LZMA.kNumStates << nid.LZMA.kNumPosBitsMax);
            this.lenDecoder = new nid.LenDecoder();
            this.repLenDecoder = new nid.LenDecoder();
            this.rangeDec = new nid.RangeDecoder();
            this.outWindow = new nid.OutWindow();
        }
        LzmaDecoder.prototype.init = function () {
            this.loc1 = nid.utils.MEMORY.getUint32() | 0;
            this.loc2 = nid.utils.MEMORY.getUint32() | 0;
            this.matchBitI = nid.utils.MEMORY.getUint16() | 0;
            this.matchByteI = nid.utils.MEMORY.getUint16() | 0;
            this.bitI = nid.utils.MEMORY.getUint16() | 0;
            this.symbolI = nid.utils.MEMORY.getUint16() | 0;
            this.prevByteI = nid.utils.MEMORY.getUint16() | 0;
            this.litStateI = nid.utils.MEMORY.getUint16() | 0;
            this.initLiterals();
            this.initDist();
            nid.LZMA.INIT_PROBS(this.isMatch);
            nid.LZMA.INIT_PROBS(this.isRep);
            nid.LZMA.INIT_PROBS(this.isRepG0);
            nid.LZMA.INIT_PROBS(this.isRepG1);
            nid.LZMA.INIT_PROBS(this.isRepG2);
            nid.LZMA.INIT_PROBS(this.isRep0Long);
            this.lenDecoder.init();
            this.repLenDecoder.init();
        };
        LzmaDecoder.prototype.create = function () {
            this.outWindow.create(this.dictSize);
            this.createLiterals();
        };
        LzmaDecoder.prototype.createLiterals = function () {
            this.litProbs = new Uint16Array(0x300 << (this.lc + this.lp));
        };
        LzmaDecoder.prototype.initLiterals = function () {
            var num = 0x300 << (this.lc + this.lp);
            for (var i = 0; i < num; i++) {
                this.litProbs[i] = nid.LZMA.PROB_INIT_VAL;
            }
        };
        LzmaDecoder.prototype.decodeLiteral = function (state, rep0) {
            nid.utils.MEMORY.u16[this.prevByteI] = 0;
            if (!this.outWindow.isEmpty())
                nid.utils.MEMORY.u16[this.prevByteI] = this.outWindow.getByte(1);
            nid.utils.MEMORY.u16[this.symbolI] = 1;
            nid.utils.MEMORY.u16[this.litStateI] = ((this.outWindow.totalPos & ((1 << this.lp) - 1)) << this.lc) + (nid.utils.MEMORY.u16[this.prevByteI] >>> (8 - this.lc));
            var probsOffset = (0x300 * nid.utils.MEMORY.u16[this.litStateI]) | 0;
            if (state >= 7) {
                nid.utils.MEMORY.u16[this.matchByteI] = this.outWindow.getByte(rep0 + 1);
                do {
                    nid.utils.MEMORY.u16[this.matchBitI] = (nid.utils.MEMORY.u16[this.matchByteI] >>> 7) & 1;
                    nid.utils.MEMORY.u16[this.matchByteI] <<= 1;
                    nid.utils.MEMORY.u16[this.bitI] = this.rangeDec.decodeBit(this.litProbs, probsOffset + ((1 + nid.utils.MEMORY.u16[this.matchBitI]) << 8) + nid.utils.MEMORY.u16[this.symbolI]);
                    nid.utils.MEMORY.u16[this.symbolI] = (nid.utils.MEMORY.u16[this.symbolI] << 1) | nid.utils.MEMORY.u16[this.bitI];
                    if (nid.utils.MEMORY.u16[this.matchBitI] != nid.utils.MEMORY.u16[this.bitI])
                        break;
                } while (nid.utils.MEMORY.u16[this.symbolI] < 0x100);
            }
            while (nid.utils.MEMORY.u16[this.symbolI] < 0x100) {
                nid.utils.MEMORY.u16[this.symbolI] = (nid.utils.MEMORY.u16[this.symbolI] << 1) | this.rangeDec.decodeBit(this.litProbs, probsOffset + nid.utils.MEMORY.u16[this.symbolI]);
            }
            this.outWindow.putByte(nid.utils.MEMORY.u16[this.symbolI] - 0x100);
        };
        LzmaDecoder.prototype.decodeDistance = function (len) {
            var lenState = len;
            if (lenState > nid.LZMA.kNumLenToPosStates - 1)
                lenState = nid.LZMA.kNumLenToPosStates - 1;
            var posSlot = this.posSlotDecoder[lenState].decode(this.rangeDec);
            if (posSlot < 4)
                return posSlot;
            var numDirectBits = ((posSlot >>> 1) - 1);
            nid.utils.MEMORY.u32[this.loc1] = ((2 | (posSlot & 1)) << numDirectBits);
            if (posSlot < nid.LZMA.kEndPosModelIndex) {
                nid.utils.MEMORY.u32[this.loc1] += nid.LZMA.BitTreeReverseDecode(this.posDecoders, numDirectBits, this.rangeDec, nid.utils.MEMORY.u32[this.loc1] - posSlot);
            }
            else {
                nid.utils.MEMORY.u32[this.loc1] += this.rangeDec.decodeDirectBits(numDirectBits - nid.LZMA.kNumAlignBits) << nid.LZMA.kNumAlignBits;
                nid.utils.MEMORY.u32[this.loc1] += this.alignDecoder.reverseDecode(this.rangeDec);
            }
            return nid.utils.MEMORY.u32[this.loc1];
        };
        LzmaDecoder.prototype.initDist = function () {
            for (var i = 0; i < nid.LZMA.kNumLenToPosStates; i++) {
                this.posSlotDecoder[i].init();
            }
            this.alignDecoder.init();
            nid.LZMA.INIT_PROBS(this.posDecoders);
        };
        LzmaDecoder.prototype.decodeProperties = function (properties) {
            var prop = new Uint8Array(4);
            prop[0] = properties[0];
            if (prop[0] >= (9 * 5 * 5)) {
                throw "Incorrect LZMA properties";
            }
            prop[1] = prop[0] % 9;
            prop[0] /= 9;
            prop[2] = prop[0] / 5;
            prop[3] = prop[0] % 5;
            this.lc = prop[1];
            this.pb = prop[2];
            this.lp = prop[3];
            this.dictSizeInProperties = 0;
            for (var i = 0; i < 4; i++) {
                this.dictSizeInProperties |= properties[i + 1] << (8 * i);
            }
            this.dictSize = this.dictSizeInProperties;
            if (this.dictSize < nid.LZMA.LZMA_DIC_MIN) {
                this.dictSize = nid.LZMA.LZMA_DIC_MIN;
            }
        };
        LzmaDecoder.prototype.updateState_Literal = function (state) {
            if (state < 4)
                return 0;
            else if (state < 10)
                return state - 3;
            else
                return state - 6;
        };
        LzmaDecoder.prototype.updateState_ShortRep = function (state) { return state < 7 ? 9 : 11; };
        LzmaDecoder.prototype.updateState_Rep = function (state) { return state < 7 ? 8 : 11; };
        LzmaDecoder.prototype.updateState_Match = function (state) { return state < 7 ? 7 : 10; };
        LzmaDecoder.prototype.decode = function (unpackSizeDefined, unpackSize) {
            this.init();
            this.rangeDec.init();
            if (unpackSizeDefined) {
                this.outWindow.outStream = new Uint8Array(new ArrayBuffer(unpackSize));
            }
            var rep0 = 0, rep1 = 0, rep2 = 0, rep3 = 0;
            var state = 0;
            for (;;) {
                if (unpackSizeDefined && unpackSize == 0 && !this.markerIsMandatory) {
                    if (this.rangeDec.isFinishedOK()) {
                        return nid.LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER;
                    }
                }
                var posState = this.outWindow.totalPos & ((1 << this.pb) - 1);
                if (this.rangeDec.decodeBit(this.isMatch, (state << nid.LZMA.kNumPosBitsMax) + posState) == 0) {
                    if (unpackSizeDefined && unpackSize == 0) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                    this.decodeLiteral(state, rep0);
                    state = this.updateState_Literal(state);
                    unpackSize--;
                    continue;
                }
                var len;
                if (this.rangeDec.decodeBit(this.isRep, state) != 0) {
                    if (unpackSizeDefined && unpackSize == 0) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                    if (this.outWindow.isEmpty()) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                    if (this.rangeDec.decodeBit(this.isRepG0, state) == 0) {
                        if (this.rangeDec.decodeBit(this.isRep0Long, (state << nid.LZMA.kNumPosBitsMax) + posState) == 0) {
                            state = this.updateState_ShortRep(state);
                            this.outWindow.putByte(this.outWindow.getByte(rep0 + 1));
                            unpackSize--;
                            continue;
                        }
                    }
                    else {
                        var dist;
                        if (this.rangeDec.decodeBit(this.isRepG1, state) == 0) {
                            dist = rep1;
                        }
                        else {
                            if (this.rangeDec.decodeBit(this.isRepG2, state) == 0) {
                                dist = rep2;
                            }
                            else {
                                dist = rep3;
                                rep3 = rep2;
                            }
                            rep2 = rep1;
                        }
                        rep1 = rep0;
                        rep0 = dist;
                    }
                    len = this.repLenDecoder.decode(this.rangeDec, posState);
                    state = this.updateState_Rep(state);
                }
                else {
                    rep3 = rep2;
                    rep2 = rep1;
                    rep1 = rep0;
                    len = this.lenDecoder.decode(this.rangeDec, posState);
                    state = this.updateState_Match(state);
                    rep0 = this.decodeDistance(len);
                    if (rep0 == 0xFFFFFFFF) {
                        return this.rangeDec.isFinishedOK() ?
                            nid.LZMA.LZMA_RES_FINISHED_WITH_MARKER :
                            nid.LZMA.LZMA_RES_ERROR;
                    }
                    if (unpackSizeDefined && unpackSize == 0) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                    if (rep0 >= this.dictSize || !this.outWindow.checkDistance(rep0)) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                }
                len += nid.LZMA.kMatchMinLen;
                var isError = false;
                if (unpackSizeDefined && unpackSize < len) {
                    len = unpackSize;
                    isError = true;
                }
                this.outWindow.copyMatch(rep0 + 1, len);
                unpackSize -= len;
                if (isError) {
                    return nid.LZMA.LZMA_RES_ERROR;
                }
            }
        };
        return LzmaDecoder;
    }());
    nid.LzmaDecoder = LzmaDecoder;
})(nid || (nid = {}));
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        var LZMA = nid.LZMA;
        var LZMAHelper = (function () {
            function LZMAHelper() {
            }
            LZMAHelper.init = function () {
                var command = 0;
                LZMAHelper.decoderAsync.onmessage = function (e) {
                    if (command == 0) {
                        command = e.data;
                    }
                    else if (command == LZMAHelper.ENCODE) {
                        command = 0;
                    }
                    else if (command == LZMAHelper.DECODE) {
                        command = 0;
                        LZMAHelper.callback(e.data);
                        LZMAHelper.callback = null;
                    }
                };
            };
            LZMAHelper.encode = function (data) {
                return null;
            };
            LZMAHelper.decode = function (data) {
                return LZMAHelper.decoder.decode(new Uint8Array(data)).buffer;
            };
            LZMAHelper.encodeAsync = function (data, _callback) {
            };
            LZMAHelper.decodeAsync = function (data, _callback) {
                if (LZMAHelper.callback == null) {
                    LZMAHelper.callback = _callback;
                    LZMAHelper.decoderAsync.postMessage(LZMAHelper.DECODE);
                    LZMAHelper.decoderAsync.postMessage(data, [data]);
                }
                else {
                    console.log('Warning! Another LZMA decoding is running...');
                }
            };
            LZMAHelper.decoder = new LZMA();
            LZMAHelper.decoderAsync = new Worker('lib/LZMAWorker.min.js');
            LZMAHelper.ENCODE = 1;
            LZMAHelper.DECODE = 2;
            return LZMAHelper;
        }());
        utils.LZMAHelper = LZMAHelper;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
nid.utils.LZMAHelper.init();
var nid;
(function (nid) {
    "use strict";
    var LZMAWorker = (function () {
        function LZMAWorker() {
            this.command = null;
            var _this = this;
            this.decoder = new nid.LZMA();
            addEventListener('message', function (e) {
                if (_this.command == null) {
                    _this.command = e.data;
                }
                else if (_this.command['job'] == 1) {
                    _this.command = null;
                }
                else if (_this.command['job'] == 2) {
                    _this.decode(e.data);
                }
            }, false);
        }
        LZMAWorker.prototype.decode = function (data) {
            this.time = Date.now();
            var result = this.decoder.decode(new Uint8Array(data));
            this.command['time'] = Date.now() - this.time;
            postMessage(this.command);
            postMessage(result.buffer, [result.buffer]);
        };
        LZMAWorker.ENCODE = 1;
        LZMAWorker.DECODE = 2;
        return LZMAWorker;
    }());
    nid.LZMAWorker = LZMAWorker;
})(nid || (nid = {}));
new nid.LZMAWorker();
var nid;
(function (nid) {
    var utils;
    (function (utils) {
        var MEMORY = (function () {
            function MEMORY() {
            }
            MEMORY.reset = function () {
                MEMORY.u8Index = 0;
                MEMORY.u16Index = 0;
                MEMORY.u32Index = 0;
                MEMORY.u8 = null;
                MEMORY.u16 = null;
                MEMORY.u32 = null;
            };
            MEMORY.allocateUint8 = function (len) {
                MEMORY.u8 = new Uint8Array(len);
            };
            MEMORY.allocateUint16 = function (len) {
                MEMORY.u16 = new Uint16Array(len);
            };
            MEMORY.allocateUint32 = function (len) {
                MEMORY.u32 = new Uint32Array(len);
            };
            MEMORY.getUint8 = function () {
                if (!MEMORY.u8) {
                    MEMORY.allocateUint8(10);
                }
                return MEMORY.u8Index++;
            };
            MEMORY.getUint16 = function () {
                if (!MEMORY.u16) {
                    MEMORY.allocateUint16(24);
                }
                return MEMORY.u16Index++;
            };
            MEMORY.getUint32 = function () {
                if (!MEMORY.u32) {
                    MEMORY.allocateUint32(10);
                }
                return MEMORY.u32Index++;
            };
            MEMORY.u8Index = 0;
            MEMORY.u16Index = 0;
            MEMORY.u32Index = 0;
            return MEMORY;
        }());
        utils.MEMORY = MEMORY;
    })(utils = nid.utils || (nid.utils = {}));
})(nid || (nid = {}));
var Neo;
(function (Neo) {
    var UintVariable = (function () {
        function UintVariable(bits) {
            if (typeof bits === "number") {
                if (bits <= 0 || bits % 32 != 0)
                    throw new RangeError();
                this._bits = new Uint32Array(bits / 32);
            }
            else if (bits instanceof Uint8Array) {
                if (bits.length == 0 || bits.length % 4 != 0)
                    throw new RangeError();
                if (bits.byteOffset % 4 == 0) {
                    this._bits = new Uint32Array(bits.buffer, bits.byteOffset, bits.length / 4);
                }
                else {
                    var bits_new = new Uint8Array(bits);
                    this._bits = new Uint32Array(bits_new.buffer);
                }
            }
            else if (bits instanceof Uint32Array) {
                this._bits = bits;
            }
            else if (bits instanceof Array) {
                if (bits.length == 0)
                    throw new RangeError();
                this._bits = new Uint32Array(bits);
            }
        }
        Object.defineProperty(UintVariable.prototype, "bits", {
            get: function () {
                return this._bits;
            },
            enumerable: true,
            configurable: true
        });
        UintVariable.prototype.compareTo = function (other) {
            var max = Math.max(this._bits.length, other._bits.length);
            for (var i = max - 1; i >= 0; i--)
                if ((this._bits[i] || 0) > (other._bits[i] || 0))
                    return 1;
                else if ((this._bits[i] || 0) < (other._bits[i] || 0))
                    return -1;
            return 0;
        };
        UintVariable.prototype.equals = function (other) {
            var max = Math.max(this._bits.length, other._bits.length);
            for (var i = 0; i < max; i++)
                if ((this._bits[i] || 0) != (other._bits[i] || 0))
                    return false;
            return true;
        };
        UintVariable.prototype.toString = function () {
            var s = "";
            for (var i = this._bits.length * 32 - 4; i >= 0; i -= 4)
                s += ((this._bits[i >>> 5] >>> (i % 32)) & 0xf).toString(16);
            return s;
        };
        UintVariable.prototype.toArray = function () {
            return new Uint8Array(this._bits.buffer).reverse();
        };
        return UintVariable;
    }());
    Neo.UintVariable = UintVariable;
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var _max, _min;
    var Uint64 = (function (_super) {
        __extends(Uint64, _super);
        function Uint64(low, high) {
            if (low === void 0) { low = 0; }
            if (high === void 0) { high = 0; }
            return _super.call(this, [low, high]) || this;
        }
        Object.defineProperty(Uint64, "MaxValue", {
            get: function () { return _max || (_max = new Uint64(0xffffffff, 0xffffffff)); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Uint64, "MinValue", {
            get: function () { return _min || (_min = new Uint64()); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Uint64, "Zero", {
            get: function () { return Uint64.MinValue; },
            enumerable: true,
            configurable: true
        });
        Uint64.prototype.add = function (other) {
            var low = this._bits[0] + other._bits[0];
            var high = this._bits[1] + other._bits[1] + (low > 0xffffffff ? 1 : 0);
            return new Uint64(low, high);
        };
        Uint64.prototype.and = function (other) {
            if (typeof other === "number") {
                return this.and(new Uint64(other));
            }
            else {
                var bits = new Uint32Array(this._bits.length);
                for (var i = 0; i < bits.length; i++)
                    bits[i] = this._bits[i] & other._bits[i];
                return new Uint64(bits[0], bits[1]);
            }
        };
        Uint64.prototype.leftShift = function (shift) {
            if (shift == 0)
                return this;
            var shift_units = shift >>> 5;
            shift = shift & 0x1f;
            var bits = new Uint32Array(this._bits.length);
            for (var i = shift_units; i < bits.length; i++)
                if (shift == 0)
                    bits[i] = this._bits[i - shift_units];
                else
                    bits[i] = this._bits[i - shift_units] << shift | this._bits[i - shift_units - 1] >>> (32 - shift);
            return new Uint64(bits[0], bits[1]);
        };
        Uint64.prototype.not = function () {
            var bits = new Uint32Array(this._bits.length);
            for (var i = 0; i < bits.length; i++)
                bits[i] = ~this._bits[i];
            return new Uint64(bits[0], bits[1]);
        };
        Uint64.prototype.or = function (other) {
            if (typeof other === "number") {
                return this.or(new Uint64(other));
            }
            else {
                var bits = new Uint32Array(this._bits.length);
                for (var i = 0; i < bits.length; i++)
                    bits[i] = this._bits[i] | other._bits[i];
                return new Uint64(bits[0], bits[1]);
            }
        };
        Uint64.parse = function (str) {
            var bi = Neo.BigInteger.parse(str);
            if (bi.bitLength() > 64)
                throw new RangeError();
            var array = new Uint32Array(bi.toUint8Array(true, 8).buffer);
            return new Uint64(array[0], array[1]);
        };
        Uint64.prototype.rightShift = function (shift) {
            if (shift == 0)
                return this;
            var shift_units = shift >>> 5;
            shift = shift & 0x1f;
            var bits = new Uint32Array(this._bits.length);
            for (var i = 0; i < bits.length - shift_units; i++)
                if (shift == 0)
                    bits[i] = this._bits[i + shift_units];
                else
                    bits[i] = this._bits[i + shift_units] >>> shift | this._bits[i + shift_units + 1] << (32 - shift);
            return new Uint64(bits[0], bits[1]);
        };
        Uint64.prototype.subtract = function (other) {
            var low = this._bits[0] - other._bits[0];
            var high = this._bits[1] - other._bits[1] - (this._bits[0] < other._bits[0] ? 1 : 0);
            return new Uint64(low, high);
        };
        Uint64.prototype.toInt32 = function () {
            return this._bits[0] | 0;
        };
        Uint64.prototype.toNumber = function () {
            return this._bits[0] + this._bits[1] * Math.pow(2, 32);
        };
        Uint64.prototype.toString = function () {
            return (new Neo.BigInteger(this._bits.buffer)).toString();
        };
        Uint64.prototype.toUint32 = function () {
            return this._bits[0];
        };
        Uint64.prototype.xor = function (other) {
            if (typeof other === "number") {
                return this.xor(new Uint64(other));
            }
            else {
                var bits = new Uint32Array(this._bits.length);
                for (var i = 0; i < bits.length; i++)
                    bits[i] = this._bits[i] ^ other._bits[i];
                return new Uint64(bits[0], bits[1]);
            }
        };
        return Uint64;
    }(Neo.UintVariable));
    Neo.Uint64 = Uint64;
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var DB = 26;
    var DM = (1 << DB) - 1;
    var DV = DM + 1;
    var _minusone, _one, _zero;
    var BigInteger = (function () {
        function BigInteger(value) {
            this._sign = 0;
            this._bits = new Array();
            if (typeof value === "number") {
                if (!isFinite(value) || isNaN(value))
                    throw new RangeError();
                var parts = BigInteger.getDoubleParts(value);
                if (parts.man.equals(Neo.Uint64.Zero) || parts.exp <= -64)
                    return;
                if (parts.exp <= 0) {
                    this.fromUint64(parts.man.rightShift(-parts.exp), parts.sign);
                }
                else if (parts.exp <= 11) {
                    this.fromUint64(parts.man.leftShift(parts.exp), parts.sign);
                }
                else {
                    parts.man = parts.man.leftShift(11);
                    parts.exp -= 11;
                    var units = Math.ceil((parts.exp + 64) / DB);
                    var cu = Math.ceil(parts.exp / DB);
                    var cbit = cu * DB - parts.exp;
                    for (var i = cu; i < units; i++)
                        this._bits[i] = parts.man.rightShift(cbit + (i - cu) * DB).toUint32() & DM;
                    if (cbit > 0)
                        this._bits[cu - 1] = (parts.man.toUint32() << (DB - cbit)) & DM;
                    this._sign = parts.sign;
                    this.clamp();
                }
            }
            else if (typeof value === "string") {
                this.fromString(value);
            }
            else if (value instanceof Uint8Array) {
                this.fromUint8Array(value);
            }
            else if (value instanceof ArrayBuffer) {
                this.fromUint8Array(new Uint8Array(value));
            }
        }
        Object.defineProperty(BigInteger, "MinusOne", {
            get: function () { return _minusone || (_minusone = new BigInteger(-1)); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BigInteger, "One", {
            get: function () { return _one || (_one = new BigInteger(1)); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BigInteger, "Zero", {
            get: function () { return _zero || (_zero = new BigInteger(0)); },
            enumerable: true,
            configurable: true
        });
        BigInteger.add = function (x, y) {
            var bi_x = typeof x === "number" ? new BigInteger(x) : x;
            var bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign == 0)
                return bi_y;
            if (bi_y._sign == 0)
                return bi_x;
            if ((bi_x._sign > 0) != (bi_y._sign > 0))
                return BigInteger.subtract(bi_x, bi_y.negate());
            var bits_r = new Array();
            BigInteger.addTo(bi_x._bits, bi_y._bits, bits_r);
            return BigInteger.create(bi_x._sign, bits_r);
        };
        BigInteger.prototype.add = function (other) {
            return BigInteger.add(this, other);
        };
        BigInteger.addTo = function (x, y, r) {
            if (x.length < y.length) {
                var t = x;
                x = y;
                y = t;
            }
            var c = 0, i = 0;
            while (i < y.length) {
                c += x[i] + y[i];
                r[i++] = c & DM;
                c >>>= DB;
            }
            while (i < x.length) {
                c += x[i];
                r[i++] = c & DM;
                c >>>= DB;
            }
            if (c > 0)
                r[i] = c;
        };
        BigInteger.prototype.bitLength = function () {
            var l = this._bits.length;
            if (l == 0)
                return 0;
            return --l * DB + BigInteger.bitLengthInternal(this._bits[l]);
        };
        BigInteger.bitLengthInternal = function (w) {
            return (w < 1 << 15 ? (w < 1 << 7
                ? (w < 1 << 3 ? (w < 1 << 1
                    ? (w < 1 << 0 ? (w < 0 ? 32 : 0) : 1)
                    : (w < 1 << 2 ? 2 : 3)) : (w < 1 << 5
                    ? (w < 1 << 4 ? 4 : 5)
                    : (w < 1 << 6 ? 6 : 7)))
                : (w < 1 << 11
                    ? (w < 1 << 9 ? (w < 1 << 8 ? 8 : 9) : (w < 1 << 10 ? 10 : 11))
                    : (w < 1 << 13 ? (w < 1 << 12 ? 12 : 13) : (w < 1 << 14 ? 14 : 15)))) : (w < 1 << 23 ? (w < 1 << 19
                ? (w < 1 << 17 ? (w < 1 << 16 ? 16 : 17) : (w < 1 << 18 ? 18 : 19))
                : (w < 1 << 21 ? (w < 1 << 20 ? 20 : 21) : (w < 1 << 22 ? 22 : 23))) : (w < 1 << 27
                ? (w < 1 << 25 ? (w < 1 << 24 ? 24 : 25) : (w < 1 << 26 ? 26 : 27))
                : (w < 1 << 29 ? (w < 1 << 28 ? 28 : 29) : (w < 1 << 30 ? 30 : 31)))));
        };
        BigInteger.prototype.clamp = function () {
            var l = this._bits.length;
            while (l > 0 && (this._bits[--l] | 0) == 0)
                this._bits.pop();
            while (l > 0)
                this._bits[--l] |= 0;
            if (this._bits.length == 0)
                this._sign = 0;
        };
        BigInteger.compare = function (x, y) {
            var bi_x = typeof x === "number" ? new BigInteger(x) : x;
            var bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign >= 0 && bi_y._sign < 0)
                return +1;
            if (bi_x._sign < 0 && bi_y._sign >= 0)
                return -1;
            var c = BigInteger.compareAbs(bi_x, bi_y);
            return bi_x._sign < 0 ? -c : c;
        };
        BigInteger.compareAbs = function (x, y) {
            if (x._bits.length > y._bits.length)
                return +1;
            if (x._bits.length < y._bits.length)
                return -1;
            for (var i = x._bits.length - 1; i >= 0; i--)
                if (x._bits[i] > y._bits[i])
                    return +1;
                else if (x._bits[i] < y._bits[i])
                    return -1;
            return 0;
        };
        BigInteger.prototype.compareTo = function (other) {
            return BigInteger.compare(this, other);
        };
        BigInteger.create = function (sign, bits, clamp) {
            if (clamp === void 0) { clamp = false; }
            var bi = Object.create(BigInteger.prototype);
            bi._sign = sign;
            bi._bits = bits;
            if (clamp)
                bi.clamp();
            return bi;
        };
        BigInteger.divide = function (x, y) {
            var bi_x = typeof x === "number" ? new BigInteger(x) : x;
            var bi_y = typeof y === "number" ? new BigInteger(y) : y;
            return BigInteger.divRem(bi_x, bi_y).result;
        };
        BigInteger.prototype.divide = function (other) {
            return BigInteger.divide(this, other);
        };
        BigInteger.divRem = function (x, y) {
            var bi_x = typeof x === "number" ? new BigInteger(x) : x;
            var bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_y._sign == 0)
                throw new RangeError();
            if (bi_x._sign == 0)
                return { result: BigInteger.Zero, remainder: BigInteger.Zero };
            if (bi_y._sign == 1 && bi_y._bits == null)
                return { result: bi_x, remainder: BigInteger.Zero };
            if (bi_y._sign == -1 && bi_y._bits == null)
                return { result: bi_x.negate(), remainder: BigInteger.Zero };
            var sign_result = (bi_x._sign > 0) == (bi_y._sign > 0) ? +1 : -1;
            var c = BigInteger.compareAbs(bi_x, bi_y);
            if (c == 0)
                return { result: sign_result > 0 ? BigInteger.One : BigInteger.MinusOne, remainder: BigInteger.Zero };
            if (c < 0)
                return { result: BigInteger.Zero, remainder: bi_x };
            var bits_result = new Array();
            var bits_rem = new Array();
            Array.copy(bi_x._bits, 0, bits_rem, 0, bi_x._bits.length);
            var df = bi_y._bits[bi_y._bits.length - 1];
            for (var i = bi_x._bits.length - 1; i >= bi_y._bits.length - 1; i--) {
                var offset = i - bi_y._bits.length + 1;
                var d = bits_rem[i] + (bits_rem[i + 1] || 0) * DV;
                var max = Math.floor(d / df);
                if (max > DM)
                    max = DM;
                var min = 0;
                while (min != max) {
                    var bits_sub_1 = new Array(offset + bi_y._bits.length);
                    for (var i_1 = 0; i_1 < offset; i_1++)
                        bits_sub_1[i_1] = 0;
                    bits_result[offset] = Math.ceil((min + max) / 2);
                    BigInteger.multiplyTo(bi_y._bits, [bits_result[offset]], bits_sub_1, offset);
                    if (BigInteger.subtractTo(bits_rem, bits_sub_1))
                        max = bits_result[offset] - 1;
                    else
                        min = bits_result[offset];
                }
                var bits_sub = new Array(offset + bi_y._bits.length);
                for (var i_2 = 0; i_2 < offset; i_2++)
                    bits_sub[i_2] = 0;
                bits_result[offset] = min;
                BigInteger.multiplyTo(bi_y._bits, [bits_result[offset]], bits_sub, offset);
                BigInteger.subtractTo(bits_rem, bits_sub, bits_rem);
            }
            return { result: BigInteger.create(sign_result, bits_result, true), remainder: BigInteger.create(bi_x._sign, bits_rem, true) };
        };
        BigInteger.equals = function (x, y) {
            var bi_x = typeof x === "number" ? new BigInteger(x) : x;
            var bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign != bi_y._sign)
                return false;
            if (bi_x._bits.length != bi_y._bits.length)
                return false;
            for (var i = 0; i < bi_x._bits.length; i++)
                if (bi_x._bits[i] != bi_y._bits[i])
                    return false;
            return true;
        };
        BigInteger.prototype.equals = function (other) {
            return BigInteger.equals(this, other);
        };
        BigInteger.fromString = function (str, radix) {
            if (radix === void 0) { radix = 10; }
            var bi = Object.create(BigInteger.prototype);
            bi.fromString(str, radix);
            return bi;
        };
        BigInteger.prototype.fromString = function (str, radix) {
            if (radix === void 0) { radix = 10; }
            if (radix < 2 || radix > 36)
                throw new RangeError();
            if (str.length == 0) {
                this._sign == 0;
                this._bits = [];
                return;
            }
            var bits_radix = [radix];
            var bits_a = [0];
            var first = str.charCodeAt(0);
            var withsign = first == 0x2b || first == 0x2d;
            this._sign = first == 0x2d ? -1 : +1;
            this._bits = [];
            for (var i = withsign ? 1 : 0; i < str.length; i++) {
                bits_a[0] = str.charCodeAt(i);
                if (bits_a[0] >= 0x30 && bits_a[0] <= 0x39)
                    bits_a[0] -= 0x30;
                else if (bits_a[0] >= 0x41 && bits_a[0] <= 0x5a)
                    bits_a[0] -= 0x37;
                else if (bits_a[0] >= 0x61 && bits_a[0] <= 0x7a)
                    bits_a[0] -= 0x57;
                else
                    throw new RangeError();
                var bits_temp = new Array();
                BigInteger.multiplyTo(this._bits, bits_radix, bits_temp);
                BigInteger.addTo(bits_temp, bits_a, this._bits);
            }
            this.clamp();
        };
        BigInteger.fromUint8Array = function (arr, sign, littleEndian) {
            if (sign === void 0) { sign = 1; }
            if (littleEndian === void 0) { littleEndian = true; }
            var bi = Object.create(BigInteger.prototype);
            bi.fromUint8Array(arr, sign, littleEndian);
            return bi;
        };
        BigInteger.fromUint8ArrayAutoSign = function (arr, littleEndian) {
            if (littleEndian === void 0) { littleEndian = true; }
            var spos = littleEndian ? arr.length - 1 : 0;
            var btsign = arr[spos];
            var care = (btsign & 128);
            if (care > 0) {
                var array = new Uint8Array(arr.length);
                for (var i = 0; i < arr.length; i++) {
                    array[i] = ~arr[i];
                }
                var n = BigInteger.fromUint8Array(array, 1, littleEndian);
                n = n.add(1);
                n["_sign"] = -1;
                return n;
            }
            return BigInteger.fromUint8Array(arr, 1, littleEndian);
        };
        BigInteger.prototype.fromUint8Array = function (arr, sign, littleEndian) {
            if (sign === void 0) { sign = 1; }
            if (littleEndian === void 0) { littleEndian = true; }
            if (!littleEndian) {
                var arr_new = new Uint8Array(arr.length);
                for (var i = 0; i < arr.length; i++)
                    arr_new[arr.length - 1 - i] = arr[i];
                arr = arr_new;
            }
            var actual_length = BigInteger.getActualLength(arr);
            var bits = actual_length * 8;
            var units = Math.ceil(bits / DB);
            this._bits = [];
            for (var i = 0; i < units; i++) {
                var cb = i * DB;
                var cu = Math.floor(cb / 8);
                cb %= 8;
                this._bits[i] = ((arr[cu] | arr[cu + 1] << 8 | arr[cu + 2] << 16 | arr[cu + 3] << 24) >>> cb) & DM;
            }
            this._sign = sign < 0 ? -1 : +1;
            this.clamp();
        };
        BigInteger.prototype.fromUint64 = function (i, sign) {
            while (i.bits[0] != 0 || i.bits[1] != 0) {
                this._bits.push(i.toUint32() & DM);
                i = i.rightShift(DB);
            }
            this._sign = sign;
            this.clamp();
        };
        BigInteger.getActualLength = function (arr) {
            var actual_length = arr.length;
            for (var i = arr.length - 1; i >= 0; i--)
                if (arr[i] != 0) {
                    actual_length = i + 1;
                    break;
                }
            return actual_length;
        };
        BigInteger.getDoubleParts = function (dbl) {
            var uu = new Uint32Array(2);
            new Float64Array(uu.buffer)[0] = dbl;
            var result = {
                sign: 1 - ((uu[1] >>> 30) & 2),
                man: new Neo.Uint64(uu[0], uu[1] & 0x000FFFFF),
                exp: (uu[1] >>> 20) & 0x7FF,
                fFinite: true
            };
            if (result.exp == 0) {
                if (!result.man.equals(Neo.Uint64.Zero))
                    result.exp = -1074;
            }
            else if (result.exp == 0x7FF) {
                result.fFinite = false;
            }
            else {
                result.man = result.man.or(new Neo.Uint64(0, 0x00100000));
                result.exp -= 1075;
            }
            return result;
        };
        BigInteger.prototype.getLowestSetBit = function () {
            if (this._sign == 0)
                return -1;
            var w = 0;
            while (this._bits[w] == 0)
                w++;
            for (var x = 0; x < DB; x++)
                if ((this._bits[w] & 1 << x) > 0)
                    return x + w * DB;
        };
        BigInteger.prototype.isEven = function () {
            if (this._sign == 0)
                return true;
            return (this._bits[0] & 1) == 0;
        };
        BigInteger.prototype.isZero = function () {
            return this._sign == 0;
        };
        BigInteger.prototype.leftShift = function (shift) {
            if (shift == 0)
                return this;
            var shift_units = Math.floor(shift / DB);
            shift %= DB;
            var bits_new = new Array(this._bits.length + shift_units);
            if (shift == 0) {
                for (var i = 0; i < this._bits.length; i++)
                    bits_new[i + shift_units] = this._bits[i];
            }
            else {
                for (var i = shift_units; i < bits_new.length; i++)
                    bits_new[i] = (this._bits[i - shift_units] << shift | this._bits[i - shift_units - 1] >>> (DB - shift)) & DM;
                bits_new[bits_new.length] = this._bits[this._bits.length - 1] >>> (DB - shift) & DM;
            }
            return BigInteger.create(this._sign, bits_new, true);
        };
        BigInteger.mod = function (x, y) {
            var bi_x = typeof x === "number" ? new BigInteger(x) : x;
            var bi_y = typeof y === "number" ? new BigInteger(y) : y;
            var bi_new = BigInteger.divRem(bi_x, bi_y).remainder;
            if (bi_new._sign < 0)
                bi_new = BigInteger.add(bi_new, bi_y);
            return bi_new;
        };
        BigInteger.prototype.mod = function (other) {
            return BigInteger.mod(this, other);
        };
        BigInteger.modInverse = function (value, modulus) {
            var a = typeof value === "number" ? new BigInteger(value) : value;
            var n = typeof modulus === "number" ? new BigInteger(modulus) : modulus;
            var i = n, v = BigInteger.Zero, d = BigInteger.One;
            while (a._sign > 0) {
                var t = BigInteger.divRem(i, a);
                var x = d;
                i = a;
                a = t.remainder;
                d = v.subtract(t.result.multiply(x));
                v = x;
            }
            return BigInteger.mod(v, n);
        };
        BigInteger.prototype.modInverse = function (modulus) {
            return BigInteger.modInverse(this, modulus);
        };
        BigInteger.modPow = function (value, exponent, modulus) {
            var bi_v = typeof value === "number" ? new BigInteger(value) : value;
            var bi_e = typeof exponent === "number" ? new BigInteger(exponent) : exponent;
            var bi_m = typeof modulus === "number" ? new BigInteger(modulus) : modulus;
            if (bi_e._sign < 0 || bi_m._sign == 0)
                throw new RangeError();
            if (Math.abs(bi_m._sign) == 1 && bi_m._bits == null)
                return BigInteger.Zero;
            var h = bi_e.bitLength();
            var bi_new = BigInteger.One;
            for (var i = 0; i < h; i++) {
                if (i > 0)
                    bi_v = BigInteger.multiply(bi_v, bi_v);
                bi_v = bi_v.remainder(bi_m);
                if (bi_e.testBit(i))
                    bi_new = BigInteger.multiply(bi_v, bi_new).remainder(bi_m);
            }
            if (bi_new._sign < 0)
                bi_new = BigInteger.add(bi_new, bi_m);
            return bi_new;
        };
        BigInteger.prototype.modPow = function (exponent, modulus) {
            return BigInteger.modPow(this, exponent, modulus);
        };
        BigInteger.multiply = function (x, y) {
            var bi_x = typeof x === "number" ? new BigInteger(x) : x;
            var bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign == 0)
                return bi_x;
            if (bi_y._sign == 0)
                return bi_y;
            if (bi_x._sign == 1 && bi_x._bits == null)
                return bi_y;
            if (bi_x._sign == -1 && bi_x._bits == null)
                return bi_y.negate();
            if (bi_y._sign == 1 && bi_y._bits == null)
                return bi_x;
            if (bi_y._sign == -1 && bi_y._bits == null)
                return bi_x.negate();
            var bits_r = new Array();
            BigInteger.multiplyTo(bi_x._bits, bi_y._bits, bits_r);
            return BigInteger.create((bi_x._sign > 0) == (bi_y._sign > 0) ? +1 : -1, bits_r);
        };
        BigInteger.prototype.multiply = function (other) {
            return BigInteger.multiply(this, other);
        };
        BigInteger.multiplyTo = function (x, y, r, offset) {
            if (offset === void 0) { offset = 0; }
            if (x.length > y.length) {
                var t = x;
                x = y;
                y = t;
            }
            for (var i = x.length + y.length - 2; i >= 0; i--)
                r[i + offset] = 0;
            for (var i = 0; i < x.length; i++) {
                if (x[i] == 0)
                    continue;
                for (var j = 0; j < y.length; j++) {
                    var c = x[i] * y[j];
                    if (c == 0)
                        continue;
                    var k = i + j;
                    do {
                        c += r[k + offset] || 0;
                        r[k + offset] = c & DM;
                        c = Math.floor(c / DV);
                        k++;
                    } while (c > 0);
                }
            }
        };
        BigInteger.prototype.negate = function () {
            return BigInteger.create(-this._sign, this._bits);
        };
        BigInteger.parse = function (str) {
            return BigInteger.fromString(str);
        };
        BigInteger.pow = function (value, exponent) {
            var bi_v = typeof value === "number" ? new BigInteger(value) : value;
            if (exponent < 0 || exponent > 0x7fffffff)
                throw new RangeError();
            if (exponent == 0)
                return BigInteger.One;
            if (exponent == 1)
                return bi_v;
            if (bi_v._sign == 0)
                return bi_v;
            if (bi_v._bits.length == 1) {
                if (bi_v._bits[0] == 1)
                    return bi_v;
                if (bi_v._bits[0] == -1)
                    return (exponent & 1) != 0 ? bi_v : BigInteger.One;
            }
            var h = BigInteger.bitLengthInternal(exponent);
            var bi_new = BigInteger.One;
            for (var i = 0; i < h; i++) {
                var e = 1 << i;
                if (e > 1)
                    bi_v = BigInteger.multiply(bi_v, bi_v);
                if ((exponent & e) != 0)
                    bi_new = BigInteger.multiply(bi_v, bi_new);
            }
            return bi_new;
        };
        BigInteger.prototype.pow = function (exponent) {
            return BigInteger.pow(this, exponent);
        };
        BigInteger.random = function (bitLength, rng) {
            if (bitLength == 0)
                return BigInteger.Zero;
            var bytes = new Uint8Array(Math.ceil(bitLength / 8));
            if (rng == null) {
                for (var i = 0; i < bytes.length; i++)
                    bytes[i] = Math.random() * 256;
            }
            else {
                rng.getRandomValues(bytes);
            }
            bytes[bytes.length - 1] &= 0xff >>> (8 - bitLength % 8);
            return new BigInteger(bytes);
        };
        BigInteger.remainder = function (x, y) {
            var bi_x = typeof x === "number" ? new BigInteger(x) : x;
            var bi_y = typeof y === "number" ? new BigInteger(y) : y;
            return BigInteger.divRem(bi_x, bi_y).remainder;
        };
        BigInteger.prototype.remainder = function (other) {
            return BigInteger.remainder(this, other);
        };
        BigInteger.prototype.rightShift = function (shift) {
            if (shift == 0)
                return this;
            var shift_units = Math.floor(shift / DB);
            shift %= DB;
            if (this._bits.length <= shift_units)
                return BigInteger.Zero;
            var bits_new = new Array(this._bits.length - shift_units);
            if (shift == 0) {
                for (var i = 0; i < bits_new.length; i++)
                    bits_new[i] = this._bits[i + shift_units];
            }
            else {
                for (var i = 0; i < bits_new.length; i++)
                    bits_new[i] = (this._bits[i + shift_units] >>> shift | this._bits[i + shift_units + 1] << (DB - shift)) & DM;
            }
            return BigInteger.create(this._sign, bits_new, true);
        };
        BigInteger.prototype.sign = function () {
            return this._sign;
        };
        BigInteger.subtract = function (x, y) {
            var bi_x = typeof x === "number" ? new BigInteger(x) : x;
            var bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign == 0)
                return bi_y.negate();
            if (bi_y._sign == 0)
                return bi_x;
            if ((bi_x._sign > 0) != (bi_y._sign > 0))
                return BigInteger.add(bi_x, bi_y.negate());
            var c = BigInteger.compareAbs(bi_x, bi_y);
            if (c == 0)
                return BigInteger.Zero;
            if (c < 0)
                return BigInteger.subtract(bi_y, bi_x).negate();
            var bits_r = new Array();
            BigInteger.subtractTo(bi_x._bits, bi_y._bits, bits_r);
            return BigInteger.create(bi_x._sign, bits_r, true);
        };
        BigInteger.prototype.subtract = function (other) {
            return BigInteger.subtract(this, other);
        };
        BigInteger.subtractTo = function (x, y, r) {
            if (r == null)
                r = [];
            var l = Math.min(x.length, y.length);
            var c = 0, i = 0;
            while (i < l) {
                c += x[i] - y[i];
                r[i++] = c & DM;
                c >>= DB;
            }
            if (x.length < y.length)
                while (i < y.length) {
                    c -= y[i];
                    r[i++] = c & DM;
                    c >>= DB;
                }
            else
                while (i < x.length) {
                    c += x[i];
                    r[i++] = c & DM;
                    c >>= DB;
                }
            return c < 0;
        };
        BigInteger.prototype.testBit = function (n) {
            var units = Math.floor(n / DB);
            if (this._bits.length <= units)
                return false;
            return (this._bits[units] & (1 << (n %= DB))) != 0;
        };
        BigInteger.prototype.toInt32 = function () {
            if (this._sign == 0)
                return 0;
            if (this._bits.length == 1)
                return this._bits[0] * this._sign;
            return ((this._bits[0] | this._bits[1] * DV) & 0x7fffffff) * this._sign;
        };
        BigInteger.prototype.toString = function (radix) {
            if (radix === void 0) { radix = 10; }
            if (this._sign == 0)
                return "0";
            if (radix < 2 || radix > 36)
                throw new RangeError();
            var s = "";
            for (var bi = this; bi._sign != 0;) {
                var r = BigInteger.divRem(bi, radix);
                var rem = Math.abs(r.remainder.toInt32());
                if (rem < 10)
                    rem += 0x30;
                else
                    rem += 0x57;
                s = String.fromCharCode(rem) + s;
                bi = r.result;
            }
            if (this._sign < 0)
                s = "-" + s;
            return s;
        };
        BigInteger.prototype.toUint8Array = function (littleEndian, length) {
            if (littleEndian === void 0) { littleEndian = true; }
            if (this._sign == 0)
                return new Uint8Array(length || 1);
            var cb = Math.ceil((this._bits.length * DB + 1) / 8);
            var array = new Uint8Array(length || cb);
            for (var i = 0; i < array.length; i++) {
                var offset = littleEndian ? i : array.length - 1 - i;
                var cbits = i * 8;
                var cu = Math.floor(cbits / DB);
                cbits %= DB;
                if (DB - cbits < 8)
                    array[offset] = (this._bits[cu] >>> cbits | this._bits[cu + 1] << (DB - cbits)) & 0xff;
                else
                    array[offset] = this._bits[cu] >>> cbits & 0xff;
            }
            length = length || BigInteger.getActualLength(array);
            if (length < array.length)
                array = array.subarray(0, length);
            return array;
        };
        BigInteger.prototype.toUint8ArrayWithSign = function (littleEndian, length) {
            if (littleEndian === void 0) { littleEndian = true; }
            if (this._sign == 0)
                return new Uint8Array(length || 1);
            if (this._sign > 0) {
                var cb = Math.ceil((this._bits.length * DB + 1) / 8);
                var array_1 = new Uint8Array(length || cb);
                for (var i_3 = 0; i_3 < array_1.length; i_3++) {
                    var offset = littleEndian ? i_3 : array_1.length - 1 - i_3;
                    var cbits = i_3 * 8;
                    var cu = Math.floor(cbits / DB);
                    if (cu <= this._bits.length) {
                        cbits %= DB;
                        if (DB - cbits < 8)
                            array_1[offset] = (this._bits[cu] >>> cbits | this._bits[cu + 1] << (DB - cbits)) & 0xff;
                        else
                            array_1[offset] = this._bits[cu] >>> cbits & 0xff;
                    }
                    else {
                        array_1[offset] = 0;
                    }
                }
                length = length || BigInteger.getActualLength(array_1);
                if (length < array_1.length)
                    array_1 = array_1.subarray(0, length);
                if ((array_1[array_1.length - 1] & 0x80) > 0) {
                    var newarr = new Uint8Array(array_1.length + 1);
                    for (var i = 0; i < array_1.length; i++) {
                        newarr[i] = array_1[i];
                    }
                    newarr[array_1.length] = 0;
                    array_1 = newarr;
                }
                return array_1;
            }
            else {
                var n = this.add(1);
                if (n.sign() < 0)
                    n["_sign"] = 1;
                var array = n.toUint8Array();
                var needaddsign = (array[array.length - 1] & 0x80) > 0;
                var newarr = new Uint8Array(needaddsign ? array.length + 1 : array.length);
                for (var i = 0; i < array.length; i++) {
                    newarr[i] = ~array[i];
                }
                if (needaddsign) {
                    newarr[i] = 0xff;
                }
                array = newarr;
                return array;
            }
        };
        return BigInteger;
    }());
    Neo.BigInteger = BigInteger;
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var D = 100000000;
    var _max, _minus, _min, _one, _satoshi;
    var Fixed8 = (function () {
        function Fixed8(data) {
            this.data = data;
            if (data.bits[1] >= 0x80000000 && (data.bits[0] != 0xffffffff || data.bits[1] != 0xffffffff))
                throw new RangeError();
        }
        Object.defineProperty(Fixed8, "MaxValue", {
            get: function () { return _max || (_max = new Fixed8(new Neo.Uint64(0xffffffff, 0x7fffffff))); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fixed8, "MinusOne", {
            get: function () { return _minus || (_minus = new Fixed8(new Neo.Uint64(0xffffffff, 0xffffffff))); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fixed8, "MinValue", {
            get: function () { return _min || (_min = new Fixed8(Neo.Uint64.MinValue)); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fixed8, "One", {
            get: function () { return _one || (_one = Fixed8.fromNumber(1)); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fixed8, "Satoshi", {
            get: function () { return _satoshi || (_satoshi = new Fixed8(new Neo.Uint64(1))); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Fixed8, "Zero", {
            get: function () { return Fixed8.MinValue; },
            enumerable: true,
            configurable: true
        });
        Fixed8.prototype.add = function (other) {
            var result = this.data.add(other.data);
            if (result.compareTo(this.data) < 0)
                throw new Error();
            return new Fixed8(result);
        };
        Fixed8.prototype.compareTo = function (other) {
            return this.data.compareTo(other.data);
        };
        Fixed8.prototype.equals = function (other) {
            return this.data.equals(other.data);
        };
        Fixed8.fromNumber = function (value) {
            if (value < 0)
                throw new RangeError();
            value *= D;
            if (value >= 0x8000000000000000)
                throw new RangeError();
            var array = new Uint32Array((new Neo.BigInteger(value)).toUint8Array(true, 8).buffer);
            return new Fixed8(new Neo.Uint64(array[0], array[1]));
        };
        Fixed8.prototype.getData = function () {
            return this.data;
        };
        Fixed8.max = function (first) {
            var others = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                others[_i - 1] = arguments[_i];
            }
            for (var i = 0; i < others.length; i++)
                if (first.compareTo(others[i]) < 0)
                    first = others[i];
            return first;
        };
        Fixed8.min = function (first) {
            var others = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                others[_i - 1] = arguments[_i];
            }
            for (var i = 0; i < others.length; i++)
                if (first.compareTo(others[i]) > 0)
                    first = others[i];
            return first;
        };
        Fixed8.parse = function (str) {
            var dot = str.indexOf('.');
            var digits = dot >= 0 ? str.length - dot - 1 : 0;
            str = str.replace('.', '');
            if (digits > 8)
                str = str.substr(0, str.length - digits + 8);
            else if (digits < 8)
                for (var i = digits; i < 8; i++)
                    str += '0';
            return new Fixed8(Neo.Uint64.parse(str));
        };
        Fixed8.prototype.subtract = function (other) {
            if (this.data.compareTo(other.data) < 0)
                throw new Error();
            return new Fixed8(this.data.subtract(other.data));
        };
        Fixed8.prototype.toString = function () {
            var str = this.data.toString();
            while (str.length <= 8)
                str = '0' + str;
            str = str.substr(0, str.length - 8) + '.' + str.substr(str.length - 8);
            var e = 0;
            for (var i = str.length - 1; i >= 0; i--)
                if (str[i] == '0')
                    e++;
                else
                    break;
            str = str.substr(0, str.length - e);
            if (str[str.length - 1] == '.')
                str = str.substr(0, str.length - 1);
            return str;
        };
        Fixed8.prototype.deserialize = function (reader) {
            this.data = reader.readUint64();
        };
        Fixed8.prototype.serialize = function (writer) {
            writer.writeUint64(this.getData());
        };
        return Fixed8;
    }());
    Neo.Fixed8 = Fixed8;
})(Neo || (Neo = {}));
Array.copy = function (src, srcOffset, dst, dstOffset, count) {
    for (var i = 0; i < count; i++)
        dst[i + dstOffset] = src[i + srcOffset];
};
Array.fromArray = function (arr) {
    var array = new Array(arr.length);
    for (var i = 0; i < array.length; i++)
        array[i] = arr[i];
    return array;
};
Uint8Array.fromArrayBuffer = function (buffer) {
    if (buffer instanceof Uint8Array)
        return buffer;
    else if (buffer instanceof ArrayBuffer)
        return new Uint8Array(buffer);
    else {
        var view = buffer;
        return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }
};
String.prototype.hexToBytes = function () {
    if ((this.length & 1) != 0)
        throw new RangeError();
    var str = this;
    if (this.length >= 2 && this[0] == '0' && this[1] == 'x')
        str = this.substr(2);
    var bytes = new Uint8Array(str.length / 2);
    for (var i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(str.substr(i * 2, 2), 16);
    }
    return bytes;
};
ArrayBuffer.prototype.slice = ArrayBuffer.prototype.slice || function (begin, end) {
    if (end === void 0) { end = this.byteLength; }
    if (begin < 0)
        begin += this.byteLength;
    if (begin < 0)
        begin = 0;
    if (end < 0)
        end += this.byteLength;
    if (end > this.byteLength)
        end = this.byteLength;
    var length = end - begin;
    if (length < 0)
        length = 0;
    var src = new Uint8Array(this);
    var dst = new Uint8Array(length);
    for (var i = 0; i < length; i++)
        dst[i] = src[i + begin];
    return dst.buffer;
};
Uint8Array.prototype.toHexString = function () {
    var s = "";
    for (var i = 0; i < this.length; i++) {
        s += (this[i] >>> 4).toString(16);
        s += (this[i] & 0xf).toString(16);
    }
    return s;
};
Uint8Array.prototype.clone = function () {
    var u8 = new Uint8Array(this.length);
    for (var i = 0; i < this.length; i++)
        u8[i] = this[i];
    return u8;
};
Uint8Array.prototype.concat = function (data) {
    var newarr = new Uint8Array(this.length + data.length);
    for (var i = 0; i < this.length; i++) {
        newarr[i] = this[i];
    }
    for (var i = 0; i < data.length; i++) {
        newarr[this.length + i] = data[i];
    }
    return newarr;
};
void function () {
    function fillArray(value, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.length; }
        if (start < 0)
            start += this.length;
        if (start < 0)
            start = 0;
        if (start >= this.length)
            return this;
        if (end < 0)
            end += this.length;
        if (end < 0)
            return this;
        if (end > this.length)
            end = this.length;
        for (var i = start; i < end; i++)
            this[i] = value;
        return this;
    }
    Array.prototype.fill = Array.prototype.fill || fillArray;
    Int8Array.prototype.fill = Int8Array.prototype.fill || fillArray;
    Int16Array.prototype.fill = Int16Array.prototype.fill || fillArray;
    Int32Array.prototype.fill = Int32Array.prototype.fill || fillArray;
    Uint8Array.prototype.fill = Uint8Array.prototype.fill || fillArray;
    Uint16Array.prototype.fill = Uint16Array.prototype.fill || fillArray;
    Uint32Array.prototype.fill = Uint32Array.prototype.fill || fillArray;
}();
var NeoMap = (function () {
    function NeoMap() {
        this._map = new Object();
        this._size = 0;
    }
    Object.defineProperty(NeoMap.prototype, "size", {
        get: function () { return this._size; },
        enumerable: true,
        configurable: true
    });
    NeoMap.prototype.clear = function () {
        for (var key in this._map)
            delete this._map[key];
        this._size = 0;
    };
    NeoMap.prototype.delete = function (key) {
        if (!this._map.hasOwnProperty(key))
            return false;
        this._size--;
        return delete this._map[key];
    };
    NeoMap.prototype.forEach = function (callback) {
        for (var key in this._map)
            callback(this._map[key], key, this);
    };
    NeoMap.prototype.get = function (key) {
        return this._map[key];
    };
    NeoMap.prototype.has = function (key) {
        return this._map.hasOwnProperty(key);
    };
    NeoMap.prototype.set = function (key, value) {
        if (!this._map.hasOwnProperty(key))
            this._size++;
        this._map[key] = value;
    };
    return NeoMap;
}());
var PromiseState;
(function (PromiseState) {
    PromiseState[PromiseState["pending"] = 0] = "pending";
    PromiseState[PromiseState["fulfilled"] = 1] = "fulfilled";
    PromiseState[PromiseState["rejected"] = 2] = "rejected";
})(PromiseState || (PromiseState = {}));
var NeoPromise = (function () {
    function NeoPromise(executor) {
        this._state = PromiseState.pending;
        this._callback_attached = false;
        if (executor != null)
            executor(this.resolve.bind(this), this.reject.bind(this));
    }
    NeoPromise.all = function (iterable) {
        return new NeoPromise(function (resolve, reject) {
            if (iterable.length == 0) {
                resolve([]);
                return;
            }
            var results = new Array(iterable.length);
            var rejected = false;
            var onFulfilled = function (result) {
                results[this._tag] = result;
                for (var i = 0; i < iterable.length; i++)
                    if (iterable[i]._state != PromiseState.fulfilled)
                        return;
                resolve(results);
            };
            var onRejected = function (reason) {
                if (!rejected) {
                    rejected = true;
                    reject(reason);
                }
            };
            for (var i = 0; i < iterable.length; i++) {
                iterable[i]._tag = i;
                iterable[i].then(onFulfilled, onRejected);
            }
        });
    };
    NeoPromise.prototype.catch = function (onrejected) {
        return this.then(null, onrejected);
    };
    NeoPromise.prototype.checkState = function () {
        if (this._state != PromiseState.pending && this._callback_attached) {
            var callback = this._state == PromiseState.fulfilled ? this._onFulfilled : this._onRejected;
            var arg = this._state == PromiseState.fulfilled ? this._value : this._reason;
            var value = void 0, reason = void 0;
            try {
                value = callback == null ? this : callback.call(this, arg);
            }
            catch (ex) {
                reason = ex;
            }
            if (this._next_promise == null) {
                if (reason != null)
                    return NeoPromise.reject(reason);
                else if (value instanceof NeoPromise)
                    return value;
                else
                    return NeoPromise.resolve(value);
            }
            else {
                if (reason != null)
                    this._next_promise.reject(reason);
                else if (value instanceof NeoPromise)
                    value.then(this.resolve.bind(this._next_promise), this.reject.bind(this._next_promise));
                else
                    this._next_promise.resolve(value);
            }
        }
    };
    NeoPromise.prototype.reject = function (reason) {
        this._state = PromiseState.rejected;
        this._reason = reason;
        this.checkState();
    };
    NeoPromise.reject = function (reason) {
        return new NeoPromise(function (resolve, reject) { return reject(reason); });
    };
    NeoPromise.prototype.resolve = function (value) {
        this._state = PromiseState.fulfilled;
        this._value = value;
        this.checkState();
    };
    NeoPromise.resolve = function (value) {
        if (value instanceof NeoPromise)
            return value;
        return new NeoPromise(function (resolve, reject) { return resolve(value); });
    };
    NeoPromise.prototype.then = function (onFulfilled, onRejected) {
        this._onFulfilled = onFulfilled;
        this._onRejected = onRejected;
        this._callback_attached = true;
        if (this._state == PromiseState.pending) {
            this._next_promise = new NeoPromise(null);
            return this._next_promise;
        }
        else {
            return this.checkState();
        }
    };
    return NeoPromise;
}());
var Neo;
(function (Neo) {
    var _zero;
    var Uint160 = (function (_super) {
        __extends(Uint160, _super);
        function Uint160(value) {
            var _this = this;
            if (value == null)
                value = new ArrayBuffer(20);
            if (value.byteLength != 20)
                throw new RangeError();
            _this = _super.call(this, new Uint32Array(value)) || this;
            return _this;
        }
        Object.defineProperty(Uint160, "Zero", {
            get: function () { return _zero || (_zero = new Uint160()); },
            enumerable: true,
            configurable: true
        });
        Uint160.parse = function (str) {
            if (str.length == 42)
                str = str.replace("0x", "");
            if (str.length != 40)
                throw new RangeError();
            var x = str.hexToBytes();
            var y = new Uint8Array(x.length);
            for (var i = 0; i < y.length; i++)
                y[i] = x[x.length - i - 1];
            return new Uint160(y.buffer);
        };
        return Uint160;
    }(Neo.UintVariable));
    Neo.Uint160 = Uint160;
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var _zero;
    var Uint256 = (function (_super) {
        __extends(Uint256, _super);
        function Uint256(value) {
            var _this = this;
            if (value == null)
                value = new ArrayBuffer(32);
            if (value.byteLength != 32)
                throw new RangeError();
            _this = _super.call(this, new Uint32Array(value)) || this;
            return _this;
        }
        Object.defineProperty(Uint256, "Zero", {
            get: function () { return _zero || (_zero = new Uint256()); },
            enumerable: true,
            configurable: true
        });
        Uint256.parse = function (str) {
            if (str.length != 64)
                throw new RangeError();
            var x = str.hexToBytes();
            var y = new Uint8Array(x.length);
            for (var i = 0; i < y.length; i++)
                y[i] = x[x.length - i - 1];
            return new Uint256(y.buffer);
        };
        return Uint256;
    }(Neo.UintVariable));
    Neo.Uint256 = Uint256;
})(Neo || (Neo = {}));
var ThinNeo;
(function (ThinNeo) {
    var contract = (function () {
        function contract() {
            this.parameters = [{ "name": "parameter0", "type": "Signature" }];
            this.deployed = false;
        }
        return contract;
    }());
    ThinNeo.contract = contract;
    var nep6account = (function () {
        function nep6account() {
        }
        nep6account.prototype.getPrivateKey = function (scrypt, password, callback) {
            var _this = this;
            var cb = function (i, r) {
                if (i == "finish") {
                    var bytes = r;
                    var pkey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(bytes);
                    var address = ThinNeo.Helper.GetAddressFromPublicKey(pkey);
                    if (address == _this.address) {
                        callback(i, r);
                    }
                    else {
                        callback("error", "checkerror");
                    }
                }
                else {
                    callback(i, r);
                }
            };
            ThinNeo.Helper.GetPrivateKeyFromNep2(this.nep2key, password, scrypt.N, scrypt.r, scrypt.p, cb);
        };
        return nep6account;
    }());
    ThinNeo.nep6account = nep6account;
    var nep6ScryptParameters = (function () {
        function nep6ScryptParameters() {
        }
        return nep6ScryptParameters;
    }());
    ThinNeo.nep6ScryptParameters = nep6ScryptParameters;
    var nep6wallet = (function () {
        function nep6wallet() {
        }
        nep6wallet.prototype.fromJsonStr = function (jsonstr) {
            var json = JSON.parse(jsonstr);
            this.scrypt = new nep6ScryptParameters();
            this.scrypt.N = json.scrypt.n;
            this.scrypt.r = json.scrypt.r;
            this.scrypt.p = json.scrypt.p;
            this.accounts = [];
            for (var i = 0; i < json.accounts.length; i++) {
                var acc = json.accounts[i];
                var localacc = new nep6account();
                localacc.address = acc.address;
                localacc.nep2key = acc.key;
                localacc.contract = acc.contract;
                if (localacc.contract == null || localacc.contract.script == null) {
                    localacc.nep2key = null;
                }
                else {
                    var ss = localacc.contract.script.hexToBytes();
                    if (ss.length != 35 || ss[0] != 33 || ss[34] != 172) {
                        localacc.nep2key = null;
                    }
                }
                if (acc.key == undefined)
                    localacc.nep2key = null;
                this.accounts.push(localacc);
            }
        };
        nep6wallet.prototype.toJson = function () {
            var obj = {};
            obj["name"] = null;
            obj["version"] = "1.0";
            obj["scrypt"] = {
                "n": this.scrypt.N,
                "r": this.scrypt.r,
                "p": this.scrypt.p
            };
            var accounts = [];
            for (var i = 0; i < this.accounts.length; i++) {
                var acc = this.accounts[0];
                var jsonacc = {};
                jsonacc["address"] = acc.address;
                jsonacc["label"] = null;
                jsonacc["isDefault"] = false;
                jsonacc["lock"] = false;
                jsonacc["key"] = acc.nep2key;
                jsonacc["extra"] = null;
                jsonacc["contract"] = acc.contract;
                accounts.push(jsonacc);
            }
            obj["accounts"] = accounts;
            obj["extra"] = null;
            return obj;
        };
        return nep6wallet;
    }());
    ThinNeo.nep6wallet = nep6wallet;
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var Base64 = (function () {
        function Base64() {
        }
        Base64.init = function () {
            if (Base64.binited)
                return;
            Base64.lookup = [];
            Base64.revLookup = [];
            for (var i = 0, len = Base64.code.length; i < len; ++i) {
                Base64.lookup[i] = Base64.code[i];
                Base64.revLookup[Base64.code.charCodeAt(i)] = i;
            }
            Base64.revLookup['-'.charCodeAt(0)] = 62;
            Base64.revLookup['_'.charCodeAt(0)] = 63;
            Base64.binited = true;
        };
        Base64.placeHoldersCount = function (b64) {
            var len = b64.length;
            if (len % 4 > 0) {
                throw new Error('Invalid string. Length must be a multiple of 4');
            }
            return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;
        };
        Base64.byteLength = function (b64) {
            return (b64.length * 3 / 4) - Base64.placeHoldersCount(b64);
        };
        Base64.toByteArray = function (b64) {
            Base64.init();
            var i, l, tmp, placeHolders, arr;
            var len = b64.length;
            placeHolders = Base64.placeHoldersCount(b64);
            arr = new Uint8Array((len * 3 / 4) - placeHolders);
            l = placeHolders > 0 ? len - 4 : len;
            var L = 0;
            for (i = 0; i < l; i += 4) {
                tmp = (Base64.revLookup[b64.charCodeAt(i)] << 18) | (Base64.revLookup[b64.charCodeAt(i + 1)] << 12) | (Base64.revLookup[b64.charCodeAt(i + 2)] << 6) | Base64.revLookup[b64.charCodeAt(i + 3)];
                arr[L++] = (tmp >> 16) & 0xFF;
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
            }
            if (placeHolders === 2) {
                tmp = (Base64.revLookup[b64.charCodeAt(i)] << 2) | (Base64.revLookup[b64.charCodeAt(i + 1)] >> 4);
                arr[L++] = tmp & 0xFF;
            }
            else if (placeHolders === 1) {
                tmp = (Base64.revLookup[b64.charCodeAt(i)] << 10) | (Base64.revLookup[b64.charCodeAt(i + 1)] << 4) | (Base64.revLookup[b64.charCodeAt(i + 2)] >> 2);
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
            }
            return arr;
        };
        Base64.tripletToBase64 = function (num) {
            return Base64.lookup[num >> 18 & 0x3F] + Base64.lookup[num >> 12 & 0x3F] + Base64.lookup[num >> 6 & 0x3F] + Base64.lookup[num & 0x3F];
        };
        Base64.encodeChunk = function (uint8, start, end) {
            var tmp;
            var output = [];
            for (var i = start; i < end; i += 3) {
                tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
                output.push(Base64.tripletToBase64(tmp));
            }
            return output.join('');
        };
        Base64.fromByteArray = function (uint8) {
            Base64.init();
            var tmp;
            var len = uint8.length;
            var extraBytes = len % 3;
            var output = '';
            var parts = [];
            var maxChunkLength = 16383;
            for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                parts.push(Base64.encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
            }
            if (extraBytes === 1) {
                tmp = uint8[len - 1];
                output += Base64.lookup[tmp >> 2];
                output += Base64.lookup[(tmp << 4) & 0x3F];
                output += '==';
            }
            else if (extraBytes === 2) {
                tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
                output += Base64.lookup[tmp >> 10];
                output += Base64.lookup[(tmp >> 4) & 0x3F];
                output += Base64.lookup[(tmp << 2) & 0x3F];
                output += '=';
            }
            parts.push(output);
            return parts.join('');
        };
        Base64.lookup = [];
        Base64.revLookup = [];
        Base64.code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        Base64.binited = false;
        return Base64;
    }());
    ThinNeo.Base64 = Base64;
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var scrypt_loaded = false;
    var Helper = (function () {
        function Helper() {
        }
        Helper.GetPrivateKeyFromWIF = function (wif) {
            if (wif == null)
                throw new Error("null wif");
            var data = Neo.Cryptography.Base58.decode(wif);
            if (data.length != 38 || data[0] != 0x80 || data[33] != 0x01)
                throw new Error("wif length or tag is error");
            var sum = data.subarray(data.length - 4, data.length);
            var realdata = data.subarray(0, data.length - 4);
            var _checksum = Neo.Cryptography.Sha256.computeHash(realdata);
            var checksum = new Uint8Array(Neo.Cryptography.Sha256.computeHash(_checksum));
            var sumcalc = checksum.subarray(0, 4);
            for (var i = 0; i < 4; i++) {
                if (sum[i] != sumcalc[i])
                    throw new Error("the sum is not match.");
            }
            var privateKey = data.subarray(1, 1 + 32);
            return privateKey;
        };
        Helper.GetWifFromPrivateKey = function (prikey) {
            var data = new Uint8Array(38);
            data[0] = 0x80;
            data[33] = 0x01;
            for (var i = 0; i < 32; i++) {
                data[i + 1] = prikey[i];
            }
            var realdata = data.subarray(0, data.length - 4);
            var _checksum = Neo.Cryptography.Sha256.computeHash(realdata);
            var checksum = new Uint8Array(Neo.Cryptography.Sha256.computeHash(_checksum));
            for (var i = 0; i < 4; i++) {
                data[34 + i] = checksum[i];
            }
            var wif = Neo.Cryptography.Base58.encode(data);
            return wif;
        };
        Helper.GetPublicKeyFromPrivateKey = function (privateKey) {
            var pkey = Neo.Cryptography.ECPoint.multiply(Neo.Cryptography.ECCurve.secp256r1.G, privateKey);
            return pkey.encodePoint(true);
        };
        Helper.Hash160 = function (data) {
            var hash1 = Neo.Cryptography.Sha256.computeHash(data);
            var hash2 = Neo.Cryptography.RIPEMD160.computeHash(hash1);
            return new Uint8Array(hash2);
        };
        Helper.GetAddressCheckScriptFromPublicKey = function (publicKey) {
            var script = new Uint8Array(publicKey.length + 2);
            script[0] = publicKey.length;
            for (var i = 0; i < publicKey.length; i++) {
                script[i + 1] = publicKey[i];
            }
            ;
            script[script.length - 1] = 172;
            return script;
        };
        Helper.GetPublicKeyScriptHashFromPublicKey = function (publicKey) {
            var script = Helper.GetAddressCheckScriptFromPublicKey(publicKey);
            var scripthash = Neo.Cryptography.Sha256.computeHash(script);
            scripthash = Neo.Cryptography.RIPEMD160.computeHash(scripthash);
            return new Uint8Array(scripthash);
        };
        Helper.GetScriptHashFromScript = function (script) {
            var scripthash = Neo.Cryptography.Sha256.computeHash(script);
            scripthash = Neo.Cryptography.RIPEMD160.computeHash(scripthash);
            return new Uint8Array(scripthash);
        };
        Helper.GetAddressFromScriptHash = function (scripthash) {
            var script_hash;
            if (scripthash instanceof Neo.Uint160) {
                script_hash = new Uint8Array(scripthash.bits.buffer);
            }
            else {
                script_hash = scripthash;
            }
            var data = new Uint8Array(script_hash.length + 1);
            data[0] = 0x17;
            for (var i = 0; i < script_hash.length; i++) {
                data[i + 1] = script_hash[i];
            }
            var hash = Neo.Cryptography.Sha256.computeHash(data);
            hash = Neo.Cryptography.Sha256.computeHash(hash);
            var hashu8 = new Uint8Array(hash, 0, 4);
            var alldata = new Uint8Array(data.length + 4);
            for (var i = 0; i < data.length; i++) {
                alldata[i] = data[i];
            }
            for (var i = 0; i < 4; i++) {
                alldata[data.length + i] = hashu8[i];
            }
            return Neo.Cryptography.Base58.encode(alldata);
        };
        Helper.GetAddressFromPublicKey = function (publicKey) {
            var scripthash = Helper.GetPublicKeyScriptHashFromPublicKey(publicKey);
            return Helper.GetAddressFromScriptHash(scripthash);
        };
        Helper.GetPublicKeyScriptHash_FromAddress = function (address) {
            var array = Neo.Cryptography.Base58.decode(address);
            var salt = array.subarray(0, 1);
            var hash = array.subarray(1, 1 + 20);
            var check = array.subarray(21, 21 + 4);
            var checkdata = array.subarray(0, 21);
            var hashd = Neo.Cryptography.Sha256.computeHash(checkdata);
            hashd = Neo.Cryptography.Sha256.computeHash(hashd);
            var hashd = hashd.slice(0, 4);
            var checked = new Uint8Array(hashd);
            for (var i = 0; i < 4; i++) {
                if (checked[i] != check[i]) {
                    throw new Error("the sum is not match.");
                }
            }
            return hash.clone();
        };
        Helper.Sign = function (message, privateKey) {
            var PublicKey = Neo.Cryptography.ECPoint.multiply(Neo.Cryptography.ECCurve.secp256r1.G, privateKey);
            var pubkey = PublicKey.encodePoint(false).subarray(1, 64);
            var key = new Neo.Cryptography.ECDsaCryptoKey(PublicKey, privateKey);
            var ecdsa = new Neo.Cryptography.ECDsa(key);
            {
                return new Uint8Array(ecdsa.sign(message));
            }
        };
        Helper.VerifySignature = function (message, signature, pubkey) {
            var PublicKey = Neo.Cryptography.ECPoint.decodePoint(pubkey, Neo.Cryptography.ECCurve.secp256r1);
            var usepk = PublicKey.encodePoint(false).subarray(1, 64);
            var key = new Neo.Cryptography.ECDsaCryptoKey(PublicKey);
            var ecdsa = new Neo.Cryptography.ECDsa(key);
            {
                return ecdsa.verify(message, signature);
            }
        };
        Helper.String2Bytes = function (str) {
            var back = [];
            var byteSize = 0;
            for (var i = 0; i < str.length; i++) {
                var code = str.charCodeAt(i);
                if (0x00 <= code && code <= 0x7f) {
                    byteSize += 1;
                    back.push(code);
                }
                else if (0x80 <= code && code <= 0x7ff) {
                    byteSize += 2;
                    back.push((192 | (31 & (code >> 6))));
                    back.push((128 | (63 & code)));
                }
                else if ((0x800 <= code && code <= 0xd7ff)
                    || (0xe000 <= code && code <= 0xffff)) {
                    byteSize += 3;
                    back.push((224 | (15 & (code >> 12))));
                    back.push((128 | (63 & (code >> 6))));
                    back.push((128 | (63 & code)));
                }
            }
            var uarr = new Uint8Array(back.length);
            for (i = 0; i < back.length; i++) {
                uarr[i] = back[i] & 0xff;
            }
            return uarr;
        };
        Helper.Bytes2String = function (_arr) {
            var UTF = '';
            for (var i = 0; i < _arr.length; i++) {
                var one = _arr[i].toString(2), v = one.match(/^1+?(?=0)/);
                if (v && one.length == 8) {
                    var bytesLength = v[0].length;
                    var store = _arr[i].toString(2).slice(7 - bytesLength);
                    for (var st = 1; st < bytesLength; st++) {
                        store += _arr[st + i].toString(2).slice(2);
                    }
                    UTF += String.fromCharCode(parseInt(store, 2));
                    i += bytesLength - 1;
                }
                else {
                    UTF += String.fromCharCode(_arr[i]);
                }
            }
            return UTF;
        };
        Helper.Aes256Encrypt = function (src, key) {
            var srcs = CryptoJS.enc.Utf8.parse(src);
            var keys = CryptoJS.enc.Utf8.parse(key);
            var encryptedkey = CryptoJS.AES.encrypt(srcs, keys, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.NoPadding
            });
            return encryptedkey.ciphertext.toString();
        };
        Helper.Aes256Encrypt_u8 = function (src, key) {
            var srcs = CryptoJS.enc.Utf8.parse("1234123412341234");
            srcs.sigBytes = src.length;
            srcs.words = new Array(src.length / 4);
            for (var i = 0; i < src.length / 4; i++) {
                srcs.words[i] = src[i * 4 + 3] + src[i * 4 + 2] * 256 + src[i * 4 + 1] * 256 * 256 + src[i * 4 + 0] * 256 * 256 * 256;
            }
            var keys = CryptoJS.enc.Utf8.parse("1234123412341234");
            keys.sigBytes = key.length;
            keys.words = new Array(key.length / 4);
            for (var i = 0; i < key.length / 4; i++) {
                keys.words[i] = key[i * 4 + 3] + key[i * 4 + 2] * 256 + key[i * 4 + 1] * 256 * 256 + key[i * 4 + 0] * 256 * 256 * 256;
            }
            var encryptedkey = CryptoJS.AES.encrypt(srcs, keys, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.NoPadding
            });
            var str = encryptedkey.ciphertext.toString();
            return str.hexToBytes();
        };
        Helper.Aes256Decrypt_u8 = function (encryptedkey, key) {
            var keys = CryptoJS.enc.Utf8.parse("1234123412341234");
            keys.sigBytes = key.length;
            keys.words = new Array(key.length / 4);
            for (var i = 0; i < key.length / 4; i++) {
                keys.words[i] = key[i * 4 + 3] + key[i * 4 + 2] * 256 + key[i * 4 + 1] * 256 * 256 + key[i * 4 + 0] * 256 * 256 * 256;
            }
            var base64key = ThinNeo.Base64.fromByteArray(encryptedkey);
            var srcs = CryptoJS.AES.decrypt(base64key, keys, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.NoPadding
            });
            var str = srcs.toString();
            return str.hexToBytes();
        };
        Helper.GetNep2FromPrivateKey = function (prikey, passphrase, n, r, p, callback) {
            if (n === void 0) { n = 16384; }
            if (r === void 0) { r = 8; }
            if (p === void 0) { p = 8; }
            var pp = scrypt.getAvailableMod();
            scrypt.setResPath('lib/asset');
            var addresshash = null;
            var ready = function () {
                var param = {
                    N: n,
                    r: r,
                    P: p
                };
                var opt = {
                    maxPassLen: 32,
                    maxSaltLen: 32,
                    maxDkLen: 64,
                    maxThread: 4
                };
                try {
                    scrypt.config(param, opt);
                }
                catch (err) {
                    console.warn('config err: ', err);
                }
            };
            scrypt.onload = function () {
                console.log("scrypt.onload");
                scrypt_loaded = true;
                ready();
            };
            scrypt.onerror = function (err) {
                console.warn('scrypt err:', err);
                callback("error", err);
            };
            scrypt.oncomplete = function (dk) {
                console.log('done', scrypt.binToHex(dk));
                var u8dk = new Uint8Array(dk);
                var derivedhalf1 = u8dk.subarray(0, 32);
                var derivedhalf2 = u8dk.subarray(32, 64);
                var u8xor = new Uint8Array(32);
                for (var i = 0; i < 32; i++) {
                    u8xor[i] = prikey[i] ^ derivedhalf1[i];
                }
                var encryptedkey = Helper.Aes256Encrypt_u8(u8xor, derivedhalf2);
                var buffer = new Uint8Array(39);
                buffer[0] = 0x01;
                buffer[1] = 0x42;
                buffer[2] = 0xe0;
                for (var i = 3; i < 3 + 4; i++) {
                    buffer[i] = addresshash[i - 3];
                }
                for (var i = 7; i < 32 + 7; i++) {
                    buffer[i] = encryptedkey[i - 7];
                }
                var b1 = Neo.Cryptography.Sha256.computeHash(buffer);
                b1 = Neo.Cryptography.Sha256.computeHash(b1);
                var u8hash = new Uint8Array(b1);
                var outbuf = new Uint8Array(39 + 4);
                for (var i = 0; i < 39; i++) {
                    outbuf[i] = buffer[i];
                }
                for (var i = 39; i < 39 + 4; i++) {
                    outbuf[i] = u8hash[i - 39];
                }
                var base58str = Neo.Cryptography.Base58.encode(outbuf);
                callback("finish", base58str);
            };
            scrypt.onprogress = function (percent) {
                console.log('onprogress');
            };
            scrypt.onready = function () {
                var pubkey = Helper.GetPublicKeyFromPrivateKey(prikey);
                var script_hash = Helper.GetPublicKeyScriptHashFromPublicKey(pubkey);
                var address = Helper.GetAddressFromScriptHash(script_hash);
                var addrbin = scrypt.strToBin(address);
                var b1 = Neo.Cryptography.Sha256.computeHash(addrbin);
                b1 = Neo.Cryptography.Sha256.computeHash(b1);
                var b2 = new Uint8Array(b1);
                addresshash = b2.subarray(0, 4);
                var passbin = scrypt.strToBin(passphrase);
                scrypt.hash(passbin, addresshash, 64);
            };
            if (scrypt_loaded == false) {
                scrypt.load("asmjs");
            }
            else {
                ready();
            }
            return;
        };
        Helper.GetPrivateKeyFromNep2 = function (nep2, passphrase, n, r, p, callback) {
            if (n === void 0) { n = 16384; }
            if (r === void 0) { r = 8; }
            if (p === void 0) { p = 8; }
            var data = Neo.Cryptography.Base58.decode(nep2);
            if (data.length != 39 + 4) {
                callback("error", "data.length error");
                return;
            }
            if (data[0] != 0x01 || data[1] != 0x42 || data[2] != 0xe0) {
                callback("error", "dataheader error");
                return;
            }
            var hash = data.subarray(39, 39 + 4);
            var buffer = data.subarray(0, 39);
            var b1 = Neo.Cryptography.Sha256.computeHash(buffer);
            b1 = Neo.Cryptography.Sha256.computeHash(b1);
            var u8hash = new Uint8Array(b1);
            for (var i = 0; i < 4; i++) {
                if (u8hash[i] != hash[i]) {
                    callback("error", "data hash error");
                    return;
                }
            }
            var addresshash = buffer.subarray(3, 3 + 4);
            var encryptedkey = buffer.subarray(7, 7 + 32);
            var pp = scrypt.getAvailableMod();
            scrypt.setResPath('lib/asset');
            var ready = function () {
                var param = {
                    N: n,
                    r: r,
                    P: p
                };
                var opt = {
                    maxPassLen: 32,
                    maxSaltLen: 32,
                    maxDkLen: 64,
                    maxThread: 4
                };
                try {
                    scrypt.config(param, opt);
                }
                catch (err) {
                    console.warn('config err: ', err);
                }
            };
            scrypt.onload = function () {
                console.log("scrypt.onload");
                scrypt_loaded = true;
                ready();
            };
            scrypt.oncomplete = function (dk) {
                console.log('done', scrypt.binToHex(dk));
                var u8dk = new Uint8Array(dk);
                var derivedhalf1 = u8dk.subarray(0, 32);
                var derivedhalf2 = u8dk.subarray(32, 64);
                var u8xor = Helper.Aes256Decrypt_u8(encryptedkey, derivedhalf2);
                var prikey = new Uint8Array(u8xor.length);
                for (var i = 0; i < 32; i++) {
                    prikey[i] = u8xor[i] ^ derivedhalf1[i];
                }
                var pubkey = Helper.GetPublicKeyFromPrivateKey(prikey);
                var script_hash = Helper.GetPublicKeyScriptHashFromPublicKey(pubkey);
                var address = Helper.GetAddressFromScriptHash(script_hash);
                var addrbin = scrypt.strToBin(address);
                var b1 = Neo.Cryptography.Sha256.computeHash(addrbin);
                b1 = Neo.Cryptography.Sha256.computeHash(b1);
                var b2 = new Uint8Array(b1);
                var addresshashgot = b2.subarray(0, 4);
                for (var i = 0; i < 4; i++) {
                    if (addresshash[i] != b2[i]) {
                        callback("error", "nep2 hash not match.");
                        return;
                    }
                }
                callback("finish", prikey);
            };
            scrypt.onerror = function (err) {
                console.warn('scrypt err:', err);
                callback("error", err);
            };
            scrypt.onprogress = function (percent) {
                console.log('onprogress');
            };
            scrypt.onready = function () {
                var passbin = scrypt.strToBin(passphrase);
                scrypt.hash(passbin, addresshash, 64);
            };
            if (scrypt_loaded == false) {
                scrypt.load("asmjs");
            }
            else {
                ready();
            }
        };
        return Helper;
    }());
    ThinNeo.Helper = Helper;
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var OpCode;
    (function (OpCode) {
        OpCode[OpCode["PUSH0"] = 0] = "PUSH0";
        OpCode[OpCode["PUSHF"] = 0] = "PUSHF";
        OpCode[OpCode["PUSHBYTES1"] = 1] = "PUSHBYTES1";
        OpCode[OpCode["PUSHBYTES75"] = 75] = "PUSHBYTES75";
        OpCode[OpCode["PUSHDATA1"] = 76] = "PUSHDATA1";
        OpCode[OpCode["PUSHDATA2"] = 77] = "PUSHDATA2";
        OpCode[OpCode["PUSHDATA4"] = 78] = "PUSHDATA4";
        OpCode[OpCode["PUSHM1"] = 79] = "PUSHM1";
        OpCode[OpCode["PUSH1"] = 81] = "PUSH1";
        OpCode[OpCode["PUSHT"] = 81] = "PUSHT";
        OpCode[OpCode["PUSH2"] = 82] = "PUSH2";
        OpCode[OpCode["PUSH3"] = 83] = "PUSH3";
        OpCode[OpCode["PUSH4"] = 84] = "PUSH4";
        OpCode[OpCode["PUSH5"] = 85] = "PUSH5";
        OpCode[OpCode["PUSH6"] = 86] = "PUSH6";
        OpCode[OpCode["PUSH7"] = 87] = "PUSH7";
        OpCode[OpCode["PUSH8"] = 88] = "PUSH8";
        OpCode[OpCode["PUSH9"] = 89] = "PUSH9";
        OpCode[OpCode["PUSH10"] = 90] = "PUSH10";
        OpCode[OpCode["PUSH11"] = 91] = "PUSH11";
        OpCode[OpCode["PUSH12"] = 92] = "PUSH12";
        OpCode[OpCode["PUSH13"] = 93] = "PUSH13";
        OpCode[OpCode["PUSH14"] = 94] = "PUSH14";
        OpCode[OpCode["PUSH15"] = 95] = "PUSH15";
        OpCode[OpCode["PUSH16"] = 96] = "PUSH16";
        OpCode[OpCode["NOP"] = 97] = "NOP";
        OpCode[OpCode["JMP"] = 98] = "JMP";
        OpCode[OpCode["JMPIF"] = 99] = "JMPIF";
        OpCode[OpCode["JMPIFNOT"] = 100] = "JMPIFNOT";
        OpCode[OpCode["CALL"] = 101] = "CALL";
        OpCode[OpCode["RET"] = 102] = "RET";
        OpCode[OpCode["APPCALL"] = 103] = "APPCALL";
        OpCode[OpCode["SYSCALL"] = 104] = "SYSCALL";
        OpCode[OpCode["TAILCALL"] = 105] = "TAILCALL";
        OpCode[OpCode["DUPFROMALTSTACK"] = 106] = "DUPFROMALTSTACK";
        OpCode[OpCode["TOALTSTACK"] = 107] = "TOALTSTACK";
        OpCode[OpCode["FROMALTSTACK"] = 108] = "FROMALTSTACK";
        OpCode[OpCode["XDROP"] = 109] = "XDROP";
        OpCode[OpCode["XSWAP"] = 114] = "XSWAP";
        OpCode[OpCode["XTUCK"] = 115] = "XTUCK";
        OpCode[OpCode["DEPTH"] = 116] = "DEPTH";
        OpCode[OpCode["DROP"] = 117] = "DROP";
        OpCode[OpCode["DUP"] = 118] = "DUP";
        OpCode[OpCode["NIP"] = 119] = "NIP";
        OpCode[OpCode["OVER"] = 120] = "OVER";
        OpCode[OpCode["PICK"] = 121] = "PICK";
        OpCode[OpCode["ROLL"] = 122] = "ROLL";
        OpCode[OpCode["ROT"] = 123] = "ROT";
        OpCode[OpCode["SWAP"] = 124] = "SWAP";
        OpCode[OpCode["TUCK"] = 125] = "TUCK";
        OpCode[OpCode["CAT"] = 126] = "CAT";
        OpCode[OpCode["SUBSTR"] = 127] = "SUBSTR";
        OpCode[OpCode["LEFT"] = 128] = "LEFT";
        OpCode[OpCode["RIGHT"] = 129] = "RIGHT";
        OpCode[OpCode["SIZE"] = 130] = "SIZE";
        OpCode[OpCode["INVERT"] = 131] = "INVERT";
        OpCode[OpCode["AND"] = 132] = "AND";
        OpCode[OpCode["OR"] = 133] = "OR";
        OpCode[OpCode["XOR"] = 134] = "XOR";
        OpCode[OpCode["EQUAL"] = 135] = "EQUAL";
        OpCode[OpCode["INC"] = 139] = "INC";
        OpCode[OpCode["DEC"] = 140] = "DEC";
        OpCode[OpCode["SIGN"] = 141] = "SIGN";
        OpCode[OpCode["NEGATE"] = 143] = "NEGATE";
        OpCode[OpCode["ABS"] = 144] = "ABS";
        OpCode[OpCode["NOT"] = 145] = "NOT";
        OpCode[OpCode["NZ"] = 146] = "NZ";
        OpCode[OpCode["ADD"] = 147] = "ADD";
        OpCode[OpCode["SUB"] = 148] = "SUB";
        OpCode[OpCode["MUL"] = 149] = "MUL";
        OpCode[OpCode["DIV"] = 150] = "DIV";
        OpCode[OpCode["MOD"] = 151] = "MOD";
        OpCode[OpCode["SHL"] = 152] = "SHL";
        OpCode[OpCode["SHR"] = 153] = "SHR";
        OpCode[OpCode["BOOLAND"] = 154] = "BOOLAND";
        OpCode[OpCode["BOOLOR"] = 155] = "BOOLOR";
        OpCode[OpCode["NUMEQUAL"] = 156] = "NUMEQUAL";
        OpCode[OpCode["NUMNOTEQUAL"] = 158] = "NUMNOTEQUAL";
        OpCode[OpCode["LT"] = 159] = "LT";
        OpCode[OpCode["GT"] = 160] = "GT";
        OpCode[OpCode["LTE"] = 161] = "LTE";
        OpCode[OpCode["GTE"] = 162] = "GTE";
        OpCode[OpCode["MIN"] = 163] = "MIN";
        OpCode[OpCode["MAX"] = 164] = "MAX";
        OpCode[OpCode["WITHIN"] = 165] = "WITHIN";
        OpCode[OpCode["SHA1"] = 167] = "SHA1";
        OpCode[OpCode["SHA256"] = 168] = "SHA256";
        OpCode[OpCode["HASH160"] = 169] = "HASH160";
        OpCode[OpCode["HASH256"] = 170] = "HASH256";
        OpCode[OpCode["CSHARPSTRHASH32"] = 171] = "CSHARPSTRHASH32";
        OpCode[OpCode["JAVAHASH32"] = 173] = "JAVAHASH32";
        OpCode[OpCode["CHECKSIG"] = 172] = "CHECKSIG";
        OpCode[OpCode["CHECKMULTISIG"] = 174] = "CHECKMULTISIG";
        OpCode[OpCode["ARRAYSIZE"] = 192] = "ARRAYSIZE";
        OpCode[OpCode["PACK"] = 193] = "PACK";
        OpCode[OpCode["UNPACK"] = 194] = "UNPACK";
        OpCode[OpCode["PICKITEM"] = 195] = "PICKITEM";
        OpCode[OpCode["SETITEM"] = 196] = "SETITEM";
        OpCode[OpCode["NEWARRAY"] = 197] = "NEWARRAY";
        OpCode[OpCode["NEWSTRUCT"] = 198] = "NEWSTRUCT";
        OpCode[OpCode["SWITCH"] = 208] = "SWITCH";
        OpCode[OpCode["THROW"] = 240] = "THROW";
        OpCode[OpCode["THROWIFNOT"] = 241] = "THROWIFNOT";
    })(OpCode = ThinNeo.OpCode || (ThinNeo.OpCode = {}));
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var VM;
    (function (VM) {
        var RandomAccessStack = (function () {
            function RandomAccessStack() {
                this.list = new Array();
            }
            Object.defineProperty(RandomAccessStack.prototype, "Count", {
                get: function () {
                    return this.list.length;
                },
                enumerable: true,
                configurable: true
            });
            RandomAccessStack.prototype.Clear = function () {
                this.list.splice(0, this.list.length);
            };
            RandomAccessStack.prototype.GetItem = function (index) {
                return this.list[index];
            };
            RandomAccessStack.prototype.Insert = function (index, item) {
                if (index > this.list.length)
                    throw new Error("InvalidOperationException");
                this.list.splice(this.list.length - index, 0, item);
            };
            RandomAccessStack.prototype.Peek = function (index) {
                if (index === void 0) { index = 0; }
                if (index >= this.list.length)
                    throw new Error("InvalidOperationException");
                return this.list[this.list.length - 1 - index];
            };
            RandomAccessStack.prototype.Pop = function () {
                return this.Remove(0);
            };
            RandomAccessStack.prototype.Push = function (item) {
                this.list.push(item);
            };
            RandomAccessStack.prototype.Remove = function (index) {
                if (index >= this.list.length)
                    throw new Error("InvalidOperationException");
                var item = this.list[this.list.length - index - 1];
                this.list.splice(this.list.length - index - 1, 1);
                return item;
            };
            RandomAccessStack.prototype.Set = function (index, item) {
                if (index >= this.list.length)
                    throw new Error("InvalidOperationException");
                this.list[this.list.length - index - 1] = item;
            };
            return RandomAccessStack;
        }());
        VM.RandomAccessStack = RandomAccessStack;
    })(VM = ThinNeo.VM || (ThinNeo.VM = {}));
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var ScriptBuilder = (function () {
        function ScriptBuilder() {
            this.Offset = 0;
            this.writer = [];
        }
        ScriptBuilder.prototype._WriteUint8 = function (num) {
            this.writer.push(num);
            this.Offset++;
        };
        ScriptBuilder.prototype._WriteUint16 = function (num) {
            var buf = new Uint8Array(2);
            var d = new DataView(buf.buffer, 0, 2);
            d.setUint16(0, num, true);
            this.writer.push(buf[0]);
            this.writer.push(buf[1]);
            this.Offset += 2;
        };
        ScriptBuilder.prototype._WriteUint32 = function (num) {
            var buf = new Uint8Array(4);
            var d = new DataView(buf.buffer, 0, 4);
            d.setUint32(0, num, true);
            this.writer.push(buf[0]);
            this.writer.push(buf[1]);
            this.writer.push(buf[2]);
            this.writer.push(buf[3]);
            this.Offset += 4;
        };
        ScriptBuilder.prototype._WriteUint8Array = function (nums) {
            for (var i = 0; i < nums.length; i++)
                this.writer.push(nums[i]);
            this.Offset += nums.length;
        };
        ScriptBuilder.prototype._ConvertInt16ToBytes = function (num) {
            var buf = new Uint8Array(2);
            var d = new DataView(buf.buffer, 0, 2);
            d.setInt16(0, num, true);
            return buf;
        };
        ScriptBuilder.prototype.Emit = function (op, arg) {
            if (arg === void 0) { arg = null; }
            this._WriteUint8(op);
            if (arg != null)
                this._WriteUint8Array(arg);
            return this;
        };
        ScriptBuilder.prototype.EmitAppCall = function (scriptHash, useTailCall) {
            if (useTailCall === void 0) { useTailCall = false; }
            var hash = null;
            if (scriptHash instanceof Neo.Uint160) {
                hash = new Uint8Array(scriptHash.bits.buffer);
            }
            else if (scriptHash.length != 20)
                throw new Error("error scriptHash length");
            else {
                hash = scriptHash;
            }
            return this.Emit(useTailCall ? ThinNeo.OpCode.TAILCALL : ThinNeo.OpCode.APPCALL, hash);
        };
        ScriptBuilder.prototype.EmitJump = function (op, offset) {
            if (op != ThinNeo.OpCode.JMP && op != ThinNeo.OpCode.JMPIF && op != ThinNeo.OpCode.JMPIFNOT && op != ThinNeo.OpCode.CALL)
                throw new Error("ArgumentException");
            return this.Emit(op, this._ConvertInt16ToBytes(offset));
        };
        ScriptBuilder.prototype.EmitPushNumber = function (number) {
            var i32 = number.toInt32();
            if (i32 == -1)
                return this.Emit(ThinNeo.OpCode.PUSHM1);
            if (i32 == 0)
                return this.Emit(ThinNeo.OpCode.PUSH0);
            if (i32 > 0 && i32 <= 16)
                return this.Emit(ThinNeo.OpCode.PUSH1 - 1 + i32);
            return this.EmitPushBytes(number.toUint8ArrayWithSign(true));
        };
        ScriptBuilder.prototype.EmitPushBool = function (data) {
            return this.Emit(data ? ThinNeo.OpCode.PUSHT : ThinNeo.OpCode.PUSHF);
        };
        ScriptBuilder.prototype.EmitPushBytes = function (data) {
            if (data == null)
                throw new Error("ArgumentNullException");
            if (data.length <= ThinNeo.OpCode.PUSHBYTES75) {
                this._WriteUint8(data.length);
                this._WriteUint8Array(data);
            }
            else if (data.length < 0x100) {
                this.Emit(ThinNeo.OpCode.PUSHDATA1);
                this._WriteUint8(data.length);
                this._WriteUint8Array(data);
            }
            else if (data.length < 0x10000) {
                this.Emit(ThinNeo.OpCode.PUSHDATA2);
                this._WriteUint16(data.length);
                this._WriteUint8Array(data);
            }
            else {
                this.Emit(ThinNeo.OpCode.PUSHDATA4);
                this._WriteUint32(data.length);
                this._WriteUint8Array(data);
            }
            return this;
        };
        ScriptBuilder.prototype.EmitPushString = function (data) {
            return this.EmitPushBytes(ThinNeo.Helper.String2Bytes(data));
        };
        ScriptBuilder.prototype.EmitSysCall = function (api) {
            if (api == null)
                throw new Error("ArgumentNullException");
            var api_bytes = ThinNeo.Helper.String2Bytes(api);
            if (api_bytes.length == 0 || api_bytes.length > 252)
                throw new Error("ArgumentException");
            var arg = new Uint8Array(api_bytes.length + 1);
            arg[0] = api_bytes.length;
            for (var i = 0; i < api_bytes.length; i++) {
                arg[i + 1] = api_bytes[i];
            }
            return this.Emit(ThinNeo.OpCode.SYSCALL, arg);
        };
        ScriptBuilder.prototype.ToArray = function () {
            var array = new Uint8Array(this.writer.length);
            for (var i = 0; i < this.writer.length; i++) {
                array[i] = this.writer[i];
            }
            return array;
        };
        ScriptBuilder.prototype.EmitParamJson = function (param) {
            if (typeof param === "number") {
                this.EmitPushNumber(new Neo.BigInteger(param));
            }
            else if (typeof param === "boolean") {
                this.EmitPushBool(param);
            }
            else if (typeof param === "object") {
                var list = param;
                for (var i = list.length - 1; i >= 0; i--) {
                    this.EmitParamJson(list[i]);
                }
                this.EmitPushNumber(new Neo.BigInteger(list.length));
                this.Emit(ThinNeo.OpCode.PACK);
            }
            else if (typeof param === "string") {
                var str = param;
                if (str[0] != '(')
                    throw new Error("must start with:(str) or (hex) or (hexrev) or (addr)or(int)");
                if (str.indexOf("(string)") == 0) {
                    this.EmitPushString(str.substr(8));
                }
                if (str.indexOf("(str)") == 0) {
                    this.EmitPushString(str.substr(5));
                }
                else if (str.indexOf("(bytes)") == 0) {
                    var hex = str.substr(7).hexToBytes();
                    this.EmitPushBytes(hex);
                }
                else if (str.indexOf("([])") == 0) {
                    var hex = str.substr(4).hexToBytes();
                    this.EmitPushBytes(hex);
                }
                else if (str.indexOf("(address)") == 0) {
                    var addr = (str.substr(9));
                    var hex = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(addr);
                    this.EmitPushBytes(hex);
                }
                else if (str.indexOf("(addr)") == 0) {
                    var addr = (str.substr(6));
                    var hex = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(addr);
                    this.EmitPushBytes(hex);
                }
                else if (str.indexOf("(integer)") == 0) {
                    var num = new Neo.BigInteger(str.substr(9));
                    this.EmitPushNumber(num);
                }
                else if (str.indexOf("(int)") == 0) {
                    var num = new Neo.BigInteger(str.substr(5));
                    this.EmitPushNumber(num);
                }
                else if (str.indexOf("(hexinteger)") == 0) {
                    var hex = str.substr(12).hexToBytes();
                    this.EmitPushBytes(hex.reverse());
                }
                else if (str.indexOf("(hexint)") == 0) {
                    var hex = str.substr(8).hexToBytes();
                    this.EmitPushBytes(hex.reverse());
                }
                else if (str.indexOf("(hex)") == 0) {
                    var hex = str.substr(5).hexToBytes();
                    this.EmitPushBytes(hex.reverse());
                }
                else if (str.indexOf("(int256)") == 0 || str.indexOf("(hex256)") == 0) {
                    var hex = str.substr(8).hexToBytes();
                    if (hex.length != 32)
                        throw new Error("not a int256");
                    this.EmitPushBytes(hex.reverse());
                }
                else if (str.indexOf("(int160)") == 0 || str.indexOf("(hex160)") == 0) {
                    var hex = str.substr(8).hexToBytes();
                    if (hex.length != 20)
                        throw new Error("not a int160");
                    this.EmitPushBytes(hex.reverse());
                }
                else
                    throw new Error("must start with:(str) or (hex) or (hexbig) or (addr) or(int)");
            }
            else {
                throw new Error("error type:" + typeof param);
            }
            return this;
        };
        return ScriptBuilder;
    }());
    ThinNeo.ScriptBuilder = ScriptBuilder;
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var TransactionType;
    (function (TransactionType) {
        TransactionType[TransactionType["MinerTransaction"] = 0] = "MinerTransaction";
        TransactionType[TransactionType["IssueTransaction"] = 1] = "IssueTransaction";
        TransactionType[TransactionType["ClaimTransaction"] = 2] = "ClaimTransaction";
        TransactionType[TransactionType["EnrollmentTransaction"] = 32] = "EnrollmentTransaction";
        TransactionType[TransactionType["RegisterTransaction"] = 64] = "RegisterTransaction";
        TransactionType[TransactionType["ContractTransaction"] = 128] = "ContractTransaction";
        TransactionType[TransactionType["PublishTransaction"] = 208] = "PublishTransaction";
        TransactionType[TransactionType["InvocationTransaction"] = 209] = "InvocationTransaction";
    })(TransactionType = ThinNeo.TransactionType || (ThinNeo.TransactionType = {}));
    var TransactionAttributeUsage;
    (function (TransactionAttributeUsage) {
        TransactionAttributeUsage[TransactionAttributeUsage["ContractHash"] = 0] = "ContractHash";
        TransactionAttributeUsage[TransactionAttributeUsage["ECDH02"] = 2] = "ECDH02";
        TransactionAttributeUsage[TransactionAttributeUsage["ECDH03"] = 3] = "ECDH03";
        TransactionAttributeUsage[TransactionAttributeUsage["Script"] = 32] = "Script";
        TransactionAttributeUsage[TransactionAttributeUsage["Vote"] = 48] = "Vote";
        TransactionAttributeUsage[TransactionAttributeUsage["DescriptionUrl"] = 129] = "DescriptionUrl";
        TransactionAttributeUsage[TransactionAttributeUsage["Description"] = 144] = "Description";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash1"] = 161] = "Hash1";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash2"] = 162] = "Hash2";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash3"] = 163] = "Hash3";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash4"] = 164] = "Hash4";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash5"] = 165] = "Hash5";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash6"] = 166] = "Hash6";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash7"] = 167] = "Hash7";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash8"] = 168] = "Hash8";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash9"] = 169] = "Hash9";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash10"] = 170] = "Hash10";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash11"] = 171] = "Hash11";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash12"] = 172] = "Hash12";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash13"] = 173] = "Hash13";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash14"] = 174] = "Hash14";
        TransactionAttributeUsage[TransactionAttributeUsage["Hash15"] = 175] = "Hash15";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark"] = 240] = "Remark";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark1"] = 241] = "Remark1";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark2"] = 242] = "Remark2";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark3"] = 243] = "Remark3";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark4"] = 244] = "Remark4";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark5"] = 245] = "Remark5";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark6"] = 246] = "Remark6";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark7"] = 247] = "Remark7";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark8"] = 248] = "Remark8";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark9"] = 249] = "Remark9";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark10"] = 250] = "Remark10";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark11"] = 251] = "Remark11";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark12"] = 252] = "Remark12";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark13"] = 253] = "Remark13";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark14"] = 254] = "Remark14";
        TransactionAttributeUsage[TransactionAttributeUsage["Remark15"] = 255] = "Remark15";
    })(TransactionAttributeUsage = ThinNeo.TransactionAttributeUsage || (ThinNeo.TransactionAttributeUsage = {}));
    var Attribute = (function () {
        function Attribute() {
        }
        return Attribute;
    }());
    ThinNeo.Attribute = Attribute;
    var TransactionOutput = (function () {
        function TransactionOutput() {
        }
        return TransactionOutput;
    }());
    ThinNeo.TransactionOutput = TransactionOutput;
    var TransactionInput = (function () {
        function TransactionInput() {
        }
        return TransactionInput;
    }());
    ThinNeo.TransactionInput = TransactionInput;
    var Witness = (function () {
        function Witness() {
        }
        Object.defineProperty(Witness.prototype, "Address", {
            get: function () {
                var hash = ThinNeo.Helper.GetScriptHashFromScript(this.VerificationScript);
                return ThinNeo.Helper.GetAddressFromScriptHash(hash);
            },
            enumerable: true,
            configurable: true
        });
        return Witness;
    }());
    ThinNeo.Witness = Witness;
    var InvokeTransData = (function () {
        function InvokeTransData() {
        }
        InvokeTransData.prototype.Serialize = function (trans, writer) {
            writer.writeVarBytes(this.script.buffer);
            if (trans.version >= 1) {
                writer.writeUint64(this.gas.getData());
            }
        };
        InvokeTransData.prototype.Deserialize = function (trans, reader) {
            var buf = reader.readVarBytes(10000000);
            this.script = new Uint8Array(buf, 0, buf.byteLength);
            if (trans.version >= 1) {
                this.gas = new Neo.Fixed8(reader.readUint64());
            }
        };
        return InvokeTransData;
    }());
    ThinNeo.InvokeTransData = InvokeTransData;
    var ClaimTransData = (function () {
        function ClaimTransData() {
        }
        ClaimTransData.prototype.Serialize = function (trans, writer) {
            writer.writeVarInt(this.claims.length);
            for (var i = 0; i < this.claims.length; i++) {
                writer.write(this.claims[i].hash, 0, 32);
                writer.writeUint16(this.claims[i].index);
            }
        };
        ClaimTransData.prototype.Deserialize = function (trans, reader) {
            var countClaims = reader.readVarInt();
            this.claims = [];
            for (var i = 0; i < countClaims; i++) {
                this.claims.push(new TransactionInput());
                var arr = reader.readBytes(32);
                this.claims[i].hash = new Uint8Array(arr, 0, arr.byteLength);
                this.claims[i].index = reader.readUint16();
            }
        };
        return ClaimTransData;
    }());
    ThinNeo.ClaimTransData = ClaimTransData;
    var MinerTransData = (function () {
        function MinerTransData() {
        }
        MinerTransData.prototype.Serialize = function (trans, writer) {
            writer.writeUint32(this.nonce);
        };
        MinerTransData.prototype.Deserialize = function (trans, reader) {
            this.nonce = reader.readUint32();
        };
        return MinerTransData;
    }());
    ThinNeo.MinerTransData = MinerTransData;
    var Transaction = (function () {
        function Transaction() {
        }
        Transaction.prototype.SerializeUnsigned = function (writer) {
            writer.writeByte(this.type);
            writer.writeByte(this.version);
            if (this.type == TransactionType.ContractTransaction ||
                this.type == TransactionType.IssueTransaction) {
            }
            else if (this.type == TransactionType.InvocationTransaction) {
                this.extdata.Serialize(this, writer);
            }
            else if (this.type == TransactionType.ClaimTransaction) {
                this.extdata.Serialize(this, writer);
            }
            else if (this.type == TransactionType.MinerTransaction) {
                this.extdata.Serialize(this, writer);
            }
            else {
                throw new Error("未编写针对这个交易类型的代码");
            }
            var countAttributes = this.attributes.length;
            writer.writeVarInt(countAttributes);
            for (var i = 0; i < countAttributes; i++) {
                var attributeData = this.attributes[i].data;
                var Usage = this.attributes[i].usage;
                writer.writeByte(Usage);
                if (Usage == TransactionAttributeUsage.ContractHash || Usage == TransactionAttributeUsage.Vote || (Usage >= TransactionAttributeUsage.Hash1 && Usage <= TransactionAttributeUsage.Hash15)) {
                    writer.write(attributeData.buffer, 0, 32);
                }
                else if (Usage == TransactionAttributeUsage.ECDH02 || Usage == TransactionAttributeUsage.ECDH03) {
                    writer.write(attributeData.buffer, 1, 32);
                }
                else if (Usage == TransactionAttributeUsage.Script) {
                    writer.write(attributeData.buffer, 0, 20);
                }
                else if (Usage == TransactionAttributeUsage.DescriptionUrl) {
                    var len = attributeData.length;
                    writer.writeByte(len);
                    writer.write(attributeData.buffer, 0, len);
                }
                else if (Usage == TransactionAttributeUsage.Description || Usage >= TransactionAttributeUsage.Remark) {
                    var len = attributeData.length;
                    writer.writeVarInt(len);
                    writer.write(attributeData.buffer, 0, len);
                }
                else
                    throw new Error();
            }
            var countInputs = this.inputs.length;
            writer.writeVarInt(countInputs);
            for (var i = 0; i < countInputs; i++) {
                writer.write(this.inputs[i].hash, 0, 32);
                writer.writeUint16(this.inputs[i].index);
            }
            var countOutputs = this.outputs.length;
            writer.writeVarInt(countOutputs);
            for (var i = 0; i < countOutputs; i++) {
                var item = this.outputs[i];
                writer.write(item.assetId.buffer, 0, 32);
                writer.writeUint64(item.value.getData());
                writer.write(item.toAddress.buffer, 0, 20);
            }
        };
        Transaction.prototype.Serialize = function (writer) {
            this.SerializeUnsigned(writer);
            var witnesscount = this.witnesses.length;
            writer.writeVarInt(witnesscount);
            for (var i = 0; i < witnesscount; i++) {
                var _witness = this.witnesses[i];
                writer.writeVarBytes(_witness.InvocationScript.buffer);
                writer.writeVarBytes(_witness.VerificationScript.buffer);
            }
        };
        Transaction.prototype.DeserializeUnsigned = function (ms) {
            this.type = ms.readByte();
            this.version = ms.readByte();
            if (this.type == TransactionType.ContractTransaction
                || this.type == TransactionType.IssueTransaction) {
                this.extdata = null;
            }
            else if (this.type == TransactionType.InvocationTransaction) {
                this.extdata = new InvokeTransData();
            }
            else if (this.type == TransactionType.ClaimTransaction) {
                this.extdata = new ClaimTransData();
            }
            else if (this.type == TransactionType.MinerTransaction) {
                this.extdata = new MinerTransData();
            }
            else {
                throw new Error("未编写针对这个交易类型的代码");
            }
            if (this.extdata != null) {
                this.extdata.Deserialize(this, ms);
            }
            var countAttributes = ms.readVarInt();
            this.attributes = [];
            for (var i = 0; i < countAttributes; i++) {
                var attributeData = null;
                var Usage = ms.readByte();
                if (Usage == TransactionAttributeUsage.ContractHash || Usage == TransactionAttributeUsage.Vote || (Usage >= TransactionAttributeUsage.Hash1 && Usage <= TransactionAttributeUsage.Hash15)) {
                    var arr = ms.readBytes(32);
                    attributeData = new Uint8Array(arr, 0, arr.byteLength);
                }
                else if (Usage == TransactionAttributeUsage.ECDH02 || Usage == TransactionAttributeUsage.ECDH03) {
                    var arr = ms.readBytes(32);
                    var data = new Uint8Array(arr, 0, arr.byteLength);
                    attributeData = new Uint8Array(33);
                    attributeData[0] = Usage;
                    for (var i = 0; i < 32; i++) {
                        attributeData[i + 1] = data[i];
                    }
                }
                else if (Usage == TransactionAttributeUsage.Script) {
                    var arr = ms.readBytes(20);
                    attributeData = new Uint8Array(arr, 0, arr.byteLength);
                }
                else if (Usage == TransactionAttributeUsage.DescriptionUrl) {
                    var len = ms.readByte();
                    var arr = ms.readBytes(len);
                    attributeData = new Uint8Array(arr, 0, arr.byteLength);
                }
                else if (Usage == TransactionAttributeUsage.Description || Usage >= TransactionAttributeUsage.Remark) {
                    var len = ms.readVarInt(65535);
                    var arr = ms.readBytes(len);
                    attributeData = new Uint8Array(arr, 0, arr.byteLength);
                }
                else
                    throw new Error();
                var attr = new Attribute();
                attr.usage = Usage;
                attr.data = attributeData;
                this.attributes.push(attr);
            }
            var countInputs = ms.readVarInt();
            this.inputs = [];
            for (var i = 0; i < countInputs; i++) {
                this.inputs.push(new TransactionInput());
                var arr = ms.readBytes(32);
                this.inputs[i].hash = new Uint8Array(arr, 0, arr.byteLength);
                this.inputs[i].index = ms.readUint16();
            }
            var countOutputs = ms.readVarInt();
            this.outputs = [];
            for (var i = 0; i < countOutputs; i++) {
                this.outputs.push(new TransactionOutput());
                var outp = this.outputs[i];
                var arr = ms.readBytes(32);
                var assetid = new Uint8Array(arr, 0, arr.byteLength);
                var value = new Neo.Fixed8(ms.readUint64());
                var arr = ms.readBytes(20);
                var scripthash = new Uint8Array(arr, 0, arr.byteLength);
                outp.assetId = assetid;
                outp.value = value;
                outp.toAddress = scripthash;
                this.outputs[i] = outp;
            }
        };
        Transaction.prototype.Deserialize = function (ms) {
            this.DeserializeUnsigned(ms);
            if (ms.canRead() > 0) {
                var witnesscount = ms.readVarInt();
                this.witnesses = [];
                for (var i = 0; i < witnesscount; i++) {
                    this.witnesses.push(new Witness());
                    this.witnesses[i].InvocationScript = new Uint8Array(ms.readVarBytes()).clone();
                    this.witnesses[i].VerificationScript = new Uint8Array(ms.readVarBytes()).clone();
                }
            }
        };
        Transaction.prototype.GetMessage = function () {
            var ms = new Neo.IO.MemoryStream();
            var writer = new Neo.IO.BinaryWriter(ms);
            this.SerializeUnsigned(writer);
            var arr = ms.toArray();
            var msg = new Uint8Array(arr, 0, arr.byteLength);
            return msg;
        };
        Transaction.prototype.GetRawData = function () {
            var ms = new Neo.IO.MemoryStream();
            var writer = new Neo.IO.BinaryWriter(ms);
            this.Serialize(writer);
            var arr = ms.toArray();
            var msg = new Uint8Array(arr, 0, arr.byteLength);
            return msg;
        };
        Transaction.prototype.AddWitness = function (signdata, pubkey, addrs) {
            {
                var msg = this.GetMessage();
                var bsign = ThinNeo.Helper.VerifySignature(msg, signdata, pubkey);
                if (bsign == false)
                    throw new Error("wrong sign");
                var addr = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                if (addr != addrs)
                    throw new Error("wrong script");
            }
            var vscript = ThinNeo.Helper.GetAddressCheckScriptFromPublicKey(pubkey);
            var sb = new ThinNeo.ScriptBuilder();
            sb.EmitPushBytes(signdata);
            var iscript = sb.ToArray();
            this.AddWitnessScript(vscript, iscript);
        };
        Transaction.prototype.AddWitnessScript = function (vscript, iscript) {
            var scripthash = ThinNeo.Helper.GetScriptHashFromScript(vscript);
            if (this.witnesses == null)
                this.witnesses = [];
            var newwit = new Witness();
            newwit.VerificationScript = vscript;
            newwit.InvocationScript = iscript;
            for (var i = 0; i < this.witnesses.length; i++) {
                if (this.witnesses[i].Address == newwit.Address)
                    throw new Error("alread have this witness");
            }
            var _witnesses;
            if (this.witnesses)
                _witnesses = this.witnesses;
            else
                _witnesses = [];
            _witnesses.push(newwit);
            _witnesses.sort(function (a, b) {
                var hash_a = ThinNeo.Helper.GetScriptHashFromScript(a.VerificationScript);
                var hash_b = ThinNeo.Helper.GetScriptHashFromScript(b.VerificationScript);
                for (var i_4 = (hash_a.length - 1); i_4 >= 0; i_4--) {
                    if (hash_a[i_4] > hash_b[i_4])
                        return 1;
                    if (hash_a[i_4] < hash_b[i_4])
                        return -1;
                }
                return 0;
            });
            this.witnesses = _witnesses;
        };
        Transaction.prototype.GetHash = function () {
            var msg = this.GetMessage();
            var data = Neo.Cryptography.Sha256.computeHash(msg);
            data = Neo.Cryptography.Sha256.computeHash(data);
            return new Uint8Array(data, 0, data.byteLength);
        };
        return Transaction;
    }());
    ThinNeo.Transaction = Transaction;
})(ThinNeo || (ThinNeo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var Aes = (function () {
            function Aes(key, iv) {
                this._Ke = [];
                this._Kd = [];
                this._lastCipherblock = new Uint8Array(16);
                var rounds = Aes.numberOfRounds[key.byteLength];
                if (rounds == null) {
                    throw new RangeError('invalid key size (must be length 16, 24 or 32)');
                }
                if (iv.byteLength != 16) {
                    throw new RangeError('initialation vector iv must be of length 16');
                }
                for (var i = 0; i <= rounds; i++) {
                    this._Ke.push([0, 0, 0, 0]);
                    this._Kd.push([0, 0, 0, 0]);
                }
                var roundKeyCount = (rounds + 1) * 4;
                var KC = key.byteLength / 4;
                var tk = Aes.convertToInt32(Uint8Array.fromArrayBuffer(key));
                var index;
                for (var i = 0; i < KC; i++) {
                    index = i >> 2;
                    this._Ke[index][i % 4] = tk[i];
                    this._Kd[rounds - index][i % 4] = tk[i];
                }
                var rconpointer = 0;
                var t = KC, tt;
                while (t < roundKeyCount) {
                    tt = tk[KC - 1];
                    tk[0] ^= ((Aes.S[(tt >> 16) & 0xFF] << 24) ^
                        (Aes.S[(tt >> 8) & 0xFF] << 16) ^
                        (Aes.S[tt & 0xFF] << 8) ^
                        Aes.S[(tt >> 24) & 0xFF] ^
                        (Aes.rcon[rconpointer] << 24));
                    rconpointer += 1;
                    if (KC != 8) {
                        for (var i = 1; i < KC; i++) {
                            tk[i] ^= tk[i - 1];
                        }
                    }
                    else {
                        for (var i = 1; i < (KC / 2); i++) {
                            tk[i] ^= tk[i - 1];
                        }
                        tt = tk[(KC / 2) - 1];
                        tk[KC / 2] ^= (Aes.S[tt & 0xFF] ^
                            (Aes.S[(tt >> 8) & 0xFF] << 8) ^
                            (Aes.S[(tt >> 16) & 0xFF] << 16) ^
                            (Aes.S[(tt >> 24) & 0xFF] << 24));
                        for (var i = (KC / 2) + 1; i < KC; i++) {
                            tk[i] ^= tk[i - 1];
                        }
                    }
                    var i = 0;
                    while (i < KC && t < roundKeyCount) {
                        var r_1 = t >> 2;
                        var c_1 = t % 4;
                        this._Ke[r_1][c_1] = tk[i];
                        this._Kd[rounds - r_1][c_1] = tk[i++];
                        t++;
                    }
                }
                for (var r = 1; r < rounds; r++) {
                    for (var c = 0; c < 4; c++) {
                        tt = this._Kd[r][c];
                        this._Kd[r][c] = (Aes.U1[(tt >> 24) & 0xFF] ^
                            Aes.U2[(tt >> 16) & 0xFF] ^
                            Aes.U3[(tt >> 8) & 0xFF] ^
                            Aes.U4[tt & 0xFF]);
                    }
                }
                this._lastCipherblock.set(Uint8Array.fromArrayBuffer(iv));
            }
            Object.defineProperty(Aes.prototype, "mode", {
                get: function () {
                    return "CBC";
                },
                enumerable: true,
                configurable: true
            });
            Aes.convertToInt32 = function (bytes) {
                var result = [];
                for (var i = 0; i < bytes.length; i += 4) {
                    result.push((bytes[i] << 24) |
                        (bytes[i + 1] << 16) |
                        (bytes[i + 2] << 8) |
                        bytes[i + 3]);
                }
                return result;
            };
            Aes.prototype.decrypt = function (ciphertext) {
                if (ciphertext.byteLength == 0 || ciphertext.byteLength % 16 != 0)
                    throw new RangeError();
                var plaintext = new Uint8Array(ciphertext.byteLength);
                var ciphertext_view = Uint8Array.fromArrayBuffer(ciphertext);
                for (var i = 0; i < ciphertext_view.length; i += 16)
                    this.decryptBlock(ciphertext_view.subarray(i, i + 16), plaintext.subarray(i, i + 16));
                return plaintext.buffer.slice(0, plaintext.length - plaintext[plaintext.length - 1]);
            };
            Aes.prototype.decryptBlock = function (ciphertext, plaintext) {
                if (ciphertext.length != 16 || plaintext.length != 16)
                    throw new RangeError();
                var rounds = this._Kd.length - 1;
                var a = [0, 0, 0, 0];
                var t = Aes.convertToInt32(ciphertext);
                for (var i = 0; i < 4; i++) {
                    t[i] ^= this._Kd[0][i];
                }
                for (var r = 1; r < rounds; r++) {
                    for (var i = 0; i < 4; i++) {
                        a[i] = (Aes.T5[(t[i] >> 24) & 0xff] ^
                            Aes.T6[(t[(i + 3) % 4] >> 16) & 0xff] ^
                            Aes.T7[(t[(i + 2) % 4] >> 8) & 0xff] ^
                            Aes.T8[t[(i + 1) % 4] & 0xff] ^
                            this._Kd[r][i]);
                    }
                    t = a.slice(0);
                }
                for (var i = 0; i < 4; i++) {
                    var tt = this._Kd[rounds][i];
                    plaintext[4 * i] = (Aes.Si[(t[i] >> 24) & 0xff] ^ (tt >> 24)) & 0xff;
                    plaintext[4 * i + 1] = (Aes.Si[(t[(i + 3) % 4] >> 16) & 0xff] ^ (tt >> 16)) & 0xff;
                    plaintext[4 * i + 2] = (Aes.Si[(t[(i + 2) % 4] >> 8) & 0xff] ^ (tt >> 8)) & 0xff;
                    plaintext[4 * i + 3] = (Aes.Si[t[(i + 1) % 4] & 0xff] ^ tt) & 0xff;
                }
                for (var i = 0; i < 16; i++) {
                    plaintext[i] ^= this._lastCipherblock[i];
                }
                Array.copy(ciphertext, 0, this._lastCipherblock, 0, ciphertext.length);
            };
            Aes.prototype.encrypt = function (plaintext) {
                var block_count = Math.ceil((plaintext.byteLength + 1) / 16);
                var ciphertext = new Uint8Array(block_count * 16);
                var plaintext_view = Uint8Array.fromArrayBuffer(plaintext);
                for (var i = 0; i < block_count - 1; i++)
                    this.encryptBlock(plaintext_view.subarray(i * 16, (i + 1) * 16), ciphertext.subarray(i * 16, (i + 1) * 16));
                var padding = ciphertext.length - plaintext.byteLength;
                var final_block = new Uint8Array(16);
                final_block.fill(padding);
                if (padding < 16)
                    Array.copy(plaintext_view, ciphertext.length - 16, final_block, 0, 16 - padding);
                this.encryptBlock(final_block, ciphertext.subarray(ciphertext.length - 16));
                return ciphertext.buffer;
            };
            Aes.prototype.encryptBlock = function (plaintext, ciphertext) {
                if (plaintext.length != 16 || ciphertext.length != 16)
                    throw new RangeError();
                var precipherblock = new Uint8Array(plaintext.length);
                for (var i = 0; i < precipherblock.length; i++) {
                    precipherblock[i] = plaintext[i] ^ this._lastCipherblock[i];
                }
                var rounds = this._Ke.length - 1;
                var a = [0, 0, 0, 0];
                var t = Aes.convertToInt32(precipherblock);
                for (var i = 0; i < 4; i++) {
                    t[i] ^= this._Ke[0][i];
                }
                for (var r = 1; r < rounds; r++) {
                    for (var i = 0; i < 4; i++) {
                        a[i] = (Aes.T1[(t[i] >> 24) & 0xff] ^
                            Aes.T2[(t[(i + 1) % 4] >> 16) & 0xff] ^
                            Aes.T3[(t[(i + 2) % 4] >> 8) & 0xff] ^
                            Aes.T4[t[(i + 3) % 4] & 0xff] ^
                            this._Ke[r][i]);
                    }
                    t = a.slice(0);
                }
                for (var i = 0; i < 4; i++) {
                    var tt = this._Ke[rounds][i];
                    ciphertext[4 * i] = (Aes.S[(t[i] >> 24) & 0xff] ^ (tt >> 24)) & 0xff;
                    ciphertext[4 * i + 1] = (Aes.S[(t[(i + 1) % 4] >> 16) & 0xff] ^ (tt >> 16)) & 0xff;
                    ciphertext[4 * i + 2] = (Aes.S[(t[(i + 2) % 4] >> 8) & 0xff] ^ (tt >> 8)) & 0xff;
                    ciphertext[4 * i + 3] = (Aes.S[t[(i + 3) % 4] & 0xff] ^ tt) & 0xff;
                }
                Array.copy(ciphertext, 0, this._lastCipherblock, 0, ciphertext.length);
            };
            Aes.numberOfRounds = { 16: 10, 24: 12, 32: 14 };
            Aes.rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91];
            Aes.S = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16];
            Aes.Si = [0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb, 0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb, 0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e, 0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25, 0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92, 0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84, 0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06, 0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b, 0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73, 0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e, 0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b, 0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4, 0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f, 0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef, 0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61, 0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d];
            Aes.T1 = [0xc66363a5, 0xf87c7c84, 0xee777799, 0xf67b7b8d, 0xfff2f20d, 0xd66b6bbd, 0xde6f6fb1, 0x91c5c554, 0x60303050, 0x02010103, 0xce6767a9, 0x562b2b7d, 0xe7fefe19, 0xb5d7d762, 0x4dababe6, 0xec76769a, 0x8fcaca45, 0x1f82829d, 0x89c9c940, 0xfa7d7d87, 0xeffafa15, 0xb25959eb, 0x8e4747c9, 0xfbf0f00b, 0x41adadec, 0xb3d4d467, 0x5fa2a2fd, 0x45afafea, 0x239c9cbf, 0x53a4a4f7, 0xe4727296, 0x9bc0c05b, 0x75b7b7c2, 0xe1fdfd1c, 0x3d9393ae, 0x4c26266a, 0x6c36365a, 0x7e3f3f41, 0xf5f7f702, 0x83cccc4f, 0x6834345c, 0x51a5a5f4, 0xd1e5e534, 0xf9f1f108, 0xe2717193, 0xabd8d873, 0x62313153, 0x2a15153f, 0x0804040c, 0x95c7c752, 0x46232365, 0x9dc3c35e, 0x30181828, 0x379696a1, 0x0a05050f, 0x2f9a9ab5, 0x0e070709, 0x24121236, 0x1b80809b, 0xdfe2e23d, 0xcdebeb26, 0x4e272769, 0x7fb2b2cd, 0xea75759f, 0x1209091b, 0x1d83839e, 0x582c2c74, 0x341a1a2e, 0x361b1b2d, 0xdc6e6eb2, 0xb45a5aee, 0x5ba0a0fb, 0xa45252f6, 0x763b3b4d, 0xb7d6d661, 0x7db3b3ce, 0x5229297b, 0xdde3e33e, 0x5e2f2f71, 0x13848497, 0xa65353f5, 0xb9d1d168, 0x00000000, 0xc1eded2c, 0x40202060, 0xe3fcfc1f, 0x79b1b1c8, 0xb65b5bed, 0xd46a6abe, 0x8dcbcb46, 0x67bebed9, 0x7239394b, 0x944a4ade, 0x984c4cd4, 0xb05858e8, 0x85cfcf4a, 0xbbd0d06b, 0xc5efef2a, 0x4faaaae5, 0xedfbfb16, 0x864343c5, 0x9a4d4dd7, 0x66333355, 0x11858594, 0x8a4545cf, 0xe9f9f910, 0x04020206, 0xfe7f7f81, 0xa05050f0, 0x783c3c44, 0x259f9fba, 0x4ba8a8e3, 0xa25151f3, 0x5da3a3fe, 0x804040c0, 0x058f8f8a, 0x3f9292ad, 0x219d9dbc, 0x70383848, 0xf1f5f504, 0x63bcbcdf, 0x77b6b6c1, 0xafdada75, 0x42212163, 0x20101030, 0xe5ffff1a, 0xfdf3f30e, 0xbfd2d26d, 0x81cdcd4c, 0x180c0c14, 0x26131335, 0xc3ecec2f, 0xbe5f5fe1, 0x359797a2, 0x884444cc, 0x2e171739, 0x93c4c457, 0x55a7a7f2, 0xfc7e7e82, 0x7a3d3d47, 0xc86464ac, 0xba5d5de7, 0x3219192b, 0xe6737395, 0xc06060a0, 0x19818198, 0x9e4f4fd1, 0xa3dcdc7f, 0x44222266, 0x542a2a7e, 0x3b9090ab, 0x0b888883, 0x8c4646ca, 0xc7eeee29, 0x6bb8b8d3, 0x2814143c, 0xa7dede79, 0xbc5e5ee2, 0x160b0b1d, 0xaddbdb76, 0xdbe0e03b, 0x64323256, 0x743a3a4e, 0x140a0a1e, 0x924949db, 0x0c06060a, 0x4824246c, 0xb85c5ce4, 0x9fc2c25d, 0xbdd3d36e, 0x43acacef, 0xc46262a6, 0x399191a8, 0x319595a4, 0xd3e4e437, 0xf279798b, 0xd5e7e732, 0x8bc8c843, 0x6e373759, 0xda6d6db7, 0x018d8d8c, 0xb1d5d564, 0x9c4e4ed2, 0x49a9a9e0, 0xd86c6cb4, 0xac5656fa, 0xf3f4f407, 0xcfeaea25, 0xca6565af, 0xf47a7a8e, 0x47aeaee9, 0x10080818, 0x6fbabad5, 0xf0787888, 0x4a25256f, 0x5c2e2e72, 0x381c1c24, 0x57a6a6f1, 0x73b4b4c7, 0x97c6c651, 0xcbe8e823, 0xa1dddd7c, 0xe874749c, 0x3e1f1f21, 0x964b4bdd, 0x61bdbddc, 0x0d8b8b86, 0x0f8a8a85, 0xe0707090, 0x7c3e3e42, 0x71b5b5c4, 0xcc6666aa, 0x904848d8, 0x06030305, 0xf7f6f601, 0x1c0e0e12, 0xc26161a3, 0x6a35355f, 0xae5757f9, 0x69b9b9d0, 0x17868691, 0x99c1c158, 0x3a1d1d27, 0x279e9eb9, 0xd9e1e138, 0xebf8f813, 0x2b9898b3, 0x22111133, 0xd26969bb, 0xa9d9d970, 0x078e8e89, 0x339494a7, 0x2d9b9bb6, 0x3c1e1e22, 0x15878792, 0xc9e9e920, 0x87cece49, 0xaa5555ff, 0x50282878, 0xa5dfdf7a, 0x038c8c8f, 0x59a1a1f8, 0x09898980, 0x1a0d0d17, 0x65bfbfda, 0xd7e6e631, 0x844242c6, 0xd06868b8, 0x824141c3, 0x299999b0, 0x5a2d2d77, 0x1e0f0f11, 0x7bb0b0cb, 0xa85454fc, 0x6dbbbbd6, 0x2c16163a];
            Aes.T2 = [0xa5c66363, 0x84f87c7c, 0x99ee7777, 0x8df67b7b, 0x0dfff2f2, 0xbdd66b6b, 0xb1de6f6f, 0x5491c5c5, 0x50603030, 0x03020101, 0xa9ce6767, 0x7d562b2b, 0x19e7fefe, 0x62b5d7d7, 0xe64dabab, 0x9aec7676, 0x458fcaca, 0x9d1f8282, 0x4089c9c9, 0x87fa7d7d, 0x15effafa, 0xebb25959, 0xc98e4747, 0x0bfbf0f0, 0xec41adad, 0x67b3d4d4, 0xfd5fa2a2, 0xea45afaf, 0xbf239c9c, 0xf753a4a4, 0x96e47272, 0x5b9bc0c0, 0xc275b7b7, 0x1ce1fdfd, 0xae3d9393, 0x6a4c2626, 0x5a6c3636, 0x417e3f3f, 0x02f5f7f7, 0x4f83cccc, 0x5c683434, 0xf451a5a5, 0x34d1e5e5, 0x08f9f1f1, 0x93e27171, 0x73abd8d8, 0x53623131, 0x3f2a1515, 0x0c080404, 0x5295c7c7, 0x65462323, 0x5e9dc3c3, 0x28301818, 0xa1379696, 0x0f0a0505, 0xb52f9a9a, 0x090e0707, 0x36241212, 0x9b1b8080, 0x3ddfe2e2, 0x26cdebeb, 0x694e2727, 0xcd7fb2b2, 0x9fea7575, 0x1b120909, 0x9e1d8383, 0x74582c2c, 0x2e341a1a, 0x2d361b1b, 0xb2dc6e6e, 0xeeb45a5a, 0xfb5ba0a0, 0xf6a45252, 0x4d763b3b, 0x61b7d6d6, 0xce7db3b3, 0x7b522929, 0x3edde3e3, 0x715e2f2f, 0x97138484, 0xf5a65353, 0x68b9d1d1, 0x00000000, 0x2cc1eded, 0x60402020, 0x1fe3fcfc, 0xc879b1b1, 0xedb65b5b, 0xbed46a6a, 0x468dcbcb, 0xd967bebe, 0x4b723939, 0xde944a4a, 0xd4984c4c, 0xe8b05858, 0x4a85cfcf, 0x6bbbd0d0, 0x2ac5efef, 0xe54faaaa, 0x16edfbfb, 0xc5864343, 0xd79a4d4d, 0x55663333, 0x94118585, 0xcf8a4545, 0x10e9f9f9, 0x06040202, 0x81fe7f7f, 0xf0a05050, 0x44783c3c, 0xba259f9f, 0xe34ba8a8, 0xf3a25151, 0xfe5da3a3, 0xc0804040, 0x8a058f8f, 0xad3f9292, 0xbc219d9d, 0x48703838, 0x04f1f5f5, 0xdf63bcbc, 0xc177b6b6, 0x75afdada, 0x63422121, 0x30201010, 0x1ae5ffff, 0x0efdf3f3, 0x6dbfd2d2, 0x4c81cdcd, 0x14180c0c, 0x35261313, 0x2fc3ecec, 0xe1be5f5f, 0xa2359797, 0xcc884444, 0x392e1717, 0x5793c4c4, 0xf255a7a7, 0x82fc7e7e, 0x477a3d3d, 0xacc86464, 0xe7ba5d5d, 0x2b321919, 0x95e67373, 0xa0c06060, 0x98198181, 0xd19e4f4f, 0x7fa3dcdc, 0x66442222, 0x7e542a2a, 0xab3b9090, 0x830b8888, 0xca8c4646, 0x29c7eeee, 0xd36bb8b8, 0x3c281414, 0x79a7dede, 0xe2bc5e5e, 0x1d160b0b, 0x76addbdb, 0x3bdbe0e0, 0x56643232, 0x4e743a3a, 0x1e140a0a, 0xdb924949, 0x0a0c0606, 0x6c482424, 0xe4b85c5c, 0x5d9fc2c2, 0x6ebdd3d3, 0xef43acac, 0xa6c46262, 0xa8399191, 0xa4319595, 0x37d3e4e4, 0x8bf27979, 0x32d5e7e7, 0x438bc8c8, 0x596e3737, 0xb7da6d6d, 0x8c018d8d, 0x64b1d5d5, 0xd29c4e4e, 0xe049a9a9, 0xb4d86c6c, 0xfaac5656, 0x07f3f4f4, 0x25cfeaea, 0xafca6565, 0x8ef47a7a, 0xe947aeae, 0x18100808, 0xd56fbaba, 0x88f07878, 0x6f4a2525, 0x725c2e2e, 0x24381c1c, 0xf157a6a6, 0xc773b4b4, 0x5197c6c6, 0x23cbe8e8, 0x7ca1dddd, 0x9ce87474, 0x213e1f1f, 0xdd964b4b, 0xdc61bdbd, 0x860d8b8b, 0x850f8a8a, 0x90e07070, 0x427c3e3e, 0xc471b5b5, 0xaacc6666, 0xd8904848, 0x05060303, 0x01f7f6f6, 0x121c0e0e, 0xa3c26161, 0x5f6a3535, 0xf9ae5757, 0xd069b9b9, 0x91178686, 0x5899c1c1, 0x273a1d1d, 0xb9279e9e, 0x38d9e1e1, 0x13ebf8f8, 0xb32b9898, 0x33221111, 0xbbd26969, 0x70a9d9d9, 0x89078e8e, 0xa7339494, 0xb62d9b9b, 0x223c1e1e, 0x92158787, 0x20c9e9e9, 0x4987cece, 0xffaa5555, 0x78502828, 0x7aa5dfdf, 0x8f038c8c, 0xf859a1a1, 0x80098989, 0x171a0d0d, 0xda65bfbf, 0x31d7e6e6, 0xc6844242, 0xb8d06868, 0xc3824141, 0xb0299999, 0x775a2d2d, 0x111e0f0f, 0xcb7bb0b0, 0xfca85454, 0xd66dbbbb, 0x3a2c1616];
            Aes.T3 = [0x63a5c663, 0x7c84f87c, 0x7799ee77, 0x7b8df67b, 0xf20dfff2, 0x6bbdd66b, 0x6fb1de6f, 0xc55491c5, 0x30506030, 0x01030201, 0x67a9ce67, 0x2b7d562b, 0xfe19e7fe, 0xd762b5d7, 0xabe64dab, 0x769aec76, 0xca458fca, 0x829d1f82, 0xc94089c9, 0x7d87fa7d, 0xfa15effa, 0x59ebb259, 0x47c98e47, 0xf00bfbf0, 0xadec41ad, 0xd467b3d4, 0xa2fd5fa2, 0xafea45af, 0x9cbf239c, 0xa4f753a4, 0x7296e472, 0xc05b9bc0, 0xb7c275b7, 0xfd1ce1fd, 0x93ae3d93, 0x266a4c26, 0x365a6c36, 0x3f417e3f, 0xf702f5f7, 0xcc4f83cc, 0x345c6834, 0xa5f451a5, 0xe534d1e5, 0xf108f9f1, 0x7193e271, 0xd873abd8, 0x31536231, 0x153f2a15, 0x040c0804, 0xc75295c7, 0x23654623, 0xc35e9dc3, 0x18283018, 0x96a13796, 0x050f0a05, 0x9ab52f9a, 0x07090e07, 0x12362412, 0x809b1b80, 0xe23ddfe2, 0xeb26cdeb, 0x27694e27, 0xb2cd7fb2, 0x759fea75, 0x091b1209, 0x839e1d83, 0x2c74582c, 0x1a2e341a, 0x1b2d361b, 0x6eb2dc6e, 0x5aeeb45a, 0xa0fb5ba0, 0x52f6a452, 0x3b4d763b, 0xd661b7d6, 0xb3ce7db3, 0x297b5229, 0xe33edde3, 0x2f715e2f, 0x84971384, 0x53f5a653, 0xd168b9d1, 0x00000000, 0xed2cc1ed, 0x20604020, 0xfc1fe3fc, 0xb1c879b1, 0x5bedb65b, 0x6abed46a, 0xcb468dcb, 0xbed967be, 0x394b7239, 0x4ade944a, 0x4cd4984c, 0x58e8b058, 0xcf4a85cf, 0xd06bbbd0, 0xef2ac5ef, 0xaae54faa, 0xfb16edfb, 0x43c58643, 0x4dd79a4d, 0x33556633, 0x85941185, 0x45cf8a45, 0xf910e9f9, 0x02060402, 0x7f81fe7f, 0x50f0a050, 0x3c44783c, 0x9fba259f, 0xa8e34ba8, 0x51f3a251, 0xa3fe5da3, 0x40c08040, 0x8f8a058f, 0x92ad3f92, 0x9dbc219d, 0x38487038, 0xf504f1f5, 0xbcdf63bc, 0xb6c177b6, 0xda75afda, 0x21634221, 0x10302010, 0xff1ae5ff, 0xf30efdf3, 0xd26dbfd2, 0xcd4c81cd, 0x0c14180c, 0x13352613, 0xec2fc3ec, 0x5fe1be5f, 0x97a23597, 0x44cc8844, 0x17392e17, 0xc45793c4, 0xa7f255a7, 0x7e82fc7e, 0x3d477a3d, 0x64acc864, 0x5de7ba5d, 0x192b3219, 0x7395e673, 0x60a0c060, 0x81981981, 0x4fd19e4f, 0xdc7fa3dc, 0x22664422, 0x2a7e542a, 0x90ab3b90, 0x88830b88, 0x46ca8c46, 0xee29c7ee, 0xb8d36bb8, 0x143c2814, 0xde79a7de, 0x5ee2bc5e, 0x0b1d160b, 0xdb76addb, 0xe03bdbe0, 0x32566432, 0x3a4e743a, 0x0a1e140a, 0x49db9249, 0x060a0c06, 0x246c4824, 0x5ce4b85c, 0xc25d9fc2, 0xd36ebdd3, 0xacef43ac, 0x62a6c462, 0x91a83991, 0x95a43195, 0xe437d3e4, 0x798bf279, 0xe732d5e7, 0xc8438bc8, 0x37596e37, 0x6db7da6d, 0x8d8c018d, 0xd564b1d5, 0x4ed29c4e, 0xa9e049a9, 0x6cb4d86c, 0x56faac56, 0xf407f3f4, 0xea25cfea, 0x65afca65, 0x7a8ef47a, 0xaee947ae, 0x08181008, 0xbad56fba, 0x7888f078, 0x256f4a25, 0x2e725c2e, 0x1c24381c, 0xa6f157a6, 0xb4c773b4, 0xc65197c6, 0xe823cbe8, 0xdd7ca1dd, 0x749ce874, 0x1f213e1f, 0x4bdd964b, 0xbddc61bd, 0x8b860d8b, 0x8a850f8a, 0x7090e070, 0x3e427c3e, 0xb5c471b5, 0x66aacc66, 0x48d89048, 0x03050603, 0xf601f7f6, 0x0e121c0e, 0x61a3c261, 0x355f6a35, 0x57f9ae57, 0xb9d069b9, 0x86911786, 0xc15899c1, 0x1d273a1d, 0x9eb9279e, 0xe138d9e1, 0xf813ebf8, 0x98b32b98, 0x11332211, 0x69bbd269, 0xd970a9d9, 0x8e89078e, 0x94a73394, 0x9bb62d9b, 0x1e223c1e, 0x87921587, 0xe920c9e9, 0xce4987ce, 0x55ffaa55, 0x28785028, 0xdf7aa5df, 0x8c8f038c, 0xa1f859a1, 0x89800989, 0x0d171a0d, 0xbfda65bf, 0xe631d7e6, 0x42c68442, 0x68b8d068, 0x41c38241, 0x99b02999, 0x2d775a2d, 0x0f111e0f, 0xb0cb7bb0, 0x54fca854, 0xbbd66dbb, 0x163a2c16];
            Aes.T4 = [0x6363a5c6, 0x7c7c84f8, 0x777799ee, 0x7b7b8df6, 0xf2f20dff, 0x6b6bbdd6, 0x6f6fb1de, 0xc5c55491, 0x30305060, 0x01010302, 0x6767a9ce, 0x2b2b7d56, 0xfefe19e7, 0xd7d762b5, 0xababe64d, 0x76769aec, 0xcaca458f, 0x82829d1f, 0xc9c94089, 0x7d7d87fa, 0xfafa15ef, 0x5959ebb2, 0x4747c98e, 0xf0f00bfb, 0xadadec41, 0xd4d467b3, 0xa2a2fd5f, 0xafafea45, 0x9c9cbf23, 0xa4a4f753, 0x727296e4, 0xc0c05b9b, 0xb7b7c275, 0xfdfd1ce1, 0x9393ae3d, 0x26266a4c, 0x36365a6c, 0x3f3f417e, 0xf7f702f5, 0xcccc4f83, 0x34345c68, 0xa5a5f451, 0xe5e534d1, 0xf1f108f9, 0x717193e2, 0xd8d873ab, 0x31315362, 0x15153f2a, 0x04040c08, 0xc7c75295, 0x23236546, 0xc3c35e9d, 0x18182830, 0x9696a137, 0x05050f0a, 0x9a9ab52f, 0x0707090e, 0x12123624, 0x80809b1b, 0xe2e23ddf, 0xebeb26cd, 0x2727694e, 0xb2b2cd7f, 0x75759fea, 0x09091b12, 0x83839e1d, 0x2c2c7458, 0x1a1a2e34, 0x1b1b2d36, 0x6e6eb2dc, 0x5a5aeeb4, 0xa0a0fb5b, 0x5252f6a4, 0x3b3b4d76, 0xd6d661b7, 0xb3b3ce7d, 0x29297b52, 0xe3e33edd, 0x2f2f715e, 0x84849713, 0x5353f5a6, 0xd1d168b9, 0x00000000, 0xeded2cc1, 0x20206040, 0xfcfc1fe3, 0xb1b1c879, 0x5b5bedb6, 0x6a6abed4, 0xcbcb468d, 0xbebed967, 0x39394b72, 0x4a4ade94, 0x4c4cd498, 0x5858e8b0, 0xcfcf4a85, 0xd0d06bbb, 0xefef2ac5, 0xaaaae54f, 0xfbfb16ed, 0x4343c586, 0x4d4dd79a, 0x33335566, 0x85859411, 0x4545cf8a, 0xf9f910e9, 0x02020604, 0x7f7f81fe, 0x5050f0a0, 0x3c3c4478, 0x9f9fba25, 0xa8a8e34b, 0x5151f3a2, 0xa3a3fe5d, 0x4040c080, 0x8f8f8a05, 0x9292ad3f, 0x9d9dbc21, 0x38384870, 0xf5f504f1, 0xbcbcdf63, 0xb6b6c177, 0xdada75af, 0x21216342, 0x10103020, 0xffff1ae5, 0xf3f30efd, 0xd2d26dbf, 0xcdcd4c81, 0x0c0c1418, 0x13133526, 0xecec2fc3, 0x5f5fe1be, 0x9797a235, 0x4444cc88, 0x1717392e, 0xc4c45793, 0xa7a7f255, 0x7e7e82fc, 0x3d3d477a, 0x6464acc8, 0x5d5de7ba, 0x19192b32, 0x737395e6, 0x6060a0c0, 0x81819819, 0x4f4fd19e, 0xdcdc7fa3, 0x22226644, 0x2a2a7e54, 0x9090ab3b, 0x8888830b, 0x4646ca8c, 0xeeee29c7, 0xb8b8d36b, 0x14143c28, 0xdede79a7, 0x5e5ee2bc, 0x0b0b1d16, 0xdbdb76ad, 0xe0e03bdb, 0x32325664, 0x3a3a4e74, 0x0a0a1e14, 0x4949db92, 0x06060a0c, 0x24246c48, 0x5c5ce4b8, 0xc2c25d9f, 0xd3d36ebd, 0xacacef43, 0x6262a6c4, 0x9191a839, 0x9595a431, 0xe4e437d3, 0x79798bf2, 0xe7e732d5, 0xc8c8438b, 0x3737596e, 0x6d6db7da, 0x8d8d8c01, 0xd5d564b1, 0x4e4ed29c, 0xa9a9e049, 0x6c6cb4d8, 0x5656faac, 0xf4f407f3, 0xeaea25cf, 0x6565afca, 0x7a7a8ef4, 0xaeaee947, 0x08081810, 0xbabad56f, 0x787888f0, 0x25256f4a, 0x2e2e725c, 0x1c1c2438, 0xa6a6f157, 0xb4b4c773, 0xc6c65197, 0xe8e823cb, 0xdddd7ca1, 0x74749ce8, 0x1f1f213e, 0x4b4bdd96, 0xbdbddc61, 0x8b8b860d, 0x8a8a850f, 0x707090e0, 0x3e3e427c, 0xb5b5c471, 0x6666aacc, 0x4848d890, 0x03030506, 0xf6f601f7, 0x0e0e121c, 0x6161a3c2, 0x35355f6a, 0x5757f9ae, 0xb9b9d069, 0x86869117, 0xc1c15899, 0x1d1d273a, 0x9e9eb927, 0xe1e138d9, 0xf8f813eb, 0x9898b32b, 0x11113322, 0x6969bbd2, 0xd9d970a9, 0x8e8e8907, 0x9494a733, 0x9b9bb62d, 0x1e1e223c, 0x87879215, 0xe9e920c9, 0xcece4987, 0x5555ffaa, 0x28287850, 0xdfdf7aa5, 0x8c8c8f03, 0xa1a1f859, 0x89898009, 0x0d0d171a, 0xbfbfda65, 0xe6e631d7, 0x4242c684, 0x6868b8d0, 0x4141c382, 0x9999b029, 0x2d2d775a, 0x0f0f111e, 0xb0b0cb7b, 0x5454fca8, 0xbbbbd66d, 0x16163a2c];
            Aes.T5 = [0x51f4a750, 0x7e416553, 0x1a17a4c3, 0x3a275e96, 0x3bab6bcb, 0x1f9d45f1, 0xacfa58ab, 0x4be30393, 0x2030fa55, 0xad766df6, 0x88cc7691, 0xf5024c25, 0x4fe5d7fc, 0xc52acbd7, 0x26354480, 0xb562a38f, 0xdeb15a49, 0x25ba1b67, 0x45ea0e98, 0x5dfec0e1, 0xc32f7502, 0x814cf012, 0x8d4697a3, 0x6bd3f9c6, 0x038f5fe7, 0x15929c95, 0xbf6d7aeb, 0x955259da, 0xd4be832d, 0x587421d3, 0x49e06929, 0x8ec9c844, 0x75c2896a, 0xf48e7978, 0x99583e6b, 0x27b971dd, 0xbee14fb6, 0xf088ad17, 0xc920ac66, 0x7dce3ab4, 0x63df4a18, 0xe51a3182, 0x97513360, 0x62537f45, 0xb16477e0, 0xbb6bae84, 0xfe81a01c, 0xf9082b94, 0x70486858, 0x8f45fd19, 0x94de6c87, 0x527bf8b7, 0xab73d323, 0x724b02e2, 0xe31f8f57, 0x6655ab2a, 0xb2eb2807, 0x2fb5c203, 0x86c57b9a, 0xd33708a5, 0x302887f2, 0x23bfa5b2, 0x02036aba, 0xed16825c, 0x8acf1c2b, 0xa779b492, 0xf307f2f0, 0x4e69e2a1, 0x65daf4cd, 0x0605bed5, 0xd134621f, 0xc4a6fe8a, 0x342e539d, 0xa2f355a0, 0x058ae132, 0xa4f6eb75, 0x0b83ec39, 0x4060efaa, 0x5e719f06, 0xbd6e1051, 0x3e218af9, 0x96dd063d, 0xdd3e05ae, 0x4de6bd46, 0x91548db5, 0x71c45d05, 0x0406d46f, 0x605015ff, 0x1998fb24, 0xd6bde997, 0x894043cc, 0x67d99e77, 0xb0e842bd, 0x07898b88, 0xe7195b38, 0x79c8eedb, 0xa17c0a47, 0x7c420fe9, 0xf8841ec9, 0x00000000, 0x09808683, 0x322bed48, 0x1e1170ac, 0x6c5a724e, 0xfd0efffb, 0x0f853856, 0x3daed51e, 0x362d3927, 0x0a0fd964, 0x685ca621, 0x9b5b54d1, 0x24362e3a, 0x0c0a67b1, 0x9357e70f, 0xb4ee96d2, 0x1b9b919e, 0x80c0c54f, 0x61dc20a2, 0x5a774b69, 0x1c121a16, 0xe293ba0a, 0xc0a02ae5, 0x3c22e043, 0x121b171d, 0x0e090d0b, 0xf28bc7ad, 0x2db6a8b9, 0x141ea9c8, 0x57f11985, 0xaf75074c, 0xee99ddbb, 0xa37f60fd, 0xf701269f, 0x5c72f5bc, 0x44663bc5, 0x5bfb7e34, 0x8b432976, 0xcb23c6dc, 0xb6edfc68, 0xb8e4f163, 0xd731dcca, 0x42638510, 0x13972240, 0x84c61120, 0x854a247d, 0xd2bb3df8, 0xaef93211, 0xc729a16d, 0x1d9e2f4b, 0xdcb230f3, 0x0d8652ec, 0x77c1e3d0, 0x2bb3166c, 0xa970b999, 0x119448fa, 0x47e96422, 0xa8fc8cc4, 0xa0f03f1a, 0x567d2cd8, 0x223390ef, 0x87494ec7, 0xd938d1c1, 0x8ccaa2fe, 0x98d40b36, 0xa6f581cf, 0xa57ade28, 0xdab78e26, 0x3fadbfa4, 0x2c3a9de4, 0x5078920d, 0x6a5fcc9b, 0x547e4662, 0xf68d13c2, 0x90d8b8e8, 0x2e39f75e, 0x82c3aff5, 0x9f5d80be, 0x69d0937c, 0x6fd52da9, 0xcf2512b3, 0xc8ac993b, 0x10187da7, 0xe89c636e, 0xdb3bbb7b, 0xcd267809, 0x6e5918f4, 0xec9ab701, 0x834f9aa8, 0xe6956e65, 0xaaffe67e, 0x21bccf08, 0xef15e8e6, 0xbae79bd9, 0x4a6f36ce, 0xea9f09d4, 0x29b07cd6, 0x31a4b2af, 0x2a3f2331, 0xc6a59430, 0x35a266c0, 0x744ebc37, 0xfc82caa6, 0xe090d0b0, 0x33a7d815, 0xf104984a, 0x41ecdaf7, 0x7fcd500e, 0x1791f62f, 0x764dd68d, 0x43efb04d, 0xccaa4d54, 0xe49604df, 0x9ed1b5e3, 0x4c6a881b, 0xc12c1fb8, 0x4665517f, 0x9d5eea04, 0x018c355d, 0xfa877473, 0xfb0b412e, 0xb3671d5a, 0x92dbd252, 0xe9105633, 0x6dd64713, 0x9ad7618c, 0x37a10c7a, 0x59f8148e, 0xeb133c89, 0xcea927ee, 0xb761c935, 0xe11ce5ed, 0x7a47b13c, 0x9cd2df59, 0x55f2733f, 0x1814ce79, 0x73c737bf, 0x53f7cdea, 0x5ffdaa5b, 0xdf3d6f14, 0x7844db86, 0xcaaff381, 0xb968c43e, 0x3824342c, 0xc2a3405f, 0x161dc372, 0xbce2250c, 0x283c498b, 0xff0d9541, 0x39a80171, 0x080cb3de, 0xd8b4e49c, 0x6456c190, 0x7bcb8461, 0xd532b670, 0x486c5c74, 0xd0b85742];
            Aes.T6 = [0x5051f4a7, 0x537e4165, 0xc31a17a4, 0x963a275e, 0xcb3bab6b, 0xf11f9d45, 0xabacfa58, 0x934be303, 0x552030fa, 0xf6ad766d, 0x9188cc76, 0x25f5024c, 0xfc4fe5d7, 0xd7c52acb, 0x80263544, 0x8fb562a3, 0x49deb15a, 0x6725ba1b, 0x9845ea0e, 0xe15dfec0, 0x02c32f75, 0x12814cf0, 0xa38d4697, 0xc66bd3f9, 0xe7038f5f, 0x9515929c, 0xebbf6d7a, 0xda955259, 0x2dd4be83, 0xd3587421, 0x2949e069, 0x448ec9c8, 0x6a75c289, 0x78f48e79, 0x6b99583e, 0xdd27b971, 0xb6bee14f, 0x17f088ad, 0x66c920ac, 0xb47dce3a, 0x1863df4a, 0x82e51a31, 0x60975133, 0x4562537f, 0xe0b16477, 0x84bb6bae, 0x1cfe81a0, 0x94f9082b, 0x58704868, 0x198f45fd, 0x8794de6c, 0xb7527bf8, 0x23ab73d3, 0xe2724b02, 0x57e31f8f, 0x2a6655ab, 0x07b2eb28, 0x032fb5c2, 0x9a86c57b, 0xa5d33708, 0xf2302887, 0xb223bfa5, 0xba02036a, 0x5ced1682, 0x2b8acf1c, 0x92a779b4, 0xf0f307f2, 0xa14e69e2, 0xcd65daf4, 0xd50605be, 0x1fd13462, 0x8ac4a6fe, 0x9d342e53, 0xa0a2f355, 0x32058ae1, 0x75a4f6eb, 0x390b83ec, 0xaa4060ef, 0x065e719f, 0x51bd6e10, 0xf93e218a, 0x3d96dd06, 0xaedd3e05, 0x464de6bd, 0xb591548d, 0x0571c45d, 0x6f0406d4, 0xff605015, 0x241998fb, 0x97d6bde9, 0xcc894043, 0x7767d99e, 0xbdb0e842, 0x8807898b, 0x38e7195b, 0xdb79c8ee, 0x47a17c0a, 0xe97c420f, 0xc9f8841e, 0x00000000, 0x83098086, 0x48322bed, 0xac1e1170, 0x4e6c5a72, 0xfbfd0eff, 0x560f8538, 0x1e3daed5, 0x27362d39, 0x640a0fd9, 0x21685ca6, 0xd19b5b54, 0x3a24362e, 0xb10c0a67, 0x0f9357e7, 0xd2b4ee96, 0x9e1b9b91, 0x4f80c0c5, 0xa261dc20, 0x695a774b, 0x161c121a, 0x0ae293ba, 0xe5c0a02a, 0x433c22e0, 0x1d121b17, 0x0b0e090d, 0xadf28bc7, 0xb92db6a8, 0xc8141ea9, 0x8557f119, 0x4caf7507, 0xbbee99dd, 0xfda37f60, 0x9ff70126, 0xbc5c72f5, 0xc544663b, 0x345bfb7e, 0x768b4329, 0xdccb23c6, 0x68b6edfc, 0x63b8e4f1, 0xcad731dc, 0x10426385, 0x40139722, 0x2084c611, 0x7d854a24, 0xf8d2bb3d, 0x11aef932, 0x6dc729a1, 0x4b1d9e2f, 0xf3dcb230, 0xec0d8652, 0xd077c1e3, 0x6c2bb316, 0x99a970b9, 0xfa119448, 0x2247e964, 0xc4a8fc8c, 0x1aa0f03f, 0xd8567d2c, 0xef223390, 0xc787494e, 0xc1d938d1, 0xfe8ccaa2, 0x3698d40b, 0xcfa6f581, 0x28a57ade, 0x26dab78e, 0xa43fadbf, 0xe42c3a9d, 0x0d507892, 0x9b6a5fcc, 0x62547e46, 0xc2f68d13, 0xe890d8b8, 0x5e2e39f7, 0xf582c3af, 0xbe9f5d80, 0x7c69d093, 0xa96fd52d, 0xb3cf2512, 0x3bc8ac99, 0xa710187d, 0x6ee89c63, 0x7bdb3bbb, 0x09cd2678, 0xf46e5918, 0x01ec9ab7, 0xa8834f9a, 0x65e6956e, 0x7eaaffe6, 0x0821bccf, 0xe6ef15e8, 0xd9bae79b, 0xce4a6f36, 0xd4ea9f09, 0xd629b07c, 0xaf31a4b2, 0x312a3f23, 0x30c6a594, 0xc035a266, 0x37744ebc, 0xa6fc82ca, 0xb0e090d0, 0x1533a7d8, 0x4af10498, 0xf741ecda, 0x0e7fcd50, 0x2f1791f6, 0x8d764dd6, 0x4d43efb0, 0x54ccaa4d, 0xdfe49604, 0xe39ed1b5, 0x1b4c6a88, 0xb8c12c1f, 0x7f466551, 0x049d5eea, 0x5d018c35, 0x73fa8774, 0x2efb0b41, 0x5ab3671d, 0x5292dbd2, 0x33e91056, 0x136dd647, 0x8c9ad761, 0x7a37a10c, 0x8e59f814, 0x89eb133c, 0xeecea927, 0x35b761c9, 0xede11ce5, 0x3c7a47b1, 0x599cd2df, 0x3f55f273, 0x791814ce, 0xbf73c737, 0xea53f7cd, 0x5b5ffdaa, 0x14df3d6f, 0x867844db, 0x81caaff3, 0x3eb968c4, 0x2c382434, 0x5fc2a340, 0x72161dc3, 0x0cbce225, 0x8b283c49, 0x41ff0d95, 0x7139a801, 0xde080cb3, 0x9cd8b4e4, 0x906456c1, 0x617bcb84, 0x70d532b6, 0x74486c5c, 0x42d0b857];
            Aes.T7 = [0xa75051f4, 0x65537e41, 0xa4c31a17, 0x5e963a27, 0x6bcb3bab, 0x45f11f9d, 0x58abacfa, 0x03934be3, 0xfa552030, 0x6df6ad76, 0x769188cc, 0x4c25f502, 0xd7fc4fe5, 0xcbd7c52a, 0x44802635, 0xa38fb562, 0x5a49deb1, 0x1b6725ba, 0x0e9845ea, 0xc0e15dfe, 0x7502c32f, 0xf012814c, 0x97a38d46, 0xf9c66bd3, 0x5fe7038f, 0x9c951592, 0x7aebbf6d, 0x59da9552, 0x832dd4be, 0x21d35874, 0x692949e0, 0xc8448ec9, 0x896a75c2, 0x7978f48e, 0x3e6b9958, 0x71dd27b9, 0x4fb6bee1, 0xad17f088, 0xac66c920, 0x3ab47dce, 0x4a1863df, 0x3182e51a, 0x33609751, 0x7f456253, 0x77e0b164, 0xae84bb6b, 0xa01cfe81, 0x2b94f908, 0x68587048, 0xfd198f45, 0x6c8794de, 0xf8b7527b, 0xd323ab73, 0x02e2724b, 0x8f57e31f, 0xab2a6655, 0x2807b2eb, 0xc2032fb5, 0x7b9a86c5, 0x08a5d337, 0x87f23028, 0xa5b223bf, 0x6aba0203, 0x825ced16, 0x1c2b8acf, 0xb492a779, 0xf2f0f307, 0xe2a14e69, 0xf4cd65da, 0xbed50605, 0x621fd134, 0xfe8ac4a6, 0x539d342e, 0x55a0a2f3, 0xe132058a, 0xeb75a4f6, 0xec390b83, 0xefaa4060, 0x9f065e71, 0x1051bd6e, 0x8af93e21, 0x063d96dd, 0x05aedd3e, 0xbd464de6, 0x8db59154, 0x5d0571c4, 0xd46f0406, 0x15ff6050, 0xfb241998, 0xe997d6bd, 0x43cc8940, 0x9e7767d9, 0x42bdb0e8, 0x8b880789, 0x5b38e719, 0xeedb79c8, 0x0a47a17c, 0x0fe97c42, 0x1ec9f884, 0x00000000, 0x86830980, 0xed48322b, 0x70ac1e11, 0x724e6c5a, 0xfffbfd0e, 0x38560f85, 0xd51e3dae, 0x3927362d, 0xd9640a0f, 0xa621685c, 0x54d19b5b, 0x2e3a2436, 0x67b10c0a, 0xe70f9357, 0x96d2b4ee, 0x919e1b9b, 0xc54f80c0, 0x20a261dc, 0x4b695a77, 0x1a161c12, 0xba0ae293, 0x2ae5c0a0, 0xe0433c22, 0x171d121b, 0x0d0b0e09, 0xc7adf28b, 0xa8b92db6, 0xa9c8141e, 0x198557f1, 0x074caf75, 0xddbbee99, 0x60fda37f, 0x269ff701, 0xf5bc5c72, 0x3bc54466, 0x7e345bfb, 0x29768b43, 0xc6dccb23, 0xfc68b6ed, 0xf163b8e4, 0xdccad731, 0x85104263, 0x22401397, 0x112084c6, 0x247d854a, 0x3df8d2bb, 0x3211aef9, 0xa16dc729, 0x2f4b1d9e, 0x30f3dcb2, 0x52ec0d86, 0xe3d077c1, 0x166c2bb3, 0xb999a970, 0x48fa1194, 0x642247e9, 0x8cc4a8fc, 0x3f1aa0f0, 0x2cd8567d, 0x90ef2233, 0x4ec78749, 0xd1c1d938, 0xa2fe8cca, 0x0b3698d4, 0x81cfa6f5, 0xde28a57a, 0x8e26dab7, 0xbfa43fad, 0x9de42c3a, 0x920d5078, 0xcc9b6a5f, 0x4662547e, 0x13c2f68d, 0xb8e890d8, 0xf75e2e39, 0xaff582c3, 0x80be9f5d, 0x937c69d0, 0x2da96fd5, 0x12b3cf25, 0x993bc8ac, 0x7da71018, 0x636ee89c, 0xbb7bdb3b, 0x7809cd26, 0x18f46e59, 0xb701ec9a, 0x9aa8834f, 0x6e65e695, 0xe67eaaff, 0xcf0821bc, 0xe8e6ef15, 0x9bd9bae7, 0x36ce4a6f, 0x09d4ea9f, 0x7cd629b0, 0xb2af31a4, 0x23312a3f, 0x9430c6a5, 0x66c035a2, 0xbc37744e, 0xcaa6fc82, 0xd0b0e090, 0xd81533a7, 0x984af104, 0xdaf741ec, 0x500e7fcd, 0xf62f1791, 0xd68d764d, 0xb04d43ef, 0x4d54ccaa, 0x04dfe496, 0xb5e39ed1, 0x881b4c6a, 0x1fb8c12c, 0x517f4665, 0xea049d5e, 0x355d018c, 0x7473fa87, 0x412efb0b, 0x1d5ab367, 0xd25292db, 0x5633e910, 0x47136dd6, 0x618c9ad7, 0x0c7a37a1, 0x148e59f8, 0x3c89eb13, 0x27eecea9, 0xc935b761, 0xe5ede11c, 0xb13c7a47, 0xdf599cd2, 0x733f55f2, 0xce791814, 0x37bf73c7, 0xcdea53f7, 0xaa5b5ffd, 0x6f14df3d, 0xdb867844, 0xf381caaf, 0xc43eb968, 0x342c3824, 0x405fc2a3, 0xc372161d, 0x250cbce2, 0x498b283c, 0x9541ff0d, 0x017139a8, 0xb3de080c, 0xe49cd8b4, 0xc1906456, 0x84617bcb, 0xb670d532, 0x5c74486c, 0x5742d0b8];
            Aes.T8 = [0xf4a75051, 0x4165537e, 0x17a4c31a, 0x275e963a, 0xab6bcb3b, 0x9d45f11f, 0xfa58abac, 0xe303934b, 0x30fa5520, 0x766df6ad, 0xcc769188, 0x024c25f5, 0xe5d7fc4f, 0x2acbd7c5, 0x35448026, 0x62a38fb5, 0xb15a49de, 0xba1b6725, 0xea0e9845, 0xfec0e15d, 0x2f7502c3, 0x4cf01281, 0x4697a38d, 0xd3f9c66b, 0x8f5fe703, 0x929c9515, 0x6d7aebbf, 0x5259da95, 0xbe832dd4, 0x7421d358, 0xe0692949, 0xc9c8448e, 0xc2896a75, 0x8e7978f4, 0x583e6b99, 0xb971dd27, 0xe14fb6be, 0x88ad17f0, 0x20ac66c9, 0xce3ab47d, 0xdf4a1863, 0x1a3182e5, 0x51336097, 0x537f4562, 0x6477e0b1, 0x6bae84bb, 0x81a01cfe, 0x082b94f9, 0x48685870, 0x45fd198f, 0xde6c8794, 0x7bf8b752, 0x73d323ab, 0x4b02e272, 0x1f8f57e3, 0x55ab2a66, 0xeb2807b2, 0xb5c2032f, 0xc57b9a86, 0x3708a5d3, 0x2887f230, 0xbfa5b223, 0x036aba02, 0x16825ced, 0xcf1c2b8a, 0x79b492a7, 0x07f2f0f3, 0x69e2a14e, 0xdaf4cd65, 0x05bed506, 0x34621fd1, 0xa6fe8ac4, 0x2e539d34, 0xf355a0a2, 0x8ae13205, 0xf6eb75a4, 0x83ec390b, 0x60efaa40, 0x719f065e, 0x6e1051bd, 0x218af93e, 0xdd063d96, 0x3e05aedd, 0xe6bd464d, 0x548db591, 0xc45d0571, 0x06d46f04, 0x5015ff60, 0x98fb2419, 0xbde997d6, 0x4043cc89, 0xd99e7767, 0xe842bdb0, 0x898b8807, 0x195b38e7, 0xc8eedb79, 0x7c0a47a1, 0x420fe97c, 0x841ec9f8, 0x00000000, 0x80868309, 0x2bed4832, 0x1170ac1e, 0x5a724e6c, 0x0efffbfd, 0x8538560f, 0xaed51e3d, 0x2d392736, 0x0fd9640a, 0x5ca62168, 0x5b54d19b, 0x362e3a24, 0x0a67b10c, 0x57e70f93, 0xee96d2b4, 0x9b919e1b, 0xc0c54f80, 0xdc20a261, 0x774b695a, 0x121a161c, 0x93ba0ae2, 0xa02ae5c0, 0x22e0433c, 0x1b171d12, 0x090d0b0e, 0x8bc7adf2, 0xb6a8b92d, 0x1ea9c814, 0xf1198557, 0x75074caf, 0x99ddbbee, 0x7f60fda3, 0x01269ff7, 0x72f5bc5c, 0x663bc544, 0xfb7e345b, 0x4329768b, 0x23c6dccb, 0xedfc68b6, 0xe4f163b8, 0x31dccad7, 0x63851042, 0x97224013, 0xc6112084, 0x4a247d85, 0xbb3df8d2, 0xf93211ae, 0x29a16dc7, 0x9e2f4b1d, 0xb230f3dc, 0x8652ec0d, 0xc1e3d077, 0xb3166c2b, 0x70b999a9, 0x9448fa11, 0xe9642247, 0xfc8cc4a8, 0xf03f1aa0, 0x7d2cd856, 0x3390ef22, 0x494ec787, 0x38d1c1d9, 0xcaa2fe8c, 0xd40b3698, 0xf581cfa6, 0x7ade28a5, 0xb78e26da, 0xadbfa43f, 0x3a9de42c, 0x78920d50, 0x5fcc9b6a, 0x7e466254, 0x8d13c2f6, 0xd8b8e890, 0x39f75e2e, 0xc3aff582, 0x5d80be9f, 0xd0937c69, 0xd52da96f, 0x2512b3cf, 0xac993bc8, 0x187da710, 0x9c636ee8, 0x3bbb7bdb, 0x267809cd, 0x5918f46e, 0x9ab701ec, 0x4f9aa883, 0x956e65e6, 0xffe67eaa, 0xbccf0821, 0x15e8e6ef, 0xe79bd9ba, 0x6f36ce4a, 0x9f09d4ea, 0xb07cd629, 0xa4b2af31, 0x3f23312a, 0xa59430c6, 0xa266c035, 0x4ebc3774, 0x82caa6fc, 0x90d0b0e0, 0xa7d81533, 0x04984af1, 0xecdaf741, 0xcd500e7f, 0x91f62f17, 0x4dd68d76, 0xefb04d43, 0xaa4d54cc, 0x9604dfe4, 0xd1b5e39e, 0x6a881b4c, 0x2c1fb8c1, 0x65517f46, 0x5eea049d, 0x8c355d01, 0x877473fa, 0x0b412efb, 0x671d5ab3, 0xdbd25292, 0x105633e9, 0xd647136d, 0xd7618c9a, 0xa10c7a37, 0xf8148e59, 0x133c89eb, 0xa927eece, 0x61c935b7, 0x1ce5ede1, 0x47b13c7a, 0xd2df599c, 0xf2733f55, 0x14ce7918, 0xc737bf73, 0xf7cdea53, 0xfdaa5b5f, 0x3d6f14df, 0x44db8678, 0xaff381ca, 0x68c43eb9, 0x24342c38, 0xa3405fc2, 0x1dc37216, 0xe2250cbc, 0x3c498b28, 0x0d9541ff, 0xa8017139, 0x0cb3de08, 0xb4e49cd8, 0x56c19064, 0xcb84617b, 0x32b670d5, 0x6c5c7448, 0xb85742d0];
            Aes.U1 = [0x00000000, 0x0e090d0b, 0x1c121a16, 0x121b171d, 0x3824342c, 0x362d3927, 0x24362e3a, 0x2a3f2331, 0x70486858, 0x7e416553, 0x6c5a724e, 0x62537f45, 0x486c5c74, 0x4665517f, 0x547e4662, 0x5a774b69, 0xe090d0b0, 0xee99ddbb, 0xfc82caa6, 0xf28bc7ad, 0xd8b4e49c, 0xd6bde997, 0xc4a6fe8a, 0xcaaff381, 0x90d8b8e8, 0x9ed1b5e3, 0x8ccaa2fe, 0x82c3aff5, 0xa8fc8cc4, 0xa6f581cf, 0xb4ee96d2, 0xbae79bd9, 0xdb3bbb7b, 0xd532b670, 0xc729a16d, 0xc920ac66, 0xe31f8f57, 0xed16825c, 0xff0d9541, 0xf104984a, 0xab73d323, 0xa57ade28, 0xb761c935, 0xb968c43e, 0x9357e70f, 0x9d5eea04, 0x8f45fd19, 0x814cf012, 0x3bab6bcb, 0x35a266c0, 0x27b971dd, 0x29b07cd6, 0x038f5fe7, 0x0d8652ec, 0x1f9d45f1, 0x119448fa, 0x4be30393, 0x45ea0e98, 0x57f11985, 0x59f8148e, 0x73c737bf, 0x7dce3ab4, 0x6fd52da9, 0x61dc20a2, 0xad766df6, 0xa37f60fd, 0xb16477e0, 0xbf6d7aeb, 0x955259da, 0x9b5b54d1, 0x894043cc, 0x87494ec7, 0xdd3e05ae, 0xd33708a5, 0xc12c1fb8, 0xcf2512b3, 0xe51a3182, 0xeb133c89, 0xf9082b94, 0xf701269f, 0x4de6bd46, 0x43efb04d, 0x51f4a750, 0x5ffdaa5b, 0x75c2896a, 0x7bcb8461, 0x69d0937c, 0x67d99e77, 0x3daed51e, 0x33a7d815, 0x21bccf08, 0x2fb5c203, 0x058ae132, 0x0b83ec39, 0x1998fb24, 0x1791f62f, 0x764dd68d, 0x7844db86, 0x6a5fcc9b, 0x6456c190, 0x4e69e2a1, 0x4060efaa, 0x527bf8b7, 0x5c72f5bc, 0x0605bed5, 0x080cb3de, 0x1a17a4c3, 0x141ea9c8, 0x3e218af9, 0x302887f2, 0x223390ef, 0x2c3a9de4, 0x96dd063d, 0x98d40b36, 0x8acf1c2b, 0x84c61120, 0xaef93211, 0xa0f03f1a, 0xb2eb2807, 0xbce2250c, 0xe6956e65, 0xe89c636e, 0xfa877473, 0xf48e7978, 0xdeb15a49, 0xd0b85742, 0xc2a3405f, 0xccaa4d54, 0x41ecdaf7, 0x4fe5d7fc, 0x5dfec0e1, 0x53f7cdea, 0x79c8eedb, 0x77c1e3d0, 0x65daf4cd, 0x6bd3f9c6, 0x31a4b2af, 0x3fadbfa4, 0x2db6a8b9, 0x23bfa5b2, 0x09808683, 0x07898b88, 0x15929c95, 0x1b9b919e, 0xa17c0a47, 0xaf75074c, 0xbd6e1051, 0xb3671d5a, 0x99583e6b, 0x97513360, 0x854a247d, 0x8b432976, 0xd134621f, 0xdf3d6f14, 0xcd267809, 0xc32f7502, 0xe9105633, 0xe7195b38, 0xf5024c25, 0xfb0b412e, 0x9ad7618c, 0x94de6c87, 0x86c57b9a, 0x88cc7691, 0xa2f355a0, 0xacfa58ab, 0xbee14fb6, 0xb0e842bd, 0xea9f09d4, 0xe49604df, 0xf68d13c2, 0xf8841ec9, 0xd2bb3df8, 0xdcb230f3, 0xcea927ee, 0xc0a02ae5, 0x7a47b13c, 0x744ebc37, 0x6655ab2a, 0x685ca621, 0x42638510, 0x4c6a881b, 0x5e719f06, 0x5078920d, 0x0a0fd964, 0x0406d46f, 0x161dc372, 0x1814ce79, 0x322bed48, 0x3c22e043, 0x2e39f75e, 0x2030fa55, 0xec9ab701, 0xe293ba0a, 0xf088ad17, 0xfe81a01c, 0xd4be832d, 0xdab78e26, 0xc8ac993b, 0xc6a59430, 0x9cd2df59, 0x92dbd252, 0x80c0c54f, 0x8ec9c844, 0xa4f6eb75, 0xaaffe67e, 0xb8e4f163, 0xb6edfc68, 0x0c0a67b1, 0x02036aba, 0x10187da7, 0x1e1170ac, 0x342e539d, 0x3a275e96, 0x283c498b, 0x26354480, 0x7c420fe9, 0x724b02e2, 0x605015ff, 0x6e5918f4, 0x44663bc5, 0x4a6f36ce, 0x587421d3, 0x567d2cd8, 0x37a10c7a, 0x39a80171, 0x2bb3166c, 0x25ba1b67, 0x0f853856, 0x018c355d, 0x13972240, 0x1d9e2f4b, 0x47e96422, 0x49e06929, 0x5bfb7e34, 0x55f2733f, 0x7fcd500e, 0x71c45d05, 0x63df4a18, 0x6dd64713, 0xd731dcca, 0xd938d1c1, 0xcb23c6dc, 0xc52acbd7, 0xef15e8e6, 0xe11ce5ed, 0xf307f2f0, 0xfd0efffb, 0xa779b492, 0xa970b999, 0xbb6bae84, 0xb562a38f, 0x9f5d80be, 0x91548db5, 0x834f9aa8, 0x8d4697a3];
            Aes.U2 = [0x00000000, 0x0b0e090d, 0x161c121a, 0x1d121b17, 0x2c382434, 0x27362d39, 0x3a24362e, 0x312a3f23, 0x58704868, 0x537e4165, 0x4e6c5a72, 0x4562537f, 0x74486c5c, 0x7f466551, 0x62547e46, 0x695a774b, 0xb0e090d0, 0xbbee99dd, 0xa6fc82ca, 0xadf28bc7, 0x9cd8b4e4, 0x97d6bde9, 0x8ac4a6fe, 0x81caaff3, 0xe890d8b8, 0xe39ed1b5, 0xfe8ccaa2, 0xf582c3af, 0xc4a8fc8c, 0xcfa6f581, 0xd2b4ee96, 0xd9bae79b, 0x7bdb3bbb, 0x70d532b6, 0x6dc729a1, 0x66c920ac, 0x57e31f8f, 0x5ced1682, 0x41ff0d95, 0x4af10498, 0x23ab73d3, 0x28a57ade, 0x35b761c9, 0x3eb968c4, 0x0f9357e7, 0x049d5eea, 0x198f45fd, 0x12814cf0, 0xcb3bab6b, 0xc035a266, 0xdd27b971, 0xd629b07c, 0xe7038f5f, 0xec0d8652, 0xf11f9d45, 0xfa119448, 0x934be303, 0x9845ea0e, 0x8557f119, 0x8e59f814, 0xbf73c737, 0xb47dce3a, 0xa96fd52d, 0xa261dc20, 0xf6ad766d, 0xfda37f60, 0xe0b16477, 0xebbf6d7a, 0xda955259, 0xd19b5b54, 0xcc894043, 0xc787494e, 0xaedd3e05, 0xa5d33708, 0xb8c12c1f, 0xb3cf2512, 0x82e51a31, 0x89eb133c, 0x94f9082b, 0x9ff70126, 0x464de6bd, 0x4d43efb0, 0x5051f4a7, 0x5b5ffdaa, 0x6a75c289, 0x617bcb84, 0x7c69d093, 0x7767d99e, 0x1e3daed5, 0x1533a7d8, 0x0821bccf, 0x032fb5c2, 0x32058ae1, 0x390b83ec, 0x241998fb, 0x2f1791f6, 0x8d764dd6, 0x867844db, 0x9b6a5fcc, 0x906456c1, 0xa14e69e2, 0xaa4060ef, 0xb7527bf8, 0xbc5c72f5, 0xd50605be, 0xde080cb3, 0xc31a17a4, 0xc8141ea9, 0xf93e218a, 0xf2302887, 0xef223390, 0xe42c3a9d, 0x3d96dd06, 0x3698d40b, 0x2b8acf1c, 0x2084c611, 0x11aef932, 0x1aa0f03f, 0x07b2eb28, 0x0cbce225, 0x65e6956e, 0x6ee89c63, 0x73fa8774, 0x78f48e79, 0x49deb15a, 0x42d0b857, 0x5fc2a340, 0x54ccaa4d, 0xf741ecda, 0xfc4fe5d7, 0xe15dfec0, 0xea53f7cd, 0xdb79c8ee, 0xd077c1e3, 0xcd65daf4, 0xc66bd3f9, 0xaf31a4b2, 0xa43fadbf, 0xb92db6a8, 0xb223bfa5, 0x83098086, 0x8807898b, 0x9515929c, 0x9e1b9b91, 0x47a17c0a, 0x4caf7507, 0x51bd6e10, 0x5ab3671d, 0x6b99583e, 0x60975133, 0x7d854a24, 0x768b4329, 0x1fd13462, 0x14df3d6f, 0x09cd2678, 0x02c32f75, 0x33e91056, 0x38e7195b, 0x25f5024c, 0x2efb0b41, 0x8c9ad761, 0x8794de6c, 0x9a86c57b, 0x9188cc76, 0xa0a2f355, 0xabacfa58, 0xb6bee14f, 0xbdb0e842, 0xd4ea9f09, 0xdfe49604, 0xc2f68d13, 0xc9f8841e, 0xf8d2bb3d, 0xf3dcb230, 0xeecea927, 0xe5c0a02a, 0x3c7a47b1, 0x37744ebc, 0x2a6655ab, 0x21685ca6, 0x10426385, 0x1b4c6a88, 0x065e719f, 0x0d507892, 0x640a0fd9, 0x6f0406d4, 0x72161dc3, 0x791814ce, 0x48322bed, 0x433c22e0, 0x5e2e39f7, 0x552030fa, 0x01ec9ab7, 0x0ae293ba, 0x17f088ad, 0x1cfe81a0, 0x2dd4be83, 0x26dab78e, 0x3bc8ac99, 0x30c6a594, 0x599cd2df, 0x5292dbd2, 0x4f80c0c5, 0x448ec9c8, 0x75a4f6eb, 0x7eaaffe6, 0x63b8e4f1, 0x68b6edfc, 0xb10c0a67, 0xba02036a, 0xa710187d, 0xac1e1170, 0x9d342e53, 0x963a275e, 0x8b283c49, 0x80263544, 0xe97c420f, 0xe2724b02, 0xff605015, 0xf46e5918, 0xc544663b, 0xce4a6f36, 0xd3587421, 0xd8567d2c, 0x7a37a10c, 0x7139a801, 0x6c2bb316, 0x6725ba1b, 0x560f8538, 0x5d018c35, 0x40139722, 0x4b1d9e2f, 0x2247e964, 0x2949e069, 0x345bfb7e, 0x3f55f273, 0x0e7fcd50, 0x0571c45d, 0x1863df4a, 0x136dd647, 0xcad731dc, 0xc1d938d1, 0xdccb23c6, 0xd7c52acb, 0xe6ef15e8, 0xede11ce5, 0xf0f307f2, 0xfbfd0eff, 0x92a779b4, 0x99a970b9, 0x84bb6bae, 0x8fb562a3, 0xbe9f5d80, 0xb591548d, 0xa8834f9a, 0xa38d4697];
            Aes.U3 = [0x00000000, 0x0d0b0e09, 0x1a161c12, 0x171d121b, 0x342c3824, 0x3927362d, 0x2e3a2436, 0x23312a3f, 0x68587048, 0x65537e41, 0x724e6c5a, 0x7f456253, 0x5c74486c, 0x517f4665, 0x4662547e, 0x4b695a77, 0xd0b0e090, 0xddbbee99, 0xcaa6fc82, 0xc7adf28b, 0xe49cd8b4, 0xe997d6bd, 0xfe8ac4a6, 0xf381caaf, 0xb8e890d8, 0xb5e39ed1, 0xa2fe8cca, 0xaff582c3, 0x8cc4a8fc, 0x81cfa6f5, 0x96d2b4ee, 0x9bd9bae7, 0xbb7bdb3b, 0xb670d532, 0xa16dc729, 0xac66c920, 0x8f57e31f, 0x825ced16, 0x9541ff0d, 0x984af104, 0xd323ab73, 0xde28a57a, 0xc935b761, 0xc43eb968, 0xe70f9357, 0xea049d5e, 0xfd198f45, 0xf012814c, 0x6bcb3bab, 0x66c035a2, 0x71dd27b9, 0x7cd629b0, 0x5fe7038f, 0x52ec0d86, 0x45f11f9d, 0x48fa1194, 0x03934be3, 0x0e9845ea, 0x198557f1, 0x148e59f8, 0x37bf73c7, 0x3ab47dce, 0x2da96fd5, 0x20a261dc, 0x6df6ad76, 0x60fda37f, 0x77e0b164, 0x7aebbf6d, 0x59da9552, 0x54d19b5b, 0x43cc8940, 0x4ec78749, 0x05aedd3e, 0x08a5d337, 0x1fb8c12c, 0x12b3cf25, 0x3182e51a, 0x3c89eb13, 0x2b94f908, 0x269ff701, 0xbd464de6, 0xb04d43ef, 0xa75051f4, 0xaa5b5ffd, 0x896a75c2, 0x84617bcb, 0x937c69d0, 0x9e7767d9, 0xd51e3dae, 0xd81533a7, 0xcf0821bc, 0xc2032fb5, 0xe132058a, 0xec390b83, 0xfb241998, 0xf62f1791, 0xd68d764d, 0xdb867844, 0xcc9b6a5f, 0xc1906456, 0xe2a14e69, 0xefaa4060, 0xf8b7527b, 0xf5bc5c72, 0xbed50605, 0xb3de080c, 0xa4c31a17, 0xa9c8141e, 0x8af93e21, 0x87f23028, 0x90ef2233, 0x9de42c3a, 0x063d96dd, 0x0b3698d4, 0x1c2b8acf, 0x112084c6, 0x3211aef9, 0x3f1aa0f0, 0x2807b2eb, 0x250cbce2, 0x6e65e695, 0x636ee89c, 0x7473fa87, 0x7978f48e, 0x5a49deb1, 0x5742d0b8, 0x405fc2a3, 0x4d54ccaa, 0xdaf741ec, 0xd7fc4fe5, 0xc0e15dfe, 0xcdea53f7, 0xeedb79c8, 0xe3d077c1, 0xf4cd65da, 0xf9c66bd3, 0xb2af31a4, 0xbfa43fad, 0xa8b92db6, 0xa5b223bf, 0x86830980, 0x8b880789, 0x9c951592, 0x919e1b9b, 0x0a47a17c, 0x074caf75, 0x1051bd6e, 0x1d5ab367, 0x3e6b9958, 0x33609751, 0x247d854a, 0x29768b43, 0x621fd134, 0x6f14df3d, 0x7809cd26, 0x7502c32f, 0x5633e910, 0x5b38e719, 0x4c25f502, 0x412efb0b, 0x618c9ad7, 0x6c8794de, 0x7b9a86c5, 0x769188cc, 0x55a0a2f3, 0x58abacfa, 0x4fb6bee1, 0x42bdb0e8, 0x09d4ea9f, 0x04dfe496, 0x13c2f68d, 0x1ec9f884, 0x3df8d2bb, 0x30f3dcb2, 0x27eecea9, 0x2ae5c0a0, 0xb13c7a47, 0xbc37744e, 0xab2a6655, 0xa621685c, 0x85104263, 0x881b4c6a, 0x9f065e71, 0x920d5078, 0xd9640a0f, 0xd46f0406, 0xc372161d, 0xce791814, 0xed48322b, 0xe0433c22, 0xf75e2e39, 0xfa552030, 0xb701ec9a, 0xba0ae293, 0xad17f088, 0xa01cfe81, 0x832dd4be, 0x8e26dab7, 0x993bc8ac, 0x9430c6a5, 0xdf599cd2, 0xd25292db, 0xc54f80c0, 0xc8448ec9, 0xeb75a4f6, 0xe67eaaff, 0xf163b8e4, 0xfc68b6ed, 0x67b10c0a, 0x6aba0203, 0x7da71018, 0x70ac1e11, 0x539d342e, 0x5e963a27, 0x498b283c, 0x44802635, 0x0fe97c42, 0x02e2724b, 0x15ff6050, 0x18f46e59, 0x3bc54466, 0x36ce4a6f, 0x21d35874, 0x2cd8567d, 0x0c7a37a1, 0x017139a8, 0x166c2bb3, 0x1b6725ba, 0x38560f85, 0x355d018c, 0x22401397, 0x2f4b1d9e, 0x642247e9, 0x692949e0, 0x7e345bfb, 0x733f55f2, 0x500e7fcd, 0x5d0571c4, 0x4a1863df, 0x47136dd6, 0xdccad731, 0xd1c1d938, 0xc6dccb23, 0xcbd7c52a, 0xe8e6ef15, 0xe5ede11c, 0xf2f0f307, 0xfffbfd0e, 0xb492a779, 0xb999a970, 0xae84bb6b, 0xa38fb562, 0x80be9f5d, 0x8db59154, 0x9aa8834f, 0x97a38d46];
            Aes.U4 = [0x00000000, 0x090d0b0e, 0x121a161c, 0x1b171d12, 0x24342c38, 0x2d392736, 0x362e3a24, 0x3f23312a, 0x48685870, 0x4165537e, 0x5a724e6c, 0x537f4562, 0x6c5c7448, 0x65517f46, 0x7e466254, 0x774b695a, 0x90d0b0e0, 0x99ddbbee, 0x82caa6fc, 0x8bc7adf2, 0xb4e49cd8, 0xbde997d6, 0xa6fe8ac4, 0xaff381ca, 0xd8b8e890, 0xd1b5e39e, 0xcaa2fe8c, 0xc3aff582, 0xfc8cc4a8, 0xf581cfa6, 0xee96d2b4, 0xe79bd9ba, 0x3bbb7bdb, 0x32b670d5, 0x29a16dc7, 0x20ac66c9, 0x1f8f57e3, 0x16825ced, 0x0d9541ff, 0x04984af1, 0x73d323ab, 0x7ade28a5, 0x61c935b7, 0x68c43eb9, 0x57e70f93, 0x5eea049d, 0x45fd198f, 0x4cf01281, 0xab6bcb3b, 0xa266c035, 0xb971dd27, 0xb07cd629, 0x8f5fe703, 0x8652ec0d, 0x9d45f11f, 0x9448fa11, 0xe303934b, 0xea0e9845, 0xf1198557, 0xf8148e59, 0xc737bf73, 0xce3ab47d, 0xd52da96f, 0xdc20a261, 0x766df6ad, 0x7f60fda3, 0x6477e0b1, 0x6d7aebbf, 0x5259da95, 0x5b54d19b, 0x4043cc89, 0x494ec787, 0x3e05aedd, 0x3708a5d3, 0x2c1fb8c1, 0x2512b3cf, 0x1a3182e5, 0x133c89eb, 0x082b94f9, 0x01269ff7, 0xe6bd464d, 0xefb04d43, 0xf4a75051, 0xfdaa5b5f, 0xc2896a75, 0xcb84617b, 0xd0937c69, 0xd99e7767, 0xaed51e3d, 0xa7d81533, 0xbccf0821, 0xb5c2032f, 0x8ae13205, 0x83ec390b, 0x98fb2419, 0x91f62f17, 0x4dd68d76, 0x44db8678, 0x5fcc9b6a, 0x56c19064, 0x69e2a14e, 0x60efaa40, 0x7bf8b752, 0x72f5bc5c, 0x05bed506, 0x0cb3de08, 0x17a4c31a, 0x1ea9c814, 0x218af93e, 0x2887f230, 0x3390ef22, 0x3a9de42c, 0xdd063d96, 0xd40b3698, 0xcf1c2b8a, 0xc6112084, 0xf93211ae, 0xf03f1aa0, 0xeb2807b2, 0xe2250cbc, 0x956e65e6, 0x9c636ee8, 0x877473fa, 0x8e7978f4, 0xb15a49de, 0xb85742d0, 0xa3405fc2, 0xaa4d54cc, 0xecdaf741, 0xe5d7fc4f, 0xfec0e15d, 0xf7cdea53, 0xc8eedb79, 0xc1e3d077, 0xdaf4cd65, 0xd3f9c66b, 0xa4b2af31, 0xadbfa43f, 0xb6a8b92d, 0xbfa5b223, 0x80868309, 0x898b8807, 0x929c9515, 0x9b919e1b, 0x7c0a47a1, 0x75074caf, 0x6e1051bd, 0x671d5ab3, 0x583e6b99, 0x51336097, 0x4a247d85, 0x4329768b, 0x34621fd1, 0x3d6f14df, 0x267809cd, 0x2f7502c3, 0x105633e9, 0x195b38e7, 0x024c25f5, 0x0b412efb, 0xd7618c9a, 0xde6c8794, 0xc57b9a86, 0xcc769188, 0xf355a0a2, 0xfa58abac, 0xe14fb6be, 0xe842bdb0, 0x9f09d4ea, 0x9604dfe4, 0x8d13c2f6, 0x841ec9f8, 0xbb3df8d2, 0xb230f3dc, 0xa927eece, 0xa02ae5c0, 0x47b13c7a, 0x4ebc3774, 0x55ab2a66, 0x5ca62168, 0x63851042, 0x6a881b4c, 0x719f065e, 0x78920d50, 0x0fd9640a, 0x06d46f04, 0x1dc37216, 0x14ce7918, 0x2bed4832, 0x22e0433c, 0x39f75e2e, 0x30fa5520, 0x9ab701ec, 0x93ba0ae2, 0x88ad17f0, 0x81a01cfe, 0xbe832dd4, 0xb78e26da, 0xac993bc8, 0xa59430c6, 0xd2df599c, 0xdbd25292, 0xc0c54f80, 0xc9c8448e, 0xf6eb75a4, 0xffe67eaa, 0xe4f163b8, 0xedfc68b6, 0x0a67b10c, 0x036aba02, 0x187da710, 0x1170ac1e, 0x2e539d34, 0x275e963a, 0x3c498b28, 0x35448026, 0x420fe97c, 0x4b02e272, 0x5015ff60, 0x5918f46e, 0x663bc544, 0x6f36ce4a, 0x7421d358, 0x7d2cd856, 0xa10c7a37, 0xa8017139, 0xb3166c2b, 0xba1b6725, 0x8538560f, 0x8c355d01, 0x97224013, 0x9e2f4b1d, 0xe9642247, 0xe0692949, 0xfb7e345b, 0xf2733f55, 0xcd500e7f, 0xc45d0571, 0xdf4a1863, 0xd647136d, 0x31dccad7, 0x38d1c1d9, 0x23c6dccb, 0x2acbd7c5, 0x15e8e6ef, 0x1ce5ede1, 0x07f2f0f3, 0x0efffbfd, 0x79b492a7, 0x70b999a9, 0x6bae84bb, 0x62a38fb5, 0x5d80be9f, 0x548db591, 0x4f9aa883, 0x4697a38d];
            return Aes;
        }());
        Cryptography.Aes = Aes;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var Base58 = (function () {
            function Base58() {
            }
            Base58.decode = function (input) {
                var bi = Neo.BigInteger.Zero;
                for (var i = input.length - 1; i >= 0; i--) {
                    var index = Base58.Alphabet.indexOf(input[i]);
                    if (index == -1)
                        throw new RangeError();
                    bi = Neo.BigInteger.add(bi, Neo.BigInteger.multiply(Neo.BigInteger.pow(Base58.Alphabet.length, input.length - 1 - i), index));
                }
                var bytes = bi.toUint8Array();
                var leadingZeros = 0;
                for (var i = 0; i < input.length && input[i] == Base58.Alphabet[0]; i++) {
                    leadingZeros++;
                }
                var tmp = new Uint8Array(bytes.length + leadingZeros);
                for (var i = 0; i < bytes.length; i++)
                    tmp[i + leadingZeros] = bytes[bytes.length - 1 - i];
                return tmp;
            };
            Base58.encode = function (input) {
                var value = Neo.BigInteger.fromUint8Array(input, 1, false);
                var s = "";
                while (!value.isZero()) {
                    var r = Neo.BigInteger.divRem(value, Base58.Alphabet.length);
                    s = Base58.Alphabet[r.remainder.toInt32()] + s;
                    value = r.result;
                }
                for (var i = 0; i < input.length; i++) {
                    if (input[i] == 0)
                        s = Base58.Alphabet[0] + s;
                    else
                        break;
                }
                return s;
            };
            Base58.Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
            return Base58;
        }());
        Cryptography.Base58 = Base58;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var CryptoKey = (function () {
            function CryptoKey(type, extractable, algorithm, usages) {
                this.type = type;
                this.extractable = extractable;
                this.algorithm = algorithm;
                this.usages = usages;
            }
            return CryptoKey;
        }());
        Cryptography.CryptoKey = CryptoKey;
        var AesCryptoKey = (function (_super) {
            __extends(AesCryptoKey, _super);
            function AesCryptoKey(_key_bytes) {
                var _this = _super.call(this, "secret", true, { name: "AES-CBC", length: _key_bytes.length * 8 }, ["encrypt", "decrypt"]) || this;
                _this._key_bytes = _key_bytes;
                return _this;
            }
            AesCryptoKey.create = function (length) {
                if (length != 128 && length != 192 && length != 256)
                    throw new RangeError();
                var key = new AesCryptoKey(new Uint8Array(length / 8));
                window.crypto.getRandomValues(key._key_bytes);
                return key;
            };
            AesCryptoKey.prototype.export = function () {
                return this._key_bytes;
            };
            AesCryptoKey.import = function (keyData) {
                if (keyData.byteLength != 16 && keyData.byteLength != 24 && keyData.byteLength != 32)
                    throw new RangeError();
                return new AesCryptoKey(Uint8Array.fromArrayBuffer(keyData));
            };
            return AesCryptoKey;
        }(Neo.Cryptography.CryptoKey));
        Cryptography.AesCryptoKey = AesCryptoKey;
        var ECDsaCryptoKey = (function (_super) {
            __extends(ECDsaCryptoKey, _super);
            function ECDsaCryptoKey(publicKey, privateKey) {
                var _this = _super.call(this, privateKey == null ? "public" : "private", true, { name: "ECDSA", namedCurve: "P-256" }, [privateKey == null ? "verify" : "sign"]) || this;
                _this.publicKey = publicKey;
                _this.privateKey = privateKey;
                return _this;
            }
            return ECDsaCryptoKey;
        }(CryptoKey));
        Cryptography.ECDsaCryptoKey = ECDsaCryptoKey;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var _secp256k1;
        var _secp256r1;
        var ECCurve = (function () {
            function ECCurve(Q, A, B, N, G) {
                this.Q = Q;
                this.A = new Cryptography.ECFieldElement(A, this);
                this.B = new Cryptography.ECFieldElement(B, this);
                this.N = N;
                this.Infinity = new Cryptography.ECPoint(null, null, this);
                this.G = Cryptography.ECPoint.decodePoint(G, this);
            }
            Object.defineProperty(ECCurve, "secp256k1", {
                get: function () {
                    return _secp256k1 || (_secp256k1 = new ECCurve(Neo.BigInteger.fromString("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16), Neo.BigInteger.Zero, new Neo.BigInteger(7), Neo.BigInteger.fromString("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16), ("04" + "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798" + "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8").hexToBytes()));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ECCurve, "secp256r1", {
                get: function () {
                    return _secp256r1 || (_secp256r1 = new ECCurve(Neo.BigInteger.fromString("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF", 16), Neo.BigInteger.fromString("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", 16), Neo.BigInteger.fromString("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", 16), Neo.BigInteger.fromString("FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551", 16), ("04" + "6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296" + "4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5").hexToBytes()));
                },
                enumerable: true,
                configurable: true
            });
            return ECCurve;
        }());
        Cryptography.ECCurve = ECCurve;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var ECDsa = (function () {
            function ECDsa(key) {
                this.key = key;
            }
            ECDsa.calculateE = function (n, message) {
                return Neo.BigInteger.fromUint8Array(new Uint8Array(Cryptography.Sha256.computeHash(message)), 1, false);
            };
            ECDsa.generateKey = function (curve) {
                var prikey = new Uint8Array(32);
                window.crypto.getRandomValues(prikey);
                var pubkey = Cryptography.ECPoint.multiply(curve.G, prikey);
                return {
                    privateKey: new Cryptography.ECDsaCryptoKey(pubkey, prikey),
                    publicKey: new Cryptography.ECDsaCryptoKey(pubkey)
                };
            };
            ECDsa.prototype.sign = function (message) {
                if (this.key.privateKey == null)
                    throw new Error();
                var e = ECDsa.calculateE(this.key.publicKey.curve.N, message);
                var d = Neo.BigInteger.fromUint8Array(this.key.privateKey, 1, false);
                var r, s;
                do {
                    var k = void 0;
                    do {
                        do {
                            k = Neo.BigInteger.random(this.key.publicKey.curve.N.bitLength(), window.crypto);
                        } while (k.sign() == 0 || k.compareTo(this.key.publicKey.curve.N) >= 0);
                        var p = Cryptography.ECPoint.multiply(this.key.publicKey.curve.G, k);
                        var x = p.x.value;
                        r = x.mod(this.key.publicKey.curve.N);
                    } while (r.sign() == 0);
                    s = k.modInverse(this.key.publicKey.curve.N).multiply(e.add(d.multiply(r))).mod(this.key.publicKey.curve.N);
                    if (s.compareTo(this.key.publicKey.curve.N.divide(2)) > 0) {
                        s = this.key.publicKey.curve.N.subtract(s);
                    }
                } while (s.sign() == 0);
                var arr = new Uint8Array(64);
                Array.copy(r.toUint8Array(false, 32), 0, arr, 0, 32);
                Array.copy(s.toUint8Array(false, 32), 0, arr, 32, 32);
                return arr.buffer;
            };
            ECDsa.sumOfTwoMultiplies = function (P, k, Q, l) {
                var m = Math.max(k.bitLength(), l.bitLength());
                var Z = Cryptography.ECPoint.add(P, Q);
                var R = P.curve.Infinity;
                for (var i = m - 1; i >= 0; --i) {
                    R = R.twice();
                    if (k.testBit(i)) {
                        if (l.testBit(i))
                            R = Cryptography.ECPoint.add(R, Z);
                        else
                            R = Cryptography.ECPoint.add(R, P);
                    }
                    else {
                        if (l.testBit(i))
                            R = Cryptography.ECPoint.add(R, Q);
                    }
                }
                return R;
            };
            ECDsa.prototype.verify = function (message, signature) {
                var arr = Uint8Array.fromArrayBuffer(signature);
                var r = Neo.BigInteger.fromUint8Array(arr.subarray(0, 32), 1, false);
                var s = Neo.BigInteger.fromUint8Array(arr.subarray(32, 64), 1, false);
                if (r.compareTo(this.key.publicKey.curve.N) >= 0 || s.compareTo(this.key.publicKey.curve.N) >= 0)
                    return false;
                var e = ECDsa.calculateE(this.key.publicKey.curve.N, message);
                var c = s.modInverse(this.key.publicKey.curve.N);
                var u1 = e.multiply(c).mod(this.key.publicKey.curve.N);
                var u2 = r.multiply(c).mod(this.key.publicKey.curve.N);
                var point = ECDsa.sumOfTwoMultiplies(this.key.publicKey.curve.G, u1, this.key.publicKey, u2);
                var v = point.x.value.mod(this.key.publicKey.curve.N);
                return v.equals(r);
            };
            return ECDsa;
        }());
        Cryptography.ECDsa = ECDsa;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var ECFieldElement = (function () {
            function ECFieldElement(value, curve) {
                this.value = value;
                this.curve = curve;
                if (Neo.BigInteger.compare(value, curve.Q) >= 0)
                    throw new RangeError("x value too large in field element");
            }
            ECFieldElement.prototype.add = function (other) {
                return new ECFieldElement(this.value.add(other.value).mod(this.curve.Q), this.curve);
            };
            ECFieldElement.prototype.compareTo = function (other) {
                if (this === other)
                    return 0;
                return this.value.compareTo(other.value);
            };
            ECFieldElement.prototype.divide = function (other) {
                return new ECFieldElement(this.value.multiply(other.value.modInverse(this.curve.Q)).mod(this.curve.Q), this.curve);
            };
            ECFieldElement.prototype.equals = function (other) {
                return this.value.equals(other.value);
            };
            ECFieldElement.fastLucasSequence = function (p, P, Q, k) {
                var n = k.bitLength();
                var s = k.getLowestSetBit();
                console.assert(k.testBit(s));
                var Uh = Neo.BigInteger.One;
                var Vl = new Neo.BigInteger(2);
                var Vh = P;
                var Ql = Neo.BigInteger.One;
                var Qh = Neo.BigInteger.One;
                for (var j = n - 1; j >= s + 1; --j) {
                    Ql = Neo.BigInteger.mod(Neo.BigInteger.multiply(Ql, Qh), p);
                    if (k.testBit(j)) {
                        Qh = Ql.multiply(Q).mod(p);
                        Uh = Uh.multiply(Vh).mod(p);
                        Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                        Vh = Vh.multiply(Vh).subtract(Qh.leftShift(1)).mod(p);
                    }
                    else {
                        Qh = Ql;
                        Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
                        Vh = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                        Vl = Vl.multiply(Vl).subtract(Ql.leftShift(1)).mod(p);
                    }
                }
                Ql = Ql.multiply(Qh).mod(p);
                Qh = Ql.multiply(Q).mod(p);
                Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
                Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                Ql = Ql.multiply(Qh).mod(p);
                for (var j = 1; j <= s; ++j) {
                    Uh = Uh.multiply(Vl).multiply(p);
                    Vl = Vl.multiply(Vl).subtract(Ql.leftShift(1)).mod(p);
                    Ql = Ql.multiply(Ql).mod(p);
                }
                return [Uh, Vl];
            };
            ECFieldElement.prototype.multiply = function (other) {
                return new ECFieldElement(this.value.multiply(other.value).mod(this.curve.Q), this.curve);
            };
            ECFieldElement.prototype.negate = function () {
                return new ECFieldElement(this.value.negate().mod(this.curve.Q), this.curve);
            };
            ECFieldElement.prototype.sqrt = function () {
                if (this.curve.Q.testBit(1)) {
                    var z = new ECFieldElement(Neo.BigInteger.modPow(this.value, this.curve.Q.rightShift(2).add(1), this.curve.Q), this.curve);
                    return z.square().equals(this) ? z : null;
                }
                var qMinusOne = this.curve.Q.subtract(1);
                var legendreExponent = qMinusOne.rightShift(1);
                if (Neo.BigInteger.modPow(this.value, legendreExponent, this.curve.Q).equals(1))
                    return null;
                var u = qMinusOne.rightShift(2);
                var k = u.leftShift(1).add(1);
                var Q = this.value;
                var fourQ = Q.leftShift(2).mod(this.curve.Q);
                var U, V;
                do {
                    var P = void 0;
                    do {
                        P = Neo.BigInteger.random(this.curve.Q.bitLength());
                    } while (P.compareTo(this.curve.Q) >= 0 || !Neo.BigInteger.modPow(P.multiply(P).subtract(fourQ), legendreExponent, this.curve.Q).equals(qMinusOne));
                    var result = ECFieldElement.fastLucasSequence(this.curve.Q, P, Q, k);
                    U = result[0];
                    V = result[1];
                    if (V.multiply(V).mod(this.curve.Q).equals(fourQ)) {
                        if (V.testBit(0)) {
                            V = V.add(this.curve.Q);
                        }
                        V = V.rightShift(1);
                        console.assert(V.multiply(V).mod(this.curve.Q).equals(this.value));
                        return new ECFieldElement(V, this.curve);
                    }
                } while (U.equals(Neo.BigInteger.One) || U.equals(qMinusOne));
                return null;
            };
            ECFieldElement.prototype.square = function () {
                return new ECFieldElement(this.value.multiply(this.value).mod(this.curve.Q), this.curve);
            };
            ECFieldElement.prototype.subtract = function (other) {
                return new ECFieldElement(this.value.subtract(other.value).mod(this.curve.Q), this.curve);
            };
            return ECFieldElement;
        }());
        Cryptography.ECFieldElement = ECFieldElement;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var ECPoint = (function () {
            function ECPoint(x, y, curve) {
                this.x = x;
                this.y = y;
                this.curve = curve;
                if ((x == null) != (y == null))
                    throw new RangeError("Exactly one of the field elements is null");
            }
            ECPoint.add = function (x, y) {
                if (x.isInfinity())
                    return y;
                if (y.isInfinity())
                    return x;
                if (x.x.equals(y.x)) {
                    if (x.y.equals(y.y))
                        return x.twice();
                    console.assert(x.y.equals(y.y.negate()));
                    return x.curve.Infinity;
                }
                var gamma = y.y.subtract(x.y).divide(y.x.subtract(x.x));
                var x3 = gamma.square().subtract(x.x).subtract(y.x);
                var y3 = gamma.multiply(x.x.subtract(x3)).subtract(x.y);
                return new ECPoint(x3, y3, x.curve);
            };
            ECPoint.prototype.compareTo = function (other) {
                if (this === other)
                    return 0;
                var result = this.x.compareTo(other.x);
                if (result != 0)
                    return result;
                return this.y.compareTo(other.y);
            };
            ECPoint.decodePoint = function (encoded, curve) {
                var p;
                var expectedLength = Math.ceil(curve.Q.bitLength() / 8);
                switch (encoded[0]) {
                    case 0x00:
                        {
                            if (encoded.length != 1)
                                throw new RangeError("Incorrect length for infinity encoding");
                            p = curve.Infinity;
                            break;
                        }
                    case 0x02:
                    case 0x03:
                        {
                            if (encoded.length != (expectedLength + 1))
                                throw new RangeError("Incorrect length for compressed encoding");
                            var yTilde = encoded[0] & 1;
                            var X1 = Neo.BigInteger.fromUint8Array(encoded.subarray(1), 1, false);
                            p = ECPoint.decompressPoint(yTilde, X1, curve);
                            break;
                        }
                    case 0x04:
                    case 0x06:
                    case 0x07:
                        {
                            if (encoded.length != (2 * expectedLength + 1))
                                throw new RangeError("Incorrect length for uncompressed/hybrid encoding");
                            var X1 = Neo.BigInteger.fromUint8Array(encoded.subarray(1, 1 + expectedLength), 1, false);
                            var Y1 = Neo.BigInteger.fromUint8Array(encoded.subarray(1 + expectedLength), 1, false);
                            p = new ECPoint(new Cryptography.ECFieldElement(X1, curve), new Cryptography.ECFieldElement(Y1, curve), curve);
                            break;
                        }
                    default:
                        throw new RangeError("Invalid point encoding " + encoded[0]);
                }
                return p;
            };
            ECPoint.decompressPoint = function (yTilde, X1, curve) {
                var x = new Cryptography.ECFieldElement(X1, curve);
                var alpha = x.multiply(x.square().add(curve.A)).add(curve.B);
                var beta = alpha.sqrt();
                if (beta == null)
                    throw new RangeError("Invalid point compression");
                var betaValue = beta.value;
                var bit0 = betaValue.isEven() ? 0 : 1;
                if (bit0 != yTilde) {
                    beta = new Cryptography.ECFieldElement(curve.Q.subtract(betaValue), curve);
                }
                return new ECPoint(x, beta, curve);
            };
            ECPoint.deserializeFrom = function (reader, curve) {
                var expectedLength = Math.floor((curve.Q.bitLength() + 7) / 8);
                var array = new Uint8Array(1 + expectedLength * 2);
                array[0] = reader.readByte();
                switch (array[0]) {
                    case 0x00:
                        return curve.Infinity;
                    case 0x02:
                    case 0x03:
                        reader.read(array.buffer, 1, expectedLength);
                        return ECPoint.decodePoint(new Uint8Array(array.buffer, 0, 33), curve);
                    case 0x04:
                    case 0x06:
                    case 0x07:
                        reader.read(array.buffer, 1, expectedLength * 2);
                        return ECPoint.decodePoint(array, curve);
                    default:
                        throw new Error("Invalid point encoding " + array[0]);
                }
            };
            ECPoint.prototype.encodePoint = function (commpressed) {
                if (this.isInfinity())
                    return new Uint8Array(1);
                var data;
                if (commpressed) {
                    data = new Uint8Array(33);
                }
                else {
                    data = new Uint8Array(65);
                    var yBytes = this.y.value.toUint8Array();
                    for (var i = 0; i < yBytes.length; i++)
                        data[65 - yBytes.length + i] = yBytes[yBytes.length - 1 - i];
                }
                var xBytes = this.x.value.toUint8Array();
                for (var i = 0; i < xBytes.length; i++)
                    data[33 - xBytes.length + i] = xBytes[xBytes.length - 1 - i];
                data[0] = commpressed ? this.y.value.isEven() ? 0x02 : 0x03 : 0x04;
                return data;
            };
            ECPoint.prototype.equals = function (other) {
                if (this === other)
                    return true;
                if (null === other)
                    return false;
                if (this.isInfinity && other.isInfinity)
                    return true;
                if (this.isInfinity || other.isInfinity)
                    return false;
                return this.x.equals(other.x) && this.y.equals(other.y);
            };
            ECPoint.fromUint8Array = function (arr, curve) {
                switch (arr.length) {
                    case 33:
                    case 65:
                        return ECPoint.decodePoint(arr, curve);
                    case 64:
                    case 72:
                        {
                            var arr_new = new Uint8Array(65);
                            arr_new[0] = 0x04;
                            arr_new.set(arr.subarray(arr.length - 64), 1);
                            return ECPoint.decodePoint(arr_new, curve);
                        }
                    case 96:
                    case 104:
                        {
                            var arr_new = new Uint8Array(65);
                            arr_new[0] = 0x04;
                            arr_new.set(arr.subarray(arr.length - 96, arr.length - 32), 1);
                            return ECPoint.decodePoint(arr_new, curve);
                        }
                    default:
                        throw new RangeError();
                }
            };
            ECPoint.prototype.isInfinity = function () {
                return this.x == null && this.y == null;
            };
            ECPoint.multiply = function (p, n) {
                var k = n instanceof Uint8Array ? Neo.BigInteger.fromUint8Array(n, 1, false) : n;
                if (p.isInfinity())
                    return p;
                if (k.isZero())
                    return p.curve.Infinity;
                var m = k.bitLength();
                var width;
                var reqPreCompLen;
                if (m < 13) {
                    width = 2;
                    reqPreCompLen = 1;
                }
                else if (m < 41) {
                    width = 3;
                    reqPreCompLen = 2;
                }
                else if (m < 121) {
                    width = 4;
                    reqPreCompLen = 4;
                }
                else if (m < 337) {
                    width = 5;
                    reqPreCompLen = 8;
                }
                else if (m < 897) {
                    width = 6;
                    reqPreCompLen = 16;
                }
                else if (m < 2305) {
                    width = 7;
                    reqPreCompLen = 32;
                }
                else {
                    width = 8;
                    reqPreCompLen = 127;
                }
                var preCompLen = 1;
                var preComp = [p];
                var twiceP = p.twice();
                if (preCompLen < reqPreCompLen) {
                    var oldPreComp = preComp;
                    preComp = new Array(reqPreCompLen);
                    for (var i = 0; i < preCompLen; i++)
                        preComp[i] = oldPreComp[i];
                    for (var i = preCompLen; i < reqPreCompLen; i++) {
                        preComp[i] = ECPoint.add(twiceP, preComp[i - 1]);
                    }
                }
                var wnaf = ECPoint.windowNaf(width, k);
                var l = wnaf.length;
                var q = p.curve.Infinity;
                for (var i = l - 1; i >= 0; i--) {
                    q = q.twice();
                    if (wnaf[i] != 0) {
                        if (wnaf[i] > 0) {
                            q = ECPoint.add(q, preComp[Math.floor((wnaf[i] - 1) / 2)]);
                        }
                        else {
                            q = ECPoint.subtract(q, preComp[Math.floor((-wnaf[i] - 1) / 2)]);
                        }
                    }
                }
                return q;
            };
            ECPoint.prototype.negate = function () {
                return new ECPoint(this.x, this.y.negate(), this.curve);
            };
            ECPoint.parse = function (str, curve) {
                return ECPoint.decodePoint(str.hexToBytes(), curve);
            };
            ECPoint.subtract = function (x, y) {
                if (y.isInfinity())
                    return x;
                return ECPoint.add(x, y.negate());
            };
            ECPoint.prototype.toString = function () {
                return this.encodePoint(true).toHexString();
            };
            ECPoint.prototype.twice = function () {
                if (this.isInfinity())
                    return this;
                if (this.y.value.sign() == 0)
                    return this.curve.Infinity;
                var TWO = new Cryptography.ECFieldElement(new Neo.BigInteger(2), this.curve);
                var THREE = new Cryptography.ECFieldElement(new Neo.BigInteger(3), this.curve);
                var gamma = this.x.square().multiply(THREE).add(this.curve.A).divide(this.y.multiply(TWO));
                var x3 = gamma.square().subtract(this.x.multiply(TWO));
                var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);
                return new ECPoint(x3, y3, this.curve);
            };
            ECPoint.windowNaf = function (width, k) {
                var wnaf = new Array(k.bitLength() + 1);
                var pow2wB = 1 << width;
                var i = 0;
                var length = 0;
                while (k.sign() > 0) {
                    if (!k.isEven()) {
                        var remainder = Neo.BigInteger.remainder(k, pow2wB);
                        if (remainder.testBit(width - 1)) {
                            wnaf[i] = Neo.BigInteger.subtract(remainder, pow2wB).toInt32();
                        }
                        else {
                            wnaf[i] = remainder.toInt32();
                        }
                        k = k.subtract(wnaf[i]);
                        length = i;
                    }
                    else {
                        wnaf[i] = 0;
                    }
                    k = k.rightShift(1);
                    i++;
                }
                wnaf.length = length + 1;
                return wnaf;
            };
            return ECPoint;
        }());
        Cryptography.ECPoint = ECPoint;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var RandomNumberGenerator = (function () {
            function RandomNumberGenerator() {
            }
            RandomNumberGenerator.addEntropy = function (data, strength) {
                if (RandomNumberGenerator._stopped)
                    return;
                for (var i = 0; i < data.length; i++)
                    if (data[i] != null && data[i] != 0) {
                        RandomNumberGenerator._entropy.push(data[i]);
                        RandomNumberGenerator._strength += strength;
                        RandomNumberGenerator._key = null;
                    }
                if (RandomNumberGenerator._strength >= 512)
                    RandomNumberGenerator.stopCollectors();
            };
            RandomNumberGenerator.getRandomValues = function (array) {
                if (RandomNumberGenerator._strength < 256)
                    throw new Error();
                if (RandomNumberGenerator._key == null) {
                    var data = new Float64Array(RandomNumberGenerator._entropy);
                    RandomNumberGenerator._key = new Uint8Array(Cryptography.Sha256.computeHash(data));
                }
                var aes = new Cryptography.Aes(RandomNumberGenerator._key, RandomNumberGenerator.getWeakRandomValues(16));
                var src = new Uint8Array(16);
                var dst = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
                for (var i = 0; i < dst.length; i += 16) {
                    aes.encryptBlock(RandomNumberGenerator.getWeakRandomValues(16), src);
                    Array.copy(src, 0, dst, i, Math.min(dst.length - i, 16));
                }
                return array;
            };
            RandomNumberGenerator.getWeakRandomValues = function (array) {
                var buffer = typeof array === "number" ? new Uint8Array(array) : array;
                for (var i = 0; i < buffer.length; i++)
                    buffer[i] = Math.random() * 256;
                return buffer;
            };
            RandomNumberGenerator.processDeviceMotionEvent = function (event) {
                RandomNumberGenerator.addEntropy([event.accelerationIncludingGravity.x, event.accelerationIncludingGravity.y, event.accelerationIncludingGravity.z], 1);
                RandomNumberGenerator.processEvent(event);
            };
            RandomNumberGenerator.processEvent = function (event) {
                if (window.performance && window.performance.now)
                    RandomNumberGenerator.addEntropy([window.performance.now()], 20);
                else
                    RandomNumberGenerator.addEntropy([event.timeStamp], 2);
            };
            RandomNumberGenerator.processMouseEvent = function (event) {
                RandomNumberGenerator.addEntropy([event.clientX, event.clientY, event.offsetX, event.offsetY, event.screenX, event.screenY], 4);
                RandomNumberGenerator.processEvent(event);
            };
            RandomNumberGenerator.processTouchEvent = function (event) {
                var touches = event.changedTouches || event.touches;
                for (var i = 0; i < touches.length; i++)
                    RandomNumberGenerator.addEntropy([touches[i].clientX, touches[i].clientY, touches[i]["radiusX"], touches[i]["radiusY"], touches[i]["force"]], 1);
                RandomNumberGenerator.processEvent(event);
            };
            RandomNumberGenerator.startCollectors = function () {
                if (RandomNumberGenerator._started)
                    return;
                window.addEventListener("load", RandomNumberGenerator.processEvent, false);
                window.addEventListener("mousemove", RandomNumberGenerator.processMouseEvent, false);
                window.addEventListener("keypress", RandomNumberGenerator.processEvent, false);
                window.addEventListener("devicemotion", RandomNumberGenerator.processDeviceMotionEvent, false);
                window.addEventListener("touchmove", RandomNumberGenerator.processTouchEvent, false);
                RandomNumberGenerator._started = true;
            };
            RandomNumberGenerator.stopCollectors = function () {
                if (RandomNumberGenerator._stopped)
                    return;
                window.removeEventListener("load", RandomNumberGenerator.processEvent, false);
                window.removeEventListener("mousemove", RandomNumberGenerator.processMouseEvent, false);
                window.removeEventListener("keypress", RandomNumberGenerator.processEvent, false);
                window.removeEventListener("devicemotion", RandomNumberGenerator.processDeviceMotionEvent, false);
                window.removeEventListener("touchmove", RandomNumberGenerator.processTouchEvent, false);
                RandomNumberGenerator._stopped = true;
            };
            RandomNumberGenerator._entropy = [];
            RandomNumberGenerator._strength = 0;
            RandomNumberGenerator._started = false;
            RandomNumberGenerator._stopped = false;
            return RandomNumberGenerator;
        }());
        Cryptography.RandomNumberGenerator = RandomNumberGenerator;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        String.prototype.base58Decode = function () {
            return Cryptography.Base58.decode(this);
        };
        String.prototype.base64UrlDecode = function () {
            var str = window.atob(this.replace(/-/g, '+').replace(/_/g, '/'));
            var arr = new Uint8Array(str.length);
            for (var i = 0; i < str.length; i++)
                arr[i] = str.charCodeAt(i);
            return arr;
        };
        String.prototype.toAesKey = function () {
            var utf8 = unescape(encodeURIComponent(this));
            var codes = new Uint8Array(utf8.length);
            for (var i = 0; i < codes.length; i++)
                codes[i] = utf8.charCodeAt(i);
            return window.crypto.subtle.digest({ name: "SHA-256" }, codes).then(function (result) {
                return window.crypto.subtle.digest({ name: "SHA-256" }, result);
            });
        };
        Uint8Array.prototype.base58Encode = function () {
            return Cryptography.Base58.encode(this);
        };
        Uint8Array.prototype.base64UrlEncode = function () {
            var str = String.fromCharCode.apply(null, this);
            str = window.btoa(str);
            return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        };
        var getAlgorithmName = function (algorithm) { return typeof algorithm === "string" ? algorithm : algorithm.name; };
        var w = window;
        if (window.crypto == null)
            window.crypto = { subtle: null, getRandomValues: null };
        if (window.crypto.getRandomValues == null) {
            if (w.msCrypto) {
                w.crypto.getRandomValues = function (array) { return w.msCrypto.getRandomValues(array); };
            }
            else {
                Cryptography.RandomNumberGenerator.startCollectors();
                window.crypto.getRandomValues = Cryptography.RandomNumberGenerator.getRandomValues;
            }
        }
        w.crypto.subtle = window.crypto.subtle || w.crypto.webkitSubtle;
        if (window.crypto.subtle == null && w.msCrypto) {
            window.crypto.subtle = {
                decrypt: function (a, b, c) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.decrypt(a, b, c); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                deriveBits: function (a, b, c) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.deriveBits(a, b, c); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                deriveKey: function (a, b, c, d, e) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.deriveKey(a, b, c, d, e); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                digest: function (a, b) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.digest(a, b); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                encrypt: function (a, b, c) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.encrypt(a, b, c); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                exportKey: function (a, b) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.exportKey(a, b); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                generateKey: function (a, b, c) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.generateKey(a, b, c); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                importKey: function (a, b, c, d, e) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.importKey(a, b, c, d, e); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                sign: function (a, b, c) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.sign(a, b, c); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                unwrapKey: function (a, b, c, d, e, f, g) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.unwrapKey(a, b, c, d, e, f, g); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                verify: function (a, b, c, d) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.verify(a, b, c, d); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
                wrapKey: function (a, b, c, d) { return new NeoPromise(function (resolve, reject) { var op = w.msCrypto.subtle.wrapKey(a, b, c, d); op.oncomplete = function () { return resolve(op.result); }; op.onerror = function (e) { return reject(e); }; }); },
            };
        }
        if (window.crypto.subtle == null) {
            window.crypto.subtle = {
                decrypt: function (algorithm, key, data) { return new NeoPromise(function (resolve, reject) {
                    if (typeof algorithm === "string" || algorithm.name != "AES-CBC" || !algorithm.iv || algorithm.iv.byteLength != 16 || data.byteLength % 16 != 0) {
                        reject(new RangeError());
                        return;
                    }
                    try {
                        var aes = new Cryptography.Aes(key.export(), algorithm.iv);
                        resolve(aes.decrypt(data));
                    }
                    catch (e) {
                        reject(e);
                    }
                }); },
                deriveBits: null,
                deriveKey: null,
                digest: function (algorithm, data) { return new NeoPromise(function (resolve, reject) {
                    if (getAlgorithmName(algorithm) != "SHA-256") {
                        reject(new RangeError());
                        return;
                    }
                    try {
                        resolve(Cryptography.Sha256.computeHash(data));
                    }
                    catch (e) {
                        reject(e);
                    }
                }); },
                encrypt: function (algorithm, key, data) { return new NeoPromise(function (resolve, reject) {
                    if (typeof algorithm === "string" || algorithm.name != "AES-CBC" || !algorithm.iv || algorithm.iv.byteLength != 16) {
                        reject(new RangeError());
                        return;
                    }
                    try {
                        var aes = new Cryptography.Aes(key.export(), algorithm.iv);
                        resolve(aes.encrypt(data));
                    }
                    catch (e) {
                        reject(e);
                    }
                }); },
                exportKey: function (format, key) { return new NeoPromise(function (resolve, reject) {
                    if (format != "jwk" || !(key instanceof Cryptography.AesCryptoKey)) {
                        reject(new RangeError());
                        return;
                    }
                    try {
                        var k = key;
                        resolve({
                            alg: "A256CBC",
                            ext: true,
                            k: k.export().base64UrlEncode(),
                            key_ops: k.usages,
                            kty: "oct"
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                }); },
                generateKey: function (algorithm, extractable, keyUsages) { return new NeoPromise(function (resolve, reject) {
                    if (typeof algorithm === "string" || algorithm.name != "AES-CBC" || (algorithm.length != 128 && algorithm.length != 192 && algorithm.length != 256)) {
                        reject(new RangeError());
                        return;
                    }
                    try {
                        resolve(Cryptography.AesCryptoKey.create(algorithm.length));
                    }
                    catch (e) {
                        reject(e);
                    }
                }); },
                importKey: function (format, keyData, algorithm, extractable, keyUsages) { return new NeoPromise(function (resolve, reject) {
                    if ((format != "raw" && format != "jwk") || getAlgorithmName(algorithm) != "AES-CBC") {
                        reject(new RangeError());
                        return;
                    }
                    try {
                        if (format == "jwk")
                            keyData = keyData.k.base64UrlDecode();
                        resolve(Cryptography.AesCryptoKey.import(keyData));
                    }
                    catch (e) {
                        reject(e);
                    }
                }); },
                sign: null,
                unwrapKey: null,
                verify: null,
                wrapKey: null,
            };
        }
        function hook_ripemd160() {
            var digest_old = window.crypto.subtle.digest;
            window.crypto.subtle.digest = function (algorithm, data) {
                if (getAlgorithmName(algorithm) != "RIPEMD-160")
                    return digest_old.call(window.crypto.subtle, algorithm, data);
                return new NeoPromise(function (resolve, reject) {
                    try {
                        resolve(Cryptography.RIPEMD160.computeHash(data));
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            };
        }
        hook_ripemd160();
        function hook_ecdsa() {
            var exportKey_old = window.crypto.subtle.exportKey;
            window.crypto.subtle.exportKey = function (format, key) {
                if (key.algorithm.name != "ECDSA")
                    return exportKey_old.call(window.crypto.subtle, format, key);
                return new NeoPromise(function (resolve, reject) {
                    var k = key;
                    if (format != "jwk" || k.algorithm.namedCurve != "P-256")
                        reject(new RangeError());
                    else
                        try {
                            if (k.type == "private")
                                resolve({
                                    crv: k.algorithm.namedCurve,
                                    d: k.privateKey.base64UrlEncode(),
                                    ext: true,
                                    key_ops: k.usages,
                                    kty: "EC",
                                    x: k.publicKey.x.value.toUint8Array(false, 32).base64UrlEncode(),
                                    y: k.publicKey.y.value.toUint8Array(false, 32).base64UrlEncode()
                                });
                            else
                                resolve({
                                    crv: k.algorithm.namedCurve,
                                    ext: true,
                                    key_ops: k.usages,
                                    kty: "EC",
                                    x: k.publicKey.x.value.toUint8Array(false, 32).base64UrlEncode(),
                                    y: k.publicKey.y.value.toUint8Array(false, 32).base64UrlEncode()
                                });
                        }
                        catch (e) {
                            reject(e);
                        }
                });
            };
            var generateKey_old = window.crypto.subtle.generateKey;
            window.crypto.subtle.generateKey = function (algorithm, extractable, keyUsages) {
                if (getAlgorithmName(algorithm) != "ECDSA")
                    return generateKey_old.call(window.crypto.subtle, algorithm, extractable, keyUsages);
                return new NeoPromise(function (resolve, reject) {
                    if (algorithm.namedCurve != "P-256")
                        reject(new RangeError());
                    else
                        try {
                            resolve(Cryptography.ECDsa.generateKey(Cryptography.ECCurve.secp256r1));
                        }
                        catch (e) {
                            reject(e);
                        }
                });
            };
            var importKey_old = window.crypto.subtle.importKey;
            window.crypto.subtle.importKey = function (format, keyData, algorithm, extractable, keyUsages) {
                if (getAlgorithmName(algorithm) != "ECDSA")
                    return importKey_old.call(window.crypto.subtle, format, keyData, algorithm, extractable, keyUsages);
                return new NeoPromise(function (resolve, reject) {
                    if (format != "jwk" || algorithm.namedCurve != "P-256")
                        reject(new RangeError());
                    else
                        try {
                            var k = keyData;
                            var x = k.x.base64UrlDecode();
                            var y = k.y.base64UrlDecode();
                            var arr = new Uint8Array(65);
                            arr[0] = 0x04;
                            Array.copy(x, 0, arr, 1, 32);
                            Array.copy(y, 0, arr, 33, 32);
                            var pubkey = Cryptography.ECPoint.decodePoint(arr, Cryptography.ECCurve.secp256r1);
                            if (k.d)
                                resolve(new Cryptography.ECDsaCryptoKey(pubkey, k.d.base64UrlDecode()));
                            else
                                resolve(new Cryptography.ECDsaCryptoKey(pubkey));
                        }
                        catch (e) {
                            reject(e);
                        }
                });
            };
            var sign_old = window.crypto.subtle.sign;
            window.crypto.subtle.sign = function (algorithm, key, data) {
                if (getAlgorithmName(algorithm) != "ECDSA")
                    return sign_old.call(window.crypto.subtle, algorithm, key, data);
                return new NeoPromise(function (resolve, reject) {
                    if (algorithm.hash.name != "SHA-256" || key.algorithm.name != "ECDSA")
                        reject(new RangeError());
                    else
                        try {
                            var ecdsa = new Cryptography.ECDsa(key);
                            resolve(ecdsa.sign(data));
                        }
                        catch (e) {
                            reject(e);
                        }
                });
            };
            var verify_old = window.crypto.subtle.verify;
            window.crypto.subtle.verify = function (algorithm, key, signature, data) {
                if (getAlgorithmName(algorithm) != "ECDSA")
                    return verify_old.call(window.crypto.subtle, algorithm, key, signature, data);
                return new NeoPromise(function (resolve, reject) {
                    if (algorithm.hash.name != "SHA-256" || key.algorithm.name != "ECDSA")
                        reject(new RangeError());
                    else
                        try {
                            var ecdsa = new Cryptography.ECDsa(key);
                            resolve(ecdsa.verify(data, signature));
                        }
                        catch (e) {
                            reject(e);
                        }
                });
            };
        }
        try {
            window.crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"]).catch(hook_ecdsa);
        }
        catch (ex) {
            hook_ecdsa();
        }
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var RIPEMD160 = (function () {
            function RIPEMD160() {
            }
            RIPEMD160.bytesToWords = function (bytes) {
                var words = [];
                for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
                    words[b >>> 5] |= bytes[i] << (24 - b % 32);
                }
                return words;
            };
            RIPEMD160.wordsToBytes = function (words) {
                var bytes = [];
                for (var b = 0; b < words.length * 32; b += 8) {
                    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
                }
                return bytes;
            };
            RIPEMD160.processBlock = function (H, M, offset) {
                for (var i = 0; i < 16; i++) {
                    var offset_i = offset + i;
                    var M_offset_i = M[offset_i];
                    M[offset_i] = ((((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
                        (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00));
                }
                var al, bl, cl, dl, el;
                var ar, br, cr, dr, er;
                ar = al = H[0];
                br = bl = H[1];
                cr = cl = H[2];
                dr = dl = H[3];
                er = el = H[4];
                var t;
                for (var i = 0; i < 80; i += 1) {
                    t = (al + M[offset + RIPEMD160.zl[i]]) | 0;
                    if (i < 16) {
                        t += RIPEMD160.f1(bl, cl, dl) + RIPEMD160.hl[0];
                    }
                    else if (i < 32) {
                        t += RIPEMD160.f2(bl, cl, dl) + RIPEMD160.hl[1];
                    }
                    else if (i < 48) {
                        t += RIPEMD160.f3(bl, cl, dl) + RIPEMD160.hl[2];
                    }
                    else if (i < 64) {
                        t += RIPEMD160.f4(bl, cl, dl) + RIPEMD160.hl[3];
                    }
                    else {
                        t += RIPEMD160.f5(bl, cl, dl) + RIPEMD160.hl[4];
                    }
                    t = t | 0;
                    t = RIPEMD160.rotl(t, RIPEMD160.sl[i]);
                    t = (t + el) | 0;
                    al = el;
                    el = dl;
                    dl = RIPEMD160.rotl(cl, 10);
                    cl = bl;
                    bl = t;
                    t = (ar + M[offset + RIPEMD160.zr[i]]) | 0;
                    if (i < 16) {
                        t += RIPEMD160.f5(br, cr, dr) + RIPEMD160.hr[0];
                    }
                    else if (i < 32) {
                        t += RIPEMD160.f4(br, cr, dr) + RIPEMD160.hr[1];
                    }
                    else if (i < 48) {
                        t += RIPEMD160.f3(br, cr, dr) + RIPEMD160.hr[2];
                    }
                    else if (i < 64) {
                        t += RIPEMD160.f2(br, cr, dr) + RIPEMD160.hr[3];
                    }
                    else {
                        t += RIPEMD160.f1(br, cr, dr) + RIPEMD160.hr[4];
                    }
                    t = t | 0;
                    t = RIPEMD160.rotl(t, RIPEMD160.sr[i]);
                    t = (t + er) | 0;
                    ar = er;
                    er = dr;
                    dr = RIPEMD160.rotl(cr, 10);
                    cr = br;
                    br = t;
                }
                t = (H[1] + cl + dr) | 0;
                H[1] = (H[2] + dl + er) | 0;
                H[2] = (H[3] + el + ar) | 0;
                H[3] = (H[4] + al + br) | 0;
                H[4] = (H[0] + bl + cr) | 0;
                H[0] = t;
            };
            RIPEMD160.f1 = function (x, y, z) { return ((x) ^ (y) ^ (z)); };
            RIPEMD160.f2 = function (x, y, z) { return (((x) & (y)) | ((~x) & (z))); };
            RIPEMD160.f3 = function (x, y, z) { return (((x) | (~(y))) ^ (z)); };
            RIPEMD160.f4 = function (x, y, z) { return (((x) & (z)) | ((y) & (~(z)))); };
            RIPEMD160.f5 = function (x, y, z) { return ((x) ^ ((y) | (~(z)))); };
            RIPEMD160.rotl = function (x, n) { return (x << n) | (x >>> (32 - n)); };
            RIPEMD160.computeHash = function (data) {
                var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
                var m = RIPEMD160.bytesToWords(Uint8Array.fromArrayBuffer(data));
                var nBitsLeft = data.byteLength * 8;
                var nBitsTotal = data.byteLength * 8;
                m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
                m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = ((((nBitsTotal << 8) | (nBitsTotal >>> 24)) & 0x00ff00ff) |
                    (((nBitsTotal << 24) | (nBitsTotal >>> 8)) & 0xff00ff00));
                for (var i = 0; i < m.length; i += 16) {
                    RIPEMD160.processBlock(H, m, i);
                }
                for (var i = 0; i < 5; i++) {
                    var H_i = H[i];
                    H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
                        (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
                }
                var digestbytes = RIPEMD160.wordsToBytes(H);
                return new Uint8Array(digestbytes).buffer;
            };
            RIPEMD160.zl = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
                3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
                1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
                4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
            ];
            RIPEMD160.zr = [
                5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
                6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
                15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
                8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
                12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
            ];
            RIPEMD160.sl = [
                11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
                7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
                11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
                11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
                9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
            ];
            RIPEMD160.sr = [
                8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
                9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
                9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
                15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
                8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
            ];
            RIPEMD160.hl = [0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
            RIPEMD160.hr = [0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];
            return RIPEMD160;
        }());
        Cryptography.RIPEMD160 = RIPEMD160;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var Cryptography;
    (function (Cryptography) {
        var Sha256 = (function () {
            function Sha256() {
            }
            Sha256.computeHash = function (data) {
                var H = new Uint32Array([
                    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
                ]);
                var l = data.byteLength / 4 + 2;
                var N = Math.ceil(l / 16);
                var M = new Array(N);
                var view = Uint8Array.fromArrayBuffer(data);
                for (var i = 0; i < N; i++) {
                    M[i] = new Uint32Array(16);
                    for (var j = 0; j < 16; j++) {
                        M[i][j] = (view[i * 64 + j * 4] << 24) | (view[i * 64 + j * 4 + 1] << 16) |
                            (view[i * 64 + j * 4 + 2] << 8) | (view[i * 64 + j * 4 + 3]);
                    }
                }
                M[Math.floor(data.byteLength / 4 / 16)][Math.floor(data.byteLength / 4) % 16] |= 0x80 << ((3 - data.byteLength % 4) * 8);
                M[N - 1][14] = (data.byteLength * 8) / Math.pow(2, 32);
                M[N - 1][15] = (data.byteLength * 8) & 0xffffffff;
                var W = new Uint32Array(64);
                var a, b, c, d, e, f, g, h;
                for (var i = 0; i < N; i++) {
                    for (var t = 0; t < 16; t++)
                        W[t] = M[i][t];
                    for (var t = 16; t < 64; t++)
                        W[t] = (Sha256.σ1(W[t - 2]) + W[t - 7] + Sha256.σ0(W[t - 15]) + W[t - 16]) & 0xffffffff;
                    a = H[0];
                    b = H[1];
                    c = H[2];
                    d = H[3];
                    e = H[4];
                    f = H[5];
                    g = H[6];
                    h = H[7];
                    for (var t = 0; t < 64; t++) {
                        var T1 = h + Sha256.Σ1(e) + Sha256.Ch(e, f, g) + Sha256.K[t] + W[t];
                        var T2 = Sha256.Σ0(a) + Sha256.Maj(a, b, c);
                        h = g;
                        g = f;
                        f = e;
                        e = (d + T1) & 0xffffffff;
                        d = c;
                        c = b;
                        b = a;
                        a = (T1 + T2) & 0xffffffff;
                    }
                    H[0] = (H[0] + a) & 0xffffffff;
                    H[1] = (H[1] + b) & 0xffffffff;
                    H[2] = (H[2] + c) & 0xffffffff;
                    H[3] = (H[3] + d) & 0xffffffff;
                    H[4] = (H[4] + e) & 0xffffffff;
                    H[5] = (H[5] + f) & 0xffffffff;
                    H[6] = (H[6] + g) & 0xffffffff;
                    H[7] = (H[7] + h) & 0xffffffff;
                }
                var result = new Uint8Array(32);
                for (var i = 0; i < H.length; i++) {
                    result[i * 4 + 0] = (H[i] >>> (3 * 8)) & 0xff;
                    result[i * 4 + 1] = (H[i] >>> (2 * 8)) & 0xff;
                    result[i * 4 + 2] = (H[i] >>> (1 * 8)) & 0xff;
                    result[i * 4 + 3] = (H[i] >>> (0 * 8)) & 0xff;
                }
                return result.buffer;
            };
            Sha256.ROTR = function (n, x) { return (x >>> n) | (x << (32 - n)); };
            Sha256.Σ0 = function (x) { return Sha256.ROTR(2, x) ^ Sha256.ROTR(13, x) ^ Sha256.ROTR(22, x); };
            Sha256.Σ1 = function (x) { return Sha256.ROTR(6, x) ^ Sha256.ROTR(11, x) ^ Sha256.ROTR(25, x); };
            Sha256.σ0 = function (x) { return Sha256.ROTR(7, x) ^ Sha256.ROTR(18, x) ^ (x >>> 3); };
            Sha256.σ1 = function (x) { return Sha256.ROTR(17, x) ^ Sha256.ROTR(19, x) ^ (x >>> 10); };
            Sha256.Ch = function (x, y, z) { return (x & y) ^ (~x & z); };
            Sha256.Maj = function (x, y, z) { return (x & y) ^ (x & z) ^ (y & z); };
            Sha256.K = [
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
            ];
            return Sha256;
        }());
        Cryptography.Sha256 = Sha256;
    })(Cryptography = Neo.Cryptography || (Neo.Cryptography = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var IO;
    (function (IO) {
        var BinaryReader = (function () {
            function BinaryReader(input) {
                this.input = input;
                this._buffer = new ArrayBuffer(8);
            }
            BinaryReader.prototype.canRead = function () {
                return this.input.length() - this.input.position();
            };
            BinaryReader.prototype.close = function () {
            };
            BinaryReader.prototype.fillBuffer = function (buffer, count) {
                var i = 0;
                while (count > 0) {
                    var actual_count = this.input.read(buffer, 0, count);
                    if (actual_count == 0)
                        throw new Error("EOF");
                    i += actual_count;
                    count -= actual_count;
                }
            };
            BinaryReader.prototype.read = function (buffer, index, count) {
                return this.input.read(buffer, index, count);
            };
            BinaryReader.prototype.readBoolean = function () {
                return this.readByte() != 0;
            };
            BinaryReader.prototype.readByte = function () {
                this.fillBuffer(this._buffer, 1);
                if (this.array_uint8 == null)
                    this.array_uint8 = new Uint8Array(this._buffer, 0, 1);
                return this.array_uint8[0];
            };
            BinaryReader.prototype.readBytes = function (count) {
                var buffer = new ArrayBuffer(count);
                this.fillBuffer(buffer, count);
                return buffer;
            };
            BinaryReader.prototype.readDouble = function () {
                this.fillBuffer(this._buffer, 8);
                if (this.array_float64 == null)
                    this.array_float64 = new Float64Array(this._buffer, 0, 1);
                return this.array_float64[0];
            };
            BinaryReader.prototype.readFixed8 = function () {
                return new Neo.Fixed8(this.readUint64());
            };
            BinaryReader.prototype.readInt16 = function () {
                this.fillBuffer(this._buffer, 2);
                if (this.array_int16 == null)
                    this.array_int16 = new Int16Array(this._buffer, 0, 1);
                return this.array_int16[0];
            };
            BinaryReader.prototype.readInt32 = function () {
                this.fillBuffer(this._buffer, 4);
                if (this.array_int32 == null)
                    this.array_int32 = new Int32Array(this._buffer, 0, 1);
                return this.array_int32[0];
            };
            BinaryReader.prototype.readSByte = function () {
                this.fillBuffer(this._buffer, 1);
                if (this.array_int8 == null)
                    this.array_int8 = new Int8Array(this._buffer, 0, 1);
                return this.array_int8[0];
            };
            BinaryReader.prototype.readSerializable = function (T) {
                var obj = new T();
                obj.deserialize(this);
                return obj;
            };
            BinaryReader.prototype.readSerializableArray = function (T) {
                var array = new Array(this.readVarInt(0x10000000));
                for (var i = 0; i < array.length; i++)
                    array[i] = this.readSerializable(T);
                return array;
            };
            BinaryReader.prototype.readSingle = function () {
                this.fillBuffer(this._buffer, 4);
                if (this.array_float32 == null)
                    this.array_float32 = new Float32Array(this._buffer, 0, 1);
                return this.array_float32[0];
            };
            BinaryReader.prototype.readUint16 = function () {
                this.fillBuffer(this._buffer, 2);
                if (this.array_uint16 == null)
                    this.array_uint16 = new Uint16Array(this._buffer, 0, 1);
                return this.array_uint16[0];
            };
            BinaryReader.prototype.readUint160 = function () {
                return new Neo.Uint160(this.readBytes(20));
            };
            BinaryReader.prototype.readUint256 = function () {
                return new Neo.Uint256(this.readBytes(32));
            };
            BinaryReader.prototype.readUint32 = function () {
                this.fillBuffer(this._buffer, 4);
                if (this.array_uint32 == null)
                    this.array_uint32 = new Uint32Array(this._buffer, 0, 1);
                return this.array_uint32[0];
            };
            BinaryReader.prototype.readUint64 = function () {
                this.fillBuffer(this._buffer, 8);
                if (this.array_uint32 == null)
                    this.array_uint32 = new Uint32Array(this._buffer, 0, 2);
                return new Neo.Uint64(this.array_uint32[0], this.array_uint32[1]);
            };
            BinaryReader.prototype.readVarBytes = function (max) {
                if (max === void 0) { max = 0X7fffffc7; }
                return this.readBytes(this.readVarInt(max));
            };
            BinaryReader.prototype.readVarInt = function (max) {
                if (max === void 0) { max = 9007199254740991; }
                var fb = this.readByte();
                var value;
                if (fb == 0xfd)
                    value = this.readUint16();
                else if (fb == 0xfe)
                    value = this.readUint32();
                else if (fb == 0xff)
                    value = this.readUint64().toNumber();
                else
                    value = fb;
                if (value > max)
                    throw new RangeError();
                return value;
            };
            BinaryReader.prototype.readVarString = function () {
                return decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(this.readVarBytes()))));
            };
            return BinaryReader;
        }());
        IO.BinaryReader = BinaryReader;
    })(IO = Neo.IO || (Neo.IO = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var IO;
    (function (IO) {
        var BinaryWriter = (function () {
            function BinaryWriter(output) {
                this.output = output;
                this._buffer = new ArrayBuffer(8);
            }
            BinaryWriter.prototype.close = function () {
            };
            BinaryWriter.prototype.seek = function (offset, origin) {
                return this.output.seek(offset, origin);
            };
            BinaryWriter.prototype.write = function (buffer, index, count) {
                if (index === void 0) { index = 0; }
                if (count === void 0) { count = buffer.byteLength - index; }
                this.output.write(buffer, index, count);
            };
            BinaryWriter.prototype.writeBoolean = function (value) {
                this.writeByte(value ? 0xff : 0);
            };
            BinaryWriter.prototype.writeByte = function (value) {
                if (this.array_uint8 == null)
                    this.array_uint8 = new Uint8Array(this._buffer, 0, 1);
                this.array_uint8[0] = value;
                this.output.write(this._buffer, 0, 1);
            };
            BinaryWriter.prototype.writeDouble = function (value) {
                if (this.array_float64 == null)
                    this.array_float64 = new Float64Array(this._buffer, 0, 1);
                this.array_float64[0] = value;
                this.output.write(this._buffer, 0, 8);
            };
            BinaryWriter.prototype.writeInt16 = function (value) {
                if (this.array_int16 == null)
                    this.array_int16 = new Int16Array(this._buffer, 0, 1);
                this.array_int16[0] = value;
                this.output.write(this._buffer, 0, 2);
            };
            BinaryWriter.prototype.writeInt32 = function (value) {
                if (this.array_int32 == null)
                    this.array_int32 = new Int32Array(this._buffer, 0, 1);
                this.array_int32[0] = value;
                this.output.write(this._buffer, 0, 4);
            };
            BinaryWriter.prototype.writeSByte = function (value) {
                if (this.array_int8 == null)
                    this.array_int8 = new Int8Array(this._buffer, 0, 1);
                this.array_int8[0] = value;
                this.output.write(this._buffer, 0, 1);
            };
            BinaryWriter.prototype.writeSerializableArray = function (array) {
                this.writeVarInt(array.length);
                for (var i = 0; i < array.length; i++)
                    array[i].serialize(this);
            };
            BinaryWriter.prototype.writeSingle = function (value) {
                if (this.array_float32 == null)
                    this.array_float32 = new Float32Array(this._buffer, 0, 1);
                this.array_float32[0] = value;
                this.output.write(this._buffer, 0, 4);
            };
            BinaryWriter.prototype.writeUint16 = function (value) {
                if (this.array_uint16 == null)
                    this.array_uint16 = new Uint16Array(this._buffer, 0, 1);
                this.array_uint16[0] = value;
                this.output.write(this._buffer, 0, 2);
            };
            BinaryWriter.prototype.writeUint32 = function (value) {
                if (this.array_uint32 == null)
                    this.array_uint32 = new Uint32Array(this._buffer, 0, 1);
                this.array_uint32[0] = value;
                this.output.write(this._buffer, 0, 4);
            };
            BinaryWriter.prototype.writeUint64 = function (value) {
                this.writeUintVariable(value);
            };
            BinaryWriter.prototype.writeUintVariable = function (value) {
                this.write(value.bits.buffer);
            };
            BinaryWriter.prototype.writeVarBytes = function (value) {
                this.writeVarInt(value.byteLength);
                this.output.write(value, 0, value.byteLength);
            };
            BinaryWriter.prototype.writeVarInt = function (value) {
                if (value < 0)
                    throw new RangeError();
                if (value < 0xfd) {
                    this.writeByte(value);
                }
                else if (value <= 0xffff) {
                    this.writeByte(0xfd);
                    this.writeUint16(value);
                }
                else if (value <= 0xFFFFFFFF) {
                    this.writeByte(0xfe);
                    this.writeUint32(value);
                }
                else {
                    this.writeByte(0xff);
                    this.writeUint32(value);
                    this.writeUint32(value / Math.pow(2, 32));
                }
            };
            BinaryWriter.prototype.writeVarString = function (value) {
                value = unescape(encodeURIComponent(value));
                var codes = new Uint8Array(value.length);
                for (var i = 0; i < codes.length; i++)
                    codes[i] = value.charCodeAt(i);
                this.writeVarBytes(codes.buffer);
            };
            return BinaryWriter;
        }());
        IO.BinaryWriter = BinaryWriter;
    })(IO = Neo.IO || (Neo.IO = {}));
})(Neo || (Neo = {}));
Uint8Array.prototype.asSerializable = function (T) {
    var ms = new Neo.IO.MemoryStream(this.buffer, false);
    var reader = new Neo.IO.BinaryReader(ms);
    return reader.readSerializable(T);
};
Uint8Array.fromSerializable = function (obj) {
    var ms = new Neo.IO.MemoryStream();
    var writer = new Neo.IO.BinaryWriter(ms);
    obj.serialize(writer);
    return new Uint8Array(ms.toArray());
};
var Neo;
(function (Neo) {
    var IO;
    (function (IO) {
        var SeekOrigin;
        (function (SeekOrigin) {
            SeekOrigin[SeekOrigin["Begin"] = 0] = "Begin";
            SeekOrigin[SeekOrigin["Current"] = 1] = "Current";
            SeekOrigin[SeekOrigin["End"] = 2] = "End";
        })(SeekOrigin = IO.SeekOrigin || (IO.SeekOrigin = {}));
        var Stream = (function () {
            function Stream() {
                this._array = new Uint8Array(1);
            }
            Stream.prototype.close = function () { };
            Stream.prototype.readByte = function () {
                if (this.read(this._array.buffer, 0, 1) == 0)
                    return -1;
                return this._array[0];
            };
            Stream.prototype.writeByte = function (value) {
                if (value < 0 || value > 255)
                    throw new RangeError();
                this._array[0] = value;
                this.write(this._array.buffer, 0, 1);
            };
            return Stream;
        }());
        IO.Stream = Stream;
    })(IO = Neo.IO || (Neo.IO = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var IO;
    (function (IO) {
        var BufferSize = 1024;
        var MemoryStream = (function (_super) {
            __extends(MemoryStream, _super);
            function MemoryStream() {
                var _this = _super.call(this) || this;
                _this._buffers = new Array();
                _this._origin = 0;
                _this._position = 0;
                if (arguments.length == 0) {
                    _this._length = 0;
                    _this._capacity = 0;
                    _this._expandable = true;
                    _this._writable = true;
                }
                else if (arguments.length == 1 && typeof arguments[0] === "number") {
                    _this._length = 0;
                    _this._capacity = arguments[0];
                    _this._expandable = true;
                    _this._writable = true;
                    _this._buffers.push(new ArrayBuffer(_this._capacity));
                }
                else {
                    var buffer = arguments[0];
                    _this._buffers.push(buffer);
                    _this._expandable = false;
                    if (arguments.length == 1) {
                        _this._writable = false;
                        _this._length = buffer.byteLength;
                    }
                    else if (typeof arguments[1] === "boolean") {
                        _this._writable = arguments[1];
                        _this._length = buffer.byteLength;
                    }
                    else {
                        _this._origin = arguments[1];
                        _this._length = arguments[2];
                        _this._writable = arguments.length == 4 ? arguments[3] : false;
                        if (_this._origin < 0 || _this._origin + _this._length > buffer.byteLength)
                            throw new RangeError();
                    }
                    _this._capacity = _this._length;
                }
                return _this;
            }
            MemoryStream.prototype.canRead = function () {
                return true;
            };
            MemoryStream.prototype.canSeek = function () {
                return true;
            };
            MemoryStream.prototype.canWrite = function () {
                return this._writable;
            };
            MemoryStream.prototype.capacity = function () {
                return this._capacity;
            };
            MemoryStream.prototype.findBuffer = function (position) {
                var iBuff, pBuff;
                var firstSize = this._buffers[0] == null ? BufferSize : this._buffers[0].byteLength;
                if (position < firstSize) {
                    iBuff = 0;
                    pBuff = position;
                }
                else {
                    iBuff = Math.floor((position - firstSize) / BufferSize) + 1;
                    pBuff = (position - firstSize) % BufferSize;
                }
                return { iBuff: iBuff, pBuff: pBuff };
            };
            MemoryStream.prototype.length = function () {
                return this._length;
            };
            MemoryStream.prototype.position = function () {
                return this._position;
            };
            MemoryStream.prototype.read = function (buffer, offset, count) {
                if (this._position + count > this._length)
                    count = this._length - this._position;
                this.readInternal(new Uint8Array(buffer, offset, count), this._position);
                this._position += count;
                return count;
            };
            MemoryStream.prototype.readInternal = function (dst, srcPos) {
                if (this._expandable) {
                    var i = 0, count = dst.length;
                    var d = this.findBuffer(srcPos);
                    while (count > 0) {
                        var actual_count = void 0;
                        if (this._buffers[d.iBuff] == null) {
                            actual_count = Math.min(count, BufferSize - d.pBuff);
                            dst.fill(0, i, i + actual_count);
                        }
                        else {
                            actual_count = Math.min(count, this._buffers[d.iBuff].byteLength - d.pBuff);
                            var src = new Uint8Array(this._buffers[d.iBuff]);
                            Array.copy(src, d.pBuff, dst, i, actual_count);
                        }
                        i += actual_count;
                        count -= actual_count;
                        d.iBuff++;
                        d.pBuff = 0;
                    }
                }
                else {
                    var src = new Uint8Array(this._buffers[0], this._origin, this._length);
                    Array.copy(src, srcPos, dst, 0, dst.length);
                }
            };
            MemoryStream.prototype.seek = function (offset, origin) {
                switch (origin) {
                    case IO.SeekOrigin.Begin:
                        break;
                    case IO.SeekOrigin.Current:
                        offset += this._position;
                        break;
                    case IO.SeekOrigin.End:
                        offset += this._length;
                        break;
                    default:
                        throw new RangeError();
                }
                if (offset < 0 || offset > this._length)
                    throw new RangeError();
                this._position = offset;
                return offset;
            };
            MemoryStream.prototype.setLength = function (value) {
                if (value < 0 || (value != this._length && !this._writable) || (value > this._capacity && !this._expandable))
                    throw new RangeError();
                this._length = value;
                if (this._position > this._length)
                    this._position = this._length;
                if (this._capacity < this._length)
                    this._capacity = this._length;
            };
            MemoryStream.prototype.toArray = function () {
                if (this._buffers.length == 1 && this._origin == 0 && this._length == this._buffers[0].byteLength)
                    return this._buffers[0];
                var bw = new Uint8Array(this._length);
                this.readInternal(bw, 0);
                return bw.buffer;
            };
            MemoryStream.prototype.write = function (buffer, offset, count) {
                if (!this._writable || (!this._expandable && this._capacity - this._position < count))
                    throw new Error();
                if (this._expandable) {
                    var src = new Uint8Array(buffer);
                    var d = this.findBuffer(this._position);
                    while (count > 0) {
                        if (this._buffers[d.iBuff] == null)
                            this._buffers[d.iBuff] = new ArrayBuffer(BufferSize);
                        var actual_count = Math.min(count, this._buffers[d.iBuff].byteLength - d.pBuff);
                        var dst = new Uint8Array(this._buffers[d.iBuff]);
                        Array.copy(src, offset, dst, d.pBuff, actual_count);
                        this._position += actual_count;
                        offset += actual_count;
                        count -= actual_count;
                        d.iBuff++;
                        d.pBuff = 0;
                    }
                }
                else {
                    var src = new Uint8Array(buffer, offset, count);
                    var dst = new Uint8Array(this._buffers[0], this._origin, this._capacity);
                    Array.copy(src, 0, dst, this._position, count);
                    this._position += count;
                }
                if (this._length < this._position)
                    this._length = this._position;
                if (this._capacity < this._length)
                    this._capacity = this._length;
            };
            return MemoryStream;
        }(IO.Stream));
        IO.MemoryStream = MemoryStream;
    })(IO = Neo.IO || (Neo.IO = {}));
})(Neo || (Neo = {}));
var ThinNeo;
(function (ThinNeo) {
    var Compiler;
    (function (Compiler) {
        var Avm2Asm = (function () {
            function Avm2Asm() {
            }
            Avm2Asm.Trans = function (script) {
                var breader = new Compiler.ByteReader(script);
                var arr = new Array();
                while (breader.End == false) {
                    var o = new Compiler.Op();
                    o.addr = breader.addr;
                    o.code = breader.ReadOP();
                    try {
                        if (o.code >= ThinNeo.OpCode.PUSHBYTES1 && o.code <= ThinNeo.OpCode.PUSHBYTES75) {
                            o.paramType = Compiler.ParamType.ByteArray;
                            var _count = o.code;
                            o.paramData = breader.ReadBytes(_count);
                        }
                        else {
                            switch (o.code) {
                                case ThinNeo.OpCode.PUSH0:
                                case ThinNeo.OpCode.PUSHM1:
                                case ThinNeo.OpCode.PUSH1:
                                case ThinNeo.OpCode.PUSH2:
                                case ThinNeo.OpCode.PUSH3:
                                case ThinNeo.OpCode.PUSH4:
                                case ThinNeo.OpCode.PUSH5:
                                case ThinNeo.OpCode.PUSH6:
                                case ThinNeo.OpCode.PUSH7:
                                case ThinNeo.OpCode.PUSH8:
                                case ThinNeo.OpCode.PUSH9:
                                case ThinNeo.OpCode.PUSH10:
                                case ThinNeo.OpCode.PUSH11:
                                case ThinNeo.OpCode.PUSH12:
                                case ThinNeo.OpCode.PUSH13:
                                case ThinNeo.OpCode.PUSH14:
                                case ThinNeo.OpCode.PUSH15:
                                case ThinNeo.OpCode.PUSH16:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                case ThinNeo.OpCode.PUSHDATA1:
                                    {
                                        o.paramType = Compiler.ParamType.ByteArray;
                                        var _count = breader.ReadByte();
                                        o.paramData = breader.ReadBytes(_count);
                                    }
                                    break;
                                case ThinNeo.OpCode.PUSHDATA2:
                                    {
                                        o.paramType = Compiler.ParamType.ByteArray;
                                        var _count = breader.ReadUInt16();
                                        o.paramData = breader.ReadBytes(_count);
                                    }
                                    break;
                                case ThinNeo.OpCode.PUSHDATA4:
                                    {
                                        o.paramType = Compiler.ParamType.ByteArray;
                                        var _count = breader.ReadInt32();
                                        o.paramData = breader.ReadBytes(_count);
                                    }
                                    break;
                                case ThinNeo.OpCode.NOP:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                case ThinNeo.OpCode.JMP:
                                case ThinNeo.OpCode.JMPIF:
                                case ThinNeo.OpCode.JMPIFNOT:
                                    o.paramType = Compiler.ParamType.Addr;
                                    o.paramData = breader.ReadBytes(2);
                                    break;
                                case ThinNeo.OpCode.CALL:
                                    o.paramType = Compiler.ParamType.Addr;
                                    o.paramData = breader.ReadBytes(2);
                                    break;
                                case ThinNeo.OpCode.RET:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                case ThinNeo.OpCode.APPCALL:
                                case ThinNeo.OpCode.TAILCALL:
                                    o.paramType = Compiler.ParamType.ByteArray;
                                    o.paramData = breader.ReadBytes(20);
                                    break;
                                case ThinNeo.OpCode.SYSCALL:
                                    o.paramType = Compiler.ParamType.String;
                                    o.paramData = breader.ReadVarBytes();
                                    break;
                                case ThinNeo.OpCode.DUPFROMALTSTACK:
                                case ThinNeo.OpCode.TOALTSTACK:
                                case ThinNeo.OpCode.FROMALTSTACK:
                                case ThinNeo.OpCode.XDROP:
                                case ThinNeo.OpCode.XSWAP:
                                case ThinNeo.OpCode.XTUCK:
                                case ThinNeo.OpCode.DEPTH:
                                case ThinNeo.OpCode.DROP:
                                case ThinNeo.OpCode.DUP:
                                case ThinNeo.OpCode.NIP:
                                case ThinNeo.OpCode.OVER:
                                case ThinNeo.OpCode.PICK:
                                case ThinNeo.OpCode.ROLL:
                                case ThinNeo.OpCode.ROT:
                                case ThinNeo.OpCode.SWAP:
                                case ThinNeo.OpCode.TUCK:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                case ThinNeo.OpCode.CAT:
                                case ThinNeo.OpCode.SUBSTR:
                                case ThinNeo.OpCode.LEFT:
                                case ThinNeo.OpCode.RIGHT:
                                case ThinNeo.OpCode.SIZE:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                case ThinNeo.OpCode.INVERT:
                                case ThinNeo.OpCode.AND:
                                case ThinNeo.OpCode.OR:
                                case ThinNeo.OpCode.XOR:
                                case ThinNeo.OpCode.EQUAL:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                case ThinNeo.OpCode.INC:
                                case ThinNeo.OpCode.DEC:
                                case ThinNeo.OpCode.SIGN:
                                case ThinNeo.OpCode.NEGATE:
                                case ThinNeo.OpCode.ABS:
                                case ThinNeo.OpCode.NOT:
                                case ThinNeo.OpCode.NZ:
                                case ThinNeo.OpCode.ADD:
                                case ThinNeo.OpCode.SUB:
                                case ThinNeo.OpCode.MUL:
                                case ThinNeo.OpCode.DIV:
                                case ThinNeo.OpCode.MOD:
                                case ThinNeo.OpCode.SHL:
                                case ThinNeo.OpCode.SHR:
                                case ThinNeo.OpCode.BOOLAND:
                                case ThinNeo.OpCode.BOOLOR:
                                case ThinNeo.OpCode.NUMEQUAL:
                                case ThinNeo.OpCode.NUMNOTEQUAL:
                                case ThinNeo.OpCode.LT:
                                case ThinNeo.OpCode.GT:
                                case ThinNeo.OpCode.LTE:
                                case ThinNeo.OpCode.GTE:
                                case ThinNeo.OpCode.MIN:
                                case ThinNeo.OpCode.MAX:
                                case ThinNeo.OpCode.WITHIN:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                case ThinNeo.OpCode.SHA1:
                                case ThinNeo.OpCode.SHA256:
                                case ThinNeo.OpCode.HASH160:
                                case ThinNeo.OpCode.HASH256:
                                case ThinNeo.OpCode.CSHARPSTRHASH32:
                                case ThinNeo.OpCode.JAVAHASH32:
                                case ThinNeo.OpCode.CHECKSIG:
                                case ThinNeo.OpCode.CHECKMULTISIG:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                case ThinNeo.OpCode.ARRAYSIZE:
                                case ThinNeo.OpCode.PACK:
                                case ThinNeo.OpCode.UNPACK:
                                case ThinNeo.OpCode.PICKITEM:
                                case ThinNeo.OpCode.SETITEM:
                                case ThinNeo.OpCode.NEWARRAY:
                                case ThinNeo.OpCode.NEWSTRUCT:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                case ThinNeo.OpCode.THROW:
                                case ThinNeo.OpCode.THROWIFNOT:
                                    o.paramType = Compiler.ParamType.None;
                                    break;
                                default:
                                    throw new Error("you fogot a type:" + o.code);
                            }
                        }
                    }
                    catch (_a) {
                        o.error = true;
                    }
                    arr.push(o);
                    if (o.error)
                        break;
                }
                return arr;
            };
            return Avm2Asm;
        }());
        Compiler.Avm2Asm = Avm2Asm;
    })(Compiler = ThinNeo.Compiler || (ThinNeo.Compiler = {}));
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var Compiler;
    (function (Compiler) {
        var ByteReader = (function () {
            function ByteReader(data) {
                this.addr = 0;
                this.data = data;
            }
            ByteReader.prototype.ReadOP = function () {
                var op = this.data[this.addr];
                this.addr++;
                return op;
            };
            ByteReader.prototype.ReadBytes = function (count) {
                var _data = new Uint8Array(count);
                for (var i = 0; i < count; i++)
                    _data[i] = this.data[this.addr + i];
                this.addr += count;
                return _data;
            };
            ByteReader.prototype.ReadByte = function () {
                var b = this.data[this.addr];
                this.addr++;
                return b;
            };
            ByteReader.prototype.ReadUInt16 = function () {
                var d = new DataView(this.data.buffer);
                var u16 = d.getUint16(this.addr, true);
                this.addr += 2;
                return u16;
            };
            ByteReader.prototype.ReadInt16 = function () {
                var d = new DataView(this.data.buffer);
                var u16 = d.getInt16(this.addr, true);
                this.addr += 2;
                return u16;
            };
            ByteReader.prototype.ReadUInt32 = function () {
                var d = new DataView(this.data.buffer);
                var u16 = d.getUint32(this.addr, true);
                this.addr += 4;
                return u16;
            };
            ByteReader.prototype.ReadInt32 = function () {
                var d = new DataView(this.data.buffer);
                var u16 = d.getInt32(this.addr, true);
                this.addr += 4;
                return u16;
            };
            ByteReader.prototype.ReadUInt64 = function () {
                var u1 = this.ReadUInt32();
                var u2 = this.ReadUInt32();
                return u2 * 0x100000000 + u1;
            };
            ByteReader.prototype.ReadVarBytes = function () {
                var count = this.ReadVarInt();
                return this.ReadBytes(count);
            };
            ByteReader.prototype.ReadVarInt = function () {
                var fb = this.ReadByte();
                var value;
                if (fb == 0xFD)
                    value = this.ReadUInt16();
                else if (fb == 0xFE)
                    value = this.ReadUInt32();
                else if (fb == 0xFF)
                    value = this.ReadUInt64();
                else
                    value = fb;
                return value;
            };
            Object.defineProperty(ByteReader.prototype, "End", {
                get: function () {
                    return this.addr >= this.data.length;
                },
                enumerable: true,
                configurable: true
            });
            return ByteReader;
        }());
        Compiler.ByteReader = ByteReader;
    })(Compiler = ThinNeo.Compiler || (ThinNeo.Compiler = {}));
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var Compiler;
    (function (Compiler) {
        var ParamType;
        (function (ParamType) {
            ParamType[ParamType["None"] = 0] = "None";
            ParamType[ParamType["ByteArray"] = 1] = "ByteArray";
            ParamType[ParamType["String"] = 2] = "String";
            ParamType[ParamType["Addr"] = 3] = "Addr";
        })(ParamType = Compiler.ParamType || (Compiler.ParamType = {}));
        var Op = (function () {
            function Op() {
            }
            Op.prototype.toString = function () {
                var name = this.getCodeName();
                if (this.paramType == ParamType.None) {
                }
                else if (this.paramType == ParamType.ByteArray) {
                    name += "[" + this.AsHexString() + "]";
                }
                else if (this.paramType == ParamType.String) {
                    name += "[" + this.AsString() + "]";
                }
                else if (this.paramType == ParamType.Addr) {
                    name += "[" + this.AsAddr() + "]";
                }
                return this.addr.toString(16) + ":" + name;
            };
            Op.prototype.AsHexString = function () {
                var str = "0x";
                for (var i = 0; i < this.paramData.length; i++) {
                    var s = this.paramData[i].toString(16);
                    if (s.length % 2 == 1)
                        s = "0" + s;
                    str += s;
                }
                return str;
            };
            Op.prototype.AsString = function () {
                var str = "";
                for (var i = 0; i < this.paramData.length; i++) {
                    str += this.paramData[i].toLocaleString();
                }
                return str;
            };
            Op.prototype.AsAddr = function () {
                var dview = new DataView(this.paramData.buffer);
                return dview.getInt16(0, true);
            };
            Op.prototype.getCodeName = function () {
                var name = "";
                if (this.error)
                    name = "[E]";
                if (this.code == ThinNeo.OpCode.PUSHT)
                    return "PUSH1(true)";
                if (this.code == ThinNeo.OpCode.PUSHF)
                    return "PUSH0(false)";
                if (this.code > ThinNeo.OpCode.PUSHBYTES1 && this.code < ThinNeo.OpCode.PUSHBYTES75)
                    return name + "PUSHBYTES" + (this.code - ThinNeo.OpCode.PUSHBYTES1 + 1);
                else
                    return name + ThinNeo.OpCode[this.code].toString();
            };
            return Op;
        }());
        Compiler.Op = Op;
    })(Compiler = ThinNeo.Compiler || (ThinNeo.Compiler = {}));
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var Debug;
    (function (Debug) {
        var Helper;
        (function (Helper) {
            var MethodInfo = (function () {
                function MethodInfo() {
                    this.addr2line = {};
                    this.line2addr = {};
                    this.addr_count = 0;
                    this.lines = new Array();
                    this.addrs = new Array();
                }
                MethodInfo.prototype.Add = function (line, addr) {
                    if (this.line2addr[line] == undefined) {
                        this.line2addr[line] = addr;
                        this.addr2line[addr] = line;
                        if (this.addr_count == 0) {
                            this.line2addr_minkey = line;
                            this.line2addr_maxkey = line;
                            this.addr2line_minkey = addr;
                            this.addr2line_maxkey = addr;
                        }
                        this.addr_count++;
                        if (line < this.line2addr_minkey)
                            this.line2addr_minkey = line;
                        if (line > this.line2addr_maxkey)
                            this.line2addr_maxkey = line;
                        if (addr < this.addr2line_minkey)
                            this.addr2line_minkey = addr;
                        if (addr > this.addr2line_maxkey)
                            this.addr2line_maxkey = addr;
                    }
                    if (this.lines.indexOf(line) < 0)
                        this.lines.push(line);
                    if (this.addrs.indexOf(addr) < 0)
                        this.addrs.push(addr);
                };
                MethodInfo.prototype.Sort = function () {
                };
                MethodInfo.prototype.GetAddr = function (line) {
                    if (this.line2addr_maxkey == undefined)
                        return -1;
                    if (line > this.line2addr_maxkey)
                        return -1;
                    for (var i = 0;; i++) {
                        if (this.line2addr[line + i] != undefined)
                            return this.line2addr[line + i];
                    }
                };
                MethodInfo.prototype.GetAddrBack = function (line) {
                    if (this.line2addr_minkey == undefined)
                        return -1;
                    if (this.addr_count == 0)
                        return -1;
                    if (line < this.line2addr_minkey)
                        return -1;
                    for (var i = 0;; i--) {
                        if (this.line2addr[line + i] != undefined)
                            return this.line2addr[line + i];
                    }
                };
                MethodInfo.prototype.GetLineDirect = function (addr) {
                    if (this.addr2line[addr] != undefined)
                        return this.addr2line[addr];
                    return -1;
                };
                MethodInfo.prototype.GetLine = function (addr) {
                    if (this.addr2line_maxkey == undefined)
                        return -1;
                    if (addr > this.addr2line_maxkey)
                        return -1;
                    for (var i = 0;; i++) {
                        if (this.addr2line[addr + i] != undefined)
                            return this.addr2line[addr + i];
                    }
                };
                MethodInfo.prototype.GetLineBack = function (addr) {
                    if (this.addr2line_minkey == undefined)
                        return -1;
                    if (this.addr_count == 0)
                        return -1;
                    if (addr < this.addr2line_minkey)
                        return -1;
                    for (var i = 0;; i--) {
                        if (this.addr2line[addr + i] != undefined)
                            return this.addr2line[addr + i];
                    }
                };
                return MethodInfo;
            }());
            Helper.MethodInfo = MethodInfo;
            var AddrMap = (function () {
                function AddrMap() {
                    this.methods = new Array();
                }
                AddrMap.prototype.GetAddr = function (line) {
                    for (var a = 0; a < this.methods.length; a++) {
                        var m = this.methods[a];
                        var i = m.GetAddr(line);
                        if (i > 0)
                            return i + m.startAddr;
                    }
                    return -1;
                };
                AddrMap.prototype.GetAddrBack = function (line) {
                    for (var a = 0; a < this.methods.length; a++) {
                        var m = this.methods[a];
                        var i = m.GetAddrBack(line);
                        if (i > 0)
                            return i + m.startAddr;
                    }
                    return -1;
                };
                AddrMap.prototype.GetLine = function (addr) {
                    for (var a = 0; a < this.methods.length; a++) {
                        var m = this.methods[a];
                        var i = m.GetLine(addr);
                        if (i > 0)
                            return i;
                    }
                    return -1;
                };
                AddrMap.prototype.GetLineDirect = function (addr) {
                    for (var a = 0; a < this.methods.length; a++) {
                        var m = this.methods[a];
                        var i = m.GetLineDirect(addr);
                        if (i > 0)
                            return i;
                    }
                    return -1;
                };
                AddrMap.prototype.GetLineBack = function (addr) {
                    for (var _i = this.methods.length - 1; _i >= 0; _i--) {
                        var m = this.methods[_i];
                        var i = m.GetLineBack(addr);
                        if (i > 0)
                            return i;
                    }
                    return -1;
                };
                AddrMap.FromJson = function (json) {
                    var info = new AddrMap();
                    for (var key in json) {
                        var item = json[key];
                        var minfo = new MethodInfo();
                        minfo.name = item["name"];
                        minfo.startAddr = parseInt(item["addr"], 16);
                        var map = item["map"];
                        for (var i = 0; i < map.length; i++) {
                            var mapitem = map[i];
                            var src = parseInt(mapitem.substr(5));
                            var addr = parseInt(mapitem.substr(0, 4), 16);
                            if (src < 0 || src >= 0xffff)
                                continue;
                            minfo.Add(src, addr);
                        }
                        minfo.Sort();
                        info.methods.push(minfo);
                        info.methods.sort(function (a, b) {
                            return a.startAddr - b.startAddr;
                        });
                    }
                    return info;
                };
                return AddrMap;
            }());
            Helper.AddrMap = AddrMap;
        })(Helper = Debug.Helper || (Debug.Helper = {}));
    })(Debug = ThinNeo.Debug || (ThinNeo.Debug = {}));
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var Debug;
    (function (Debug) {
        var DebugScript = (function () {
            function DebugScript() {
            }
            return DebugScript;
        }());
        Debug.DebugScript = DebugScript;
        var DebugTool = (function () {
            function DebugTool() {
                this.scripts = {};
            }
            return DebugTool;
        }());
        Debug.DebugTool = DebugTool;
    })(Debug = ThinNeo.Debug || (ThinNeo.Debug = {}));
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var SmartContract;
    (function (SmartContract) {
        var Debug;
        (function (Debug) {
            var VMState;
            (function (VMState) {
                VMState[VMState["NONE"] = 0] = "NONE";
                VMState[VMState["HALT"] = 1] = "HALT";
                VMState[VMState["FAULT"] = 2] = "FAULT";
                VMState[VMState["BREAK"] = 4] = "BREAK";
            })(VMState = Debug.VMState || (Debug.VMState = {}));
            var OpType;
            (function (OpType) {
                OpType[OpType["Non"] = 0] = "Non";
                OpType[OpType["Clear"] = 1] = "Clear";
                OpType[OpType["Insert"] = 2] = "Insert";
                OpType[OpType["Peek"] = 3] = "Peek";
                OpType[OpType["Pop"] = 4] = "Pop";
                OpType[OpType["Push"] = 5] = "Push";
                OpType[OpType["Remove"] = 6] = "Remove";
                OpType[OpType["Set"] = 7] = "Set";
            })(OpType = Debug.OpType || (Debug.OpType = {}));
            var Op = (function () {
                function Op(type, ind) {
                    if (ind === void 0) { ind = -1; }
                    this.type = type;
                    this.ind = ind;
                }
                Op.prototype.Clone = function () {
                    var op = new Op(this.type, this.ind);
                    return op;
                };
                return Op;
            }());
            Debug.Op = Op;
            var StackItem = (function () {
                function StackItem() {
                }
                StackItem.prototype.Clone = function () {
                    if (this.type != "Struct")
                        return this;
                    var item = new StackItem();
                    item.type = this.type;
                    item.strvalue = this.strvalue;
                    if (this.subItems != null) {
                        item.subItems = [];
                        for (var i = 0; i < this.subItems.length; i++) {
                            item.subItems.push(this.subItems[i].Clone());
                        }
                    }
                    return item;
                };
                StackItem.prototype.AsInt = function () {
                    return parseInt(this.strvalue);
                };
                StackItem.prototype.AsBigInteger = function () {
                    return Neo.BigInteger.parse(this.strvalue);
                };
                StackItem.prototype.asBytes = function () {
                    return null;
                };
                StackItem.prototype.ToString = function () {
                    if (this.type == "Array" || this.type == "Struct") {
                        var outstr = this.type + "[";
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
                };
                StackItem.prototype.ToShortString = function () {
                    if (this.type == "Array" || this.type == "Struct") {
                        var outstr = "[";
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
                };
                StackItem.FromJson = function (json) {
                    var item = new StackItem();
                    for (var key in json) {
                        item.type = key;
                        break;
                    }
                    var strvalue = json[item.type];
                    var isarrayvalue = json[item.type] instanceof Array;
                    if (isarrayvalue == false) {
                        item.strvalue = strvalue;
                    }
                    else {
                        var arrayvalue = json[item.type];
                        item.subItems = [];
                        for (var i = 0; i < arrayvalue.length; i++) {
                            item.subItems.push(StackItem.FromJson(arrayvalue[i]));
                        }
                    }
                    return item;
                };
                return StackItem;
            }());
            Debug.StackItem = StackItem;
            var LogScript = (function () {
                function LogScript(hash) {
                    this.ops = new Array();
                    this.hash = hash;
                }
                LogScript.prototype.GetAllScriptName = function (names) {
                    names.push(this.hash);
                    var scount = 1;
                    for (var i = 0; i < this.ops.length; i++) {
                        var op = this.ops[i];
                        if (op.subScript != null) {
                            scount += op.subScript.GetAllScriptName(names);
                        }
                    }
                    return scount;
                };
                LogScript.FromJson = function (json) {
                    var hash = json["hash"];
                    var script = new LogScript(hash);
                    var array = json["ops"];
                    for (var i = 0; i < array.length; i++) {
                        var op = array[i];
                        script.ops.push(LogOp.FromJson(op));
                        var ss = script.ops[script.ops.length - 1].subScript;
                        if (ss != null)
                            ss.parent = script;
                    }
                    return script;
                };
                LogScript.prototype.Clone = function () {
                    var s = new LogScript(this.hash);
                    s.parent = this;
                    s.ops = new Array();
                    for (var i = 0; i < this.ops.length; i++) {
                        var o = this.ops[i];
                        s.ops.push(o.Clone());
                    }
                    return s;
                };
                return LogScript;
            }());
            Debug.LogScript = LogScript;
            var LogOp = (function () {
                function LogOp(addr, op) {
                    this.addr = addr;
                    this.op = op;
                    if (op == undefined) {
                        console.log("what a fuck");
                    }
                    LogOp.__guid++;
                    this.thisguid = LogOp.__guid;
                }
                Object.defineProperty(LogOp.prototype, "guid", {
                    get: function () {
                        return this.thisguid;
                    },
                    enumerable: true,
                    configurable: true
                });
                LogOp.prototype.GetHeader = function () {
                    var addrstr = this.addr.toString(16);
                    while (addrstr.length < 4)
                        addrstr = "0" + addrstr;
                    var name = this.addr + ":";
                    if (this.op > ThinNeo.OpCode.PUSHBYTES1 && this.op < ThinNeo.OpCode.PUSHBYTES75)
                        return name + "PUSHBYTES" + (this.op - ThinNeo.OpCode.PUSHBYTES1);
                    else {
                        var trystr = ThinNeo.OpCode[this.op];
                        if (trystr == undefined)
                            trystr = "" + this.op;
                        return name + trystr;
                    }
                };
                LogOp.FromJson = function (json) {
                    var opstr = json["op"];
                    var addr = json["addr"];
                    var op = ThinNeo.OpCode[opstr];
                    if (op == undefined)
                        op = parseInt(opstr);
                    var _op = new LogOp(addr, op);
                    if (json["stack"] != undefined) {
                        var array = json["stack"];
                        _op.stack = new Array(array.length);
                        for (var i = 0; i < array.length; i++) {
                            var str = array[i];
                            var ind = -1;
                            if (str.indexOf('|') >= 0) {
                                var strs = str.split('|');
                                ind = parseInt(strs[1]);
                                str = strs[0];
                            }
                            var _type = OpType[str];
                            if (_type == undefined)
                                _type = parseInt(str);
                            _op.stack[i] = new Op(_type, ind);
                        }
                    }
                    if (json["param"] != undefined) {
                        _op.param = json["param"].hexToBytes();
                    }
                    if (json["result"] != undefined) {
                        _op.opresult = StackItem.FromJson(json["result"]);
                    }
                    if (json["subscript"] != undefined) {
                        _op.subScript = LogScript.FromJson(json["subscript"]);
                    }
                    return _op;
                };
                LogOp.prototype.Clone = function () {
                    var op = new LogOp(this.addr, this.op);
                    op.thisguid = this.thisguid;
                    op.error = this.error;
                    if (this.stack != null) {
                        op.stack = new Array(this.stack.length);
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
                };
                LogOp.__guid = 0;
                return LogOp;
            }());
            Debug.LogOp = LogOp;
            var DumpInfo = (function () {
                function DumpInfo() {
                    this.script = null;
                    this.error = null;
                    this.curScript = null;
                    this.curOp = null;
                }
                DumpInfo.FromJson = function (json) {
                    var dumpinfo = new DumpInfo();
                    if (json["error"] != undefined)
                        dumpinfo.error = json["error"];
                    if (json["VMState"] != undefined) {
                        var state = json["VMState"];
                        var words = state.split(",");
                        dumpinfo.states = [];
                        for (var i = 0; i < words.length; i++) {
                            var item = words[i].replace(" ", "");
                            dumpinfo.states.push(VMState[item]);
                        }
                    }
                    if (json["script"] != undefined) {
                        dumpinfo.script = LogScript.FromJson(json["script"]);
                    }
                    return dumpinfo;
                };
                return DumpInfo;
            }());
            Debug.DumpInfo = DumpInfo;
        })(Debug = SmartContract.Debug || (SmartContract.Debug = {}));
    })(SmartContract = ThinNeo.SmartContract || (ThinNeo.SmartContract = {}));
})(ThinNeo || (ThinNeo = {}));
var ThinNeo;
(function (ThinNeo) {
    var Debug;
    (function (Debug) {
        var State = (function () {
            function State() {
                this.ExeStack = new ThinNeo.VM.RandomAccessStack();
                this.CalcStack = new ThinNeo.VM.RandomAccessStack();
                this.AltStack = new ThinNeo.VM.RandomAccessStack();
            }
            Object.defineProperty(State.prototype, "StateID", {
                get: function () {
                    return this._StateID;
                },
                enumerable: true,
                configurable: true
            });
            State.prototype.SetId = function (id) {
                this._StateID = id;
            };
            State.prototype.PushExe = function (hash) {
                this.ExeStack.Push(hash);
                this._StateID++;
            };
            State.prototype.PopExe = function () {
                this.ExeStack.Pop();
                this._StateID++;
            };
            State.prototype.CalcCalcStack = function (op) {
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
                return false;
            };
            State.prototype.CalcCalcStack2 = function (stackop, item) {
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
                else if (stackop.type == ThinNeo.SmartContract.Debug.OpType.Pop) {
                    this.CalcStack.Pop();
                }
                else if (stackop.type == ThinNeo.SmartContract.Debug.OpType.Peek) {
                }
                else if (stackop.type == ThinNeo.SmartContract.Debug.OpType.Remove) {
                    this.CalcStack.Remove(stackop.ind);
                }
                if (stackop.type != ThinNeo.SmartContract.Debug.OpType.Peek)
                    this._StateID++;
            };
            State.prototype.DoSysCall = function () {
            };
            State.prototype.Clone = function () {
                var state = new State();
                state._StateID = this._StateID;
                for (var i = 0; i < this.ExeStack.Count; i++) {
                    var s = this.ExeStack.GetItem(i);
                    state.ExeStack.Push(s);
                }
                for (var i = 0; i < this.CalcStack.Count; i++) {
                    var s = this.CalcStack.GetItem(i);
                    if (s == null)
                        state.CalcStack.Push(null);
                    else
                        state.CalcStack.Push(s.Clone());
                }
                for (var i = 0; i < this.AltStack.Count; i++) {
                    var s = this.AltStack.GetItem(i);
                    state.AltStack.Push(s.Clone());
                }
                return state;
            };
            return State;
        }());
        Debug.State = State;
        var CareItem = (function () {
            function CareItem(name, state) {
                this.name = name;
                if (name == "Neo.Runtime.CheckWitness" ||
                    name == "Neo.Runtime.Notify") {
                    this.item = state.CalcStack.Peek(0).Clone();
                }
                else if (name == "Neo.Runtime.Log") {
                    var item = state.CalcStack.Peek(0);
                    this.item = new ThinNeo.SmartContract.Debug.StackItem();
                    this.item.type = "String";
                    if (item.type == "String") {
                        this.item.strvalue = item.strvalue;
                    }
                    else if (item.type == "ByteArray") {
                        var bt = item.strvalue.hexToBytes();
                        this.item.strvalue = ThinNeo.Helper.Bytes2String(bt);
                    }
                    else {
                        this.item.strvalue = "can't convert this.";
                    }
                }
                else if (name == "Neo.Storage.Put") {
                    var item1 = state.CalcStack.Peek(0);
                    var item2 = state.CalcStack.Peek(1);
                    var item3 = state.CalcStack.Peek(2);
                    this.item = new ThinNeo.SmartContract.Debug.StackItem();
                    this.item.type = "Array";
                    this.item.subItems = new Array();
                    this.item.subItems.push(item1.Clone());
                    this.item.subItems.push(item2.Clone());
                    this.item.subItems.push(item3.Clone());
                }
                else {
                }
            }
            CareItem.prototype.ToString = function () {
                return name + "(" + this.item == null ? "" : this.item.ToString() + ")";
            };
            return CareItem;
        }());
        Debug.CareItem = CareItem;
        var SimVM = (function () {
            function SimVM() {
                this.lastScript = null;
            }
            SimVM.prototype.Execute = function (DumpInfo) {
                var runstate = new State();
                runstate.SetId(0);
                this.stateClone = {};
                this.mapState = {};
                this.careinfo = new Array();
                this.regenScript = new ThinNeo.SmartContract.Debug.LogScript(DumpInfo.script.hash);
                this.lastScript = this.regenScript;
                this.ExecuteScript(runstate, DumpInfo.script);
            };
            SimVM.prototype.ExecuteScript = function (runstate, script) {
                {
                    runstate.PushExe(script.hash);
                    for (var i = 0; i < script.ops.length; i++) {
                        var op = script.ops[i];
                        var _nop = op.Clone();
                        this.lastScript.ops.push(_nop);
                        try {
                            if (op.op == ThinNeo.OpCode.APPCALL) {
                                var _script = op.subScript;
                                var outscript = new ThinNeo.SmartContract.Debug.LogScript(op.subScript.hash);
                                outscript.parent = this.lastScript;
                                _nop.subScript = outscript;
                                this.lastScript = outscript;
                                if (op.stack != null) {
                                    for (var j = 0; j < op.stack.length; j++) {
                                        if (j == op.stack.length - 1) {
                                            runstate.CalcCalcStack2(op.stack[j], op.opresult);
                                        }
                                        else {
                                            runstate.CalcCalcStack2(op.stack[j], null);
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
                            else if (op.op == ThinNeo.OpCode.CALL) {
                                var _lastScript = new ThinNeo.SmartContract.Debug.LogScript(this.lastScript.hash);
                                _lastScript.parent = this.lastScript;
                                _nop.subScript = _lastScript;
                                this.lastScript = _lastScript;
                                runstate.PushExe(this.lastScript.hash);
                                this.mapState[_nop.guid] = runstate.StateID;
                            }
                            else if (op.op == ThinNeo.OpCode.RET) {
                                runstate.PopExe();
                                {
                                    this.lastScript = this.lastScript.parent;
                                }
                                if (this.stateClone[runstate.StateID] == undefined) {
                                    this.stateClone[runstate.StateID] = runstate.Clone();
                                }
                                this.mapState[_nop.guid] = runstate.StateID;
                            }
                            else {
                                if (op.op == ThinNeo.OpCode.SYSCALL) {
                                    var name = ThinNeo.Helper.Bytes2String(op.param);
                                    this.careinfo.push(new CareItem(name, runstate));
                                }
                                if (runstate.CalcCalcStack(op.op) == false) {
                                    if (op.stack != null) {
                                        for (var k = 0; k < op.stack.length; k++) {
                                            if (k == op.stack.length - 1) {
                                                runstate.CalcCalcStack2(op.stack[k], op.opresult);
                                            }
                                            else {
                                                runstate.CalcCalcStack2(op.stack[k], null);
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
            };
            return SimVM;
        }());
        Debug.SimVM = SimVM;
    })(Debug = ThinNeo.Debug || (ThinNeo.Debug = {}));
})(ThinNeo || (ThinNeo = {}));
var Neo;
(function (Neo) {
    var IO;
    (function (IO) {
        var Caching;
        (function (Caching) {
            var TrackableCollection = (function () {
                function TrackableCollection(items) {
                    this._map = new NeoMap();
                    if (items != null) {
                        for (var i = 0; i < items.length; i++) {
                            this._map.set(items[i].key, items[i]);
                            items[i].trackState = Caching.TrackState.None;
                        }
                    }
                }
                TrackableCollection.prototype.add = function (item) {
                    this._map.set(item.key, item);
                    item.trackState = Caching.TrackState.Added;
                };
                TrackableCollection.prototype.clear = function () {
                    this._map.forEach(function (value, key, map) {
                        if (value.trackState == Caching.TrackState.Added)
                            map.delete(key);
                        else
                            value.trackState = Caching.TrackState.Deleted;
                    });
                };
                TrackableCollection.prototype.commit = function () {
                    this._map.forEach(function (value, key, map) {
                        if (value.trackState == Caching.TrackState.Deleted)
                            map.delete(key);
                        else
                            value.trackState = Caching.TrackState.None;
                    });
                };
                TrackableCollection.prototype.forEach = function (callback) {
                    var _this = this;
                    this._map.forEach(function (value, key) {
                        callback(value, key, _this);
                    });
                };
                TrackableCollection.prototype.get = function (key) {
                    return this._map.get(key);
                };
                TrackableCollection.prototype.getChangeSet = function () {
                    var array = new Array();
                    this._map.forEach(function (value) {
                        if (value.trackState != Caching.TrackState.None)
                            array.push(value);
                    });
                    return array;
                };
                TrackableCollection.prototype.has = function (key) {
                    return this._map.has(key);
                };
                TrackableCollection.prototype.remove = function (key) {
                    var item = this._map.get(key);
                    if (item.trackState == Caching.TrackState.Added)
                        this._map.delete(key);
                    else
                        item.trackState = Caching.TrackState.Deleted;
                };
                return TrackableCollection;
            }());
            Caching.TrackableCollection = TrackableCollection;
        })(Caching = IO.Caching || (IO.Caching = {}));
    })(IO = Neo.IO || (Neo.IO = {}));
})(Neo || (Neo = {}));
var Neo;
(function (Neo) {
    var IO;
    (function (IO) {
        var Caching;
        (function (Caching) {
            var TrackState;
            (function (TrackState) {
                TrackState[TrackState["None"] = 0] = "None";
                TrackState[TrackState["Added"] = 1] = "Added";
                TrackState[TrackState["Changed"] = 2] = "Changed";
                TrackState[TrackState["Deleted"] = 3] = "Deleted";
            })(TrackState = Caching.TrackState || (Caching.TrackState = {}));
        })(Caching = IO.Caching || (IO.Caching = {}));
    })(IO = Neo.IO || (Neo.IO = {}));
})(Neo || (Neo = {}));
//# sourceMappingURL=neo-ts.js.map