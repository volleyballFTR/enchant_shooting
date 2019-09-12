// 1 ゲーム部品の準備
enchant(); // 全クラスのエクスポート クラス登録された関数をグローバルにする
let game, background; // グローバル変数の定義
let player, isGameOver, score, life
let enemiyDmgSD = []
let enemies = [];
let BackgroundImageTable = ['yozora.png', 'yozora2.png', 'yozora3.png']
// 2 イベント: window.onload（ウィンドウがロードされる時）
window.onload = function () {
    console.log("window.onload:start");
    // 2.1 ゲームの初期設定
    game = new Core(320, 320); // ゲームサイズ
    game.fps = 24; // フレーム数/秒
    game.preload('imomusi.png', 'space2.png', "space3.png", 'space4.png', 'ito.png', 'icon0.png', 'hinotama.png', 'effect0.png', 'clear.png',); // 画像のロード
    game.preload(BackgroundImageTable);
    game.preload('sounds/nv_01.mp3', 'sounds/failed.mp3', 'sounds/bomb1.wav', 'sounds/shot5.wav', 'sounds/kuliar.mp3', 'sounds/Clear4.mp3')
    score = 0;
    life = 3
    // 2.2 イベント: game.onload（ゲームがロードされる時）
    game.onload = function () {
        console.log("game.onload:start");
        // 2.2.1 背景を作る
        background = new Background();
        player = new Player(game.width / 2 - 18 / 2, game.height - 32 * 2);

        let scorelabel = new ScoreLabel(5, 0);
        scorelabel.score = score
        scorelabel.scaleX = 0.8;
        scorelabel.scaleY = 0.8;
        scorelabel.width = 84;
        game.rootScene.addChild(scorelabel);

        let lifeLabel = new LifeLabel(180, 0, 5);
        lifeLabel.scaleX = 0.8;
        lifeLabel.scaleY = 0.8;
        lifeLabel.life = life;
        game.rootScene.addChild(lifeLabel);

        enemiyDmgSD[0] = game.assets['sounds/bomb1.wav'];
        enemiyDmgSD[1] = game.assets['sounds/shot5.wav'];
        enemiyDmgSD[2] = game.assets['sounds/nv_01.mp3'];
        enemiyDmgSD[3] = game.assets['sounds/failed.mp3'];
        enemiyDmgSD[4] = game.assets['sounds/kuliar.mp3'];
        enemiyDmgSD[5] = game.assets['sounds/Clear4.mp3'];
        game.rootScene.addEventListener('enterframe', function () {
            scorelabel.score = score;
            lifeLabel.life = life;
            if (isGameOver) {
                enemiyDmgSD[2].stop();
                enemiyDmgSD[3].play();
                game.end();
            }
            if (player.isLost == false) {
                if (rand(100) < 5) {
                    let enemy = new Enemy(rand(320 - 32), 0, 32, 32, game.frame, 0)
                    enemies[game.frame] = enemy;
                }
                if (rand(100) < 1) {
                    let enemy = new Enemy(rand(320 - 32), 0, 32, 32, game.frame, 1)
                    enemies[game.frame] = enemy;
                }
                if (rand(200) < 1 && life < 3) {
                    let enemy = new Enemy(rand(320 - 32), 0, 16, 16, game.frame, "life_plus");
                    enemies[game.frame] = enemy;
                }
            }
            if (enemiyDmgSD[2].currentTime >= enemiyDmgSD[2].duration) {
                enemiyDmgSD[2].currentTime = 0;
            }
        });
        game.rootScene.addEventListener('enter', function () {
            console.log("game.rootScene:enter event ocuured");
            enemiyDmgSD[2].play();
        })
        console.log("game.onload:end");
    };
    // 2.3 ゲームをスタートする
    game.start();
    console.log("window.onload:end");
}
// 3 プレイヤのスプライトを作成する
let Background = enchant.Class.create(enchant.Sprite, { // enchant.Spriteを継承
    // 3.1 スプライトの初期設定をする
    initialize: function () {
        console.log("Background initialize:start")
        enchant.Sprite.call(this, 320, 640);
        this.x = 0; //ｘ座標
        this.y = -320; //y座標
        this.frame = 0; //先頭のフレーム
        this.currentImageNum = 0
        this.image = game.assets['yozora.png']; // 画像をこのクラスに設定
        // 3.2 イベント: enterframe(新しいフレームを描画する時)：
        this.addEventListener('enterframe', function () {
            // 3.2.1 スプライトのy座標を１ずつ下げる（プラスする）
            this.y = this.y + 5
            // 3.2.2 ウィンドウの左上までいったら、最初の位置に戻す
            // y座標が 0 以上になったら、y座標を最初の位置 -320 に戻す
            if (this.y >= 0) this.y = -320;
        });
        // 3.3 ゲームに背景を追加する
        game.rootScene.addChild(this);
        console.log("Background initialize:start")
    },
    changeImage: function () {
        this.currentImageNum += 1;
        if (this.currentImageNum < BackgroundImageTable.length) {
            this.image = game.assets[BackgroundImageTable[this.currentImageNum]]
        } else {
            enemiyDmgSD[2].stop();
            enemiyDmgSD[5].play();
            enemiyDmgSD[4].play();
            this.clearGame();
        }
        //stageUpSD.play();
    },
    clearGame: function () {
        game.rootScene.clearEventListener("enterframe");
        player.clearEventListener("enterframe");
        background.clearEventListener("enterframe");
        enemies.forEach(function (enemy) { enemy.clearEventListener("enterframe"); });
        gameClear = new Sprite(267, 48);
        gameClear.image = game.assets["clear.png"];
        gameClear.x = 26
        gameClear.y = 112;
        game.rootScene.addChild(gameClear);
    }
});
let Player = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y) {
        console.log("Player initialize:start")
        enchant.Sprite.call(this, 18, 32);
        this.image = game.assets['imomusi.png'];
        this.frame = 0;
        this.x = x;
        this.y = y;
        this.isLost = false
        this.lostframeCount = 0
        this.addEventListener('enterframe', function () {
            if (this.isLost == true) {
                this.lostframeCount += 1
                if (this.visible == true) {
                    this.visible = false;
                } else if (this.visible == false) {
                    this.visible = true;
                }
                if (this.lostframeCount > 72) {
                    this.isLost = false
                    this.visible = true
                    this.lostframeCount = 0
                }
            }
            this.vx = this.vy = 0;
            if (game.input.left && player.isLost == false) {
                this.vx = -7;
            } else if (game.input.right && player.isLost == false) {
                this.vx = 7;
            } else if (game.input.up && player.isLost == false) {
                this.vy = -7;
            } else if (game.input.down && player.isLost == false) {
                this.vy = 7;
            }
            this.x += this.vx;
            this.y += this.vy;
            if (this.x <= 0) {
                this.x = 0;
            }
            if (this.x >= 302) {
                this.x = 302;
            }
            if (this.y <= 0) {
                this.y = 0;
            }
            if (this.y >= 288) {
                this.y = 288;
            }
            if (game.frame % 8 == 0) {
                var s = new PlayerBullet(this.x + 1, this.y - 16);
            }
            for (let i in enemies) {
                if (enemies[i].intersect(this)) {
                    effect = new Explosion(player.x, player.y, 30);
                    if (player.isLost == false) {
                        life -= 1;
                        enemiyDmgSD[1].play();
                    }
                    if (life == 0) {
                        enemiyDmgSD[2].stop();
                        isGameOver = true;
                    }

                }
            }
        });
        game.rootScene.addChild(this);
        console.log("Player initialize:end")
    }
});
//敵を定義する
let Enemy = enchant.Class.create(enchant.Sprite, {
    //初期設定
    initialize: function (x, y, w, h, id, type) {
        console.log("Enemy initialize:start")
        enchant.Sprite.call(this, w, h);
        this.x = x;
        this.y = y;
        this.id = id;
        this.tick = 0;
        this.bulletCycle = EnemyTable[type].bulletCycle
        this.hp = EnemyTable[type].hp
        this.type = type;
        this.image = game.assets[EnemyTable[type].imagefile];
        this.addEventListener('enterframe', function () {
            //画像のフレームを0から3に切り替える
            this.frame = EnemyTable[type].frame()
            //y座標を増やす
            EnemyTable[type].position(this)
            //画面外に出たら消す
            if (this.y > game.height || this.x > game.width || this.x < -this.width || this.y < -this.height) {
                //消す
                this.remove();
            }
            this.tick += 1
            if (this.tick % this.bulletCycle == 0) {
                let sx = (player.x + player.width / 2) - (this.x + this.width / 2)
                let sy = (player.y + player.height / 2) - (this.y + this.height);
                let angle = Math.atan(sx / sy);
                let bullet = new EnemyBullet(this.x + 8, this.y + this.height, angle)
            }
        })
        game.rootScene.addChild(this);
        console.log("Enemy initialize:end")
    },
    remove: function () {
        delete enemies[this.id]
        game.rootScene.removeChild(this);
    }

});

let PlayerBullet = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y) {
        console.log("PlayerBullet initialize:start")
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['ito.png'];
        this.frame = 48;
        this.x = x;
        this.y = y;
        this.rotate(180);
        this.speed = -12;
        this.addEventListener('enterframe', function () {
            this.y += this.speed
            if (this.y > 320 || this.x > 320 || this.x < 0 - this.width || this.y < 0 - this.height) {
                this.remove();
            }
            for (let key in enemies) {
                if (enemies[key].intersect(this)) {
                    if (player.isLost == false) {
                        enemiyDmgSD[0].play();
                    }

                    let effect = new Explosion(this.x, this.y, 30);
                    score += EnemyTable[enemies[key].type].score
                    enemies[key].hp -= 1;
                    if (enemies[key].hp <= 0) {
                        if (score % 15 == 0) {
                            background.changeImage()
                        }
                    }
                    enemies[key].remove();
                }
            }
        })
        game.rootScene.addChild(this);
        console.log("PlayerBullet initialize:end")
    },
    remove: function () {
        game.rootScene.removeChild(this)
    }
})

//敵のミサイルを作る
let EnemyBullet = enchant.Class.create(enchant.Sprite, {
    //スプライトの初期化
    initialize: function (x, y, angle) {
        console.log("EnemyBullet initialize:start")
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['hinotama.png'];
        this.frame = 56;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.rotation = this.angle * -1 * 180 / Math.PI;
        this.speed = 10; //スピード
        this.addEventListener('enterframe', function () {
            this.x += this.speed * Math.sin(this.angle);
            this.y += this.speed * Math.cos(this.angle);
            //画面外に出たら消す
            if (this.y > 320 || this.x > 320 || this.x < 0 - this.width || this.y < 0 - this.height) {
                this.remove();
            }
            if (player.within(this, 16)) {
                if (player.isLost == false) {
                    life -= 1;
                    enemiyDmgSD[1].play();
                }
                player.isLost = true
                effect = new Explosion(player.x, player.y, 30);
                this.remove();
                if (life == 0) {
                    isGameOver = true
                }
            }
        });
        //ミサイルを追加する
        game.rootScene.addChild(this);
        console.log("EnemyBullet initialize:end")
    },
    remove: function () {
        game.rootScene.removeChild(this);
    }
});

let Explosion = enchant.Class.create(enchant.Sprite, {

    initialize: function (x, y, wait) {
        console.log("Explosion initialize:start")
        enchant.Sprite.call(this, 16, 16);
        this.x = x
        this.y = y
        this.scaleX = 2
        this.scaleY = 2
        this.frame = 0
        this.tick = 0
        this.image = game.assets['effect0.png']

        this.addEventListener('enterframe', function () {
            if (this.tick < wait) {
                this.frame = game.frame % 5;
                this.tick++;
            } else {

                this.tick = 0n
                this.remove()
            }
        })
        game.rootScene.addChild(this)
        console.log("Explosion initialize:end")
    },
    remove: function () {
        game.rootScene.removeChild(this);
    }
});
let EnemyTable = {
    0: {
        imagefile: "space2.png",
        bulletCycle: 45,
        hp: 1,
        score: 1,
        frame: function () { return game.frame % 4; },
        position: function (enemy) { enemy.y += 4; }
    },
    1: {
        imagefile: "space3.png",
        bulletCycle: 20,
        hp: 1,
        score: 3,
        frame: function () { return game.frame % 4; },
        position: function (enemy) { enemy.y += 2; }
    },
    2: {
        imagefile: "space4.png",
        bulletCycle: 10,
    },
    life_plus: {
        hp: 1,
        imagefile: "icon0.png",
        frame: function () { return 10},
        position: function (enemy) { enemy.y += 3; },
        bulletCycle: null,
        score: 0
    }
}
