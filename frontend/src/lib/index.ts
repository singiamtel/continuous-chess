// place files you want to import through the `$lib` alias in this folder.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(condition: any, message?: string): asserts condition {
    if(!condition) {
        throw new Error(message);
    }
}

export function assertNever(x: never): asserts x {
    throw new Error("This code should not be reachable");
}
