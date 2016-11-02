class Person{
    public PersonBitmap : egret.Bitmap;
    private IfIsIdle : boolean;
    private IfIsWalking : boolean;
    private IfGoRight : boolean = false;
    private IfGoLeft : boolean = false;
    private IdOrWaStateMachine : StateMachine;
    private LOrRStateMachine : StateMachine;

    constructor(){
        this.PersonBitmap = new egret.Bitmap();
        this.PersonBitmap.width = 64;
        this.PersonBitmap.height = 64;
        this.IfIsIdle = true;
        this.IfIsWalking = false;
        this.IdOrWaStateMachine = new StateMachine();
        this.LOrRStateMachine = new StateMachine();

    }

    public CanSetPersonBitmap(picture:egret.Bitmap){
        this.PersonBitmap = picture;
    }


    public CanSetIdle(set : boolean){
        this.IfIsIdle = set;
    }

    public CanGetIfIdle(): boolean{
        return this.IfIsIdle;
    }

    public CanSetWalk(set : boolean){
        this.IfIsWalking = set;
    }

    public CanGetIfWalk(): boolean{
        return this.IfIsWalking
    }

    public CanSetGoRight(){
        this.IfGoRight = true;
        this.IfGoLeft = false;
    }

    public CanGetIfGoRight(): boolean{
        return this.IfGoRight;
    }

    public CanSetGoLeft(){
        this.IfGoLeft = true;
        this.IfGoRight = false;
    }

    public GetIfGoLeft() : boolean{
        return this.IfGoLeft;
    }

    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    public SetState(e : State , _tmain : Main){
        this.IdOrWaStateMachine.setState(e,_tmain);
    }

    public SetRightOrLeftState(e : State , _tmain : Main){
        this.LOrRStateMachine.setState(e,_tmain);
    }


}

interface State{
    OnState(_tmain : Main);

    ExitState(_tmain : Main);

}

class PeopleState implements State{
      OnState(_tmain : Main){};

      ExitState(_tmain : Main){};
}

class StateMachine{
     CurrentState : State;

     setState( e : State , _tmain : Main){
        if( this.CurrentState != null){
           this.CurrentState.ExitState(_tmain);
        }
        this.CurrentState = e;
        this.CurrentState.OnState(_tmain);
     }
}


class IdleState implements PeopleState{

    OnState(_tmain : Main){
        _tmain.Player.CanSetIdle(true);
        _tmain.Player.CanSetWalk(false);
    };

    ExitState(_tmain : Main){
        _tmain.Player.CanSetIdle(false);
    };

}

class WalkingState implements PeopleState{
      OnState(_tmain : Main){
        _tmain.Player.CanSetIdle(false);
        _tmain.Player.CanSetWalk(true);
    };

    ExitState(_tmain : Main){
        _tmain.Player.CanSetWalk(false);
    };
}

class GoRightState implements PeopleState{
    OnState(_tmain : Main){
        _tmain.Player.CanSetGoRight();
    };

    ExitState(_tmain : Main){};

}

class GoLeftState implements PeopleState{
    OnState(_tmain : Main){
        _tmain.Player.CanSetGoLeft();
    };

    ExitState(_tmain : Main){};

}
