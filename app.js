// MAKE SECOND COLOR FOR WALLS SO THEY HIGHLIGHT
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game')

function Main() {};

Main.prototype = {
  init: function(){
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
  },
  preload: function(){
    this.game.load.spritesheet('aisle', 'assets/allAislesSprite.png', 80, 24);
    this.game.load.spritesheet('wall', 'assets/wallsSprite.png', 80, 8);
  },
  create: function(){
    this.game.stage.backgroundColor = "#71c5cf";
    this.aisleInfoDelay = 200;
    this.actionDelay = 300;
    this.moveSpeed = 150;
    this.currentItem = null;

    this.aisles = this.game.add.group();
    this.walls = this.game.add.group();

    this.currentItemGroup = this.aisles;

    this.aisleInfo = {};
    for (i = 0; i < 50; i++) {
      var aisle = new Aisle(this);
      this.aisles.add(aisle);
      this.aisleInfo[i] = aisle;
    }
    window.aisleInfo = this.aisleInfo;


    for (i = 0; i < 50; i++) {
      var wall = new Wall(this);
      this.walls.add(wall);
    }

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);
    this.spawnItem();
  },
  update: function(){
    this.currentItem.body.velocity.x = 0;
    this.currentItem.body.velocity.y = 0;
    if(!this.cursors.right.isDown && !this.cursors.left.isDown){
    } else {
      if(this.cursors.left.isDown){
        this.currentItem.body.velocity.x -= this.moveSpeed;
      }
      if(this.cursors.right.isDown){
        this.currentItem.body.velocity.x += this.moveSpeed;
      }
    }

    if(this.cursors.up.isDown){
      this.currentItem.body.velocity.y -= this.moveSpeed;
    }
    if(this.cursors.down.isDown){
      this.currentItem.body.velocity.y += this.moveSpeed;
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
      this.spawnItem();
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.Q)){
      this.currentItem.rotateLeft();
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.W)){
      this.currentItem.rotateRight();
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.F)){
      this.toggleAisleType();
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.G)){
      this.toggleItem();
    }

    if(this.game.input.keyboard.isDown(Phaser.Keyboard.P)){
      if (this.game.time.time < this.nextChangeAisle) { return; }
      this.previousAisle();
      this.nextChangeAisle = this.game.time.time + this.actionDelay;
    }
    if(this.game.input.keyboard.isDown(Phaser.Keyboard.N)){
      if (this.game.time.time < this.nextChangeAisle) { return; }
      this.nextItem();
      this.nextChangeAisle = this.game.time.time + this.actionDelay;
    }
    this.updateAisleInfo();
  },
  updateAisleInfo: function(){
    var aisleElement = document.getElementById("aisleInfo");

    if (this.game.time.time < this.nextAisleInfoUpdate) { return; }

    aisleElement.innerHTML = "";
    for (i = 0; i < this.aisles.length; i++) {
      var aisle = this.aisleInfo[i];
      if(!aisle.alive){return}
      var selected = "";
      if(this.currentItem.className == "Aisle" && this.aisles.getIndex(this.currentItem) == i){
        selected = "selected"
      };
      aisleElement.innerHTML += "<div class=" + selected + ">" +
        "X: " + aisle.position.x +
        ", Y: " + aisle.position.y +
        ", Angle: " + aisle.angle +
        ", Has Direction Preference: " + (aisle.frame > 1) +
        "</div>"
    }
    this.nextAisleInfoUpdate = this.game.time.time + this.aisleInfoDelay;
  },
  spawnItem: function(){
    if (this.game.time.time < this.nextSpawn) { return; }

    if(this.currentItem){
      this.currentItem.body.velocity.x = 0;
      this.currentItem.body.velocity.y = 0;
    }
    var item = this.currentItemGroup.getFirstDead();
    item.reset(200, 240);
    this.setCurrentItem(item);
    this.nextSpawn = this.game.time.time + this.actionDelay;
    return item;
  },
  previousAisle: function(){
    var livingItems = this.currentItemGroup.filter(function(e){return e.alive});
    console.log(livingItems)
    if(this.currentItem && livingItems.list.length > 1){
      this.currentItem.body.velocity.x = 0;
      this.currentItem.body.velocity.y = 0;
    }
    var currentIndex = this.currentItemGroup.getIndex(this.currentItem);
    var previousAisle;
    if(currentIndex == 0){
      previousAisle = this.currentItemGroup.getAt(this.currentItemGroup.length-1);
    } else {
      previousAisle = this.currentItemGroup.getAt(currentIndex-1);
    }
    if(!previousAisle.alive){
      var index = livingItems.getIndex(livingItems.list[livingItems.list.length-1]);
      this.setCurrentItem(this.currentItemGroup.getAt(index));
    } else {
      this.setCurrentItem(previousAisle);
    }
    this.updateAisleInfo();
  },
  nextItem: function(){
    var livingAisles = this.currentItemGroup.filter(function(e){return e.alive});
    if(!this.currentItem || !livingAisles.list.length > 1){ return }

    var nextItem;
    var currentIndex = this.currentItemGroup.getIndex(this.currentItem);
    if(currentIndex == this.currentItemGroup.length-1){
      nextItem = this.currentItemGroup.getAt(0);
    } else {
      nextItem = this.currentItemGroup.getAt(currentIndex+1);
    }
    if(!nextItem.alive){
      nextItem = this.currentItemGroup.getAt(0);
    }
    this.setCurrentItem(nextItem);
    this.updateAisleInfo();
  },
  setCurrentItem: function(item){
    if(this.currentItem){
      this.currentItem.body.velocity.x = 0;
      this.currentItem.body.velocity.y = 0;
      this.currentItem.frame = 0 + this.currentItem.offset;
    }
    this.currentItem = item;
    this.currentItem.frame = 1 + this.currentItem.offset;
  },
  toggleAisleType: function(){
    this.currentItem.toggleType();
  },
  toggleItem: function(){
    if (this.game.time.time < this.nextToggleItem) { return; }
    if(this.currentItem.className == "Aisle"){
      this.currentItemGroup = this.walls;
    } else {
      this.currentItemGroup = this.aisles;
    }
    var item = this.spawnItem();
    this.setCurrentItem(item);
    this.nextToggleItem = this.game.time.time + this.actionDelay;
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
  this.actionDelay = 200;
  this.className = "Aisle";
  this.offset = 0;
};

Aisle.prototype = Object.create(Phaser.Sprite.prototype);
Aisle.prototype.constructor = Aisle;

Aisle.prototype.create = function(){
}

Aisle.prototype.update = function () {
};

Aisle.prototype.toggleType = function(){
  if (this.game.time.time < this.nextToggleType) { return; }
  if(this.offset == 0){
    this.offset = 2;
  } else {
    this.offset = 0;
  }
  this.updateFrame();
  this.nextToggleType = this.game.time.time + this.actionDelay;
}

Aisle.prototype.updateFrame = function(){
  this.frame = 1 + this.offset;
}

Aisle.prototype.rotateLeft = function(){
  if (this.game.time.time < this.nextRotate) { return; }
  this.angle -= 45;
  this.nextRotate = this.game.time.time + this.actionDelay;
}
Aisle.prototype.rotateRight = function(){
  if (this.game.time.time < this.nextRotate) { return; }
  this.angle += 45;
  this.nextRotate = this.game.time.time + this.actionDelay;
}


var Wall = function (state) {
  this.gameState = state;
  this.game = state.game;
  Phaser.Sprite.call(this, this.game, 0, 0, 'wall');
  this.game.physics.arcade.enable(this);
  this.exists = false;
  this.alive = false;
  this.anchor.setTo(0.5, 0.5);
  this.actionDelay = 200;
  this.className = "Wall";
};

Wall.prototype = Object.create(Phaser.Sprite.prototype);
Wall.prototype.constructor = Wall;

Wall.prototype.create = function(){
}

Wall.prototype.update = function () {
};

Wall.prototype.rotateLeft = function(){
  if (this.game.time.time < this.nextRotate) { return; }
  this.angle -= 45;
  this.nextRotate = this.game.time.time + this.actionDelay;
}
Wall.prototype.rotateRight = function(){
  if (this.game.time.time < this.nextRotate) { return; }
  this.angle += 45;
  this.nextRotate = this.game.time.time + this.actionDelay;
}



game.state.add('main', Main);
game.state.start('main');
