///<reference path="../lib/neo-ts.d.ts"/>
module NeoTest {
    export class Test_MultiSign implements ITestItem {
        getName(): string {
            return "MultiSign";
        }
        keys: Array<key>;
        key: key;
        bError: boolean;
        tx: Tx = new Tx();
        start(div: HTMLDivElement): void {
            this.keys = new Array<key>();
            this.key = new key();
            this.key.prikey = null;
            this.key.multisignkey = true;
            this.key.MKey_NeedCount = 1;
            this.key.MKey_Pubkeys = new Array<Uint8Array>();
            this.tx = new Tx();
            //title
            var span = document.createElement("span");
            div.appendChild(span);
            span.textContent = "多签工具";
            div.appendChild(document.createElement("hr"));//newline

            var label_account = document.createElement("label");
            div.appendChild(label_account);
            label_account.textContent = "账户列表:";
            div.appendChild(document.createElement("br"));
            var text_account = document.createElement("textarea");
            div.appendChild(text_account);
            text_account.style.width = "800px";
            text_account.style.height = "100px";
            text_account.textContent = "";
            div.appendChild(document.createElement("hr"));

            var label = document.createElement("label");
            div.appendChild(label);
            label.textContent = "增加普通账户:";
            div.appendChild(document.createElement("br"));
            var lb_wif = document.createElement("label");
            div.appendChild(lb_wif);
            lb_wif.textContent = "填入wif：";
            var input_wif = document.createElement("input");
            div.appendChild(input_wif);
            input_wif.style.width = "500px";
            input_wif.style.position = "absoulte";
            input_wif.multiple = true;
            input_wif.value = "";
            var btn_addwif = document.createElement("button");
            div.appendChild(btn_addwif);
            btn_addwif.textContent = "add wif";
            div.appendChild(document.createElement("br"));
            var lb_nep6 = document.createElement("label");
            div.appendChild(lb_nep6);
            lb_nep6.textContent = "导入nep6钱包";
            //openfile
            var file = document.createElement("input");
            div.appendChild(file);
            file.type = "file";

            var lb_pw = document.createElement("label");
            div.appendChild(lb_pw);
            lb_pw.textContent = "密码：";
            var input_pw = document.createElement("input");
            div.appendChild(input_pw);
            input_pw.style.width = "500px";
            input_pw.style.position = "absoulte";
            input_pw.multiple = true;
            input_pw.value = "";
            var btn_sure = document.createElement("button");
            btn_sure.textContent = "确认";
            div.appendChild(btn_sure);
            div.appendChild(document.createElement("hr"));

            var label = document.createElement("label");
            div.appendChild(label);
            label.textContent = "增加多签账户:";
            div.appendChild(document.createElement("br"));
            var label = document.createElement("label");
            div.appendChild(label);
            label.textContent = "填入公钥";
            var input_pubKey = document.createElement("input");
            div.appendChild(input_pubKey);
            input_pubKey.style.width = "500px";
            input_pubKey.style.position = "absoulte";
            input_pubKey.multiple = true;
            input_pubKey.value = "";
            var btn_addPubKey = document.createElement("button");
            div.appendChild(btn_addPubKey);
            btn_addPubKey.textContent = "add pubKey";
            div.appendChild(document.createElement("br"));
            div.appendChild(document.createElement("br"));
            var text_addrs = document.createElement("textarea");
            div.appendChild(text_addrs);
            text_addrs.style.width = "800px";
            text_addrs.style.height = "100px";
            text_addrs.textContent = "";
            div.appendChild(document.createElement("br"));
            var label = document.createElement("label");
            div.appendChild(label);
            label.textContent = "最小签名数";
            var input_count = document.createElement("input");
            div.appendChild(input_count);
            input_count.style.width = "500px";
            input_count.style.position = "absoulte";
            input_count.multiple = true;
            input_count.value = "";
            var btn_ok = document.createElement("button");
            div.appendChild(btn_ok);
            btn_ok.textContent = "ok";
            div.appendChild(document.createElement("hr"));

            var text_data = document.createElement("textarea");
            div.appendChild(text_data);
            text_data.style.width = "500px";
            text_data.style.height = "200px";
            text_data.value = "";
            var btn_import = document.createElement("button");
            div.appendChild(btn_import);
            btn_import.textContent = "import data";
            div.appendChild(document.createElement("hr"));

            var text_tx = document.createElement("textarea");
            div.appendChild(text_tx);
            text_tx.style.width = "800px";
            text_tx.style.height = "200px";
            text_tx.textContent = "";
            var btn_sign = document.createElement("button");
            div.appendChild(btn_sign);
            btn_sign.textContent = "sign";



            var wallet: ThinNeo.nep6wallet;
            var reader = new FileReader();
            reader.onload = (e: Event) => {
                var walletstr = reader.result as string;
                wallet = new ThinNeo.nep6wallet();
                wallet.fromJsonStr(walletstr);
            };
            file.onchange = (ev: Event) => {
                if (file.files[0].name.includes(".json")) {
                    reader.readAsText(file.files[0]);
                }
            }
            btn_sure.onclick = () => {
                if (!input_pw.value) {
                    alert("请输入密码");
                    return;
                }
                var addPrikey = (num,wallet) => {
                    if (!wallet.accounts[num].nep2key) {
                        alert("nep2key wrong" + wallet.accounts[num].address);
                        return;
                    }
                    wallet.accounts[num].getPrivateKey(wallet.scrypt, input_pw.value, (info, result) => {
                        if (info == "finish") {
                            var priKey = result as Uint8Array;
                            var _key = new key();
                            _key.MKey_NeedCount = 0;
                            _key.MKey_Pubkeys = null;
                            _key.multisignkey = false;
                            _key.prikey = priKey;
                            for (var i = 0; i < this.keys.length; i++) {
                                if (this.keys[i].ToString() == _key.ToString())
                                    return;
                            }
                            this.keys.push(_key);
                            console.log(priKey);
                            updateUI();
                            num = num + 1;
                            if (wallet.accounts.length <= num)
                                return;
                            addPrikey(num, wallet);
                        }
                        else {
                            console.log(result);
                        }
                    });
                }
                addPrikey(0, wallet);
            }

            btn_addwif.onclick = () => {
                var wif: string = input_wif.value;
                var priKey = ThinNeo.Helper.GetPrivateKeyFromWIF(wif);
                var _key = new key();
                _key.MKey_NeedCount = 0;
                _key.MKey_Pubkeys = null;
                _key.multisignkey = false;
                _key.prikey = priKey;
                for (var i = 0; i < this.keys.length;i++)
                {
                    if (this.keys[i].ToString() == _key.ToString())
                        return;
                }
                this.keys.push(_key);
                updateUI();
            }
            btn_addPubKey.onclick = () => {
                var pubKey: string = input_pubKey.value;
                var bytes_pubKey: Uint8Array = pubKey.hexToBytes();
                if (bytes_pubKey.length != 33)
                    return;

                this.key.AddPubkey(bytes_pubKey);

                //更新text_addrs
                text_addrs.textContent = "";
                for (var i = 0; i < this.key.MKey_Pubkeys.length; i++) {
                    var pubkey = this.key.MKey_Pubkeys[i];
                    var pubkeystr = pubkey.toHexString();
                    var address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                    text_addrs.textContent = text_addrs.textContent + address + "[" + pubkeystr + "]"+ "\r\n";
                }
            }
            btn_ok.onclick = () => {
                this.key.MKey_NeedCount = Number.parseInt(input_count.value);
                this.keys.push(this.key);
                updateUI();
            }
            btn_import.onclick = () => {
                this.tx.FromString(this.keys, text_data.value);
                updateUI();
            }
            btn_sign.onclick = () => {
                var signcount = 0;
                var data = this.tx.txraw.GetMessage();
                for (var i = 0; i < this.keys.length;i++) {
                    var key = this.keys[i];
                    if (key.prikey == null) continue;
                    var addr = key.GetAddress();
                    for (var k in this.tx.keyinfos) {
                        var type = (this.tx.keyinfos[k] as KeyInfo).type;
                        if (type == KeyType.Simple) {
                            if (k == addr) {
                                (this.tx.keyinfos[k] as KeyInfo).signdata[0] = ThinNeo.Helper.Sign(data, key.prikey);
                                signcount++;
                            }
                        }
                        if (type == KeyType.MultiSign) {
                            for (var ii = 0; ii < (this.tx.keyinfos[k] as KeyInfo).MultiSignKey.MKey_Pubkeys.length; ii++) {
                                var pub = (this.tx.keyinfos[k] as KeyInfo).MultiSignKey.MKey_Pubkeys[ii];
                                var signaddr = ThinNeo.Helper.GetAddressFromPublicKey(pub);
                                if (addr == signaddr) {
                                    (this.tx.keyinfos[k] as KeyInfo).signdata[ii] = ThinNeo.Helper.Sign(data, key.prikey);
                                    signcount++;
                                }
                            }
                        }
                    }
                }
                if (signcount == 0) {
                    alert("没有找到可以签名的");
                } else {
                    updateTxUI();
                    updateDataUI();
                }
            }

            var updateUI = () => {
                //更新账户
                text_account.textContent = "";
                for (var i = 0; i < this.keys.length; i++) {
                    var _key = this.keys[i];
                    text_account.textContent = text_account.textContent + _key.ToString() + "\r\n";
                    if (_key.multisignkey) {
                        for (var ii = 0; ii < _key.MKey_Pubkeys.length; ii++) {
                            var pubkey = _key.MKey_Pubkeys[ii];
                            var address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                            text_account.textContent = text_account.textContent + "\t" + address + "\r\n";
                        }
                    }
                }
                try {
                    if (this.tx != null) {
                        this.tx.ImportKeyInfo(this.keys);
                    }
                    updateTxUI();
                }
                catch
                {

                }
            }
            var updateTxUI = () => {
                text_tx.textContent = "";
                if (this.tx == null) {
                    text_tx.textContent = "null";
                }
                else {
                    text_tx.textContent += ThinNeo.TransactionType[this.tx.txraw.type] + ":" + this.tx.txraw.GetHash().toHexString() + "\r\n";
                    for (var k in this.tx.keyinfos) {
                        text_tx.textContent += "\t" + k + ":" + KeyType[(this.tx.keyinfos[k] as KeyInfo).type] + "\r\n";

                        if ((this.tx.keyinfos[k] as KeyInfo).type == KeyType.Unknow) {
                            text_tx.textContent += "\t\t" + "<unknow count....>" + "\r\n";
                        }
                        if ((this.tx.keyinfos[k] as KeyInfo).type == KeyType.Simple) {
                            let signstr = (this.tx.keyinfos[k] as KeyInfo).signdata[0] == null ? "<null>" : (this.tx.keyinfos[k] as KeyInfo).signdata[0].toHexString();
                            text_tx.textContent += "\t\t" + "sign0" + signstr + "\r\n";
                        }

                        if ((this.tx.keyinfos[k] as KeyInfo).type == KeyType.MultiSign) {
                            for (var i = 0; i < (this.tx.keyinfos[k] as KeyInfo).MultiSignKey.MKey_Pubkeys.length; i++) {
                                var pubkey = (this.tx.keyinfos[k] as KeyInfo).MultiSignKey.MKey_Pubkeys[i];
                                var address = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                                let signstr = (this.tx.keyinfos[k] as KeyInfo).signdata[i] == null ? "<null>" : (this.tx.keyinfos[k] as KeyInfo).signdata[i].toHexString();
                                text_tx.textContent += "\t\t" + "sign" + i + ":" + address + "=" + signstr+ "\r\n";
                            }
                        }
                    }
                }
            }
            var updateDataUI = () => {
                text_data.value = this.tx.ToString();
            }
        }
    }

    export class key
    {
        multisignkey: boolean;
        prikey: Uint8Array;
        MKey_NeedCount: number;
        MKey_Pubkeys: Array<Uint8Array>;
        ToString(): string {
            if (this.multisignkey == false) {
                var pubkey: Uint8Array = ThinNeo.Helper.GetPublicKeyFromPrivateKey(this.prikey);
                var address: string = ThinNeo.Helper.GetAddressFromPublicKey(pubkey);
                return address;
            }
            else
            {
                try {
                    return "M" + this.MKey_NeedCount + "/" + this.MKey_Pubkeys.length + ":" + this.GetAddress();
                }
                catch
                {
                    return "M<error>";
                }
            }
        }

        GetMultiContract(): Uint8Array {
            if (!(1 <= this.MKey_NeedCount && this.MKey_NeedCount <= this.MKey_Pubkeys.length && this.MKey_Pubkeys.length <= 1024))
                throw new Error();
            var sb: ThinNeo.ScriptBuilder = new ThinNeo.ScriptBuilder();
            {
                sb.EmitPushNumber(Neo.BigInteger.parse(this.MKey_NeedCount.toString()));
                for (var i = 0; i < this.MKey_Pubkeys.length; i++)
                {
                    var pkey: Uint8Array = this.MKey_Pubkeys[i];
                    sb.EmitPushBytes(pkey);
                }
                sb.EmitPushNumber(Neo.BigInteger.parse(this.MKey_Pubkeys.length.toString()));
                sb.Emit(ThinNeo.OpCode.CHECKMULTISIG);
                return sb.ToArray();
            }
        }

        GetAddress(): string {
            if (this.multisignkey == false) {
                return this.ToString();
            }
            else {//计算多签地址
                var contract = this.GetMultiContract();
                var scripthash = ThinNeo.Helper.GetScriptHashFromScript(contract);
                var address = ThinNeo.Helper.GetAddressFromScriptHash(scripthash);
                return address;
            }
        }

        AddPubkey(pubkey: Uint8Array) {
            for (var i = 0; i < this.MKey_Pubkeys.length; i++) {
                var k: Uint8Array = this.MKey_Pubkeys[i];
                if (k == pubkey)
                    return;
                var s1 = k.toHexString();
                var s2 = pubkey.toHexString();
                if (s1 == s2)
                    return;
            }
            this.MKey_Pubkeys.push(pubkey);
            this.MKey_Pubkeys.sort((a, b) => {
                var pa = Neo.Cryptography.ECPoint.decodePoint(a, Neo.Cryptography.ECCurve.secp256r1);
                var pb = Neo.Cryptography.ECPoint.decodePoint(b, Neo.Cryptography.ECCurve.secp256r1);
                return pa.compareTo(pb);
            });
        }
    }


    export class Tx {
        txraw: ThinNeo.Transaction;
        keyinfos: Map<string, KeyInfo>;
        HasKeyInfo(): boolean {
            for (var k in this.keyinfos.keys) {
                var value = this.keyinfos[k] as KeyInfo;
                if (value.type != KeyType.Unknow)
                    return true;
            }
            return false;
        }
        HasAllKeyInfo(): boolean {
            for (var k in this.keyinfos.keys) {
                var value = this.keyinfos[k] as KeyInfo;
                if (value.type == KeyType.Unknow)
                    return false;
                if (value.type == KeyType.Simple)
                    if (value.signdata == null || value.signdata[0] == null || value.signdata[0].length == 0)
                        return false;
                if (value.type == KeyType.MultiSign) {
                    var m = value.MultiSignKey.MKey_NeedCount;
                    var c = 0;
                    for (var i = 0; i < value.MultiSignKey.MKey_Pubkeys.length; i++) {
                        var data = value.signdata[i];
                        if (data != null && data.length > 0)
                            c++;
                    }
                    if (c < m)
                        return false;
                }
            }
            return true;
        }


        FillRaw() {
            this.txraw.witnesses = new ThinNeo.Witness[this.keyinfos.keys.length];
            var keys: Array<KeyInfo> = new Array<KeyInfo>();
            for (var k in this.keyinfos.keys) {
                var value = this.keyinfos[k] as KeyInfo;
                keys.push(value);
            }
            //keys 需要排序
            for (let i = 0; i < keys.length; i++) {
                this.txraw.witnesses[i] = new ThinNeo.Witness();
                if (keys[i].type == KeyType.Simple) {
                    //算出vscript
                    this.txraw.witnesses[i].VerificationScript = ThinNeo.Helper.GetPublicKeyScriptHashFromPublicKey(keys[i].pubKey);
                    var sb: ThinNeo.ScriptBuilder = new ThinNeo.ScriptBuilder();
                    sb.EmitPushBytes(keys[i].signdata[0]);
                    this.txraw.witnesses[i].InvocationScript = sb.ToArray();
                }
                if (keys[i].type == KeyType.MultiSign) {
                    //算出vscript
                    this.txraw.witnesses[i].VerificationScript = keys[i].MultiSignKey.GetMultiContract();
                    var signs: Array<Uint8Array> = new Array<Uint8Array>();
                    for (let ii = 0; ii < keys[i].signdata.length; ii++) {
                        var s = keys[i].signdata[ii];
                        if (s != null && s.length > 0) {
                            signs.push(s);
                        }
                    }
                    var sb: ThinNeo.ScriptBuilder = new ThinNeo.ScriptBuilder();
                    for (var iss = 0; iss < keys[i].MultiSignKey.MKey_NeedCount; iss++) {
                        sb.EmitPushBytes(signs[iss]);
                    }
                    this.txraw.witnesses[i].InvocationScript = sb.ToArray();
                }

            }
        }

        ToString(): string {
            var ms: Neo.IO.MemoryStream = new Neo.IO.MemoryStream();
            this.txraw.SerializeUnsigned(new Neo.IO.BinaryWriter(ms));
            var data = ms.toArray();
            var outstr = new Uint8Array(data, 0, data.byteLength).toHexString();
            if (this.HasKeyInfo) {
                var json = this.ExoprtKeyInfo();
                outstr += "|" + JSON.stringify(json);
            }
            return outstr; 
        }

        ExoprtKeyInfo(): {} {
            var json: {} = {};
            for (var k in this.keyinfos) {
                var value = this.keyinfos[k] as KeyInfo;
                if (value.type == KeyType.Unknow) {
                    continue;
                }
                var keyitem: {} = {};
                keyitem["type"] = KeyType[value["type"]];
                if (value["type"] == KeyType.Simple) {
                    var strsigndata = value["signdata"][0] == null ? "<null>" : value["signdata"][0].toHexString();
                    keyitem["sign0"] = strsigndata;
                    var strpubkey = value["pubKey"] == null ? "<null>" : value["pubKey"].toHexString();
                    keyitem["pkey0"] = strpubkey;
                }
                else if (value["type"] == KeyType.MultiSign) {
                    keyitem["m"] = value["MultiSignKey"]["MKey_NeedCount"];
                    keyitem["c"] = value["MultiSignKey"]["MKey_Pubkeys"].length;
                    for (let i = 0; i < value["MultiSignKey"]["MKey_Pubkeys"].length; i++) {
                        var strpubkey = value["MultiSignKey"]["MKey_Pubkeys"][i].toHexString();
                        keyitem["pkey" + i] = strpubkey;
                        var strsigndata = value["signdata"][i] == null ? "<null>" : value["signdata"][i].toHexString();
                        keyitem["sign" + i] = strsigndata;
                    }
                }
                json[value["keyaddress"]] = keyitem;
            }
            return json;
        }

        ImportKeyInfo(keys: Array<key>, json: {} = null) {
            if (this.keyinfos == null) {
                this.keyinfos = new Map<string, KeyInfo>();
            }

            for (let i = 0; i < this.txraw.attributes.length; i++) {
                var att = this.txraw.attributes[i];
                if (att.usage == ThinNeo.TransactionAttributeUsage.Script) {
                    //附加鉴证，有这个，说明需要这个签名
                    var addr = ThinNeo.Helper.GetAddressFromScriptHash(att.data);
                    if (!this.keyinfos[addr]) {
                        this.keyinfos[addr] = new KeyInfo();
                        this.keyinfos[addr].type = KeyType.Unknow;
                        this.keyinfos[addr].keyaddress = addr;
                    }
                    for (let ii = 0; ii < keys.length; ii++) {
                        let k = keys[ii];
                        if (k.GetAddress() == addr) {
                            if (k.multisignkey == false) {
                                (this.keyinfos[addr] as KeyInfo).type = KeyType.Simple;
                                (this.keyinfos[addr] as KeyInfo).pubKey = ThinNeo.Helper.GetPublicKeyFromPrivateKey(k.prikey);
                                if ((this.keyinfos[addr] as KeyInfo).signdata == null) {
                                    (this.keyinfos[addr] as KeyInfo).signdata = new Array<Uint8Array>();
                                    (this.keyinfos[addr] as KeyInfo).signdata.push(null);
                                }
                            }
                            else {
                                this.keyinfos[addr].type = KeyType.MultiSign;
                                this.keyinfos[addr].MultiSignKey = k;
                                if ((this.keyinfos[addr] as KeyInfo).signdata == null) {
                                    (this.keyinfos[addr] as KeyInfo).signdata = new Array<Uint8Array>();
                                    for (var iii = 0; iii < k.MKey_Pubkeys.length; iii++) {
                                        (this.keyinfos[addr] as KeyInfo).signdata.push(null);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            //从json导入已经做了的签名
            if (json != null) {
                for (let k in json) {
                    if (!!this.keyinfos[k]) {
                        var type = json[k]["type"];
                        (this.keyinfos[k] as KeyInfo).type = type;
                        if (this.keyinfos[k].type == KeyType[KeyType.Simple]) {
                            if (this.keyinfos[k].signdata == null) {
                                this.keyinfos[k].signdata = new Array<Uint8Array>();
                                this.keyinfos[k].signdata.push(null);
                            }
                            var data = json[k]["sign0"] as string;
                            if (data != "<null>") {
                                this.keyinfos[k].signdata[0] = data.hexToBytes();
                            }
                            var pkey = json[k]["pkey0"] as string;
                            this.keyinfos[k].pubkey = pkey.hexToBytes();
                        }
                        if (this.keyinfos[k].type == KeyType[KeyType.MultiSign]) {
                            var m = Number.parseInt(json[k]["m"]);
                            var c = Number.parseInt(json[k]["c"]);
                            var pubkeys = new Array<Uint8Array>();
                            if (this.keyinfos[k].signdata == null) {
                                this.keyinfos[k].signdata = new Array<Uint8Array>();
                                for (var i = 0; i < c; i++) {
                                    this.keyinfos[k].signdata.push(null);
                                }
                            }
                            for (var i = 0; i < c; i++) {
                                let data = json[k]["sign" + i] as string;
                                if (data != "<null>") {
                                    this.keyinfos[k].signdata[i] = data.hexToBytes();
                                }
                                var pkey = json[k]["pkey" + i] as string;
                                pubkeys.push(pkey.hexToBytes());
                            }
                            var _key: key = null;
                            for (var i = 0; i < keys.length; i++) {
                                var _k = keys[i].GetAddress();
                                if (_k == k) {
                                    _key = keys[i];
                                    break;
                                }
                            }

                            //没有这个key 直接导入
                            if (_key == null) {
                                _key = new key();
                                _key.MKey_NeedCount = m;
                                _key.MKey_Pubkeys = pubkeys;
                                _key.multisignkey = true;
                                _key.prikey = null;
                                keys.push(_key);
                            }
                            (this.keyinfos[k] as KeyInfo).MultiSignKey = _key;
                        }
                    }
                }
            }
        }

        FromString(keys: Array<key>, info: string) {
            var txdata: Uint8Array;
            //有附加信息
            var keyinfo = null;
            if (info.indexOf("|")>0) {
                var ss = info.split("|");
                txdata = ss[0].hexToBytes();
                keyinfo = JSON.parse(ss[1]);
            }
            else {
                txdata = info.hexToBytes();
            }
            this.txraw = new ThinNeo.Transaction();
            var ms = new Neo.IO.MemoryStream(txdata.buffer, 0, txdata.byteLength);
            var br = new Neo.IO.BinaryReader(ms);
            this.txraw.Deserialize(br);
            this.ImportKeyInfo(keys, keyinfo);
        }

    }

    export class KeyInfo {
        keyaddress: string;
        type: KeyType;
        MultiSignKey: key;
        pubKey: Uint8Array;
        signdata: Array<Uint8Array>;
    }

    export enum KeyType {
        Unknow,
        Simple,
        MultiSign,
    }
}