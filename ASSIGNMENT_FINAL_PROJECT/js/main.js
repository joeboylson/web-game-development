const DEBUG = false;

window.addEventListener('DOMContentLoaded', () => {

  // setup
  let game = new Game()

  // event listeners
  game.canvas.addEventListener('click', () => game.switchGravity())

  // screens
  let pauseScreen = document.getElementById('pause-screen')
  let startScreen = document.getElementById('start-screen')
  let loseScreen = document.getElementById('lose-screen')

  startScreen.addEventListener('click', () => {
    console.log('start game')
    game.setStart(true)
  })

  document.getElementById('pause-button').addEventListener('click', () => {
    game.setPause(true)
  })

  pauseScreen.addEventListener('click', () => {
    game.setPause(false)
  })

  document.addEventListener('keyup', (e) => {
    if (e.keyCode === 32) { 
      if (!game.isStarted) {
        game.setStart(true)
      }
      else if (game.isStarted && !game.isLost) {
        game.switchGravity(); 
      }
      else {
        location.reload()
      }
    }
    if (e.keyCode === 13) { if (game.isLost) { location.reload(); } }
    if (e.keyCode === 27) { game.togglePause() }
  });

  const animate = () => {

    if (window.innerHeight > window.innerWidth) {
      return game.setPause(true);
    }

    if (game.isStarted) {
      startScreen.classList.remove('show-start-screen')

      if (!game.isPaused) {
        pauseScreen.classList.remove('show-pause-screen')
        game.clear()
        game.draw()
      } 
      else {
        pauseScreen.classList.add('show-pause-screen')
      }   
  
    }

    if (!game.isLost) {
      if (DEBUG) { return setTimeout(animate, 1000/20) }  
      return window.requestAnimationFrame(animate)
    }
    else {
      document.getElementById('final-score-text').innerHTML = game.score;
      loseScreen.classList.add('show-lose-screen')
    }
  }

  // begin the game
  animate()
})
