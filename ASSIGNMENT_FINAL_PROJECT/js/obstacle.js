class Obstacle {

  constructor({context, canvasWidth, canvasHeight, score, obstacle}) {

    this.keepalive = true
    this.isPowerUp = obstacle.isPowerUp;

    this.context = context;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.score = score;

    this.size = Math.random() * 400;
    this.speed = Math.random() * 10 + 10 + this.score/1000;

    this.x = this.canvasWidth - 10,
    this.y = Math.random() * this.canvasHeight,
    this.width = 200
    this.height = 3

    this.obstacleType = obstacle.name;
    this.color = obstacle.color;
    this.effect = obstacle.effect;

    this.points = [];

    if (this.isPowerUp) {
      this.points = [
        [this.x, this.y],
        [this.x + 10, this.y],
        [this.x + 10, this.y + 10],
        [this.x, this.y + 10],
        [this.x, this.y]
      ]
    }
    else { 
      this.points = [
        [this.x, this.y],
        [this.x + this.width, this.y],
        [this.x + this.width, this.y + this.height],
        [this.x, this.y + this.height],
        [this.x, this.y]
      ]
    }

    this.rotationSpeed = 1
  }

  tick () {
    if (this.points[0][0] <= 0 - this.canvasWidth) {
      this.keepalive = false
    }

    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.shadowBlur = 25;
    this.context.shadowColor = this.color;

    this.context.moveTo(...this.points[0]);

    // https://stackoverflow.com/questions/20104611/find-new-coordinates-of-a-point-after-rotation
    // move points
    this.points = this.points.map(point => {
      let newPoint = [
        point[0] - this.speed, 
        point[1]
      ]

      this.context.lineTo(...newPoint);
      return newPoint
    })

    this.context.fill();
  }

}