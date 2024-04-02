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

#[derive(Debug, PartialEq, Eq)]
pub struct Piece {
    position: (i32, i32),
    color: Color,
    kind: PieceKind,
    alive: bool,
    moved: bool,
}

#[derive(Debug, PartialEq, Eq)]
pub struct Fen {
    pieces: Vec<Piece>,
    active_color: Color,
    castling_rights: (bool, bool, bool, bool),
    en_passant: Option<(i32, i32)>,
    halfmove_clock: i32,
    fullmove_number: i32,
}

pub fn parse_fen(fen: &str) -> Fen {
    let re = Regex::new(r"\d").expect("Invalid regex");
    let parts = fen.split(' ').collect::<Vec<&str>>();
    if parts.len() != 6 {
        panic!("Invalid FEN format");
    }
    let (board, _turn, _castling_rights, _en_passant, _halfmove_clock, _fullmove_number) =
        (parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
    let fen_pieces: String = re
        .replace_all(board, |caps: &regex::Captures| {
            let n = caps[0].parse::<usize>().expect("Invalid number in FEN");
            " ".repeat(n)
        })
        .to_string();

    let rows = fen_pieces.split('/').collect::<Vec<&str>>();
    let pieces = rows
        .iter()
        .enumerate()
        .flat_map(|(row_idx, &row)| {
            let mut pieces = vec![];
            for (col_idx, c) in row.chars().enumerate() {
                if c == ' ' {
                    continue;
                }
                let (piece_type, color) = get_piece_type(c);
                pieces.push(Piece {
                    position: (
                        row_idx.try_into().expect("Invalid row index"),
                        col_idx.try_into().expect("Invalid column index"),
                    ),
                    color,
                    kind: piece_type,
                    alive: true,
                    moved: false,
                });
            }
            pieces
        })
        .collect::<Vec<Piece>>();
    println!("{:?}", &pieces);
    Fen {
        pieces,
        active_color: if _turn == "w" {
            Color::White
        } else {
            Color::Black
        },
        castling_rights: (
            _castling_rights.contains('K'),
            _castling_rights.contains('Q'),
            _castling_rights.contains('k'),
            _castling_rights.contains('q'),
        ),
        en_passant: None,
        halfmove_clock: _halfmove_clock
            .parse::<i32>()
            .expect("Invalid halfmove clock"),
        fullmove_number: _fullmove_number
            .parse::<i32>()
            .expect("Invalid fullmove number"),
    }
}
