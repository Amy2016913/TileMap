//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingsight:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.AddToStage, this);
    }

    private AddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingsight = new LoadingUI();
        this.stage.addChild(this.loadingsight);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingsight);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingsight.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private clickPoint : egret.Point = new egret.Point();
    public Player : Person = new Person();
    private goalPoint : egret.Point = new egret.Point();
    private map : TileMap;
    private astar : AStar;
    private tileX : number;
    private tileY : number;
    private tileSize = 64;
    private ifFindAWay : boolean = false;
    private currentPath : number = 0;
    private movingTime = 32;
    private ifOnGoal = false;
    private ifStartMove = false;
    private playerx : number;
    private playery : number;
    private playerBitX : number;
    private playerBitY : number;

    
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {
        var stageW:number = this.stage.stageWidth;
        var stageH:number = this.stage.stageHeight;

        this.map = new TileMap();
        this.addChild(this.map);

        

         this.addChild(this.Player.PersonBitmap);
         this.Player.PersonBitmap.x = 0;
         this.Player.PersonBitmap.y = 0;

         this.map.startTile = this.map.CangetTile(0,0);
         this.map.endTile = this.map.CangetTile(0,0);
         this.astar = new AStar();


       

            this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN,(e : egret.TouchEvent)=>{
            //egret.Tween.removeTweens(this.Player.PersonBitmap);
            this.ifStartMove = true;
            this.playerx = Math.floor(this.Player.PersonBitmap.x / this.tileSize);
            this.playery = Math.floor(this.Player.PersonBitmap.y / this.tileSize);
            this.playerBitX = this.Player.PersonBitmap.x;
            this.playerBitY = this.Player.PersonBitmap.y;
            this.map.startTile = this.map.CangetTile(this.playerx,this.playery);
            this.currentPath = 0;
            this.clickPoint.x = e.stageX;
            this.clickPoint.y = e.stageY;
            this.tileX = Math.floor(this.clickPoint.x / this.tileSize);
            this.tileY = Math.floor(this.clickPoint.y / this.tileSize);
            this.map.endTile = this.map.CangetTile(this.tileX,this.tileY);
            this.ifFindAWay = this.astar.findPath(this.map);
            if(this.ifFindAWay){
                this.Player.SetState(new WalkingState(),this);
                this.currentPath = 0;
            }

            for(let i = 0 ; i < this.astar.pathArray.length ; i++){
                console.log(this.astar.pathArray[i].x + " And " + this.astar.pathArray[i].y);
            }if(this.ifFindAWay)
            this.map.startTile = this.map.endTile;
        },this)
            this.PlayerMove();
            this.PlayerAnimation();      
    }

  
    private createmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

   public PlayerMove(){
       var self:any = this;
       
       egret.Ticker.getInstance().register(()=>{
    if(this.ifStartMove && self.ifFindAWay){
       if(self.currentPath < self.astar.pathArray.length - 1){ 
            var distanceX = self.astar.pathArray[self.currentPath + 1].x - self.astar.pathArray[self.currentPath].x;
            var distanceY = self.astar.pathArray[self.currentPath + 1].y - self.astar.pathArray[self.currentPath].y;

            if(distanceX > 0){
            self.Player.SetRightOrLeftState(new GoRightState(),self);
            }
            if(distanceX <= 0){
            self.Player.SetRightOrLeftState(new GoLeftState(),self);
            }
            if(!self.IfOnGoal(self.astar.pathArray[self.currentPath + 1])){
               self.Player.PersonBitmap.x += distanceX / self.movingTime;
               self.Player.PersonBitmap.y += distanceY / self.movingTime;
            }
            else{
               self.currentPath += 1;
            }
          }
    }

    if(this.ifStartMove && !self.ifFindAWay){
        var distanceX = self.map01.startTile.x - self.playerBitX;
        var distanceY = self.map01.startTile.y - self.playerBitY;
        if(distanceX > 0){
            self.Player.SetRightOrLeftState(new GoRightState(),self);
            }
            if(distanceX <= 0){
            self.Player.SetRightOrLeftState(new GoLeftState(),self);
            }
        if(!self.IfOnGoal(self.map01.startTile)){
               self.Player.PersonBitmap.x += distanceX / self.movingTime;
               self.Player.PersonBitmap.y += distanceY / self.movingTime;
            }
            else
            self.Player.SetState(new IdleState(),self);
    }
        },self)
      
   }



    public PictureMove(pic : egret.Bitmap):void{
        var self:any = this;
        var MapMove:Function = function (){
            egret.Tween.removeTweens(pic);
            var dis = self.Player.PersonBitmap.x - self.EventPoint.x;
        if(self.Player.GetIfGoRight() && pic.x >= - (pic.width - self.stage.stageWidth) ){
            egret.Tween.get(pic).to({x : pic.x - Math.abs(dis)},self.MoveTime);
        }

        if(self.Player.GetIfGoLeft() && pic.x <= 0){
            egret.Tween.get(pic).to({x : pic.x + Math.abs(dis)},self.MoveTime);
        }
  
        }
        MapMove();
    }


    public IfAimGoal(tile : Tile) : any{
        var self:any = this;
        if(self.Player.PersonBitmap.x == tile.x && self.Player.PersonBitmap.y == tile.y)
        this.ifOnGoal = true;
        else 
        this.ifOnGoal = false;
        return this.ifOnGoal;

    }


    public PlayerAnimation():void{
        var self:any = this;
        var n = 0;
        var GOR = 0;
        var GOL = 0;
        var coco = 0;
        var coco2 = 0;
        var coco3 = 0;
        var standArr = ["1","2","3","4"];
        var walkArr = ["1","2","3","4","5","6","7","8"];

        var MoveAnimation:Function = function (){
            //var playerBitmap = egret.Tween.get(self.Player.PersonBitmap);
               
                
                egret.Ticker.getInstance().register(()=>{
                if(coco % 4 == 0){
                    
                    if(self.Player.GetIfIdle() && !self.Player.GetIfWalk()){
                    GOR = 0;
                    GOL = 0;
                    var textureName = "待机" + standArr[n] + "_png";
                    var texture : egret.Texture = RES.getRes(textureName);
                    self.Player.PersonBitmap.texture = texture;
                    n++;
                    if(n >= standArr.length){
                          n=0;
                          }
                          }
                          



                    if(self.Player.GetIfWalk() && self.Player.GetIfGoRight() && !self.Player.GetIfIdle()){
                        n = 0;
                        GOL = 0;
                    var textureName = "右跑" + walkArr[GOR] + "_png";
                    var texture : egret.Texture = RES.getRes(textureName);
                    self.Player.PersonBitmap.texture = texture;
                    GOR++;
                    if(GOR >= walkArr.length){
                          GOR=0;
                          }
                          }

                          if(self.Player.GetIfWalk() && self.Player.GetIfGoLeft() && !self.Player.GetIfIdle()){
                              n = 0;
                              GOR = 0;
                    var textureName = "左跑" + walkArr[GOL] + "_png";
                    var texture : egret.Texture = RES.getRes(textureName);
                    self.Player.PersonBitmap.texture = texture;
                    GOL++;
                    if(GOL >= walkArr.length){
                          GOL=0;
                          }
                    }

                    }


                    if(self.IfOnGoal(self.map.endTile)){
                     self.Player.SetState(new IdleState(),self);
                    }
                },self);
        }

        

        

        

        var JamesAddIt : Function = function(){
            egret.Ticker.getInstance().register(()=>{
            coco++;
            if(coco == 400)
            coco = 0;
            },self)
        }




        MoveAnimation();
        
        JamesAddIt();
    }

 
}

