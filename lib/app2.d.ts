/// <reference path="neo-ts.d.ts" />
declare module NeoTest2 {
    interface ITestItem {
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest2 {
    class Test1_Fullog_Read implements ITestItem {
        constructor();
        getName(): string;
        div: HTMLDivElement;
        addtxt(str: string): void;
        start(div: HTMLDivElement): void;
        testasync(): Promise<void>;
        dumpScript(script: ThinNeo.SmartContract.Debug.LogScript, level: HTMLUListElement): void;
    }
}
declare module NeoTest2 {
    class Test1_Lzma implements ITestItem {
        constructor();
        getName(): string;
        div: HTMLDivElement;
        addtxt(str: string): void;
        start(div: HTMLDivElement): void;
        testasync(): Promise<void>;
    }
}
