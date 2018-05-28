//定义八个搜索方向
const SEARCH = [[-1, -1], [0, -1], [ 1, -1], [ 1, 0],
                [ 1,  1], [0,  1], [-1,  1], [-1, 0]];

class Game {
    constructor(){
        this.init();
    }
    // 初始化游戏数据
    init(){
        this.turn = "black";//轮到黑棋或白棋 默认黑棋先手
        this.win = 0;//是否胜利信息
        this.gridBlack = new Array(15);//黑棋网格
        this.gridWhite = new Array(15);//白棋网格
        for (let i = 0; i < 15; i++) {
            this.gridWhite[i] = new Array(15);
            this.gridBlack[i] = new Array(15);
        };
    }
    // 检查落子是否合法
    check(x, y) {
        const x_error = (x - MARGIN) % GRID_LENGTH;
        const y_error = (y - MARGIN) % GRID_LENGTH;
        if ((x_error < 8 || x_error > 22) &&
            (y_error < 8 || y_error > 22) && this.win == 0) {
            // TODO: 这里不知道发生了什么 可能不需要Math.round()
            if (x_error < 8) {
                x = Math.round((x - x_error) / GRID_LENGTH) - 1;
            } else {
                x = Math.round((x - x_error) / GRID_LENGTH);
            }
            if (y_error < 8) {
                y = Math.round((y - y_error) / GRID_LENGTH) - 1;
            } else {
                y = Math.round((y - y_error) / GRID_LENGTH);
            }
            this.x = x;
            this.y = y;
            return true;
            // console.log(x + "," + y);
        }
    }
    // 在虚拟网格中添加棋子
    addChessman(){
        if (this.gridWhite[this.x][this.y] != 1 &&
            this.gridBlack[this.x][this.y] != 1) {
            this.turn == "white" ?
                this.gridWhite[this.x][this.y] = 1 :
                this.gridBlack[this.x][this.y] = 1;
            return true;
        }
    }
    // 在canvas上显示棋子
    drawChessman(){
        const x = this.x * GRID_LENGTH + MARGIN;
        const y = this.y * GRID_LENGTH + MARGIN;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, 2 * Math.PI);//x,y,r,起始，结束
        if (this.turn == "white") {
            var gradient = ctx.createLinearGradient(
                x - 6, y - 6, x + 60, y + 60
            );
            gradient.addColorStop(0, "white");
            gradient.addColorStop(1, "black");
        } else {
            var gradient = ctx.createLinearGradient(
                x + 20, y + 20, x - 60, y - 60
            );
            gradient.addColorStop(0, "black");
            gradient.addColorStop(1, "white");
        }
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
    }
    // 交换回合
    changeTurn(){
        this.turn == "white"? this.turn = "black":this.turn = "white";
    }
    //寻找一条线上可能连成的五子
    searchLine() {
        for (let i = 0; i < SEARCH.length; i++) {
            //前向搜索总和 反向搜索总和
            this.f_sum = 0;
            this.b_sum = 0;
            let grid;
            this.turn == "white" ? grid = this.gridWhite:grid = this.gridBlack;
            this.forwardDetect(this.x, this.y, grid, SEARCH[i]);
            this.backwardDetect(this.x, this.y, grid, SEARCH[i]);
            const sum = this.f_sum + this.b_sum + 1;
            // console.log("sum:",sum);
            if (sum == 5) {
                this.win = 1;
                return;
            }
        }
    }
    // 正向检查是否连成五子
    forwardDetect(x, y, grid, search) {
        if (grid[x + search[0]][y + search[1]]) {
            this.f_sum++;
            //console.log("forward",this.f_sum);
            if (this.f_sum == 4) {
                this.win = 1;
                return;
            }
            this.forwardDetect(x + search[0], y + search[1], grid, search);
        } else {
            //console.log("f-sum",f_sum);
            return;
        }
    }

    // 反向检查是否连成五子
    backwardDetect(x, y, grid, search) {
        if (grid[x - search[0]][y - search[1]]) {
            this.b_sum++;
            if (this.b_sum == 4) {
                this.win = 1;
                return;
            }
            this.backwardDetect(x - search[0], y - search[1], grid, search);
        } else {
            //console.log("b-sum",b_sum);
            return;
        }
    }
    checkWin(){
        if(this.win == 1){
            this.gameOver();
        }
    }
    gameOver(){
        this.turn == "white" ? alert("白棋获胜!") : alert("黑棋获胜!");
    }
}

const gobang = new Game();
document.querySelector('canvas').onclick = function (e) {
    var x = e.clientX;
    var y = e.clientY;
    var width = document.body.clientWidth;
    // console.log(x + "," + y);
    var xInborad = x - (width - EDGE - 2*MARGIN) / 2 - 1;
    var yInborad = y;
    // console.log(xInborad + "," + yInborad);

    if(gobang.check(xInborad, yInborad)){
        if(gobang.addChessman()){
            gobang.drawChessman();
            gobang.searchLine();
            gobang.checkWin();
            gobang.changeTurn();
        };

    }

}