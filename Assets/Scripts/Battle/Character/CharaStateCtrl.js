#pragma strict
/********************************************
入力からキャラの状態遷移を管理する。
また状態(state)とともに、経過時間(elapsed)の管理を行い、
elapsedの値によっても状態遷移が発生する。

硬直：プレイヤーの入力を受け付けない状態
 外力によって移動、ダウンなどが発生する可能性がある
 ダッシュ硬直、攻撃硬直などは、それぞれのstateの中で管理し、
 このstateは基本的に外力によって発生するものとする。(弾を食らったときなど)
********************************************/

/*
var dashTime : int = 120;				// ダッシュ最大時間
var dashStunTime : int = 45;			// ダッシュ硬直時間
var dashCancelTime : int = 2;			// ダッシュキャンセル時間

ダッシュボタンが押されると、
stateがDASHになり、
1F目～120F目は、ダッシュ可能
121F目～165F目は、硬直状態になる
また、165F目で敵に向き直る

1F目～120F目までの間に、再度ダッシュボタンが押された場合、
ReserveNextState(CharaState.WALK, 2); 
が呼ばれ、
121F目(-2 = -dashCancelTime)で、敵に向き直り、
123F目(0)で次のstate(WALK)に切り替わる
(なので123F目は存在せず、WALKの1F目として処理される)
*/


var charaHp : float = 1000.0;		// HP

enum CharaState {
	//IDLE,			// 立ち
	WALK,			// 立ち・歩き
	DASH,			// ダッシュ
	BARR,			// バリア
	
	STUN,			// 硬直
	DOWN,			// ダウン
	//GOD,			// 無敵
	
	// 攻撃
	WALK_M,
	WALK_S,
	
	DASH_M,
	DASH_S,
	
	BARR_M,
	BARR_S,
	
	// 近接攻撃
	CLOSEATK_0,
	CLOSEATK_1,
	CLOSEATK_2,
	CLOSEATK_3_1,
	CLOSEATK_3_2,
	
	COUNT
};

enum CharaAttackState {
	NONE,
	A,
	B,
	C,
	COUNT
};

var isGod : int = 0;		// 無敵状態の残りフレーム数
var isStun : int= 0;		// 硬直状態(プレイヤーの入力を受け付けない)の
							// 残りフレーム数

/*** キャラの状態 ***/
// stateのフレームカウントは1から
// (CheckState処理の最初で+1し、状態遷移判定などを行う
// 新しいstateはelapsedを1にセットする)
// [次のstateの予約]
// 次の状態へ遷移するまでの時間を負の値でstateElapsedにセットする
// stateElapsedが0になったときに、currentStateにnextStateがセットされる

private var STATE_BUFSIZE : int = 8;	// 過去何フレーム保存するか

/*** state管理 ***/
var stateBuf : int[];		// 現在のstate
var stateElapsed : int[];	// 各stateの経過フレーム
private var stateBufIndex : int;	// 現在のstateを格納しているバッファindex
var nextState : int;		// 予約state（非設定時は-1
private var gameFrame : int;	// 現在のgameFrame(CheckStateで更新)


/*** スクリプトコンポーネント ***/
private var charaInput : CharaInput;
private var charaAction : CharaAction;
private var charaStatus : CharaStatus;

/******************************************************************************/

function Awake ()
{
	//enabled = false;
}

function Start ()
{
	// --- コンポーネントのキャッシュ ---
	charaInput = GetComponent(CharaInput);
	charaAction = GetComponent(CharaAction);
	charaStatus = GetComponent(CharaStatus);
	
	//charaInput.enabled = true;
	//charaAction.enabled = true;
	
	// --- stateバッファリセット ---
	var i : int;
	
	stateBuf = new int[STATE_BUFSIZE];
	stateElapsed = new int[STATE_BUFSIZE];
	stateBufIndex = 0;
	
	for (i = 0; i < STATE_BUFSIZE; i++) {
		stateBuf[i] = CharaState.WALK;
		stateElapsed[i] = 0;
	}
	
	// --- 初期状態をセット：歩き ---
	SetState(CharaState.WALK);
}

/*------------------------------------------------------------------------------
関数名	: CheckState (gameFrame : int)
説明	: ①現在のゲームフレームを更新する(publicで扱う)
		  ②予約された次の状態へ遷移する、または入力に応じて状態遷移判定を行う
		  ③state経過フレーム数をカウントアップする
引数	: gameFrame=現在のゲームフレーム
戻り値	: なし
------------------------------------------------------------------------------*/
function CheckState (frame : int)
{
	// gameFrameの更新
	if (frame != gameFrame+1) {
		// gameFrameが飛んでる
		Debug.Log("CheckState[Assert] :\n" +
			      "gameFrame = " + frame +
			      ", prvFrame = " + gameFrame);
		return;
	}
	
	gameFrame = frame;
	
	// --- 入力の取得(入力バッファの更新) ---
	charaInput.GetInput(gameFrame);
	
	
	// --- state経過フレーム数加算 ---
	AddElapsed();
	
	// --- 予約された次の状態へ遷移 ---
	if (GetElapsed() == 0) {
		SetNextState();
	
	// --- state遷移判定処理 ---
	} else {
		var state : int = GetState();
		if      (state == CharaState.WALK)   stateWalk();
		else if (state == CharaState.DASH)   stateDash();
		else if (state == CharaState.BARR)   stateBarr();
		
		else if (state == CharaState.STUN)   stateStun();
		else if (state == CharaState.DOWN)   stateDown();
		
		else if (state == CharaState.WALK_M) stateWalk_M();
		else if (state == CharaState.WALK_S) stateWalk_S();
		
		else if (state == CharaState.DASH_M) stateDash_M();
		else if (state == CharaState.DASH_S) stateDash_S();
		
		else if (state == CharaState.BARR_M) stateBarr_M();
		else if (state == CharaState.BARR_S) stateBarr_S();
		
		//else if (state == CharaState.CLOSEATK_0) stateCloseAtk_0();
		else if (state == CharaState.CLOSEATK_1) stateCloseAtk_1();
		else if (state == CharaState.CLOSEATK_2) stateCloseAtk_2();
		else if (state == CharaState.CLOSEATK_3_1) stateCloseAtk_3_1();
		//else if (state == CharaState.CLOSEATK_3_2) stateCloseAtk_3_2();
	}
}


/***********************************************************
	状態遷移
SetState (newState, newElapsed = 0)
SetNextState ()
ReserveNextState (newState, newElapsed)

GetState (frameNum = 0)

GetElapsed (frameNum = 0)
AddElapsed ()
************************************************************/

/*------------------------------------------------------------------------------
関数名	: SetState (newState : int, newElapsed : int)
説明	: 現在のゲームフレームに、指定された新しいstate、elapsedをセットする
引数	: newState=新しいstate
		  newElapsed=新しいstateの経過フレーム数(default = 1)
戻り値	: なし
------------------------------------------------------------------------------*/
function SetState (newState : int, newElapsed : int)
{
	if (newState < 0 || newState >= CharaState.COUNT) {
		Debug.LogError("[SetState] invalid newState");
		return;
	}
	
	// 新しいstateをバッファにセット
	if (stateBufIndex == STATE_BUFSIZE-1) {
		stateBufIndex = 0;
	} else {
		stateBufIndex++;
	}

	stateBuf[stateBufIndex] = newState;
	stateElapsed[stateBufIndex] = newElapsed;
}

// デフォルトnewElapsed = 1
function SetState (newState : int)
{
	SetState(newState, 1);
}


/*------------------------------------------------------------------------------
関数名	: SetNextState ()
説明	: 現在のゲームフレームに、nextStateにセットされた予約stateをセットする
		  前のstateのelapsedが0になった時に呼ばれる
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function SetNextState ()
{
	if (GetElapsed() != 0) {
		Debug.LogError("[SetNextState] stateElapsed != 0 " + 
		               "(" + GetElapsed() + ")");
		return;
	} else if (nextState == -1) {
		Debug.LogError("[SetNextState] nextState is not set");
		return;
	}
	SetState(nextState);
	nextState = -1;		// 予約stateを未定義状態にする
}


/*------------------------------------------------------------------------------
関数名	: ReserveNextState ()
説明	: 次のstateを予約する
引数	: newState = newElapsedフレーム後に遷移するstate
		  newElapsed = newStateに遷移するまでのフレーム数
戻り値	: なし
------------------------------------------------------------------------------*/
function ReserveNextState (newState : int, newElapsed : int)
{
	nextState = newState;
	
	stateElapsed[stateBufIndex] = -newElapsed;
}


/*------------------------------------------------------------------------------
関数名	: GetState (frameNum : int)
説明	: 現在のゲームフレームよりframeNum分前のフレームのstateを取得する
引数	: frameNum=取得するフレームは現在のフレームの何フレーム前か
		           (0 <= frameNum < STATE_BUFSIZE)
戻り値	: 取得したstate
------------------------------------------------------------------------------*/
function GetState (frameNum : int)
{
	// 未来のstateとすでにバッファから消えたstateは取得できない
	if (frameNum < 0 ||
		frameNum >= STATE_BUFSIZE) {
		Debug.LogError("[GetState] invalid frameNum = " + frameNum);
		return;
	}
	
	var i : int = stateBufIndex - frameNum;
	if (i < 0) {
		i = STATE_BUFSIZE + i;
	}
	return stateBuf[i];
}

// デフォルトframeNum = 0(現在のフレームのstateを取得)
function GetState ()
{
	return GetState(0);
}

/*------------------------------------------------------------------------------
関数名	: GetElapsed ()
説明	: 現在のゲームフレームよりframeNum分前のフレームの
		  state経過フレーム数を取得する
引数	: GetState() 参照
戻り値	: 現在のstateElapsed
------------------------------------------------------------------------------*/
function GetElapsed (frameNum : int)
{
	// 未来のフレームとすでにバッファから消えたstateElapsedは取得できない
	if (frameNum < 0 ||
		frameNum >= STATE_BUFSIZE) {
		Debug.LogError("[GetElapsed] invalid frameNum = " + frameNum);
		return;
	}
	
	var i : int = stateBufIndex - frameNum;
	if (i < 0) {
		i = STATE_BUFSIZE + i;
	}
	return stateElapsed[i];
}

// デフォルトframeNum = 0
function GetElapsed ()
{
	return GetElapsed(0);
}

/*------------------------------------------------------------------------------
関数名	: AddElapsed ()
説明	: 現在のフレームのstate経過フレーム数を加算する
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function AddElapsed ()
{
	stateElapsed[stateBufIndex]++;
}



/***********************************************************
	状態遷移判定
************************************************************/

/*------------------------------------------------------------------------------
関数名	: stateWalk ()
説明	: stateがWALK（歩き・立ち）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateWalk ()
{
	// バリア・ダッシュ
	if (charaInput.inputAccum[Btn.A] == 1) {
		if (charaInput.inputAxis.magnitude == 0) {
			// バリア
			SetState(CharaState.BARR);
			return;
			
		} else {
			// ダッシュ
			SetState(CharaState.DASH);
			return;
		}
	
	// 攻撃
	} else if (charaInput.inputAccum[Btn.M] == 1) {
		if ((charaAction.enemyTransform.position - transform.position).sqrMagnitude < charaAction.closeAtkRange) {
			SetState(CharaState.CLOSEATK_1);
		} else {
			SetState(CharaState.WALK_M);
		}
		return;
	//} else if (charaInput.inputAccum[Btn.S] == 1) {
	//	SetState(CharaState.WALK_S);
	
	}
	
}

/*------------------------------------------------------------------------------
関数名	: stateWalk_M ()
説明	: stateがWALK_M（歩きM）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateWalk_M ()
{
	var prvState : int;
	var prvElapsed : int;
	var currentElapsed : int;
	currentElapsed = GetElapsed();
	
	
	// M攻撃終了(Mボタンを離した)
	if (charaInput.inputAccum[Btn.M] == 0) {
		// 1フレーム前のstate, elapsedを取得
		prvState = GetState(1);
		prvElapsed = GetElapsed(1);
		
		if (prvState != CharaState.WALK) {
			Debug.LogWarning("[stateWalk_M] prvState is not WALK");
			SetState(CharaState.WALK);
			return;
		}
		// 1つ前のstate(WALK)に戻す
		SetState(prvState, prvElapsed);
		return;
	
	// M弾切れ
	} else if (currentElapsed >
	           charaAction.walkM_interval * charaAction.walkM_bulletNum +1) {
		// 1フレーム前のstate, elapsedを取得
		prvState = GetState(1);
		prvElapsed = GetElapsed(1);
			
		if (prvState != CharaState.WALK) {
			Debug.LogWarning("[stateWalk_M] prvState is not WALK");
			SetState(CharaState.WALK);
			return;
		}
		// 1つ前のstate(WALK)に戻す
		SetState(prvState, prvElapsed);
		return;
	}
}

function stateWalk_S ()
{
}

/*------------------------------------------------------------------------------
関数名	: stateDash ()
説明	: stateがDASH（ダッシュ）の場合の状態遷移判定
		  ダッシュキャンセル時間 : -dashCancelTime <= time <= 0
		  ダッシュ移動最大時間 : 0 < time <= dashTime
		  ダッシュ硬直時間 : dashTime < time <= dashTime + dashStunTime
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateDash ()
{
	var currentElapsed : int;
	currentElapsed = GetElapsed();
	
	if (currentElapsed <= charaAction.dashTime) {
		// ダッシュキャンセル
		if (charaInput.inputAccum[Btn.A] == 1 &&
			charaInput.inputAxis.magnitude == 0) {
			// 次のstateにWALKを予約
			ReserveNextState(CharaState.WALK, charaAction.dashCancelTime);
			return;
		
		// ダッシュM攻撃
		} else if (charaInput.inputAccum[Btn.M] == 1) {
			SetState(CharaState.DASH_M);
			return;
		}
	}
	
	// ダッシュ（ダッシュ硬直含む）終了
	if (currentElapsed > charaAction.dashTime + charaAction.dashStunTime) {
		SetState(CharaState.WALK);
		return;
	}
}

/*------------------------------------------------------------------------------
関数名	: stateDash_M ()
説明	: stateがDASH_M（ダッシュM）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateDash_M ()
{
	var prvState : int;
	var prvElapsed : int;
	var currentElapsed : int;
	currentElapsed = GetElapsed();
	
	if (currentElapsed >
	    charaAction.dashM_interval * charaAction.dashM_bulletNum + 1) {
		
		prvState = GetState(1);
		prvElapsed = GetElapsed(1);
		
		if (prvState != CharaState.DASH) {
			Debug.LogWarning("[stateDash_M] prvState is not DASH");
			SetState(CharaState.DASH, charaAction.dashTime);
			return;
		}
		
		// 1つ前のstate(DASH)に戻す(ダッシュ移動時間を越えていたら硬直発生)
		if (charaAction.dashTime < currentElapsed + prvElapsed) {
			SetState(prvState, charaAction.dashTime);
		} else {
			SetState(prvState, currentElapsed + prvElapsed);
		}
		return;
	}
}

function stateDash_S ()
{
}


/*------------------------------------------------------------------------------
関数名	: stateBarr ()
説明	: stateがBARR（バリア）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateBarr () {
	if (charaInput.inputAccum[Btn.A] == 0) {
		// バリア解除
		SetState(CharaState.WALK);
		return;
	}
}


/*------------------------------------------------------------------------------
関数名	: stateBarr_M ()
説明	: stateがBARR_M（バリアM）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateBarr_M ()
{
}


/*------------------------------------------------------------------------------
関数名	: stateBarr_S ()
説明	: stateがBARR_S（バリアS）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateBarr_S ()
{
}


/*------------------------------------------------------------------------------
関数名	: stateCloseAtk_0 ()
説明	: stateがCLOSEATK_0（近接攻撃発動）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateCloseAtk_0 ()
{
}

/*------------------------------------------------------------------------------
関数名	: stateCloseAtk_1 ()
説明	: stateがCLOSEATK_1（近接攻撃1段目）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateCloseAtk_1 ()
{
// 連携入力受付時間 closeAtkTime_1 * 0.8 ～ closeAtkTime_1 * 1.2
	var currentElapsed : int;
	currentElapsed = GetElapsed();
	
	// 連携終了
	if (currentElapsed > charaAction.closeAtkTime_1 * 1.2) {
		SetState(CharaState.WALK);
		return;
	}
	
	// 連携判定
	//if ((currentElapsed > charaAction.closeAtkTime_1 * 0.8) && charaInput.inputAccum[Btn.M] == 1) {
	if (charaInput.inputAccum[Btn.M] == 1) {
		if ((charaAction.enemyTransform.position - transform.position).sqrMagnitude < charaAction.closeAtkRange) {
			ReserveNextState(CharaState.CLOSEATK_2,
							 charaAction.closeAtkTime_1 - currentElapsed);
		} else {
			SetState(CharaState.WALK);
		}
		return;
	}
}

/*------------------------------------------------------------------------------
関数名	: stateCloseAtk_2 ()
説明	: stateがCLOSEATK_2（近接攻撃2段目）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateCloseAtk_2 ()
{
	// 連携入力受付時間 closeAtkTime_1 * 0.8 ～ closeAtkTime_1 * 1.2
	var currentElapsed : int;
	currentElapsed = GetElapsed();
	
	// 連携終了
	if (currentElapsed > charaAction.closeAtkTime_2 * 1.2) {
		SetState(CharaState.WALK);
		return;
	}
	
	// 連携判定
	//if ((currentElapsed > charaAction.closeAtkTime_2 * 0.5) && charaInput.inputAccum[Btn.M] == 1) {
	if (charaInput.inputAccum[Btn.M] == 1) {
		if ((charaAction.enemyTransform.position - transform.position).sqrMagnitude < charaAction.closeAtkRange) {
			ReserveNextState(CharaState.CLOSEATK_3_1,
							 charaAction.closeAtkTime_2 - currentElapsed);
		} else {
			SetState(CharaState.WALK);
		}
		return;
	}
}

/*------------------------------------------------------------------------------
関数名	: stateCloseAtk_3_1 ()
説明	: stateがCLOSEATK_3_1（近接攻撃3-1段目）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateCloseAtk_3_1 ()
{
	// 連携入力受付時間 closeAtkTime_1 * 0.8 ～ closeAtkTime_1 * 1.2
	var currentElapsed : int;
	currentElapsed = GetElapsed();
	
	// 近接攻撃終了
	if (currentElapsed > charaAction.closeAtkTime_3_1) {
		SetState(CharaState.WALK);
		return;
	}
}

/*------------------------------------------------------------------------------
関数名	: stateCloseAtk_3_2 ()
説明	: stateがCLOSEATK_3_2（近接攻撃3-2段目）の場合の状態遷移判定
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function stateCloseAtk_3_2 ()
{
}

/***********************************************************
	行動不能
************************************************************/
/*** 硬直 ***/
function stateStun ()
{
}

/*** ダウン ***/
function stateDown ()
{
}



/***********************************************************
	ダメージ管理
************************************************************/
function ApplyDamage(damage : float) {
	charaHp -= damage;
	if (charaHp < 0) charaHp = 0;
}

