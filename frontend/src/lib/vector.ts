export type Position = { x: number; y: number };
export type Line = { from: Position; to: Position };
export type Circunference = { center: Position; radius: number };

export function isCircunference(movement: Line | Line[] | Circunference): movement is Circunference {
    return (movement as Circunference).center !== undefined;
}

export function closestPointToCircunference(circunference: Circunference, point: Position): Position {
    const angle = Math.atan2(point.y - circunference.center.y, point.x - circunference.center.x);
    return {
        x: circunference.center.x + Math.cos(angle) * circunference.radius,
        y: circunference.center.y + Math.sin(angle) * circunference.radius,
    };
}

function add (a: Position, b: Position) {return {x: a.x + b.x, y: a.y + b.y};}
function sub (a: Position, b: Position) {return {x: a.x - b.x, y: a.y - b.y};}
function dot (a: Position, b: Position) {return a.x * b.x + a.y * b.y;}
function hypot2 (a: Position, b: Position) {return dot(sub(a, b), sub(a, b));}

// Function for projecting some vector a onto b
function proj(a: Position, b: Position) {
    const k = dot(a, b) / dot(b, b);
    return {x: k * b.x, y: k * b.y};
}

// From https://stackoverflow.com/a/1079478
export function distanceSegmentToPoint(line: Line, point: Position) {
    // Compute vectors AC and AB
    const {from: A, to: B} = line;
    const C = point;
    const AC = sub(C, A);
    const AB = sub(B, A);

    // Get point D by taking the projection of AC onto AB then adding the offset of A
    const D = add(proj(AC, AB), A);

    const AD = sub(D, A);
    // D might not be on AB so calculate k of D down AB (aka solve AD = k * AB)
    // We can use either component, but choose larger value to reduce the chance of dividing by zero
    const k = Math.abs(AB.x) > Math.abs(AB.y) ? AD.x / AB.x : AD.y / AB.y;

    // Check if D is off either end of the line segment
    if (k <= 0.0) {
        return distance(C, A);
    } else if (k >= 1.0) {
        return distance(C, B);
    }

    return Math.sqrt(hypot2(C, D));
}

export function distance(a: Position, b: Position) {
    return Math.sqrt(hypot2(a, b));
}


export const South = {x: 0, y: 8};
export const North = {x: 0, y: -8};
export const East = {x: 8, y: 0};
export const West = {x: -8, y: 0};
export const NorthEast = {x: 8, y: -8};
export const NorthWest = {x: -8, y: -8};
export const SouthEast = {x: 8, y: 8};
export const SouthWest = {x: -8, y: 8};


export function relativeLine(origin: Position, addition: Position): Line {
    return {from: origin, to: add(origin, addition)};
}

export function absoluteLine(origin: Position, destination: Position): Line {
    return {from: origin, to: destination};
}

export function closestPointToLine(line: Line, point: Position): Position {
    const {from: A, to: B} = line;
    const AB = sub(B, A);
    const AC = sub(point, A);

    const k = dot(AC, AB) / dot(AB, AB);

    if (k <= 0) {
        return A;
    } else if (k >= 1) {
        return B;
    }

    return add(A, proj(AC, AB));
}

