namespace lightsPanel
{
    export class QuickDom
    {
        static addElement(panel: panel | HTMLDivElement, name: string): HTMLElement
        {
            var p: HTMLDivElement = null;
            if (panel instanceof (lightsPanel.panel))
            {
                p = (panel as panel).divContent;
            }
            else
            {
                p = panel;
            }
            var e = document.createElement(name);
            p.appendChild(e);
            return e;
        }
        static addA(panel: panel | HTMLDivElement, text: string, href: string = null): HTMLAnchorElement
        {
            var e = QuickDom.addElement(panel, "a") as HTMLAnchorElement;
            e.text = text;
            if (href != null)
                e.href = href;
            return e;
        }
        static addSpan(panel: panel | HTMLDivElement, text: string): HTMLSpanElement
        {
            var e = QuickDom.addElement(panel, "Span") as HTMLSpanElement;
            e.textContent = text;
            return e;
        }
        static addSpace(panel: panel | HTMLDivElement, width: number): HTMLDivElement
        {
            var e = QuickDom.addElement(panel, "div") as HTMLDivElement;
            e.style.width = width + "px";
            e.style.height = "1px";
            return e;
        }
        static addReturn(panel: panel | HTMLDivElement): HTMLBRElement
        {
            var e = QuickDom.addElement(panel, "br") as HTMLBRElement;
            return e;
        }
        static addTextInput(panel: panel | HTMLDivElement, text: string = ""): HTMLInputElement
        {
            var e = QuickDom.addElement(panel, "input") as HTMLInputElement;
            e.type = "text";
            e.value = text;
            return e;

        }
        static addTextInputPassword(panel: panel | HTMLDivElement, text: string = ""): HTMLInputElement
        {
            var e = QuickDom.addElement(panel, "input") as HTMLInputElement;
            e.type = "password";
            e.value = text;
            return e;
        }
        static addButton(panel: panel | HTMLDivElement, text: string = ""): HTMLButtonElement
        {
            var e = QuickDom.addElement(panel, "button") as HTMLButtonElement;
            e.title = text;
            e.value = text;
            e.textContent = text;
            return e;
        }

    }
}