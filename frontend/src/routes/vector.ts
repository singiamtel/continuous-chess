export type Position = { x: number; y: number };

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
export function distanceSegmentToPoint(line: [Position, Position], point: Position) {
    // Compute vectors AC and AB
    const [A, B] = line;
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