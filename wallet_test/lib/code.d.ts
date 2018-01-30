declare namespace what {
    class Main {
        other: lightsPanel.panel;
        panel2: lightsPanel.panel;
        Start(): void;
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
        static addSpace(panel: panel | HTMLDivElement, width: number): HTMLDivElement;
        static addReturn(panel: panel | HTMLDivElement): HTMLBRElement;
        static addTextInput(panel: panel | HTMLDivElement, text?: string): HTMLInputElement;
        static addTextInputPassword(panel: panel | HTMLDivElement, text?: string): HTMLInputElement;
        static addButton(panel: panel | HTMLDivElement, text?: string): HTMLButtonElement;
    }
}
