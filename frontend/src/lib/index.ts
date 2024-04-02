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

export function capitalize(s: string): string {
    assert(s.length > 0), "capitalize: empty string";
    return s.charAt(0).toUpperCase() + s.slice(1);
}