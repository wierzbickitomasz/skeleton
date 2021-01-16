

    //east: { offset: 0, x: 2, y: 0, opposite: 'west' },
   // west: { offset: 10, x: -2, y: 0, opposite: 'east' },

  
  // northWest: { offset: 10, x: -2, y: -1, opposite: 'southEast' }, //lewo góra (DZIAŁA)
  // southEast: { offset: 0, x: 2, y: 1, opposite: 'northWest' },//prawo dół (DZIAŁA)
   //northEast: { offset: 1, x: 2, y: -1, opposite: 'southWest' }, //prawo góra
   //southWest: { offset: 25, x: -2, y: 1, opposite: 'northEast' } //lewo dół (DZIAŁA)
    

   var directions = {
   northWest: { offset: 11, x: -2, y: -1, opposite: 'southEast' }, //lewo góra (DZIAŁA)
   southEast: { offset: 0, x: 2, y: 1, opposite: 'northWest' },//prawo dół (DZIAŁA)
   northEast: { offset: 35, x: 2, y: -1, opposite: 'southWest' }, //prawo góra
   southWest: { offset: 24, x: -2, y: 1, opposite: 'northEast' } //lewo dół (DZIAŁA)

    /*
   // west: { offset: 0, x: -2, y: 0, opposite: 'east' },

   //prawo góra
   northEast: { offset: 96, x: 2, y: -1, opposite: 'southWest' }, 
   //lewo dół
   southWest: { offset: 224, x: -2, y: 1, opposite: 'northEast' },


    //lewo góra
    northWest: { offset: 10, x: -2, y: -1, opposite: 'southEast' },
   // north: { offset: 64, x: 0, y: -2, opposite: 'south' },
   
   // east: { offset: 128, x: 2, y: 0, opposite: 'west' },
   //prawo dół
    southEast: { offset: 0, x: 2, y: 1, opposite: 'northWest' }
  //  south: { offset: 192, x: 0, y: 2, opposite: 'north' },
    */
};

var anims = {
    walk: {
        startFrame: 5,
        endFrame: 12,
        speed: 0.15
    }
   
};


var skeletons = [];

var tileWidthHalf;
var tileHeightHalf;

var d = 0;

var scene;

// GameObject Skeleton
class Skeleton extends Phaser.GameObjects.Image {
    constructor(scene, x, y, motion, direction, distance) {
        super(scene, x, y, 'skeleton', direction.offset);

        this.startX = x;
        this.startY = y;
        this.distance = distance;

        this.motion = motion;
        this.anim = anims[motion];
        this.direction = directions[direction];
        this.speed = 0.15;
        this.f = this.anim.startFrame;

        this.depth = y + 64;

        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }

    changeFrame ()
    {
        this.f++;

        var delay = this.anim.speed;

        if (this.f === this.anim.endFrame)
        {
            switch (this.motion)
            {
                case 'walk':
                    this.f = this.anim.startFrame;
                    this.frame = this.texture.get(this.direction.offset + this.f);
                    scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
                    break;

                case 'attack':
                    delay = Math.random() * 2;
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;

                case 'idle':
                    delay = 0.5 + Math.random();
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;

                case 'die':
                    delay = 6 + Math.random() * 6;
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
            }
        }
        else
        {
            this.frame = this.texture.get(this.direction.offset + this.f);

            scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
        }
    }

    resetAnimation ()
    {
        this.f = this.anim.startFrame;

        this.frame = this.texture.get(this.direction.offset + this.f);

        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }

    update ()
    {   
        if (this.motion === 'walk')
        {
            this.x += this.direction.x * this.speed;

            if (this.direction.y !== 0)
            {
                this.y += this.direction.y * this.speed;
                this.depth = this.y + 64;
            }

            //  Walked far enough?
            if (Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y) >= this.distance)
            {
                this.direction = directions[this.direction.opposite];
                this.f = this.anim.startFrame;
                this.frame = this.texture.get(this.direction.offset + this.f);
                this.startX = this.x;
                this.startY = this.y;
            }
        }
    }
}

class Example extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.json('map', 'assets/tests/iso/mapa.json');
        this.load.spritesheet('tiles', 'assets/tests/iso/tileset.png', { frameWidth: 64, frameHeight: 40 });
        this.load.spritesheet('skeleton', 'assets/tests/iso/character.png', { frameWidth: 128, frameHeight: 128 });
        this.load.image('house', 'assets/tests/iso/rem_0002.png');
    }

    create ()
    {
        scene = this;

        this.buildMap();

        skeletons.push(this.add.existing(new Skeleton(this, 150, 200, 'walk', 'southEast', 100))); //ost arg to dystans
        skeletons.push(this.add.existing(new Skeleton(this, 325, 170, 'walk', 'northEast', 50))); //ost arg to dystans

        this.cameras.main.setSize(650, 350);

        // this.cameras.main.scrollX = 300;
    }

    update ()
    {
        skeletons.forEach(function (skeleton) {
            skeleton.update();
        });

        // return;

    }


    buildMap ()
    {
        //  Parse the data out of the map
        const data = scene.cache.json.get('map');

        const tilewidth = 64;
        const tileheight = data.tileheight;

        tileWidthHalf = tilewidth / 2;
        tileHeightHalf = tileheight / 2;

        const layer = data.layers[0].data;

        const mapwidth = data.layers[0].width;
        const mapheight = data.layers[0].height;

        const centerX = 325; //650/2
        const centerY = 20;

        let i = 0;

        for (let y = 0; y < mapheight; y++)
        {
            for (let x = 0; x < mapwidth; x++)
            {
                const id = layer[i] - 1;

                const tx = (x - y) * tileWidthHalf;
                const ty = (x + y) * tileHeightHalf;

                const tile = scene.add.image(centerX + tx, centerY + ty, 'tiles', id);

                tile.depth = centerY + ty;

                i++;
            }
        }
    }

  
}

const config = {
    type: Phaser.WEBGL,
    width: 650,
    height: 350,
    backgroundColor: '#ababab',
    parent: 'phaser-example',
    scene: [ Example ]
};

const game = new Phaser.Game(config);
