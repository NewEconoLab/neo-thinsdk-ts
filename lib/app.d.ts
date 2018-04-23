/// <reference path="neo-ts.d.ts" />
declare module NeoTest {
    interface ITestItem {
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_CheckAddress implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_Hash2Address implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_Pubkey2Address implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_Sign implements ITestItem {
        constructor();
        getName(): string;
        privateKey: Uint8Array;
        publicKey: Uint8Array;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_WifDecode implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_Nep2FromPrikey implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_Nep2ToPrikey implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_Nep6 implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_Nep6Gen implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_TransactionAnalysis implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_ASM2AVM implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_GetNep5Info implements ITestItem {
        constructor();
        getName(): string;
        makeRpcUrl(url: string, method: string, ..._params: any[]): string;
        makeRpcPostBody(method: string, ..._params: any[]): {};
        nep5decimals: number;
        start(div: HTMLDivElement): void;
    }
}
declare module NeoTest {
    class Test_ScriptBuilder implements ITestItem {
        constructor();
        getName(): string;
        start(div: HTMLDivElement): void;
    }
}
