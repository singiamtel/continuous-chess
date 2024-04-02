pub struct Point {
    pub x: f32,
    pub y: f32,
}

pub struct Vector {
    pub start: Point,
    pub end: Point,
}

pub struct Circumference {
    pub center: Point,
    pub radius: f32,
}

fn add(p1: &Point, p2: &Point) -> Point {
    Point {
        x: p1.x + p2.x,
        y: p1.y + p2.y,
    }
}

fn subtract(p1: &Point, p2: &Point) -> Point {
    Point {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
    }
}

fn dot(p1: &Point, p2: &Point) -> f32 {
    p1.x * p2.x + p1.y * p2.y
}

fn hypot2(p1: &Point, p2: &Point) -> f32 {
    dot(&subtract(p1, p2), &subtract(p1, p2))
}

fn project(p1: &Point, p2: &Point) -> Point {
    let k = dot(p1, p2) / dot(p2, p2);
    Point {
        x: p2.x * k,
        y: p2.y * k,
    }
}

// From https://stackoverflow.com/a/1079478
fn distance_point_to_vector(line: &Vector, point: &Point) -> f32 {
    let Vector { start: A, end: B } = line;
    let C = point;
    // Compute AC and AB
    let AC = subtract(C, A);
    let AB = subtract(B, A);

    // Get point D by taking the projection of AC onto AB then adding the offset of A
    let D = add(&project(&AC, &AB), A);

    let AD = subtract(&D, A);

    // D might not be on AB so calculate k of D down AB (aka solve AD = k * AB)
    // We can use either component, but choose larger value to reduce the chance of dividing by zero
    let k = if AB.x.abs() > AB.y.abs() {
        AD.x / AB.x
    } else {
        AD.y / AB.y
    };
    if k < 0.0 {
        distance(C, A)
    } else {
        distance(C, B)
    }
}

pub fn distance(p1: &Point, p2: &Point) -> f32 {
    hypot2(p1, p2).sqrt()
}

pub fn add_vector_to_point(point: &Point, vector: &Vector) -> Point {
    Point {
        x: point.x + vector.end.x - vector.start.x,
        y: point.y + vector.end.y - vector.start.y,
    }
}

fn closest_point_on_line(line: &Vector, point: &Point) -> Point {
    let Vector { start: A, end: B } = line;
    let AB = subtract(B, A);
    let AC = subtract(point, A);

    let k = dot(&AC, &AB) / dot(&AB, &AB);
    if k < 0.0 {
        Point { x: A.x, y: A.y }
    } else if k > 1.0 {
        Point { x: B.x, y: B.y }
    } else {
        Point {
            x: A.x + AB.x * k,
            y: A.y + AB.y * k,
        }
    }
}
