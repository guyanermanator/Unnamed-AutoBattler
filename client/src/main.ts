import { Game } from './Game';
import './style.css';

/**
 * Main entry point
 */
function main() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  const game = new Game(canvas);
  game.start().catch(error => {
    console.error('Failed to start game:', error);
  });
}

// Start game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
