module ThinNeo {
    declare var scrypt: any;
    var scrypt_loaded: boolean = false;
    export class Helper {
        public static GetPrivateKeyFromWIF(wif: string): Uint8Array {
            if (wif == null) throw new Error("null wif");
            var data = Neo.Cryptography.Base58.decode(wif);
            //检查标志位
            if (data.length != 38 || data[0] != 0x80 || data[33] != 0x01)
                throw new Error("wif length or tag is error");
            //取出检验字节
            var sum = data.subarray(data.length - 4, data.length);
            var realdata = data.subarray(0, data.length - 4);

            //验证,对前34字节进行进行两次hash取前4个字节
            var _checksum = Neo.Cryptography.Sha256.computeHash(realdata);
            var checksum = new Uint8Array(Neo.Cryptography.Sha256.computeHash(_checksum));
            var sumcalc = checksum.subarray(0, 4);

            for (var i = 0; i < 4; i++) {
                if (sum[i] != sumcalc[i])
                    throw new Error("the sum is not match.");
            }

            var privateKey = data.subarray(1, 1 + 32);
            return privateKey;
        }
        public static GetPublicKeyFromPrivateKey(privateKey: Uint8Array): Uint8Array {
            var pkey = Neo.Cryptography.ECPoint.multiply(Neo.Cryptography.ECCurve.secp256r1.G, privateKey);
            return pkey.encodePoint(true);
        }
        public static GetAddressCheckScriptFromPublicKey(publicKey: Uint8Array): Uint8Array {
            var script = new Uint8Array(publicKey.length + 2);
            script[0] = publicKey.length;
            for (var i = 0; i < publicKey.length; i++) {
                script[i + 1] = publicKey[i];
            };
            script[script.length - 1] = 172;//CHECKSIG
            return script;
        }
        public static GetPublicKeyScriptHashFromPublicKey(publicKey: Uint8Array): Uint8Array {
            var script = Helper.GetAddressCheckScriptFromPublicKey(publicKey);
            var scripthash = Neo.Cryptography.Sha256.computeHash(script);
            scripthash = Neo.Cryptography.RIPEMD160.computeHash(scripthash);
            return new Uint8Array(scripthash);
        }
        public static GetAddressFromScriptHash(scripthash: Uint8Array): string {
            var data = new Uint8Array(scripthash.length + 1);
            data[0] = 0x17;
            for (var i = 0; i < scripthash.length; i++) {
                data[i + 1] = scripthash[i];
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
        }
        public static GetAddressFromPublicKey(publicKey: Uint8Array): string {
            var scripthash = Helper.GetPublicKeyScriptHashFromPublicKey(publicKey);
            return Helper.GetAddressFromScriptHash(scripthash);
        }
        public static GetPublicKeyScriptHash_FromAddress(address: string): Uint8Array {
            var array: Uint8Array = Neo.Cryptography.Base58.decode(address);

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
            return hash;
        }


        public static Sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {

            var PublicKey = Neo.Cryptography.ECPoint.multiply(Neo.Cryptography.ECCurve.secp256r1.G, privateKey);
            var pubkey = PublicKey.encodePoint(false).subarray(1, 64);

            //var PublicKey = ThinNeo.Cryptography.ECC.ECCurve.Secp256r1.G * prikey;
            //var pubkey = PublicKey.EncodePoint(false).Skip(1).ToArray();

            var key = new Neo.Cryptography.ECDsaCryptoKey(PublicKey, privateKey);
            var ecdsa = new Neo.Cryptography.ECDsa(key);
            ////using(var ecdsa = System.Security.Cryptography.ECDsa.Create(new System.Security.Cryptography.ECParameters
            //{
            //        Curve = System.Security.Cryptography.ECCurve.NamedCurves.nistP256,
            //        D = prikey,
            //        Q = new System.Security.Cryptography.ECPoint
            //    {
            //        X = pubkey.Take(32).ToArray(),
            //        Y = pubkey.Skip(32).ToArray()
            //    }
            //}))
            {
                //var hash = Neo.Cryptography.Sha256.computeHash(message);
                return new Uint8Array(ecdsa.sign(message));
            }
        }
        public static VerifySignature(message: Uint8Array, signature: Uint8Array, pubkey: Uint8Array) {
            var PublicKey = Neo.Cryptography.ECPoint.decodePoint(pubkey, Neo.Cryptography.ECCurve.secp256r1);
            var usepk = PublicKey.encodePoint(false).subarray(1, 64);
            var key = new Neo.Cryptography.ECDsaCryptoKey(PublicKey);
            var ecdsa = new Neo.Cryptography.ECDsa(key);

            //byte[] first = { 0x45, 0x43, 0x53, 0x31, 0x20, 0x00, 0x00, 0x00 };
            //usepk = first.Concat(usepk).ToArray();

            //using (System.Security.Cryptography.CngKey key = System.Security.Cryptography.CngKey.Import(usepk, System.Security.Cryptography.CngKeyBlobFormat.EccPublicBlob))
            //using (System.Security.Cryptography.ECDsaCng ecdsa = new System.Security.Cryptography.ECDsaCng(key))

            //using(var ecdsa = System.Security.Cryptography.ECDsa.Create(new System.Security.Cryptography.ECParameters
            //{
            //        Curve = System.Security.Cryptography.ECCurve.NamedCurves.nistP256,
            //        Q = new System.Security.Cryptography.ECPoint
            //    {
            //        X = usepk.Take(32).ToArray(),
            //        Y = usepk.Skip(32).ToArray()
            //    }
            //}))
            {
                //var hash = sha256.ComputeHash(message);
                return ecdsa.verify(message, signature);
            }
        }


        public static GetNep2FromPrivateKey(prikey: Uint8Array, passphrase: string, n = 16384, r = 8, p = 8) {

            var pp = scrypt.getAvailableMod();
            scrypt.setResPath('lib/asset');

            var ready = () => {
                var param = {
                    N: n,   // 时空成本
                    r: r,       // 块大小
                    P: p       // 并发维度
                };

                var opt = {
                    maxPassLen: 32, // 缓冲区大小分配
                    maxSaltLen: 32,
                    maxDkLen: 32,
                    maxThread: 1    // 最多使用的线程数
                };

                try {
                    scrypt.config(param, opt);
                } catch (err) {
                    console.warn('config err: ', err);
                }
                //scrypt.onready();
            };

            scrypt.onload = () => {

                console.log("scrypt.onload");
                scrypt_loaded = true;
                ready();
            }
            scrypt.onerror = (err) => {
                console.warn('scrypt err:', err);
            }
            scrypt.oncomplete = (dk) =>{
                console.log('done', scrypt.binToHex(dk));
            };
            scrypt.onprogress =  (percent)=> {
                console.log('onprogress');
            };
            scrypt.onready = () => {
                var pubkey = Helper.GetPublicKeyFromPrivateKey(prikey);
                var script_hash = Helper.GetPublicKeyScriptHashFromPublicKey(pubkey);
                var address = Helper.GetAddressFromScriptHash(script_hash);
                var addrbin = scrypt.strToBin(address);


                var b1 = Neo.Cryptography.Sha256.computeHash(addrbin);
                b1 = Neo.Cryptography.Sha256.computeHash(b1);
                var b2 = new Uint8Array(b1);

                var addresshash = b2.subarray(0, 4);
                var passbin = scrypt.strToBin(passphrase);
                scrypt.hash(passbin, addresshash, 32);
            }
            if (scrypt_loaded == false) {
                scrypt.load("asmjs");
            }
            else {
                ready();
            }

            return;

            //var address = unescape(Helper.GetAddressFromScriptHash(script_hash));
            //let utf8 = unescape(encodeURIComponent(address));

            //let addrbin = new Uint8Array(utf8.length);
            //for (let i = 0; i < utf8.length; i++)
            //    addrbin[i] = utf8.charCodeAt(i);

            //utf8 = unescape(encodeURIComponent(passphrase));
            //let passbin = new Uint8Array(utf8.length);
            //for (let i = 0; i < utf8.length; i++)
            //    passbin[i] = utf8.charCodeAt(i);

            //var b1 = Neo.Cryptography.Sha256.computeHash(addrbin);
            //b1 = Neo.Cryptography.Sha256.computeHash(b1);
            //var b2 = new Uint8Array(b1);

            //var addresshash = b2.subarray(0, 4);
            //var derivedkey = Neo.Cryptography.de SCrypt.DeriveKey(passbin, addresshash, 16384, 8, 8, 64);
            //byte[] derivedhalf1 = derivedkey.Take(32).ToArray();
            //byte[] derivedhalf2 = derivedkey.Skip(32).ToArray();
            //var xorinfo = XOR(prikey, derivedhalf1);
            //byte[] encryptedkey = AES256Encrypt(xorinfo, derivedhalf2);
            //byte[] buffer = new byte[39];
            //buffer[0] = 0x01;
            //buffer[1] = 0x42;
            //buffer[2] = 0xe0;
            //Buffer.BlockCopy(addresshash, 0, buffer, 3, addresshash.Length);
            //Buffer.BlockCopy(encryptedkey, 0, buffer, 7, encryptedkey.Length);
            //return Base58CheckEncode(buffer);
        }
    }
}