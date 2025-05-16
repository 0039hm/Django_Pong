//定数
const fieldWidth = 700;
const fieldHeight = 500;

const barWidth = 30;
const barHeight = 100;
const barMargin = 10; //フィールドの橋からバーまでの距離

const ballWidth = 20;
const ballHeight = 20;
const verticalMaxSpeed = 300;

const fieldArea = ".l-field";
const myBar = "#my-bar";
const opponentBar = "#opponent-bar";
const ball = "#ball";

const framerate = 60; // [frame/s]

const gamesetPoint = 3;

//グローバル変数
let myScore = 0;
let opponentScore = 0;

function Player ( isMe ) {
    this.isMe = isMe;
    this.score = 0;
    this.isWin = () => {
        return this.score >= gamesetPoint;
    };
    this.addScore = () => {
        this.score++;
    };
}

function Bar  ( player ){
    //左上を中心とした座標
    this.player = player;
    this.isMe = player.isMe

    this.x = this.isMe ?  fieldWidth - barMargin - barWidth : barMargin;
    this.y = 0;

    this.moveSpeed = 50;

    this.getBottom = () => {
        return this.y + barHeight;
    };

    this.chaseBall = (x,y)=>{
        this.y += ((this.y > y) ? -1 : 1) * this.moveSpeed/framerate
    }

    this.getBouncePoint = (y)=>{
        //FIXME 座標の参照ポイントがボールの上部のみになってる問題
        return (y - this.y - barHeight/2)*2/barHeight
    }
};



// オブジェクト
function Ball ( x, y, velX, velY ) {
    //ボールの左上を基準とした座標
    this.x = x;
    this.y = y;
    this.velX = velX; // [px/s]
    this.velY = velY;

    this.shouldBounceOnWall = ( x, y ) => {
        if ( 0 < y && y + ballHeight < fieldHeight ) {
            return false;
        } else {
            return true;
        }
    };

    this.shouldBounceOnBar = ( x, y, bar ) => {
        if ( this.towardRight() && bar.isMe ) {
            if ( bar.x < this.x + ballWidth && this.x + ballWidth < bar.x + 10 ) {
                console.log('近づいてきた!!');
                if ( bar.y< this.y && this.y < bar.getBottom() ) {
                    console.log('あたった!');
                    return true;
                }
            }
        } else if ( !this.towardRight() && !bar.isMe ) {
            if ( bar.x + barWidth - 10 < this.x && this.x < bar.x + barWidth ) {
                console.log('近づいてきた!!');
                if ( bar.y< this.y && this.y < bar.getBottom() ) {
                    console.log('あたった!');
                    return true;
                }
            }
        }
        return false;
    };


    this.move = ( bar ) => {
        let newX = this.x + this.velX / framerate;
        let newY = this.y + this.velY / framerate;

        if ( this.shouldBounceOnWall( newX, newY ) ) {
            newY = this.y - this.velY / framerate;
            this.velY = -this.velY;
        }
        if ( this.shouldBounceOnBar( newX, newY, bar ) ) {
            console.log('hannsya!!!');
            
            newX = this.x - this.velX / framerate;
            this.velX = -this.velX * 1.5;
            this.velY = bar.getBouncePoint(newY) * verticalMaxSpeed
            console.log(bar.getBouncePoint(newY))
        }

        this.x = newX;
        this.y = newY;
    };

    this.towardRight = () => {
        return 0 < this.velX;
    };

    //自分の得点なら1、相手の得点なら2、どちらも得点していなければ0を返す
    this.isScored = () => {
        if ( this.x <= 0 && this.velX <= 0 ) {
            return 1;
        } else if ( fieldWidth <= this.x && 0 <= this.velX ) {
            return 2;
        } else {
            return 0;
        }
    };

}





//メインスレッド
$( document ).ready( function () {

    let ballobj;
    const players = [new Player(true),new Player(false)]
    const bars = [ new Bar(players[0]), new Bar(players[1]) ];


    // Setup
    $( function () {
        $( fieldArea ).css( {
            "width": fieldWidth,
            "height": fieldHeight,
        } );

    } );

    //バーのマウス追従
    $( fieldArea ).hover( function ( e ) {
        $( fieldArea ).on( 'mousemove', function ( e ) {
            if ( barHeight / 2 < e.offsetY && e.offsetY < fieldHeight - barHeight / 2 ) {
                bars[ 0 ].y = e.offsetY - barHeight / 2;
                $( myBar ).css( "top", e.offsetY - barHeight / 2 );
            }

        } );
    }, );

    //非同期処理
    //1ラリー
    const rally = async () => {
        let whoGoal
        let inGame = true; //FIXME 名前が被ってる
        while ( inGame ) {
            let bar;
            if( ballobj.towardRight()){
                bar = bars[0]
            }else{
                bar = bars[1]
            }
            ballobj.move(bar);
            if ( ballobj.isScored() ) {
                inGame = false;

                if ( ballobj.isScored() == 1 ) { //自分の得点
                    console.log( '自分のゴール!!' );
                    whoGoal = players[0]

                } else {
                    console.log( 'ゴールされました…' );
                    whoGoal = players[1]
                }
            }

            $( ball ).css( {
                "top": ballobj.y,
                "left": ballobj.x
            } );

            //CPU
            bars[1].chaseBall(ballobj.x,ballobj.y)
            $(opponentBar).css("top",bars[1].y)


            //1フレームぶん待つ
            await new Promise( resolve => setTimeout( resolve, 1000 / framerate) );


        }
        return whoGoal;
    };

    //メインスレッド
    $( async function () {
        let inGame = true
        while(inGame){
            ballobj = new Ball( 500, 100, 100, -100 );

            $("#my-score").text(players[0].score)
            $("#opponent-score").text(players[1].score)

            whoGoal = await rally()
            whoGoal.addScore()
            if (players[0].isWin()){
                inGame = false
                $("#scoreboard").text('プレイヤーの勝ち!')
            }else if(players[1].isWin()){
                inGame = false
                $("#scoreboard").text('CPUの勝ち')
            }

            //次のラリーまで待つ
            if(inGame){
                await new Promise(resolve => setTimeout(resolve,1000))
            }
        }

    } );
} )

