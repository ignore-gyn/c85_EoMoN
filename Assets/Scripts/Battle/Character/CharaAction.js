#pragma strict

/********************************************
キャラの状態から、
キャラの移動、方向転換、アニメーションの再生を
制御する。また、演出スクリプトを呼び出す。

時間パラメータは以下のように扱う。
 startTime < time <= endTime
 
stateElapsedは1から。
stateElapsed = 0は次の状態遷移前の最終フレーム
********************************************/


/*** 移動能力値 ***/
private var moveDirection : Vector3;	// 進行方向
private var myLookAt : Quaternion;		// 向き

// 旋回性能：移動方向の補正能力（進行方向を曲げる速度）
// 回頭性能：キャラの向きの補正能力（敵の方に向き直る速度）

var walkSpeed : float = 0.1;			// 1フレームに歩きで移動する距離
var walkLookAt : float = 0.03;			// 歩き中の回頭性能

var dashSpeed : float = 0.33;			// 1フレームにダッシュで移動する距離
var dashRot : float = 0.008;			// ダッシュ中の旋回性能


var barrRot : float = 0.06;				// バリア中の旋回性能
var barrMaxDeg : float = 50;			// バリア最大旋回角度

var dashTime : int = 120;				// ダッシュ最大時間
var dashStunTime : int = 45;			// ダッシュ硬直時間
var dashCancelTime : int = 2;			// ダッシュキャンセル時間


/*** 攻撃能力値 ***/
var walkM_interval : int = 10;			// 射出間隔
var walkM_bulletNum : int = 10;			// 最大弾数


var dashM_LookAt : float = 0.01;		// ダッシュM中の回頭性能
var dashM_interval : int = 10;			// 射出間隔
var dashM_bulletNum : int = 5;			// 弾数

var closeAtkRange : int = 400;			// 近接攻撃発動レンジ2乗(20*20)
var closeAtkTime_0 : int;
var closeAtkTime_1 : int = 50;			// 近接攻撃1段目時間
var closeAtkTime_2 : int = 50;			// 近接攻撃2段目時間
var closeAtkTime_3_1 : int = 100;		// 近接攻撃3-1段目時間
var closeAtkTime_3_2 : int;				// 近接攻撃3-2段目時間


/*** バリアオブジェクト ***/
var barrPrfb : GameObject;
private var barr : GameObject;

/*** キャラオブジェクトコンポーネント ***/
private var publicData : PublicData;
private var controller : CharacterController;
private var charaStatus : CharaStatus;

private var charaInput : CharaInput;
private var inputAxis : Vector3;	// プレイヤーの軸入力

private var charaStateCtrl : CharaStateCtrl;
private var state : int;
private var elapsed : int;

private var seCtrl : SECtrl;

var enemy : GameObject;

var myTransform : Transform;
var enemyTransform : Transform;

/*** フィールド情報 ***/
private var field : GameObject;
private var fieldScale : float;		// フィールド半径の2乗


/*** エフェクト ***/



/******************************************************************************/

function Awake ()
{
}

function Start ()
{
	// アニメーション再生設定
	animation["Walk"].speed = 1.0;
	animation["Jump"].speed = 2.0;	// ダッシュ硬直
	
	// コンポーネントをキャッシュ
	publicData = GameObject.Find("DataKeeper").GetComponent(PublicData);
	seCtrl = GameObject.Find("GameController").GetComponent(SECtrl);
	controller  = GetComponent(CharacterController);
	
	charaStatus = GetComponent(CharaStatus);
	charaStateCtrl = GetComponent(CharaStateCtrl);
	charaInput = GetComponent(CharaInput);
	
	if (gameObject.tag == "Tiger") {
		enemy = GameObject.FindWithTag("Bunny");
	} else {
		enemy = GameObject.FindWithTag("Tiger");
	}
	enemyTransform = enemy.transform;
	myTransform = transform;
	
	// フィールドサイズ取得
	field = GameObject.Find("Stage/Field");
	fieldScale = Mathf.Pow(field.transform.localScale.x * 0.5 * 0.9, 2);
}

function Update ()
{
}

function UpdateCharaAction (gameFrame : int)
{
	if (gameFrame <= 0) return;
	
	// 現在のstateを取得
	charaStateCtrl.CheckState(gameFrame);
	state = charaStateCtrl.GetState();
	elapsed = charaStateCtrl.GetElapsed();
	
	// 軸入力を取得
	inputAxis = charaInput.inputAxis;
	
	// state別の処理
	if      (state == CharaState.WALK)   Walk();
	else if (state == CharaState.DASH)   Dash();
	else if (state == CharaState.BARR)   Barr();
	
	//else if (state == CharaState.STUN)   Stun();
	//else if (state == CharaState.DOWN)   Down();
	
	else if (state == CharaState.WALK_M) Walk_M();
	//else if (state == CharaState.WALK_S) Walk_S();
	
	else if (state == CharaState.DASH_M) Dash_M();
	//else if (state == CharaState.DASH_S) Dash_S();
	
	//else if (state == CharaState.BARR_M) Barr_M();
	//else if (state == CharaState.BARR_S) Barr_S();
	
	//else if (state == CharaState.CLOSEATK_0) CloseAtk_0();
	else if (state == CharaState.CLOSEATK_1) CloseAtk_1();
	else if (state == CharaState.CLOSEATK_2) CloseAtk_2();
	else if (state == CharaState.CLOSEATK_3_1) CloseAtk_3_1();
	//else if (state == CharaState.CLOSEATK_3_2) CloseAtk_3_2();
	
	// 無敵状態処理
	if (charaStateCtrl.isGod > 0) God();
}

/***********************************************************
// 敵までの回転角の算出
myLookAt = Quaternion.LookRotation(enemyTransform.position - myTransform.position);

// 敵の方向を向かせる
myTransform.LookAt(enemyTransform);

// 進行方向(moveDirection)を向かせる
// myTransform.eulerAngles = moveDirection; なぜだかうまくいかない??
myTransform.rotation = Quaternion.LookRotation(moveDirection);
************************************************************/


/***********************************************************
	歩き・立ち
************************************************************/

// 歩き中
function Walk ()
{
	if (inputAxis.magnitude == 0) {
		animation.CrossFade("Idle", 0.1);
		//animation["Idle"].wrapMode = WrapMode.Loop;
	
	} else {
		animation.CrossFade("Walk", 0.1);
		// 移動
		moveDirection = inputAxis.normalized;
		MoveOnField(moveDirection * walkSpeed);
	}
	
	// 回頭
	myLookAt = Quaternion.LookRotation(enemyTransform.position -
	                                   myTransform.position);
	myTransform.rotation = Quaternion.Slerp(myTransform.rotation,
	                                        myLookAt,
	                                        walkLookAt);
}

function Walk_M ()
{
	// 連射間隔 10, 弾数 10
	if (elapsed > walkM_interval * walkM_bulletNum + 2) {
		Debug.Log("Walk_M[Assert] : Over Heat");
	
	} else if (elapsed % walkM_interval == 1) {
		audio.PlayOneShot(seCtrl.fireSE);
		GetComponent(CharaAShotMaker).makeBulletA();
	}
	
	Walk();
}


/***********************************************************
	ダッシュ

ダッシュキャンセル時間 : -dashCancelTime <= time <= 0
ダッシュ移動最大時間 : 0 < time <= dashTime
ダッシュ硬直時間 : dashTime < time <= dashTime + dashStunTime
************************************************************/

function Dash () {
	
	// ダッシュキャンセル
	if (elapsed == -dashCancelTime) {
		animation.CrossFade("Idle", 1);
	
		myTransform.LookAt(enemyTransform);
		return;
	
	} else if (elapsed <= 0) {
		animation.CrossFade("Idle", 1);
		return;
		
	// ダッシュ硬直終了
	} else if (elapsed == dashTime + dashStunTime) {
		myTransform.LookAt(enemyTransform);
		return;
		
	// ダッシュ硬直
	} else if (elapsed > dashTime) {
		effectDashStun();
		return;
	
	// ダッシュ開始
	} else if (elapsed == 1) {
		audio.PlayOneShot(seCtrl.dashSE);
		moveDirection = inputAxis.normalized;
	
	// ダッシュ中
	} else {
		// ダッシュターン
		if (charaInput.inputAccum[Btn.A] == 1) {
			moveDirection = inputAxis.normalized;
		
		// 旋回
		} else {
			moveDirection = (moveDirection + inputAxis * dashRot).normalized;
		}
	}
	
	// 移動
	animation.CrossFade("Run", 0.1);
	myTransform.rotation = Quaternion.LookRotation(moveDirection);
	MoveOnField(moveDirection * dashSpeed);
}

// ダッシュ硬直演出
function effectDashStun () {
	// 硬直開始
	if (elapsed == dashTime+1) {
		animation.CrossFade("Jump", 0);
	
	// 硬直中
	} else {
		// 演出として回転する
		myTransform.eulerAngles += Vector3(0, 0.02*(dashTime + dashStunTime - elapsed)*(dashTime + dashStunTime - elapsed), 0);
	}
}

// ダッシュM攻撃
function Dash_M ()
{
	if (elapsed > dashM_interval * dashM_bulletNum + 2) {
		Debug.Log("Dash_M[Assert] : Over Heat");
	
	} else if (elapsed % dashM_interval == 1) {
		audio.PlayOneShot(seCtrl.fireSE);
		GetComponent(CharaAShotMaker).makeBulletB();
	}
	
	// 移動
	animation.CrossFade("Run", 0.1);
	
	// 回頭
	myLookAt = Quaternion.LookRotation(enemyTransform.position -
	                                   myTransform.position);
	myTransform.rotation = Quaternion.Slerp(myTransform.rotation,
	                                        myLookAt,
	                                        dashM_LookAt);
	//moveDirection : Dash()から引き継ぐ
	MoveOnField(moveDirection * dashSpeed);
}

/***********************************************************
	バリア
************************************************************/

// バリア展開
function makeBarr () {
	if (barr != null) return;
	barr = Instantiate(barrPrfb,
                          Vector3(myTransform.position.x, 2.5, myTransform.position.z),
                          myTransform.rotation);
    barr.transform.parent = myTransform;
}

// バリア旋回
function Barr () {
	
	if (elapsed == 1) {
		makeBarr();
		return;
	}
	
	myLookAt = Quaternion.LookRotation(enemyTransform.position - myTransform.position);
	if (inputAxis.magnitude == 0) {
		// バリア中の回頭性能 = 歩き中の回頭性能
		myTransform.rotation = Quaternion.Slerp(myTransform.rotation,
	                                            myLookAt,
	                                            walkLookAt);
	} else {
		// 旋回(その場で向きを変える)
		myLookAt *= Quaternion.AngleAxis(inputAxis.x * barrMaxDeg, Vector3.up);
		myTransform.rotation = Quaternion.Slerp(myTransform.rotation,
		                                        myLookAt,
		                                        barrRot);
	}
}

/***********************************************************
	近接攻撃

ダッシュキャンセル時間 : -dashCancelTime <= time <= 0
ダッシュ移動最大時間 : 0 < time <= dashTime
ダッシュ硬直時間 : dashTime < time <= dashTime + dashStunTime
************************************************************/
function CloseAtk_0 ()
{
	
}

function CloseAtk_1 ()
{
	if (elapsed == 1) {
		animation["Attack3-1"].speed = 1.2;
		//animation.wrapMode = WrapMode.ClampForever;
		animation.Play("Attack3-1");
	}
}

function CloseAtk_2 ()
{
	if (elapsed == 1) {
		// 移動
		//moveDirection = inputAxis.normalized;
		MoveOnField(moveDirection * 3);
		
		animation["Attack3-2"].speed = 1.2;
		animation.Play("Attack3-2");
	}
}

function CloseAtk_3_1 ()
{
	if (elapsed == 1) {
		animation.Play("Attack2");
	}
}

function CloseAtk_3_2 ()
{
	
}


/*------------------------------------------------------------------------------
関数名	: God ()
説明	: 無敵状態(isGod > 0)の時、キャラを点滅させる
引数	: なし
戻り値	: なし
------------------------------------------------------------------------------*/
function God ()
{
	var isGod : int = charaStateCtrl.isGod;
	
	if (isGod <= 0) {
		Debug.LogError("God : isGod = " + isGod);
		return;
	}
	
	// 2フレーム間隔点滅
	// isGod = 1 の時に gameObject.renderer.enabled = true にすることに注意
	if (isGod % 3 <= 1) {
		gameObject.renderer.enabled = true;
	} else {
		gameObject.renderer.enabled = false;
	}
}

/***********************************************************
	移動可能判定
************************************************************/

// 移動先がフィールド内なら移動する
function MoveOnField (dest : Vector3) {
	if ((myTransform.position + dest).sqrMagnitude < fieldScale) {
		//myTransform.position += dest;
		controller.Move(dest);
	}
}

