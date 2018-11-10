// model
const model = { 
    // 八个搜索同色棋子的方向
    SEARCH:[[-1, -1], [0, -1], [1, -1], [1, 0],[1, 1], [0, 1], [-1, 1], [-1, 0]],
    init(){
        this.turn = "white"; // 轮到黑棋或白棋 默认黑棋先手
        this.win = 0; // 是否胜利信息
        this.gridBlack = new Array(15); // 黑棋网格
        this.gridWhite = new Array(15); // 白棋网格
        for (let i = 0; i < 15; i++) {
            this.gridWhite[i] = new Array(15);
            this.gridBlack[i] = new Array(15);
        };
    },
    addPiece(){
        if (this.gridWhite[this.x][this.y] != 1 &&
            this.gridBlack[this.x][this.y] != 1) {
            this.turn == "white" ?
                this.gridWhite[this.x][this.y] = 1 :
                this.gridBlack[this.x][this.y] = 1;
            return true;
        }
    },
    // 交换回合
    changeTurn() {
        this.turn == "white" ? this.turn = "black" : this.turn = "white";
    },
    //寻找一条线上可能连成的五子
    searchLine() {
        for (let i = 0; i < this.SEARCH.length; i++) {
            //前向搜索总和 反向搜索总和
            this.f_sum = 0;
            this.b_sum = 0;
            let grid;
            this.turn == "white" ? grid = this.gridWhite : grid = this.gridBlack;
            this.forwardDetect(this.x, this.y, grid, this.SEARCH[i]);
            this.backwardDetect(this.x, this.y, grid, this.SEARCH[i]);
            const sum = this.f_sum + this.b_sum + 1;
            // console.log("sum:",sum);
            if (sum == 5) {
                this.win = 1;
                return;
            }
        }
    },
    // 正向检查是否连成五子
    forwardDetect(x, y, grid, search) {
        if (x + search[0] < 0 || y + search[1] < 0 ||
            x + search[0] > 14 || y + search[1] > 14){
            return;
        }
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
    },

    // 反向检查是否连成五子
    backwardDetect(x, y, grid, search) {
        if (x - search[0] < 0 || y - search[1] < 0 ||
            x - search[0] > 14 || y - search[1] > 14) {
            return;
        }
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
    },
    checkWin() {
        if (this.win == 1) {
            octopus.gameOver();
        }
    }
}

// view
const view = {
    init(){
        this.EDGE = 14 * 30;   // 棋盘边长
        this.MARGIN = 15;      // 棋盘边缘间隙
        this.GRID_LENGTH = 30; // 棋盘格边长
        const canvas = document.createElement('canvas');
        canvas.width = 450;
        canvas.height = 450;
        document.body.appendChild(canvas);
        this.ctx = canvas.getContext('2d');
        this.render();
    },
    render(){
        this.renderBoard();
    },
    renderBoard(){
        this.ctx.fillStyle = "#ffc369";
        this.ctx.fillRect(this.MARGIN, this.MARGIN, this.EDGE, this.EDGE);//x,y,width,height
        for (var i = 0; i < 15; i++) {
            this.ctx.moveTo(this.GRID_LENGTH * i + this.MARGIN, this.MARGIN);//x,y
            this.ctx.lineTo(this.GRID_LENGTH * i + this.MARGIN, this.EDGE + this.MARGIN);
            this.ctx.stroke();

            this.ctx.moveTo(this.MARGIN, this.GRID_LENGTH * i + this.MARGIN);//x,y
            this.ctx.lineTo(this.EDGE + this.MARGIN, this.GRID_LENGTH * i + this.MARGIN);
            this.ctx.stroke();
        }
    },
    renderPiece(){
        const x = octopus.getX() * this.GRID_LENGTH + this.MARGIN;
        const y = octopus.getY() * this.GRID_LENGTH + this.MARGIN;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 14, 0, 2 * Math.PI);//x,y,r,起始，结束
        if (octopus.getTurn() == "white") {
            var gradient = this.ctx.createLinearGradient(
                x - 6, y - 6, x + 60, y + 60
            );
            gradient.addColorStop(0, "white");
            gradient.addColorStop(1, "black");
        } else {
            var gradient = this.ctx.createLinearGradient(
                x + 20, y + 20, x - 60, y - 60
            );
            gradient.addColorStop(0, "black");
            gradient.addColorStop(1, "white");
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.closePath();
    }
}

const octopus = {
    init(){
        model.init();
        view.init();
        document.querySelector('canvas').onclick = function (e) {
            var x = e.clientX;
            var y = e.clientY;
            var width = document.body.clientWidth;
            // console.log(x + "," + y);
            var xInborad = x - (width - view.EDGE - 2 * view.MARGIN) / 2 - 1;
            var yInborad = y;
            // console.log(xInborad + "," + yInborad);

            if (octopus.check(xInborad, yInborad)) {
                if (model.addPiece()) {
                    view.renderPiece();
                    model.searchLine();
                    model.checkWin();
                    model.changeTurn();
                    if (ai && model.win!==1) {
                        const {x,y} = ai.choose();
                        model.x = x;
                        model.y = y;
                        model.addPiece(); 
                        view.renderPiece();
                        model.searchLine();
                        model.checkWin();
                        model.changeTurn();
                    }
                
                }
            }
        }
    },
    getX(){
        return model.x;
    },
    getY(){
        return model.y;
    },
    getTurn(){
        return model.turn;
    },
    check(x, y){
        const x_error = (x - view.MARGIN) % view.GRID_LENGTH;
        const y_error = (y - view.MARGIN) % view.GRID_LENGTH;
        if ((x_error < 8 || x_error > 22) &&
            (y_error < 8 || y_error > 22) && model.win == 0) {
            // TODO: 这里不知道发生了什么 可能不需要Math.round()
            if (x_error < 8) {
                x = Math.round((x - x_error) / view.GRID_LENGTH) - 1;
            } else {
                x = Math.round((x - x_error) / view.GRID_LENGTH);
            }
            if (y_error < 8) {
                y = Math.round((y - y_error) / view.GRID_LENGTH) - 1;
            } else {
                y = Math.round((y - y_error) / view.GRID_LENGTH);
            }
            model.x = x;
            model.y = y;
            return true;
            // console.log(x + "," + y);
        }
    },
    gameOver(){
        model.turn == 'white' ? window.alert('白棋胜利！') : window.alert('黑棋胜利！');
    }
}

const table = {
    // tuple is empty  0
    Blank:7,
    // tuple contains a black chess  1
    B:35,
    // tuple contains two black chesses  2
    BB:800,
    // tuple contains three black chesses  3
    BBB:15000,
    // tuple contains four black chesses  4
    BBBB: 800000,
    // tuple contains a white chess  5
    W: 15,
    // tuple contains two white chesses  6
    WW: 400,
    // tuple contains three white chesses  7
    WWW: 1800,
    // tuple contains four white chesses  8
    WWWW: 100000,
    // tuple does not exist  9
    Virtual:0,
    // tuple contains at least one black and at least one white  10
    Polluted:0
}

const ai = {
    tupleScoreTable:[7, 35, 800, 15000, 800000, 15, 400, 1800, 100000, 0, 0], // 分数表
    AI_SEARCH: [[1, 1], [0, 1], [-1, 1], [-1, 0]],
    memory:{},
    /**
     * 计算得分
     */
    calcScore(x, y) {
        // 获得位置
        const tuples = this.getTuplePostions(x, y);
        // 查棋盘
        const codes = this.codeingTuple(tuples);
        // 得出分数
        let scoreSum = 0;
        for (const code of codes) {
            if (code === "") {
                scoreSum += 7;
                continue;
            }
            if (code === "Polluted") {
                scoreSum += 0;
                continue;
            }
            if (code.indexOf("w") !== -1 && code.indexOf("b") !== -1) {
                scoreSum += 0;
                continue;
            }
            if (code.indexOf("b") !== -1) {
                const list = [1, 2, 3, 4];
                scoreSum += this.tupleScoreTable[list[code.length-1]];
                
            }
            if (code.indexOf("w") !== -1) {
                const list = [5, 6, 7, 8];
                scoreSum += this.tupleScoreTable[list[code.length-1]];
            }
        }
        return scoreSum;
    },
    // 获取五元组位置信息
    getTuplePostions(x, y) {
        let tuples = [];
        for (const search of this.AI_SEARCH) {
            const piece = { x, y };
            const tuple = [];
            for (let i = 0; i < 5; i++) {
                const fivePiece = [];
                const firstPiece = {
                    x: piece.x + i * search[0],
                    y: piece.y + i * search[1]
                };
                for (let j = 0; j < 5; j++) {
                    const _piece = {
                        x: firstPiece.x - j * search[0],
                        y: firstPiece.y - j * search[1]
                    };
                    fivePiece.push(_piece);
                }
                // 一个方向的五元组
                tuple.push(fivePiece);
            }
            // 这个位置的所有五元组
            tuples.push(tuple);
        }
        return tuples;
    },
    // 查棋盘编码
    codeingTuple(tuples){
        const codes = [];
        for (const tuple of tuples) {
            for (const fivePiece of tuple) {
                let code = "";
                for (const piece of fivePiece) {
                    const { x, y } = piece;
                    if (x > 14 || y > 14 || x < 0 || y < 0) {
                        code = "Polluted";
                        break;
                    }
                    const white = model.gridWhite[x][y];
                    const black = model.gridBlack[x][y];
                    if (white) {
                        code += "w";
                    }
                    if (black) {
                        code += "b";
                    }
                }
                codes.push(code);
            }
        }
        return codes;
    },
    /**
     * 选择落子位置
     */
    choose() {
        // 比较棋盘上得分
        let max = 0;
        let choose;
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (model.gridBlack[i][j] || model.gridWhite[i][j]) {
                    continue;
                }
                const score = this.calcScore(i, j);
                if (score>max) {
                    max = score;
                    choose = {x:i, y:j};
                }
            }
        }
        // 给出落子坐标
        return choose;
    }
}

octopus.init();