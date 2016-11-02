class AStar{
    private openArray : Tile[];
    private closedTheArray : Tile[];
    private tileMap : TileMap;
    public startTile : Tile;
    public endTile : Tile;
    public pathArray : Tile[];
    private straightCost:number = 1.0;
    private diagCost:number = Math.SQRT2;
    private heuristic:Function = this.Whatdiagonal;
    constructor(){};

    public findYourPath(tileMap : TileMap):any{
          var h = 0;
          var g = 0;
          this.pathArray = [];
          this.tileMap = tileMap;
          this.openArray = [];
          this.closedTheArray = [];
          this.startTile = tileMap.startTile;
          this.endTile = tileMap.endTile;
          this.startTile.tileData.g = 0;
          this.startTile.tileData.h = this.heuristic(this.startTile);
          this.startTile.tileData.f = this.startTile.tileData.g + this.startTile.tileData.h;
          return this.Cansearch();
    }

    private IfItisOpen(tile : Tile):any{
        for(var i = 0 ; i < this.openArray.length ; i++){
            if( tile == this.openArray[i] ){
                return true;
            }
        }
        return false;
    }

    private IfItisClosed(tile : Tile):any{
        for(var p = 0 ; p < this.closedTheArray.length ; p++){
            if( tile == this.closedTheArray[p] ){
                return true;
            }
        }
        return false;
    }

    private SeeMinFInOpenArray():any{
        var k = 0;
        var temp : Tile;
        for(var j = 0 ; j < this.openArray.length ; j++){
            if( this.openArray[k].tileData.f > this.openArray[j].tileData.f){
                k = j;
            }
        }
        temp = this.openArray[k];
        for( j = k ; j < this.openArray.length - 1; j++){
            this.openArray[j] = this.openArray[j + 1];
        }
        this.openArray.pop();
        return temp;
    }

    public Cansearch():any{
        var textile = this.startTile;
        
        while( textile != this.endTile){
            var startX:number = Math.max(0, textile.tileData.x - 1);
            var endX:number = Math.min(this.tileMap.numCols - 1, textile.tileData.x + 1);
            var startY:number = Math.max(0, textile.tileData.y - 1);
            var endY:number = Math.min(this.tileMap.numRows - 1, textile.tileData.y + 1);
            for(var z:number = startX; z <= endX; z++){
                for(var j:number = startY; j <= endY; j++){
                    var test:Tile = this.tileMap.CangetTile(z, j);
                    if(test == textile ||!test.tileData.walkable ||!this.tileMap.CangetTile(textile.tileData.x, test.tileData.y).tileData.walkable ||!this.tileMap.CangetTile(test.tileData.x, textile.tileData.y).tileData.walkable){
                        continue;
                    }
                    var cost:number = this.straightCost;
                    if(!((textile.tileData.x == test.tileData.x) || (textile.tileData.y == test.tileData.y))){
                        cost = this.diagCost;
                    }
                    var g:number = textile.tileData.g + cost * test.tileData.costMultiplier;
                    var h:number = this.heuristic(test);
                    var f:number = g + h;
                    if(this.IfItisOpen(test) || this.IfItisClosed(test)){
                       if(test.tileData.f > f){
                          test.tileData.f = f;
                          test.tileData.g = g;
                          test.tileData.h = h;
                          test.tileParent = textile;
                        }
                    }
                    else{
                        test.tileData.f = f;
                        test.tileData.g = g;
                        test.tileData.h = h;
                        test.tileParent = textile;
                        this.openArray.push(test);
                    }

                }
            }
            this.closedTheArray.push(textile);
            if(this.openArray.length == 0){
                console.log("No Way is found");
                return false
            }
            textile = this.SeeMinFInOpenArray();
        }
        this.buildAPath();
        return true;

    }
    
    private buildAPath():void{
        var tile:Tile = this.endTile;
        this.pathArray.push(tile);
        while(tile != this.startTile){
        tile = tile.tileParent;
        this.pathArray.unshift(tile);
        }
    }


    private Whatemanhattan(tile:Tile):number {
        return Math.abs(tile.x - this.endTile.tileData.x) * this.straightCost +
        Math.abs(tile.y + this.endTile.tileData.y) * this.straightCost;
    }

    private Whateuclidian(tile:Tile):number{
        var dx:number = tile.x - this.endTile.tileData.x;
        var dy:number = tile.y - this.endTile.tileData.y;
        return Math.sqrt(dx * dx + dy * dy) * this.straightCost;
    }

    private Whatdiagonal(tile:Tile):number{
        var dx:number = Math.abs(tile.tileData.x - this.endTile.tileData.x);
        var dy:number = Math.abs(tile.tileData.y - this.endTile.tileData.y);
        var Thediag:number = Math.min(dx, dy);
        var Thestraight:number = dx + dy;
        return this.diagCost * Thediag + this.straightCost * (Thestraight - 2 * Thediag);
    }
}