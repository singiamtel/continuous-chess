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
    let Vector { start: a, end: b } = line;
    let c = point;
    // Compute AC and AB
    let ac = subtract(c, a);
    let ab = subtract(b, a);

    // Get point D by taking the projection of AC onto AB then adding the offset of A
    let d = add(&project(&ac, &ab), a);

    let ad = subtract(&d, a);

    // d might not be on ab so calculate k of d down ab (aka solve ad = k * ab)
    // we can use either component, but choose larger value to reduce the chance of dividing by zero
    let k = if ab.x.abs() > ab.y.abs() {
        ad.x / ab.x
    } else {
        ad.y / ab.y
    };
    if k < 0.0 {
        distance(c, a)
    } else {
        distance(c, b)
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
    let Vector { start: a, end: b } = line;
    let ab = subtract(b, a);
    let ac = subtract(point, a);

    let k = dot(&ac, &ab) / dot(&ab, &ab);
    if k < 0.0 {
        Point { x: a.x, y: a.y }
    } else if k > 1.0 {
        Point { x: b.x, y: b.y }
    } else {
        Point {
            x: a.x + ab.x * k,
            y: a.y + ab.y * k,
        }
    }
}
