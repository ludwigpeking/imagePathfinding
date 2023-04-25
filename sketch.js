const { RGBADepthPacking } = require("three");

function preload() {
    img = loadImage('image2.jpg');
  }
  
function setup(){
    createCanvas(img.width, img.height);
    background(200);
    noStroke();
    console.log("sizes:", width, 'px *',height, 'px'); //show the sizes of the image
    let grid = makeGrid();
    let clustersBlue = [];
    let clustersRed = [];
    //find all clusters of blue points and red points
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const tile = grid[i][j];
            if (tile.bluePoint) {
                tile.walkable = true;
                tile.bluePoint = false;
                const cluster = [tile];
                findCluster(grid, tile, cluster);
                // console.log('blue cluster length ',cluster.length)
                clustersBlue.push(cluster);
            }
        }
    }
    //redraw the blue clusters with green
    // for (let i = 0; i < clustersBlue.length; i++) {
    //     const cluster = clustersBlue[i];
    //     for (let j = 0; j < cluster.length; j++) {
    //         const tile = cluster[j];
    //         fill(0,255,0, 100);
    //         rect(tile.x, tile.y, 1, 1);
    //     }
    // }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const tile = grid[i][j];
            if (tile.redPoint) {
                tile.walkable = true;
                tile.redPoint = false;
                const cluster = [tile];
                findClusterRed(grid, tile, cluster);
                clustersRed.push(cluster);
            }
        }
    }

    console.log('Parking Lot Nr: ', clustersBlue.length);
    console.log('Elevator Nr: ', clustersRed.length);
    let ends = [];
    let starts = [];
    //find the clusterCenter of each cluster of blue points and make it a end point
    for (let i = 0; i < clustersBlue.length; i++) {
        const cluster = clustersBlue[i];
        const clusterCenter = findClusterclusterCenter(cluster);
        const endPoint = grid[clusterCenter.x][clusterCenter.y];


        endPoint.end = true;
        ends.push(endPoint);
    }
    //find the clusterCenter of each cluster of red points and make it a start point
    for (let i = 0; i < clustersRed.length; i++) {
        const cluster = clustersRed[i];
        const clusterCenter = findClusterclusterCenter(cluster);
        const startPoint = grid[clusterCenter.x][clusterCenter.y];
        startPoint.start = true;
        starts.push(startPoint);
    }
    console.log('start points: ', starts);
    console.log('end points: ', ends);
    //iterate through all the start points and end points and find the shortest path between them, on the end point, print the sum of the count returned by the path
    for (let i = 0; i < ends.length; i++) {
        const end = ends[i];
        end.sum = 0;
        for (let j = 0; j < starts.length; j++) {
            const start = starts[j];
            const path = findPathJPS(grid, start, end);
            end.sum += path.length;
            resetGridJPS(grid);
            
        }
        // console.log(end.sum);
        // fill(0);
        // textSize(3);
        // text(end.sum, end.x, end.y);
    }
    //draw the blue clusters based on their centers' sum value. interpolate the color from yellow to purple between the lowest and the highest sum value, color every tile of the cluster with the same color
    let min = 100000;
    let max = 0;
    for (let i = 0; i < ends.length; i++) {
        const end = ends[i];
        if (end.sum < min) {
            min = end.sum;
        }
        if (end.sum > max) {
            max = end.sum;
        }
    }
    console.log('min: ', min);
    console.log('max: ', max);
    for (let i = 0; i < ends.length; i++) {
        const end = ends[i];
        const cluster = clustersBlue[i];
        const clusterCenter = findClusterclusterCenter(cluster);
        const endPoint = grid[clusterCenter.x][clusterCenter.y];
        const color = map(end.sum, min, max, 60, 200);
        colorMode(HSL);
        fill(color,100,50);
        noStroke()
        for (let j = 0; j < cluster.length; j++) {
            const tile = cluster[j];
            rect(tile.x, tile.y, 1, 1);
        }
        colorMode(RGB);
        fill(75);
        noStroke();
        strokeWeight(0.5);
        textSize(2);
        textAlign(CENTER);
        text(endPoint.sum, endPoint.x, endPoint.y);
    }



    // for (let i = 0; i < clustersBlue.length; i++) {
    //     const cluster = clustersBlue[i];
    //     const clusterCenter = findClusterclusterCenter(cluster);
    //     const endPoint = grid[clusterCenter.x][clusterCenter.y];
    //     fill(255- endPoint.sum,endPoint.sum,255- endPoint.sum);
    //     noStroke()
    //     for (let j = 0; j < cluster.length; j++) {
    //         const tile = cluster[j];
    //         rect(tile.x, tile.y, 1, 1);
    //     }
    //     fill(255);
    //     stroke(50);
    //     strokeWeight(0.5);
    //     textSize(3);
    //     textAlign(CENTER);
    //     text(endPoint.sum, endPoint.x, endPoint.y);
    // }

   


}

function makeGrid(){
    console.log("makeGrid");
    const grid = [];
    for(let i = 0; i< width; i++){
        grid.push([]);
        for (let j = 0; j < height; j++){
            let c = img.get(i, j);
            
            // console.log(i,j, c);
            if (c[0] < 100 && c[1] < 100 && c[2] < 100){
                grid[i].push({x: i, y: j, walkable: false, bluePoint: false, redPoint: false});
                fill (0);
                rect(i, j, 1, 1);
            } else if (c[0] > 200 && c[1] < 100 && c[2] < 100){
                grid[i].push({x: i, y: j, walkable: true, bluePoint: false, redPoint: true});
                fill (255,0,0);
                rect(i, j, 1, 1);
            } else if (c[0] < 100 && c[1] < 100 && c[2] > 200){
                grid[i].push({x: i, y: j, walkable: true, bluePoint: true, redPoint: false});
                fill (0,0,255);
                rect(i, j, 1, 1);
            } else {
                grid[i].push({x: i, y: j, walkable: true, bluePoint: false, redPoint: false});
                
                fill (150);
                rect(i, j, 1, 1);
            }
        }       
    }
    return grid;
}


function findCluster(grid, tile, cluster) {
    const neighbors = getNeighbors(grid, tile);
    for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (neighbor.bluePoint) {
            neighbor.walkable = true;
            neighbor.bluePoint = false;
            cluster.push(neighbor);
            findCluster(grid, neighbor, cluster);
        }
    }
}

function findClusterRed(grid, tile, cluster) {
    const neighbors = getNeighbors(grid, tile);
    for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (neighbor.redPoint) {
            neighbor.walkable = true;
            neighbor.redPoint = false;
            cluster.push(neighbor);
            findClusterRed(grid, neighbor, cluster);
        }
    }
}


function findClusterclusterCenter(cluster) {
    let xSum = 0;
    let ySum = 0;
    for (let i = 0; i < cluster.length; i++) {
        const tile = cluster[i];
        xSum += tile.x;
        ySum += tile.y;
    }
    const x = Math.round(xSum / cluster.length);
    const y = Math.round(ySum / cluster.length);
    return {x: x, y: y};
}


function getNeighbors(grid, tile) {
    const neighbors = [];
    const x = tile.x;
    const y = tile.y;
    if (x > 0) {
        neighbors.push(grid[x-1][y]);
    }
    if (x < grid.length - 1) {
        neighbors.push(grid[x+1][y]);
    }
    if (y > 0) {
        neighbors.push(grid[x][y-1]);
    }
    if (y < grid[0].length - 1) {
        neighbors.push(grid[x][y+1]);
    }
    return neighbors;
}

//manhattan distance pathfinding between two points
function findPath(grid, start, end) {
    const openSet = [];
    const closedSet = [];
    openSet.push(start);
    while (openSet.length > 0) {
        let winner = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[winner].f) {
                winner = i;
            }
        }
        const current = openSet[winner];
        if (current === end) {
            let path = [];
            let temp = current;
            let count = 0;
            path.push(temp);
            while (temp.previous) {
                path.push(temp.previous);
                temp = temp.previous;
                count++;
            }
            return path.reverse();
        }
        removeFromArray(openSet, current);
        closedSet.push(current);
        const neighbors = getNeighbors(grid, current);
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];
            if (!neighbor.walkable || closedSet.includes(neighbor)) {
                continue;
            }
            const tempG = current.g + 1;
            let newPath = false;
            if (openSet.includes(neighbor)) {
                if (tempG < neighbor.g) {
                    neighbor.g = tempG;
                    newPath = true;
                }
            } else {
                neighbor.g = tempG;
                newPath = true;
                openSet.push(neighbor);
            }
            if (newPath) {
                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.previous = current;
            }
        }
    }
    return [];
}
//to iterate pathfinding , clean up the grid and reset the start and end points
function resetGrid(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++){
            grid[i][j].f = 0;
            grid[i][j].g = 0;
            grid[i][j].h = 0;
            grid[i][j].previous = undefined;
        }
    }
}


function heuristic(a, b) {
    const d = a.x + a.y - b.x - b.y;
    return d;
}

function removeFromArray(arr, elt) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === elt) {
            arr.splice(i, 1);
        }
    }
}

//draw the end points with color related to their sum values , the higher the sum the more red the color 
function drawEndPoints(grid){
    for(let i = 0; i< grid.length; i++){
        for (let j = 0; j < grid[0].length; j++){
            if (grid[i][j].bluePoint){
                fill (0,0,255);
                rect(i, j, 1, 1);
            } else if (grid[i][j].redPoint){
                fill (255,0,0);
                rect(i, j, 1, 1);
            } else if (grid[i][j].sum){
                let c = color(255, 0, 0);
                c.setAlpha(grid[i][j].sum);
                fill(c);
                rect(i, j, 1, 1);
            }
        }
    }
}

//pathfinding between two points, with jump point search
function findPathJPS(grid, start, end) {
    const openSet = [];
    const closedSet = [];
    openSet.push(start);
    while (openSet.length > 0) {
        let winner = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[winner].f) {
                winner = i;
            }
        }
        const current = openSet[winner];
        if (current === end) {
            let path = [];
            let temp = current;
            let count = 0;
            path.push(temp);
            while (temp.previous) {
                path.push(temp.previous);
                temp = temp.previous;
                count++;
            }
            return path.reverse();
        }
        removeFromArray(openSet, current);
        closedSet.push(current);
        const neighbors = getNeighborsJPS(grid, current);
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];
            if (!neighbor.walkable || closedSet.includes(neighbor)) {
                continue;
            }
            const tempG = current.g + 1;
            let newPath = false;
            if (openSet.includes(neighbor)) {
                if (tempG < neighbor.g) {
                    neighbor.g = tempG;
                    newPath = true;
                }
            } else {
                neighbor.g = tempG;
                newPath = true;
                openSet.push(neighbor);
            }
            if (newPath) {
                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.previous = current;
            }
        }
    }
    return [];
}

//jump point search
function getNeighborsJPS(grid, tile) {
    const neighbors = [];
    const x = tile.x;
    const y = tile.y;
    if (x > 0) {
        neighbors.push(grid[x-1][y]);
    }
    if (x < grid.length - 1) {
        neighbors.push(grid[x+1][y]);
    }
    if (y > 0) {
        neighbors.push(grid[x][y-1]);
    }
    if (y < grid[0].length - 1) {
        neighbors.push(grid[x][y+1]);
    }
    return neighbors;
}

//to iterate pathfinding , clean up the grid and reset the start and end points
function resetGridJPS(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++){
            grid[i][j].f = 0;
            grid[i][j].g = 0;
            grid[i][j].h = 0;
            grid[i][j].previous = undefined;
        }
    }
}

