use crate::math::Point;
use crate::math::Vector;

pub const IN_SITU: Point = Point { x: 0.0, y: 0.0 };

pub const NORTH: Vector = Vector {
    start: IN_SITU,
    end: Point { x: 0.0, y: -8.0 },
};

pub const SOUTH: Vector = Vector {
    start: IN_SITU,
    end: Point { x: 0.0, y: 8.0 },
};

pub const EAST: Vector = Vector {
    start: IN_SITU,
    end: Point { x: 8.0, y: 0.0 },
};

pub const WEST: Vector = Vector {
    start: IN_SITU,
    end: Point { x: -8.0, y: 0.0 },
};

pub const NORTHEAST: Vector = Vector {
    start: IN_SITU,
    end: Point { x: 8.0, y: -8.0 },
};

pub const NORTHWEST: Vector = Vector {
    start: IN_SITU,
    end: Point { x: -8.0, y: -8.0 },
};

pub const SOUTHEAST: Vector = Vector {
    start: IN_SITU,
    end: Point { x: 8.0, y: 8.0 },
};

pub const SOUTHWEST: Vector = Vector {
    start: IN_SITU,
    end: Point { x: -8.0, y: 8.0 },
};
