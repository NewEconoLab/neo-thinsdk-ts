
namespace ThinNeo.Debug.Helper
{

    export class MethodInfo
    {
        public name: string;
        public startAddr: number;//int
        public Add(line: number, addr: number): void
        {
            if (this.line2addr[line] == undefined)
            {

                this.line2addr[line] = addr;
                this.addr2line[addr] = line;



                if (this.addr_count == 0)
                {
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
        }
        public Sort(): void
        {

        }
        public addr2line: { [id: number]: number } = {};
        line2addr: { [id: number]: number } = {};

        addr_count: number = 0;
        line2addr_minkey: number;
        line2addr_maxkey: number;
        addr2line_minkey: number;
        addr2line_maxkey: number;
        public lines: Array<number> = new Array<number>();
        public addrs: Array<number> = new Array<number>();
        public GetAddr(line: number): number
        {
            if (this.line2addr_maxkey == undefined) return -1;
            if (line > this.line2addr_maxkey) return -1;

            for (var i = 0; ; i++)
            {
                if (this.line2addr[line + i] != undefined)
                    return this.line2addr[line + i];
            }
        }
        public GetAddrBack(line: number): number
        {
            if (this.line2addr_minkey == undefined) return -1;
            if (this.addr_count == 0) return -1;
            if (line < this.line2addr_minkey) return -1;

            for (var i = 0; ; i--)
            {
                if (this.line2addr[line + i] != undefined)
                    return this.line2addr[line + i];
            }
        }
        public GetLineDirect(addr: number): number
        {
            if (this.addr2line[addr] != undefined)
                return this.addr2line[addr];
            return -1;
        }

        public GetLine(addr: number): number
        {
            if (this.addr2line_maxkey == undefined) return -1;

            if (addr > this.addr2line_maxkey) return -1;

            for (var i = 0; ; i++)
            {
                if (this.addr2line[addr + i] != undefined)
                    return this.addr2line[addr + i];
            }
        }
        public GetLineBack(addr: number): number
        {
            if (this.addr2line_minkey == undefined) return -1;

            if (this.addr_count == 0)
                return -1;
            if (addr < this.addr2line_minkey) return -1;

            for (var i = 0; ; i--)
            {
                if (this.addr2line[addr + i] != undefined)
                    return this.addr2line[addr + i];
            }
        }
    }

    export class AddrMap
    {
        methods: Array<MethodInfo> = new Array<MethodInfo>();
        public GetAddr(line: number): number
        {
            for (var a = 0; a < this.methods.length; a++)
            //foreach(var m in methods)
            {
                var m = this.methods[a];

                var i = m.GetAddr(line);
                if (i > 0)
                    return i + m.startAddr;
            }
            return -1;
        }
        public GetAddrBack(line: number): number
        {
            for (var a = 0; a < this.methods.length; a++)
            //foreach(var m in methods)
            {
                var m = this.methods[a];
                var i = m.GetAddrBack(line);
                if (i > 0)
                    return i + m.startAddr;
            }
            return -1;
        }
        public GetLine(addr: number): number
        {
            for (var a = 0; a < this.methods.length; a++)
            //foreach(var m in methods)
            {
                var m = this.methods[a];
                var i = m.GetLine(addr);
                if (i > 0)
                    return i;
            }
            return -1;
        }
        public GetLineDirect(addr: number): number
        {
            for (var a = 0; a < this.methods.length; a++)
            //foreach(var m in methods)
            {
                var m = this.methods[a];
                var i = m.GetLineDirect(addr);
                if (i > 0)
                    return i;
            }
            return -1;
        }
        public GetLineBack(addr: number): number
        {

            for (var _i = this.methods.length - 1; _i >= 0; _i--)
            {
                var m = this.methods[_i];
                var i = m.GetLineBack(addr);
                if (i > 0)
                    return i;
            }
            return -1;
        }

        public static FromJson(json: { [id: string]: any }): AddrMap
        {
            let info = new AddrMap();

            for (var key in json)
            {
                let item = json[key];
                let minfo = new MethodInfo();
                minfo.name = item["name"] as string;
                minfo.startAddr = parseInt(item["addr"] as string, 16);
                var map = item["map"] as [];//.GetDictItem("map").AsList();
                for (var i = 0; i < map.length; i++)
                // foreach(var mapitem in map)
                {
                    var mapitem = map[i] as string;
                    var src = parseInt(mapitem.substr(5));
                    var addr = parseInt(mapitem.substr(0, 4), 16);
                    if (src < 0 || src >= 0xffff) continue;
                    minfo.Add(src, addr);

                }
                minfo.Sort();
                info.methods.push(minfo);
                info.methods.sort((a, b) =>
                {
                    return a.startAddr - b.startAddr;
                });
            }

            //        [{"name":"Main","addr":"0000","map":["0011-11","0012-12","0023-14","004C-16707566","0054-15","0055-16","0074-17","007F-19","00B0-25","00C2-26","00D4-27","00E1-29","0101-32","0139-33","0155-34","0160-35"]
            //}]
            return info;
        }

    }
}
