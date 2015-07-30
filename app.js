var game = new Phaser.Game(400, 490, Phaser.AUTO, '')

function Main() {};

Main.prototype = {
  init: function(){
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
  },
  preload: function(){
    this.game.load.spritesheet('aisle', 'assets/linesSprites.png', 12, 3);
  },
  create: function(){
    this.actionDelay = 300;
    this.moveSpeed = 50;
    this.currentAisle = null;
    this.aisles = this.game.add.group();

    for (i = 0; i < 50; i++) {
      this.aisles.add(new Aisle(this));
    }

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.spawnAisle();
  },
  update: function(){
    this.currentAisle.body.velocity.x = 0;
    this.currentAisle.body.velocity.y = 0;
    if(!this.cursors.right.isDown && !this.cursors.left.isDown){
    } else {
      if(this.cursors.left.isDown){
        this.currentAisle.body.velocity.x -= this.moveSpeed;
      }
      if(this.cursors.right.isDown){
        this.currentAisle.body.velocity.x += this.moveSpeed;
      }
    }

    if(this.cursors.up.isDown){
      this.currentAisle.body.velocity.y -= this.moveSpeed;
    }
    if(this.cursors.down.isDown){
      this.currentAisle.body.velocity.y += this.moveSpeed;
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
      this.spawnAisle();
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.Q)){
      this.currentAisle.rotateLeft();
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.W)){
      this.currentAisle.rotateRight();
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.P)){
      if (this.game.time.time < this.nextChangeAisle) { return; }
      this.previousAisle();
      this.nextChangeAisle = this.game.time.time + this.actionDelay;
    }
    if(this.game.input.keyboard.isDown(Phaser.Keyboard.N)){
      if (this.game.time.time < this.nextChangeAisle) { return; }
      this.nextAisle();
      this.nextChangeAisle = this.game.time.time + this.actionDelay;
    }
  },
  spawnAisle: function(){
    if (this.game.time.time < this.nextSpawn) { return; }

    if(this.currentAisle){
      this.currentAisle.body.velocity.x = 0;
      this.currentAisle.body.velocity.y = 0;
    }
    var aisle = this.aisles.getFirstDead();
    aisle.reset(200, 240);
    this.setCurrentAisle(aisle);
    this.nextSpawn = this.game.time.time + this.actionDelay;
  },
  previousAisle: function(){
    var livingAisles = this.aisles.filter(function(e){return e.alive});
    if(this.currentAisle && livingAisles.list.length > 1){
      this.currentAisle.body.velocity.x = 0;
      this.currentAisle.body.velocity.y = 0;
    }
    var currentIndex = this.aisles.getIndex(this.currentAisle);
    var previousAisle;
    if(currentIndex == 0){
      previousAisle = this.aisles.getAt(this.aisles.length-1);
    } else {
      previousAisle = this.aisles.getAt(currentIndex-1);
    }
    if(!previousAisle.alive){
      ai = livingAisles;
      var index = livingAisles.getIndex(livingAisles.list[livingAisles.list.length-1]);
      bar = this.aisles.getAt(index)
      this.setCurrentAisle(this.aisles.getAt(index));
    } else {
      this.setCurrentAisle(previousAisle);
    }
  },
  nextAisle: function(){
    var livingAisles = this.aisles.filter(function(e){return e.alive});
    if(!this.currentAisle || !livingAisles.list.length > 1){ return }

    var nextAisle;
    var currentIndex = this.aisles.getIndex(this.currentAisle);
    if(currentIndex == this.aisles.length-1){
      nextAisle = this.aisles.getAt(0);
    } else {
      nextAisle = this.aisles.getAt(currentIndex+1);
    }
    if(!nextAisle.alive){
      nextAisle = this.aisles.getAt(0);
    }
    this.setCurrentAisle(nextAisle);
  },
  setCurrentAisle: function(aisle){
    if(this.currentAisle){
      this.currentAisle.body.velocity.x = 0;
      this.currentAisle.body.velocity.y = 0;
      this.currentAisle.frame = 0;
    }
    this.currentAisle = aisle;
    this.currentAisle.frame = 1;
  }
};



var Aisle = function (state) {
  this.gameState = state;
  this.game = state.game;
  Phaser.Sprite.call(this, this.game, 0, 0, 'aisle');
  this.game.physics.arcade.enable(this);
  this.exists = false;
  this.alive = false;
  this.anchor.setTo(0.5, 0.5);
};

Aisle.prototype = Object.create(Phaser.Sprite.prototype);
Aisle.prototype.constructor = Aisle;

Aisle.prototype.create = function(){
}

Aisle.prototype.update = function () {
};

Aisle.prototype.rotateLeft = function(){
  this.angle -= 2;
}
Aisle.prototype.rotateRight = function(){
  this.angle += 2;
}




game.state.add('main', Main);
game.state.start('main');
