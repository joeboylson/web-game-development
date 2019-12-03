const DEBUG = false;

window.addEventListener('DOMContentLoaded', () => {

  // setup
  let  gravitySwitch = document.getElementById('gravity-switch')
  let game = new Game()

  // event listeners
  gravitySwitch.addEventListener('click', () => game.switchGravity() )
  game.canvas.addEventListener('click', () => game.switchGravity())

  document.addEventListener('keyup', (e) => {
    if (e.keyCode === 32) { game.switchGravity(); }
    if (e.keyCode === 13) { if (game.isLost) { location.reload(); } }
  });

  const animate = () => {
    game.clear()
    game.draw()

    if (!game.isLost) {
      if (DEBUG) { return setTimeout(animate, 1000/20) }  
      return window.requestAnimationFrame(animate)
    }
  }

  // begin the game
  animate()
})
