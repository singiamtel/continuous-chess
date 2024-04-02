mod game;
use game::game as deepgame;
use game::math;

fn main() {
    println!("Hello, world!");
    deepgame::parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
}
