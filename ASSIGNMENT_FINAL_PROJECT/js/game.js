class Game {
  constructor () {

    // game status
    this.isStarted = false;
    this.isLost = false;
    this.isPaused = false;

    // barriers
    this.barrierDeployScore = 3000;
    this.barrierTopDeployed = false;
    this.barrierBottomDeployed = false;

    // canvas
    this.canvasHeight = window.innerHeight;
    this.canvasWidth = window.innerWidth;
    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.context = this.canvas.getContext("2d");

    window.addEventListener('resize', () => {
      this.isPaused = true;
    })

    // score
    this.score = 0;
    this.scoreText = document.getElementById('score-text')

    // runner
    this.runnerWidth = 30;
    this.runnerHeight = 30;

    //powerups
    this.invisibleTimer = 0;
    this.invisibleColor = '#ff0099';
    this.invisible = { 
      name: 'invisible', 
      color: this.invisibleColor, 
      isPowerUp: true,
      effect: (obstacle) => {
        this.invisibleTimer = 60*7;
        obstacle.keepalive = false;
      }
    }

    this.coin = { 
      name: 'coin', 
      color: '#DAA520', 
      isPowerUp: true,
      effect: (obstacle) => {
        this.score = this.score + 500;
        obstacle.keepalive = false;
      }
    }

    this.runnerPositionX = 100;
    this.runnerPositionY = 0;
    this.runnerSpeed = 0;

    // gravity
    this.antiGravity = true;
    this.gravityIntensity = 0.25;
    
    // obstalces
    this.obstacleTimer = 0;
    this.obstacles = [];
  }

  switchGravity() {
    if (!this.isPaused) {
      this.antiGravity = this.antiGravity ? false : true
      this.runnerSpeed = 0;
    }
  }
  
  setStart (bool) {
    this.isStarted = bool;
  }

  setPause (bool) {
    if (this.isStarted) {  
      this.isPaused = bool;
    }
  }

  togglePause () {
    this.setPause(!this.isPaused);
  }

  clear () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  writeScore() {
    this.score = this.score + 1;
    this.scoreText.innerHTML = this.score
  }

  draw () {

    if (this.antiGravity) {
      this.runnerSpeed = this.runnerSpeed + this.gravityIntensity;
      this.runnerPositionY = this.runnerPositionY + this.runnerSpeed;
    }

    if (!this.antiGravity) {
      this.runnerSpeed = this.runnerSpeed - this.gravityIntensity;
      this.runnerPositionY = this.runnerPositionY + this.runnerSpeed;
    }

    if (this.runnerPositionY < 0) {
      this.runnerPositionY = 0;
    }

    if (this.runnerPositionY > (this.canvasHeight-this.runnerHeight)) {
      this.runnerPositionY = (this.canvasHeight-this.runnerHeight);
    }

    // draw runner
    this.context.shadowBlur = 40;
    if (this.invisibleTimer > 0) {
      this.context.strokeStyle = this.invisibleColor;
      this.context.shadowColor = this.invisibleColor;
      this.context.strokeRect(this.runnerPositionX, this.runnerPositionY, this.runnerWidth, this.runnerHeight);
    }
    else {
      this.context.fillStyle = this.antiGravity ? 'yellow' : 'blue'
      this.context.shadowColor = "white";
      this.context.fillRect(this.runnerPositionX, this.runnerPositionY, this.runnerWidth, this.runnerHeight);
    }

    // manage obstacles
    this.obstacleTick();
    this.moveObstacles();
  }

  triangulateObject (object) {
    let triangles = object.map((point, index) => {

      let pointOne = object[index]
      let pointTwo = object[index + 1] || object[ (index + 1) - (object.length) ]
      let pointThree = object[index + 2] || object[ (index + 2) - (object.length) ]

      return [
        {x: pointOne[0], y: pointOne[1]},
        {x: pointTwo[0], y: pointTwo[1]},
        {x: pointThree[0], y: pointThree[1]},
      ]
    })

    return triangles
  } 

  playerIsInvulnerable() {
    return (this.invisibleTimer > 0)
  }

  detectRunnerCollision (obstacle) {

    if (this.playerIsInvulnerable()) {
      return;
    }

    if (!obstacle.keepalive) {
      return;
    }

    let runner = [
      [this.runnerPositionX, this.runnerPositionY],
      [this.runnerPositionX + this.runnerWidth, this.runnerPositionY],
      [this.runnerPositionX + this.runnerWidth, this.runnerPositionY + this.runnerHeight],
      [this.runnerPositionX, this.runnerPositionY + this.runnerHeight],
      [this.runnerPositionX, this.runnerPositionY]
    ]

    let runnerTriangles = this.triangulateObject(runner)
    let obstacleTriangles = this.triangulateObject(obstacle.points)
    for (let rt of runnerTriangles) {
      for (let ot of obstacleTriangles) {
        if( greinerHormann.intersection(rt, ot) ) {
          return obstacle.effect(obstacle)
        }
      }
    }
  }

  obstacleTick () {
    
    if (this.obstacleTimer <= 0) {
      this.generateObstacle();
      this.obstacleTimer = 18 - this.score/2000;
    }
    else {
      this.obstacleTimer = this.obstacleTimer - 1;
    }
  }

  getRandomPowerUp() {

    if (!this.barrierTopDeployed && this.score > this.barrierDeployScore) {
      this.barrierTopDeployed = true;
      return {
        name: 'barrier-top',
        color: 'red',
        isPowerUp: false,
        effect: () => this.isLost = true
      }
    }

    if (!this.barrierBottomDeployed && this.score > this.barrierDeployScore) {
      this.barrierBottomDeployed = true;
      return {
        name: 'barrier-bottom',
        color: 'red',
        isPowerUp: false,
        effect: () => this.isLost = true
      }
    }

    let randomValue = Math.random()

    if (randomValue < 0.9) {
      return this.coin;
    }
    else {
      return this.invisible;
    }

  }

  generateObstacle () {

    let generatePowerUp = Math.random() > 0.5;
    let defaultObstacle = { name: 'obstacle', color: 'red', isPowerUp: false, effect: () => this.isLost = true}

    let newObstacle = new Obstacle({
      context: this.context,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      score: this.score,
      obstacle: generatePowerUp ? this.getRandomPowerUp() : defaultObstacle
    })

    this.obstacles.push(newObstacle)
  }

  moveObstacles () {
    if (this.obstacles.length) {
      for (let obstacle of this.obstacles) {
        obstacle.tick()
        this.detectRunnerCollision(obstacle)
      }

      this.obstacles = this.obstacles.filter(o => o.keepalive)
      this.writeScore()
    }

    if ( this.invisibleTimer > 0 ) {
      this.invisibleTimer = this.invisibleTimer - 1;
    }
  }
  
}