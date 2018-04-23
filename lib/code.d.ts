/// <reference path="neo-ts.d.ts" />
declare namespace what {
    class Main {
        panelState: panel_State;
        panelLoadKey: panel_LoadKey;
        panelFunction: panel_Function;
        panelTransaction: panel_Transaction;
        panelUTXO: panel_UTXO;
        panelSign: panel_Sign;
        start(): Promise<void>;
        update(): void;
    }
}
declare namespace lightsPanel {
    interface IPanel {
        divRoot: HTMLDivElement;
        container: panelContainer;
        onDock(container: panelContainer): any;
    }
    enum direction {
        H_Left = 0,
        H_Right = 1,
        V_Top = 2,
        V_Bottom = 3,
    }
    class panel implements IPanel {
        container: panelContainer;
        divRoot: HTMLDivElement;
        subPanels: IPanel[];
        name: string;
        divTitle: HTMLDivElement;
        divContent: HTMLDivElement;
        divResize: HTMLDivElement;
        btnFloat: HTMLButtonElement;
        btnClose: HTMLButtonElement;
        onClose: () => void;
        floatWidth: number;
        floatHeight: number;
        isFloat: boolean;
        canDrag: boolean;
        canScale: boolean;
        canDock: boolean;
        constructor(div: HTMLDivElement);
        setTitleText(txt: string): void;
        setTitle(txt: string, img?: string): void;
        splitWith(p: panel, dir: direction, v: number): void;
        onDock(container: panelContainer): void;
        makeMini(width: number, height: number): void;
        onFloat(): void;
        toCenter(): void;
        show(): void;
        hide(): void;
    }
    class panelContainer implements IPanel {
        divRoot: HTMLDivElement;
        subPanels: IPanel[];
        container: panelContainer;
        readonly maxPanelCount: number;
        constructor(div: HTMLDivElement);
        scalew: number;
        scaleh: number;
        divScale: HTMLDivElement;
        onSplit(dir: direction, v: number): void;
        _doSplit(): void;
        onDock(container: panelContainer): void;
        addSubPanel(p: IPanel, pos?: number): void;
        removeSubPanel(p: IPanel): void;
        _fillStyle(div: HTMLDivElement): void;
        fill(p: IPanel): void;
    }
    class panelMgr {
        private static g_this;
        static instance(): panelMgr;
        readonly width: number;
        readonly height: number;
        private urlfill;
        private urlleft;
        private divRoot;
        root: panelContainer;
        private floatDiv;
        private overDiv;
        private overDiv_Show;
        private overDiv_FillImg;
        private overDiv_LeftImg;
        private overDiv_RightImg;
        private overDiv_TopImg;
        private overDiv_BottomImg;
        private backimg;
        setbackImg(url: string): void;
        init(div: HTMLDivElement): void;
        pickPanel(panel: IPanel, cx: any, cy: any): IPanel;
        createPanel(name: string, width?: number, height?: number, customctor?: (div: HTMLDivElement) => panel): panel;
        toTop(panel: panel): void;
        floatPanel(panel: panel): void;
        removePanel(panel: panel): void;
        fillPanel(panel: panel): void;
        private _moveTop(divsrc);
        private _initOverDiv();
        private pickOverLay(cx, cy);
        private testOverlay(usedock, cx, cy);
        private _inbox(panel, cx, cy);
        _setDockPos(div: HTMLDivElement, x: string, y: string, r: string, b: string): void;
        _calcRootPos(div: HTMLDivElement): {
            x: number;
            y: number;
        };
        _calcClientPos(div: HTMLElement): {
            x: number;
            y: number;
        };
        _calcRootCenterPos(): {
            x: number;
            y: number;
        };
    }
}
declare namespace lightsPanel {
    class QuickDom {
        static addElement(panel: panel | HTMLDivElement, name: string): HTMLElement;
        static addA(panel: panel | HTMLDivElement, text: string, href?: string): HTMLAnchorElement;
        static addSpan(panel: panel | HTMLDivElement, text: string): HTMLSpanElement;
        static addSpace(panel: panel | HTMLDivElement, width: number): HTMLDivElement;
        static addReturn(panel: panel | HTMLDivElement): HTMLBRElement;
        static addTextInput(panel: panel | HTMLDivElement, text?: string): HTMLInputElement;
        static addTextInputPassword(panel: panel | HTMLDivElement, text?: string): HTMLInputElement;
        static addButton(panel: panel | HTMLDivElement, text?: string): HTMLButtonElement;
    }
}
declare namespace lightsPanel {
    interface ITreeViewFilter {
        getChildren(rootObj: any): {
            name: string;
            txtcolor: string;
        }[];
    }
    class treeNode {
        divNode: HTMLDivElement;
        divText: HTMLDivElement;
        divForChild: HTMLDivElement;
        divChildButton: HTMLButtonElement;
        text: string;
        children: treeNode[];
        parent: treeNode;
        left: number;
        getDivForChild(): HTMLDivElement;
        data: any;
        MakeLength(len: number): void;
        FillData(treeview: treeView, filter: ITreeViewFilter, data: {
            name: string;
            txtcolor: string;
        }): void;
        hide(): void;
        show(): void;
    }
    class treeView {
        constructor(parent: panel | HTMLDivElement);
        private treeArea;
        private nodeRoot;
        onSelectItem: (txt: string, data: any) => void;
        private selectItem;
        private onSelect(node);
        makeSelectEvent(node: treeNode): void;
        updateData(filter: ITreeViewFilter): void;
    }
}
declare namespace what {
    enum FuncTag {
        transfer = 0,
        DApp_WhoAmI = 1,
    }
    class panel_Function {
        constructor();
        panel: lightsPanel.panel;
        main: Main;
        init(main: Main): void;
        setFunc(tag: FuncTag): void;
        initTransfer(): void;
        initDApp_WhoAmI(): void;
    }
}
declare namespace what {
    class panel_LoadKey {
        constructor();
        panel: lightsPanel.panel;
        main: Main;
        keylist: HTMLDivElement;
        prikey: Uint8Array;
        pubkey: Uint8Array;
        address: string;
        spanKey: HTMLSpanElement;
        init(main: Main): void;
        setKey(key: Uint8Array): void;
    }
}
declare namespace what {
    class panel_Sign {
        constructor();
        panel: lightsPanel.panel;
        main: Main;
        init(main: Main): void;
        setTran(tran: ThinNeo.Transaction, inputaddr: string[]): void;
    }
}
declare namespace what {
    class panel_State {
        constructor();
        panel: lightsPanel.panel;
        main: Main;
        spanAPIHeight: HTMLSpanElement;
        spanRPC: HTMLSpanElement;
        spanRPCHeight: HTMLSpanElement;
        init(main: Main): void;
        update(): Promise<void>;
    }
}
declare namespace what {
    class panel_Transaction {
        constructor();
        panel: lightsPanel.panel;
        main: Main;
        init(main: Main): void;
        setTran(tran: ThinNeo.Transaction): void;
    }
}
declare namespace what {
    class panel_UTXO {
        constructor();
        panel: lightsPanel.panel;
        main: Main;
        tree: lightsPanel.treeView;
        assets: {
            [id: string]: UTXO[];
        };
        init(main: Main): Promise<void>;
        refresh(): Promise<void>;
    }
    class UTXO {
        addr: string;
        txid: string;
        n: number;
        asset: string;
        count: Neo.Fixed8;
    }
}
declare namespace what {
    class CoinTool {
        static readonly id_GAS: string;
        static readonly id_NEO: string;
        static assetID2name: {
            [id: string]: string;
        };
        static name2assetID: {
            [id: string]: string;
        };
        static initAllAsset(): Promise<void>;
        static makeTran(utxos: {
            [id: string]: UTXO[];
        }, targetaddr: string, assetid: string, sendcount: Neo.Fixed8): ThinNeo.Transaction;
    }
}
declare namespace what {
    class WWW {
        static api: string;
        static rpc: string;
        static rpcName: string;
        static makeRpcUrl(url: string, method: string, ..._params: any[]): string;
        static makeRpcPostBody(method: string, ..._params: any[]): {};
        static api_getHeight(): Promise<number>;
        static api_getAllAssets(): Promise<any>;
        static api_getUTXO(address: string): Promise<any>;
        static rpc_getHeight(): Promise<number>;
        static rpc_postRawTransaction(data: Uint8Array): Promise<boolean>;
        static rpc_getStorage(scripthash: Uint8Array, key: Uint8Array): Promise<string>;
    }
}
