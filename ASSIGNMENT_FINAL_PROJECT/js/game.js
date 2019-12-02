class Game {
  constructor () {

    this.isLost = false;

    // canvas
    this.canvasHeight = window.innerWidth/3;
    this.canvasWidth = window.innerWidth;
    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.context = this.canvas.getContext("2d");

    // score
    this.score = 0;
    this.scoreText = document.getElementById('score-text')

    // runner
    this.runnerWidth = 30;
    this.runnerHeight = 30;

    this.runnerPositionX = 25;
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
    this.antiGravity = this.antiGravity ? false : true
    this.runnerSpeed = 0;
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
    this.context.fillStyle = this.antiGravity ? 'yellow' : 'blue'
    this.context.shadowBlur = 40;
    this.context.shadowColor = "white";
    this.context.fillRect(this.runnerPositionX, this.runnerPositionY, this.runnerWidth, this.runnerHeight);

    // manage obstacles
    this.obstacleTick();
    this.moveObstacles();
  }

  triangulateObject (object) {
    let triangles = object.map((point, index) => {

      // there's gotta be an easier way to do this

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

  detectRunnerCollision (obstacle) {

    let runner = [
      [this.runnerPositionX, this.runnerPositionY],
      [this.runnerPositionX + this.runnerWidth, this.runnerPositionY],
      [this.runnerPositionX + this.runnerWidth, this.runnerPositionY + this.runnerHeight],
      [this.runnerPositionX, this.runnerPositionY + this.runnerHeight],
      [this.runnerPositionX, this.runnerPositionY]
    ]

    let runnerTriangles = this.triangulateObject(runner)
    let obstacleTriangles = this.triangulateObject(obstacle)
    for (let rt of runnerTriangles) {
      for (let ot of obstacleTriangles) {
        if( greinerHormann.intersection(rt, ot) ) {
          this.isLost = true;
        }
      }
    }

  }

  obstacleTick () {
    
    if (this.obstacleTimer <= 0) {
      this.generateObstacle();
      this.obstacleTimer = 30 - this.score/1000;
    }
    else {
      this.obstacleTimer = this.obstacleTimer - 1;
    }
  }

  generateObstacle () {
    let newObstacle = new Obstacle({
      context: this.context,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      score: this.score
    })

    this.obstacles.push(newObstacle)
  }

  moveObstacles () {
    if (this.obstacles.length) {
      for (let obstacle of this.obstacles) {
        obstacle.tick()
        this.detectRunnerCollision(obstacle.points)
      }

      this.obstacles = this.obstacles.filter(o => o.keepalive)
      this.writeScore()
    }
  }
  
}