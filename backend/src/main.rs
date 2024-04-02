mod game;
use game::game as deepgame;
use game::math;

fn main() {
    deepgame::parse_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
}
