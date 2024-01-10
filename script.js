let canvas = document.getElementById("myCanvas");
const Width = canvas.width;
const Height = canvas.height;
/*
add snakes to map, then do render raycasting
*/

let scaleSlider = document.getElementById("scale");

let ctx = canvas.getContext("2d");

function clearGraph(){
    drawFRect(0, 0, Width, Height, "red");
}

function drawCirc(x,y,r,c){
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawSRect(x,y, w, h, c){
    ctx.lineWidth = 1;
    ctx.strokeStyle = c;
    ctx.strokeRect(x, y, w, h);
}

function drawFRect(x,y, w, h, c){
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
}
  
function drawLin(x1,y1,x2,y2,c,w){
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
  
function drawTex(x,y,text,c){
    ctx.font = "12px Georgia";
    ctx.fillStyle = c;
    ctx.fillText(text, x, y);
}

let cells = [];

function createMap(w, h, s){
    let temp = new Array(w);
    for(let i = 0; i < w; i++){
        let tempCol = new Array(h);
        let numTempStates = s;
        for(let j = 0; j < h; j++){
            let tempArr = [];
            for(let k = 0; k < numTempStates; k++){
                tempArr.push(k);
            }
            let tempCell = new Cell(tempArr);
            tempCol[j] = tempCell;
        }
        temp[i] = tempCol;
    }   
    cells = temp;
}

class Cell{
    constructor(s){
        this.info = s;
        if(s.length == 1){
            this.propped = true;
        }else if(s.length == 0){
            
        }else{
            this.propped = false;
        }
    }

    pick(){
        let index = Math.floor(Math.random()*this.info.length);
        // let numTries = 0;
        // for(let i = 0; i < numTries; i++){
        //     let tempState = this.info[index];
        //     if(tempState > 11){
        //         index = Math.floor(Math.random()*this.info.length);
        //     }else{
        //         break;
        //     }
        // }
        this.info = [this.info[index]];
        
    }
}

function findLowestEntropy(){
    let smallestStates = 100;
    let lastI = -1;
    let lastJ = -1;
    for(let i = 0; i < numCols; i++){
        for(let j = 0; j < numRows; j++){
            if(cells[i][j].info.length < smallestStates && cells[i][j].propped == false){
                smallestStates = cells[i][j].info.length;
                lastI = i;
                lastJ = j;
            }
        }
    }
    return [lastI, lastJ];
}

function getAllowedSockets(neighborStates, dir){
    //dir is index direction that is connecting to main cell, 0-3
    let allowedStates = [];
    for(let i = 0; i < neighborStates.length; i++){
        let connectionIndex = neighborStates[i];
        let cons = connectionArr[connectionIndex];
        let side = cons[dir].split("").reverse().join("");
        if(allowedStates.includes(side) == false){
            allowedStates.push(side);
        }
    }
    return allowedStates;
}

let finished = false;
let restart = false;

function iterateBoard(){
    let coords = findLowestEntropy();
    if(coords[0] == -1 || coords[1] == -1){
        if(coords[0] == -1 && coords[1] == -1){
            finished = true;
        }
        return;
    }

    let nextBoard = new Array(numCols);
    for(let i = 0; i < numCols; i++){
        nextBoard[i] = new Array(numRows);
    }

    let pickedCell = cells[coords[0]][coords[1]];

    pickedCell.pick();
    pickedCell.propped = true;

    for(let i = 0; i < numCols; i++){
        for(let j = 0; j < numRows; j++){
            let mainCell = cells[i][j];
            if(mainCell.propped == true){
                nextBoard[i][j] = cells[i][j];
            }else{
                //look at neighbors
                let finalStates = mainCell.info;
                for(let k = 0; k < 4; k++){
                    let x;
                    let y;
                    if(k < 2){
                        x = i - 1 + k*2;
                        y = j;
                    }else{
                        x = i;
                        y = j - 1 + (k-2)*2;
                    }
                    if(x < 0 || x >= numCols || y < 0 || y >= numRows){
                        continue;
                    }
                    let neighborCell = cells[x][y];
                    let neighborIndex;//in direction of neighbor
                    if(k == 0){
                        neighborIndex = 3;
                    }else if(k == 1){
                        neighborIndex = 1;
                    }else if(k == 2){
                        neighborIndex = 0;
                    }else{
                        neighborIndex = 2;
                    }
                    let lookIndex = (neighborIndex + 2 ) % 4;// in direction of main cell
                    let allowedSockets = getAllowedSockets(neighborCell.info, lookIndex);
                    if(allowedSockets.length != 2){
                        
                    }
                    finalStates = reducePossibleStates(finalStates, allowedSockets, neighborIndex);
                    if(finalStates.length < 1){
                        restart = true;
                        break;
                    }
                    
                }
                nextBoard[i][j] = new Cell(finalStates);
            }
        }
    }
    cells = nextBoard;
}

function reducePossibleStates(currentStates, givenSockets, adjSide){
    let newStates = [];
    for(let i = 0; i < currentStates.length; i++){
        let curState = currentStates[i];
        let curConn = connectionArr[curState];
        let singleSide = curConn[adjSide];
        if(givenSockets.includes(singleSide)){
            newStates.push(curState);
        }
    }
    
    return newStates;
}


function drawMap(){
    for(let i = 0; i < cells.length; i++){
        for(let j = 0; j < cells[i].length; j++){
            let x = i*boxWidth;
            let y = j*boxHeight;
            if(cells[i][j].info.length == 1){
                // drawFRect(x, y, boxWidth, boxHeight, colors[cells[i][j].info[0]]);
                ctx.drawImage(imgs[cells[i][j].info[0]], x, y, boxWidth, boxHeight);
            }else{
                if(cells[i][j].propped == true){
                    drawSRect(x, y, boxWidth, boxHeight, colors[0]);
                }
                let tempText = cells[i][j].info;
                x += boxWidth/5;
                y += boxHeight/2;
                
                // drawTex(x, y, tempText, "#000000");
            }
        }
    }
}

let conns1 = {
    "end" : ["111", "111", "101", "111"],
    "floor" : ["000", "000", "000", "000"],
    "hallway" : ["111", "101", "101", "101"],
    "intersection" : ["101", "101", "101", "101"],
    "tintersection" : ["111", "101", "101", "101"],
    "wall" : ["111", "111", "111", "111"],
    "entry" : ["111", "000", "111", "101"],
    "diagonal" : ["111", "000", "000", "111"],
    "corner" : ["111", "101", "101", "111"]
}

//0 water, 1 sand, 2 grass
//implmenet 3 socket

// let conns1 = {
//     "fullWater" : "0000",
//     "fullSand" : "1111",
//     "fullGrass" : "2222",
//     "waterIntersection" : "0000",
//     "sandIntersection" : "1111",
//     "grassIntersection" : "2222",
//     "waterTIntersection" : "1000",
//     "sandTIntersection" : "2111",
//     "grassTIntersection" : "1222",
//     "waterStraight" : "0101",
//     "sandStraight" : "2121",
//     "grassStraight" : "2121",
//     "waterCorner" : "1001",
//     "sandCorner" : "2211",
//     "grassCorner" : "1221",
//     "waterEnd" : "1101",
//     "sandEnd" : "2212",
//     "grassEnd" : "1121",
//     "sandPeak" : "0000",
//     "grassPeak" : "1111",
//     "waterPit" : "1111",
//     "sandPit" : "2222"
// }

let imgNames = Object.keys(conns1);
let numImgs = imgNames.length;
let imgs = new Array(numImgs);
let imgsLocation = "imgs";
// let imgsLocation = "difimgs";
const imgSize = 100;
let connectionArr;
const numMakeCols = Width/imgSize;
const numMakeRows = Height/imgSize;

const numCols = 30;
const numRows = 15;

const boxWidth = Width/numCols;
const boxHeight = Height/numRows;


function loadBaseImages(){
    for(let i = 0; i < numImgs; i++){
        let temp = new Image(imgSize,imgSize);
        temp.src = imgsLocation + "/" + imgNames[i] + ".png";
        imgs[i] = temp;
    }
    
}

function drawRotImages(){
    for(let i = 0; i < numImgs*4; i++){
        let x = (i%numMakeCols)*imgSize;
        let y = Math.floor(i/numMakeCols) * imgSize;
        let rotX = x + imgSize/2;
        let rotY = y + imgSize/2;
        let degs = (i%4) * Math.PI/2;
        ctx.save();
        ctx.translate(rotX, rotY);
        ctx.rotate(degs);
        ctx.drawImage(imgs[Math.floor(i/4)], -imgSize/2, -imgSize/2);
        ctx.restore();
    }
}
async function loadRotImages(){
    let newImgs = new Array(numImgs*4);

    for(let i = 0; i < numImgs*4; i++){
        let x = (i%numMakeCols)*imgSize;
        let y = Math.floor(i/numMakeCols) * imgSize;
        newImgs[i] = await createImageBitmap(canvas, x, y, imgSize, imgSize);
    }
    imgs = newImgs;
    numImgs = imgs.length;
}

function drawBaseImages(){
    for(let i = 0; i < numImgs; i++){
        let x = (i%6) * 100;
        let y = 50;
        ctx.drawImage(imgs[i], x, y);
    }
}

function drawIndexRotImages(){
    for(let i = 0; i < imgs.length; i++){
        let x = i%numMakeCols * 100;
        let y = Math.floor(i/numMakeCols) * 100;
        ctx.drawImage(imgs[i], x, y);
    }
}

function makeRotConns(){
    let tempConns = {};
    let keys = Object.keys(conns1);
    let tempArrConns = new Array(keys.length*4);
    for(let i = 0; i < keys.length; i++){
        for(let j = 0; j < 4; j++){
            let newKey = "" + keys[i] + j;
            let index = 4 - j;
            let curSides = conns1[keys[i]];
            let back = curSides.slice(index, 4);
            let front = curSides.slice(0, index);
            let newSides = back.concat(front);
            tempConns[newKey] = newSides;
            tempArrConns[i*4 + j] = newSides;
        }
    }
    conns1 = tempConns;
    connectionArr = tempArrConns;
}

loadBaseImages();
setTimeout(updateSeg, 1000);

const loadSpeed = 25;

async function updateSeg(){
    drawRotImages();
    await loadRotImages();
    clearGraph();
    drawIndexRotImages();
    makeRotConns();
    
    clearGraph();
    createMap(numCols, numRows, numImgs);
    iterateBoard();
    drawMap();
    
    setInterval(updateMap, loadSpeed);
}

function updateMap(){
    if(finished == false){
        if(restart == true){
            restart = false;
            createMap(numCols, numRows, numImgs);
        }
        clearGraph();
        iterateBoard();
        drawMap();
    }else{
        
    }
}
