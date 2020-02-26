"use strict"

//writing as a log on developer tool. 
console.log("Hello World");

var canvas, ctx;

var img_player;
var img_player_bullet;
var img_enemy;

//storing the position of player.
var player_x, player_y;

var BULLETS = 5;
var FIRE_INTERVAL = 20;
var STAR_INTERVAL = 30;
var player_bullet_x = new Array(BULLETS);
var player_bullet_y = new Array(BULLETS);
var player_fire_interval = 0;
var player_star_interval = 0

var ENEMIES = 50;
var enemies_x = new Array(ENEMIES);
var enemies_y = new Array(ENEMIES);
var killed;
		
var player_HP;
var player_bullet_HP = new Array(BULLETS);
var enemies_HP = new Array(ENEMIES);

var KEYS = new Array(256);
for (var i = 0; i < KEYS.length; i++) {
	KEYS[i] = false;
}

//define reused function
var redraw = function(){
		//clear canvas context.clearRect(x,y,width,height); 
		ctx.clearRect(0,0,canvas.width,canvas.height);
		
		if (player_HP > 0) 
		{
			ctx.save();
			//flashing
			if(player_star_interval % 6 != 0)
			{
				//translucent
				ctx.globalAlpha = 0.5;
			}
			ctx.drawImage(img_player, player_x, player_y);
			ctx.restore();
		}
		if(player_HP <= 0)
		{
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = '#000';
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.globalAlpha = 1.0;
			var text_gameover = "game over";
			ctx.font = '30px sans-senrif';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = '#f00';
			
			width = ctx.measureText(text_gameover).width;
			ctx.fillText(text_gameover,(canvas.width - width)/2,canvas.height/2);
		}
		else if(killed == ENEMIES)
		{
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = '#000';
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.globalAlpha = 1.0;
			ctx.font ='30px sans-senrif';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = '#fff';
			text = "Game Clear";
			width = ctx.measureText(text).width;
			ctx.fillText(text,(canvas.width - width)/2,canvas.height/2);
		}


		for(var i = 0 ; i < ENEMIES ; i++){
		if(enemies_HP[i] > 0)
		{
			ctx.drawImage(img_enemy, enemies_x[i], enemies_y[i]);
		}
		}
		
		for (var i = 0; i < BULLETS ; i++) {
		if (player_bullet_HP[i] > 0) {
		ctx.drawImage(img_player_bullet,player_bullet_x[i],player_bullet_y[i]);
		}
		}
		//save the condition of context
		ctx.save();
		ctx.fillStyle = '#fff';
		ctx.fillRect(10,canvas.height-10,10*5,5);
		ctx.fillStyle = '#f00';
		ctx.fillRect(10, canvas.height-10,player_HP * 5, 5);


		var text = "Killed: " + killed + "/" + ENEMIES;
		var width = ctx.measureText(text).width;
		ctx.fillStyle = '#fff';
		ctx.fillText(text, canvas.width - 10 - width, canvas.height-10);

		ctx.restore();


		};

/*onkeyup イベントはキーが離された時に発生します。
 キーが押された時に発生する onkeydown イベントとちょうど反対の役割をします。
 したがって全キーの状態を配列で保持し onkeydown イベントで
 その配列の e.keyCode 番目を true にし onkeyup イベントで 
 false にすればすべてのキーの状態を 配列で保持できます。 */
window.onkeydown = function(e){
	KEYS[e.keyCode] = true;
};

window.onkeyup = function(e){
	KEYS[e.keyCode] = false;
};

// 上下左右の移動速度を定義

var movePlayer = function(){
	if(player_HP <= 0){
		return;
	}
	var speed = 2;
	var RIGHT = 39;
	var LEFT = 37;
	var SPACE = 32;

	if (KEYS[SPACE] && player_fire_interval == 0)
	 {        // 未使用の弾があれば発射する
	  for (var i = 0; i < BULLETS; i++) {
	  	if (player_bullet_HP[i] == 0) {
	  		// 弾の初期位置はプレイヤーと同じ位置にする
	  		player_bullet_x[i] = player_x;
	  		player_bullet_y[i] = player_y;
	  		 // 弾のHPを1にする。これにより次のループから描画や移動処理
             // が行われるようになる
             player_bullet_HP[i] = 1;
             player_fire_interval = FIRE_INTERVAL;
	  		// 弾は打ったのでループを抜ける
            // ループ処理を途中でやめる場合は `break` を使うplayer_bullet_HP[i] = 1;

	  		break;
	  	}
	  	
	  }
	 }
	if (player_fire_interval > 0)
	 {
	  player_fire_interval--;
	 }
	
	if (KEYS[RIGHT] && player_x + img_player.width < canvas.width) { 
	//This is same as "if (KEYS[RIGHT] == true" )
		console.log('right key has been pressed.');
		player_x += speed;

	}else if(KEYS[LEFT] && player_x > 0){
		console.log('left key has been pressed.');	
		player_x -= speed;
	}
	};

var movePlayerBullets = function(){
	var speed = -5;
	for (var i = 0; i < BULLETS; i++) {
		if (player_bullet_HP[i] <= 0)
		 {
		 	continue;
		 }
		 player_bullet_y[i] += speed;

		 if (player_bullet_y[i] < img_player_bullet.height) 
		 {
		 	player_bullet_HP[i] = 0;
		 }
	}
}

var moveEnemy = function(){

	var speed = 3;

	for (var i = 0; i < ENEMIES ; i++) {
	if(enemies_HP[i] <= 0){
		continue;
	}	
	enemies_y[i] += speed;

	if (enemies_y[i] > canvas.height) {
		enemies_y[i] = img_enemy.height;
		// せっかくなので x座標を再度ランダムに設定
        enemies_x[i] = Math.random() * (canvas.width - img_enemy.width);
	}
	}
};

//General function
var hitCheck = function(x1,y1,obj1,x2,y2,obj2){
	var cx1,cx2,cy1,cy2,r1,r2,d;
    // 中心座標の取得
    cx1 = x1 + obj1.width/2;
    cy1 = y1 + obj1.height/2;
    cx2 = x2 + obj2.width/2;
    cy2 = y2 + obj2.height/2;

    r1 = (obj1.width + obj1.height)/4;
    r2 = (obj2.width + obj2.height)/4;
    // Math.sqrt(d) -- dのルートを返す
    // Math.pow(x, a) -- xのa乗を返す
    d = Math.sqrt(Math.pow(cx1-cx2,2) + Math.pow(cy1-cy2,2));

    if (d < r1+r2) {return true;}
    else{return false;}

};
//define infinite loop
var FPS = 60;
var MSPF = 1000/FPS;

var mainloop = function(){
	var startTime = new Date();
	movePlayer();
	movePlayerBullets();
	moveEnemy();
	killed = enemies_HP.filter(function(k){return k===0}).length;

	if (player_HP > 0 && player_star_interval == 0)
	 {
		for (var i = 0; i < ENEMIES; i++) 
		{
			if (enemies_HP[i] > 0) 
			{
				if (hitCheck(player_x,player_y,img_player,enemies_x[i],enemies_y[i],img_enemy)) 
				{
					player_HP -= 1;
					enemies_HP[i] -= 1;
					player_star_interval = STAR_INTERVAL;
				}
			}
		}
	}
	if (player_star_interval > 0) 
	{
		player_star_interval-- ;
	}

	if (player_HP > 0) {
		for (var i = 0; i < ENEMIES ; i++)
		 {
		 if (enemies_HP[i] <= 0)
		 {
		 	continue ;
		 }
		 for (var j = 0; j < BULLETS; j++) {
		 	if (player_bullet_HP[j] <= 0)
		 	{
		 		continue;
		 	}
		 	if (hitCheck(player_bullet_x[j],player_bullet_y[j],img_player_bullet,
		 		enemies_x[i],enemies_y[i],img_enemy)) 
		 	{
		 		player_bullet_HP[j] -= 1;
		 		enemies_HP[i] -= 1;
		 		console.log(enemies_HP);
		 	}
		 }

		}
	}
	
	redraw();

	var deltaTime = (new Date()) - startTime;
	var interval = MSPF - deltaTime;
	if(interval > 0){
		setTimeout(mainloop, interval);
	}else{
		mainloop();
	}
};
// ページロード時に呼び出される処理を指定
// window.onload = function(){ から }; までの間が呼び出される。
window.onload = function(){

	// id を用いてキャンバスオブジェクトを取得し
    // canvas 変数に代入
    //
    //   オブジェクト = document.getElementById('id');
    //
	canvas = document.getElementById('screen');

	// 2次元用の描画コンテキスト（とよばれるナニか）を取得し代入
	ctx = canvas.getContext('2d');

	// Playerの画像（id='player'で指定された<img>）を取得
	img_player = document.getElementById('player');
	img_player_bullet = document.getElementById('player_bullet');
	
	player_x = (canvas.width - img_player.width)/2
	player_y = canvas.height - img_player.height - 20
	player_HP = 10;

	for (var i = 0; i < BULLETS; i++) {
		player_bullet_x[i] = 0;
		player_bullet_y[i] = 0;
		player_bullet_HP[i] = 0;
	}
	// Just once be executed by loading
	// define position of enemies
	img_enemy = document.getElementById('enemy');
	for (var i = 0; i < ENEMIES; i++) {
		enemies_x[i] = Math.random() * (canvas.width - img_enemy.width);
		enemies_y[i] = Math.random() * (canvas.height - img_enemy.height);
		enemies_HP[i] = 2;
		killed = 0;
	}
		//Enemies are drawn at random

		mainloop();
};

/*window.onkeydown = function(e){
	// 上下左右の移動速度を定義
	var speed = 4;

	var RIGHT = 39;
	var LEFT = 37;
	
	// 移動処理を行ったかどうか（Yes/No）を表す変数を定義し
    // 移動していない（false）で初期化
    var moved = false;

	if (e.keyCode == RIGHT) {
		console.log('right key has been pressed.');

		player_x += speed;
		
		// 移動したので true を代入
		moved = true;


	}else if(e.keyCode == LEFT){
	console.log('left key has been pressed.');	
	player_x -= speed;
	moved = true;
	}

	if(moved){
		redraw();
		}
	}*/

//37left 38upper 39right 40lower


