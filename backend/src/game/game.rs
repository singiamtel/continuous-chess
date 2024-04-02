use regex::Regex;

#[derive(Debug, PartialEq, Eq)]
pub enum Color {
    White,
    Black,
}

#[derive(Debug, PartialEq, Eq)]
pub struct Player {
    name: String,
    color: Color,
}

#[derive(Debug, PartialEq, Eq)]
pub enum PieceKind {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
}

pub fn get_piece_type(c: char) -> (PieceKind, Color) {
    let piece_type = match c {
        'P' | 'p' => PieceKind::Pawn,
        'N' | 'n' => PieceKind::Knight,
        'B' | 'b' => PieceKind::Bishop,
        'R' | 'r' => PieceKind::Rook,
        'Q' | 'q' => PieceKind::Queen,
        'K' | 'k' => PieceKind::King,
        _ => panic!("Invalid piece type"),
    };
    let color = if c.is_uppercase() {
        Color::White
    } else {
        Color::Black
    };
    (piece_type, color)
}

pub struct Piece {
    position: (i32, i32),
    color: Color,
    kind: PieceKind,
    alive: bool,
    moved: bool,
}

struct FEN {
    pieces: Vec<Piece>,
    active_color: Color,
    castling_rights: (bool, bool, bool, bool),
    en_passant: Option<(i32, i32)>,
    halfmove_clock: i32,
    fullmove_number: i32,
}

pub fn parseFEN(fen: &str) {
    let re = Regex::new(r"\d").unwrap();
    let parts = fen.split(' ').collect::<Vec<&str>>();
    if parts.len() != 6 {
        panic!("Invalid FEN format");
    }
    let (board, turn, _castling_rights, _en_passant, halfmove_clock, fullmove_number) =
        (parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
    let fen_pieces: String = re
        .replace_all(board, |caps: &regex::Captures| {
            let n = caps[0].parse::<usize>().unwrap();
            " ".repeat(n)
        })
        .to_string();

    let rows = fen_pieces.split('/').collect::<Vec<&str>>();
    let pieces = rows.iter().map(|&row| row.chars());
    // .collect::<Vec<C
    println!("{:?}", &pieces);
    // .enumerate()
    // .map(|(row, col)| row.chars())
    // .enumerate()
    // .map(|(row, c)| {
    //     let (piece_type, color) = get_piece_type(c);
    //     Piece {
    //         position: (row, col),
    //         color,
    //         kind: piece_type,
    //         alive: true,
    //         moved: false,
    //     }
    // })
    // .collect::<Vec<Piece>>();
}
