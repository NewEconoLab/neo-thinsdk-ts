declare type Func<T, TResult> = (arg: T) => TResult;
declare type Action<T> = Func<T, void>;
interface Array<T> {
    fill(value: T, start?: number, end?: number): any;
}
interface ArrayConstructor {
    copy<T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void;
    fromArray<T>(arr: ArrayLike<T>): Array<T>;
}
interface String {
    hexToBytes(): Uint8Array;
}
interface Uint8Array {
    toHexString(): string;
}
interface Uint8ArrayConstructor {
    fromArrayBuffer(buffer: ArrayBuffer | ArrayBufferView): Uint8Array;
}
declare class NeoMap<TKey, TValue> {
    private _map;
    private _size;
    readonly size: number;
    clear(): void;
    delete(key: TKey): boolean;
    forEach(callback: (value: TValue, key: TKey, map: NeoMap<TKey, TValue>) => void): void;
    get(key: TKey): TValue;
    has(key: TKey): boolean;
    set(key: TKey, value: TValue): void;
}
declare type PromiseExecutor<T> = (resolve: Action<T | PromiseLike<T>>, reject: Action<any>) => void;
declare enum PromiseState {
    pending = 0,
    fulfilled = 1,
    rejected = 2,
}
declare class NeoPromise<T> implements PromiseLike<T> {
    private _state;
    private _callback_attached;
    private _value;
    private _reason;
    private _onFulfilled;
    private _onRejected;
    private _next_promise;
    private _tag;
    constructor(executor: PromiseExecutor<T>);
    static all(iterable: NeoPromise<any>[]): NeoPromise<any[]>;
    catch<TResult>(onRejected: Func<any, TResult | PromiseLike<TResult>>): PromiseLike<TResult>;
    private checkState();
    private reject(reason);
    static reject(reason: any): PromiseLike<any>;
    private resolve(value);
    static resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>;
    then<TResult>(onFulfilled?: Func<T, TResult | PromiseLike<TResult>>, onRejected?: Func<any, TResult | PromiseLike<TResult>>): PromiseLike<TResult>;
}
declare namespace Neo {
    abstract class UintVariable {
        protected _bits: Uint32Array;
        readonly bits: Uint32Array;
        constructor(bits: number | Uint8Array | Uint32Array | number[]);
        compareTo(other: UintVariable): number;
        equals(other: UintVariable): boolean;
        toString(): string;
    }
}
declare namespace Neo {
    class Uint64 extends UintVariable {
        static readonly MaxValue: Uint64;
        static readonly MinValue: Uint64;
        static readonly Zero: Uint64;
        constructor(low?: number, high?: number);
        add(other: Uint64): Uint64;
        and(other: number | Uint64): Uint64;
        leftShift(shift: number): Uint64;
        not(): Uint64;
        or(other: number | Uint64): Uint64;
        static parse(str: string): Uint64;
        rightShift(shift: number): Uint64;
        subtract(other: Uint64): Uint64;
        toInt32(): number;
        toNumber(): number;
        toString(): string;
        toUint32(): number;
        xor(other: number | Uint64): Uint64;
    }
}
declare namespace Neo {
    class BigInteger {
        private _sign;
        private _bits;
        static readonly MinusOne: BigInteger;
        static readonly One: BigInteger;
        static readonly Zero: BigInteger;
        constructor(value: number | string | ArrayBuffer | Uint8Array);
        static add(x: number | BigInteger, y: number | BigInteger): BigInteger;
        add(other: number | BigInteger): BigInteger;
        private static addTo(x, y, r);
        bitLength(): number;
        private static bitLengthInternal(w);
        private clamp();
        static compare(x: number | BigInteger, y: number | BigInteger): number;
        private static compareAbs(x, y);
        compareTo(other: number | BigInteger): number;
        private static create(sign, bits, clamp?);
        static divide(x: number | BigInteger, y: number | BigInteger): BigInteger;
        divide(other: number | BigInteger): BigInteger;
        static divRem(x: number | BigInteger, y: number | BigInteger): {
            result: BigInteger;
            remainder: BigInteger;
        };
        static equals(x: number | BigInteger, y: number | BigInteger): boolean;
        equals(other: number | BigInteger): boolean;
        static fromString(str: string, radix?: number): BigInteger;
        private fromString(str, radix?);
        static fromUint8Array(arr: Uint8Array, sign?: number, littleEndian?: boolean): BigInteger;
        private fromUint8Array(arr, sign?, littleEndian?);
        private fromUint64(i, sign);
        private static getActualLength(arr);
        private static getDoubleParts(dbl);
        getLowestSetBit(): number;
        isEven(): boolean;
        isZero(): boolean;
        leftShift(shift: number): BigInteger;
        static mod(x: number | BigInteger, y: number | BigInteger): BigInteger;
        mod(other: number | BigInteger): BigInteger;
        static modInverse(value: number | BigInteger, modulus: number | BigInteger): BigInteger;
        modInverse(modulus: number | BigInteger): BigInteger;
        static modPow(value: number | BigInteger, exponent: number | BigInteger, modulus: number | BigInteger): BigInteger;
        modPow(exponent: number | BigInteger, modulus: number | BigInteger): BigInteger;
        static multiply(x: number | BigInteger, y: number | BigInteger): BigInteger;
        multiply(other: number | BigInteger): BigInteger;
        private static multiplyTo(x, y, r, offset?);
        negate(): BigInteger;
        static parse(str: string): BigInteger;
        static pow(value: number | BigInteger, exponent: number): BigInteger;
        pow(exponent: number): BigInteger;
        static random(bitLength: number, rng?: RandomSource): BigInteger;
        static remainder(x: number | BigInteger, y: number | BigInteger): BigInteger;
        remainder(other: number | BigInteger): BigInteger;
        rightShift(shift: number): BigInteger;
        sign(): number;
        static subtract(x: number | BigInteger, y: number | BigInteger): BigInteger;
        subtract(other: number | BigInteger): BigInteger;
        private static subtractTo(x, y, r?);
        testBit(n: number): boolean;
        toInt32(): number;
        toString(radix?: number): string;
        toUint8Array(littleEndian?: boolean, length?: number): Uint8Array;
    }
}
declare namespace Neo {
    class Fixed8 implements IO.ISerializable {
        private data;
        static readonly MaxValue: Fixed8;
        static readonly MinusOne: Fixed8;
        static readonly MinValue: Fixed8;
        static readonly One: Fixed8;
        static readonly Satoshi: Fixed8;
        static readonly Zero: Fixed8;
        constructor(data: Uint64);
        add(other: Fixed8): Fixed8;
        compareTo(other: Fixed8): number;
        equals(other: Fixed8): boolean;
        static fromNumber(value: number): Fixed8;
        getData(): Uint64;
        static max(first: Fixed8, ...others: Fixed8[]): Fixed8;
        static min(first: Fixed8, ...others: Fixed8[]): Fixed8;
        static parse(str: string): Fixed8;
        subtract(other: Fixed8): Fixed8;
        toString(): string;
        deserialize(reader: IO.BinaryReader): void;
        serialize(writer: IO.BinaryWriter): void;
    }
}
declare namespace Neo {
    class Uint160 extends UintVariable {
        static readonly Zero: Uint160;
        constructor(value?: ArrayBuffer);
        static parse(str: string): Uint160;
    }
}
declare namespace Neo {
    class Uint256 extends UintVariable {
        static readonly Zero: Uint256;
        constructor(value?: ArrayBuffer);
        static parse(str: string): Uint256;
    }
}
declare namespace Neo.Cryptography {
    class Aes {
        private static numberOfRounds;
        private static rcon;
        private static S;
        private static Si;
        private static T1;
        private static T2;
        private static T3;
        private static T4;
        private static T5;
        private static T6;
        private static T7;
        private static T8;
        private static U1;
        private static U2;
        private static U3;
        private static U4;
        private _Ke;
        private _Kd;
        private _lastCipherblock;
        readonly mode: string;
        constructor(key: ArrayBuffer | ArrayBufferView, iv: ArrayBuffer | ArrayBufferView);
        private static convertToInt32(bytes);
        decrypt(ciphertext: ArrayBuffer | ArrayBufferView): ArrayBuffer;
        decryptBlock(ciphertext: Uint8Array, plaintext: Uint8Array): void;
        encrypt(plaintext: ArrayBuffer | ArrayBufferView): ArrayBuffer;
        encryptBlock(plaintext: Uint8Array, ciphertext: Uint8Array): void;
    }
}
declare namespace Neo.Cryptography {
    class Base58 {
        static Alphabet: string;
        static decode(input: string): Uint8Array;
        static encode(input: Uint8Array): string;
    }
}
declare namespace Neo.Cryptography {
    class CryptoKey {
        type: string;
        extractable: boolean;
        algorithm: Algorithm;
        usages: string[];
        constructor(type: string, extractable: boolean, algorithm: Algorithm, usages: string[]);
    }
    class AesCryptoKey extends Neo.Cryptography.CryptoKey {
        private _key_bytes;
        constructor(_key_bytes: Uint8Array);
        static create(length: number): AesCryptoKey;
        export(): Uint8Array;
        static import(keyData: ArrayBuffer | ArrayBufferView): AesCryptoKey;
    }
    class ECDsaCryptoKey extends CryptoKey {
        publicKey: ECPoint;
        privateKey: Uint8Array;
        constructor(publicKey: ECPoint, privateKey?: Uint8Array);
    }
}
declare namespace Neo.Cryptography {
    class ECCurve {
        Q: BigInteger;
        A: ECFieldElement;
        B: ECFieldElement;
        N: BigInteger;
        Infinity: ECPoint;
        G: ECPoint;
        static readonly secp256k1: ECCurve;
        static readonly secp256r1: ECCurve;
        constructor(Q: BigInteger, A: BigInteger, B: BigInteger, N: BigInteger, G: Uint8Array);
    }
}
declare namespace Neo.Cryptography {
    class ECDsa {
        private key;
        constructor(key: ECDsaCryptoKey);
        private static calculateE(n, message);
        static generateKey(curve: ECCurve): {
            privateKey: ECDsaCryptoKey;
            publicKey: ECDsaCryptoKey;
        };
        sign(message: ArrayBuffer | ArrayBufferView): ArrayBuffer;
        private static sumOfTwoMultiplies(P, k, Q, l);
        verify(message: ArrayBuffer | ArrayBufferView, signature: ArrayBuffer | ArrayBufferView): boolean;
    }
}
declare namespace Neo.Cryptography {
    class ECFieldElement {
        value: BigInteger;
        private curve;
        constructor(value: BigInteger, curve: ECCurve);
        add(other: ECFieldElement): ECFieldElement;
        compareTo(other: ECFieldElement): number;
        divide(other: ECFieldElement): ECFieldElement;
        equals(other: ECFieldElement): boolean;
        private static fastLucasSequence(p, P, Q, k);
        multiply(other: ECFieldElement): ECFieldElement;
        negate(): ECFieldElement;
        sqrt(): ECFieldElement;
        square(): ECFieldElement;
        subtract(other: ECFieldElement): ECFieldElement;
    }
}
declare namespace Neo.Cryptography {
    class ECPoint {
        x: ECFieldElement;
        y: ECFieldElement;
        curve: ECCurve;
        constructor(x: ECFieldElement, y: ECFieldElement, curve: ECCurve);
        static add(x: ECPoint, y: ECPoint): ECPoint;
        compareTo(other: ECPoint): number;
        static decodePoint(encoded: Uint8Array, curve: ECCurve): ECPoint;
        private static decompressPoint(yTilde, X1, curve);
        static deserializeFrom(reader: IO.BinaryReader, curve: ECCurve): ECPoint;
        encodePoint(commpressed: boolean): Uint8Array;
        equals(other: ECPoint): boolean;
        static fromUint8Array(arr: Uint8Array, curve: ECCurve): ECPoint;
        isInfinity(): boolean;
        static multiply(p: ECPoint, n: Uint8Array | BigInteger): ECPoint;
        negate(): ECPoint;
        static parse(str: string, curve: ECCurve): ECPoint;
        static subtract(x: ECPoint, y: ECPoint): ECPoint;
        toString(): string;
        twice(): ECPoint;
        private static windowNaf(width, k);
    }
}
declare namespace Neo.Cryptography {
    class RandomNumberGenerator {
        private static _entropy;
        private static _strength;
        private static _started;
        private static _stopped;
        private static _key;
        private static addEntropy(data, strength);
        static getRandomValues<T extends Int8Array | Uint8ClampedArray | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array>(array: T): T;
        private static getWeakRandomValues(array);
        private static processDeviceMotionEvent(event);
        private static processEvent(event);
        private static processMouseEvent(event);
        private static processTouchEvent(event);
        static startCollectors(): void;
        private static stopCollectors();
    }
}
interface String {
    base58Decode(): Uint8Array;
    base64UrlDecode(): Uint8Array;
    toAesKey(): PromiseLike<ArrayBuffer>;
}
interface Uint8Array {
    base58Encode(): string;
    base64UrlEncode(): string;
}
declare function escape(s: string): string;
declare function unescape(s: string): string;
declare namespace Neo.Cryptography {
}
declare namespace Neo.Cryptography {
    class RIPEMD160 {
        private static zl;
        private static zr;
        private static sl;
        private static sr;
        private static hl;
        private static hr;
        private static bytesToWords(bytes);
        private static wordsToBytes(words);
        private static processBlock(H, M, offset);
        private static f1(x, y, z);
        private static f2(x, y, z);
        private static f3(x, y, z);
        private static f4(x, y, z);
        private static f5(x, y, z);
        private static rotl(x, n);
        static computeHash(data: ArrayBuffer | ArrayBufferView): ArrayBuffer;
    }
}
declare namespace Neo.Cryptography {
    class Sha256 {
        private static K;
        static computeHash(data: ArrayBuffer | ArrayBufferView): ArrayBuffer;
        private static ROTR(n, x);
        private static Σ0(x);
        private static Σ1(x);
        private static σ0(x);
        private static σ1(x);
        private static Ch(x, y, z);
        private static Maj(x, y, z);
    }
}
declare namespace Neo.IO {
    class BinaryReader {
        private input;
        private _buffer;
        private array_uint8;
        private array_int8;
        private array_uint16;
        private array_int16;
        private array_uint32;
        private array_int32;
        private array_float32;
        private array_float64;
        constructor(input: Stream);
        close(): void;
        private fillBuffer(buffer, count);
        read(buffer: ArrayBuffer, index: number, count: number): number;
        readBoolean(): boolean;
        readByte(): number;
        readBytes(count: number): ArrayBuffer;
        readDouble(): number;
        readFixed8(): Fixed8;
        readInt16(): number;
        readInt32(): number;
        readSByte(): number;
        readSerializable(T: Function): ISerializable;
        readSerializableArray(T: Function): ISerializable[];
        readSingle(): number;
        readUint16(): number;
        readUint160(): Uint160;
        readUint256(): Uint256;
        readUint32(): number;
        readUint64(): Uint64;
        readVarBytes(max?: number): ArrayBuffer;
        readVarInt(max?: number): number;
        readVarString(): string;
    }
}
declare namespace Neo.IO {
    class BinaryWriter {
        private output;
        private _buffer;
        private array_uint8;
        private array_int8;
        private array_uint16;
        private array_int16;
        private array_uint32;
        private array_int32;
        private array_float32;
        private array_float64;
        constructor(output: Stream);
        close(): void;
        seek(offset: number, origin: SeekOrigin): number;
        write(buffer: ArrayBuffer, index?: number, count?: number): void;
        writeBoolean(value: boolean): void;
        writeByte(value: number): void;
        writeDouble(value: number): void;
        writeFixed8(value: Fixed8): void;
        writeInt16(value: number): void;
        writeInt32(value: number): void;
        writeSByte(value: number): void;
        writeSerializableArray(array: ISerializable[]): void;
        writeSingle(value: number): void;
        writeUint16(value: number): void;
        writeUint32(value: number): void;
        writeUintVariable(value: UintVariable): void;
        writeVarBytes(value: ArrayBuffer): void;
        writeVarInt(value: number): void;
        writeVarString(value: string): void;
    }
}
interface Uint8Array {
    asSerializable(T: Function): Neo.IO.ISerializable;
}
interface Uint8ArrayConstructor {
    fromSerializable(obj: Neo.IO.ISerializable): Uint8Array;
}
declare namespace Neo.IO {
    interface ISerializable {
        deserialize(reader: BinaryReader): void;
        serialize(writer: BinaryWriter): void;
    }
}
declare namespace Neo.IO {
    enum SeekOrigin {
        Begin = 0,
        Current = 1,
        End = 2,
    }
    abstract class Stream {
        private _array;
        abstract canRead(): boolean;
        abstract canSeek(): boolean;
        abstract canWrite(): boolean;
        close(): void;
        abstract length(): number;
        abstract position(): number;
        abstract read(buffer: ArrayBuffer, offset: number, count: number): number;
        readByte(): number;
        abstract seek(offset: number, origin: SeekOrigin): number;
        abstract setLength(value: number): void;
        abstract write(buffer: ArrayBuffer, offset: number, count: number): void;
        writeByte(value: number): void;
    }
}
declare namespace Neo.IO {
    class MemoryStream extends Stream {
        private _buffers;
        private _origin;
        private _position;
        private _length;
        private _capacity;
        private _expandable;
        private _writable;
        constructor(capacity?: number);
        constructor(buffer: ArrayBuffer, writable?: boolean);
        constructor(buffer: ArrayBuffer, index: number, count: number, writable?: boolean);
        canRead(): boolean;
        canSeek(): boolean;
        canWrite(): boolean;
        capacity(): number;
        private findBuffer(position);
        length(): number;
        position(): number;
        read(buffer: ArrayBuffer, offset: number, count: number): number;
        private readInternal(dst, srcPos);
        seek(offset: number, origin: SeekOrigin): number;
        setLength(value: number): void;
        toArray(): ArrayBuffer;
        write(buffer: ArrayBuffer, offset: number, count: number): void;
    }
}
declare namespace Neo.IO.Caching {
    interface ITrackable<TKey> {
        key: TKey;
        trackState: TrackState;
    }
}
declare namespace Neo.IO.Caching {
    class TrackableCollection<TKey, TItem extends ITrackable<TKey>> {
        private _map;
        constructor(items?: ArrayLike<TItem>);
        add(item: TItem): void;
        clear(): void;
        commit(): void;
        forEach(callback: (value: TItem, key: TKey, collection: TrackableCollection<TKey, TItem>) => void): void;
        get(key: TKey): TItem;
        getChangeSet(): TItem[];
        has(key: TKey): boolean;
        remove(key: TKey): void;
    }
}
declare namespace Neo.IO.Caching {
    enum TrackState {
        None = 0,
        Added = 1,
        Changed = 2,
        Deleted = 3,
    }
}
