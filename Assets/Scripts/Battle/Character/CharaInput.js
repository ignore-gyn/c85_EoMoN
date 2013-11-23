#pragma strict

/*** 入力情報 ***/
var inputAccum : int[];		// ボタンが押され続けたフレーム数
var inputAxis : Vector3;	// 軸入力

/*** スクリプトコンポーネント ***/
private var charaIndex : int;		// 0 : 1P, 1 : 2P

private var playerInput : PlayerInput;
private var playerInputFrame : int;
private var playerInputBtn : boolean[];
private var playerInputAxis : Vector3[];

// PlayerInputで宣言
private var BTN_COUNT : int;
private var INPUT_BUFSIZE : int;

/******************************************************************************/

function Awake ()
{
}

function Start ()
{
	playerInput = GameObject.Find("GameController").GetComponent(PlayerInput);
	BTN_COUNT = playerInput.BTN_COUNT;
	INPUT_BUFSIZE = playerInput.INPUT_BUFSIZE;
	
	charaIndex = (gameObject.tag == "Tiger") ? 0 : 1;
	
	// ボタン入力情報の0リセット
	inputAccum = new int[BTN_COUNT];
	for (var btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
		inputAccum[btnNum] = 0;
	}
	inputAxis = Vector3.zero;
}

function Update ()
{
}

/*------------------------------------------------------------------------------
関数名	: GetInput (gameFrame : int)
説明	: PlayerInputから各キャラのボタン入力継続フレーム数(inputAccum)、		  軸入力(inputAxis)を取得
引数	: gameFrame
戻り値	: なし
------------------------------------------------------------------------------*/
function GetInput (gameFrame : int)
{
	var btnNum : int;
	var bufIndex : int;
	//var frameIndex : int;
	
	/*
	if (charaIndex == 0) {
		playerInputFrame = playerInput.inputTigerFrame;
	} else if (charaIndex == 1) {
		playerInputFrame = playerInput.inputBunnyFrame;
	}
	
	frameIndex = playerInputFrame - gameFrame;
	if (frameIndex >= INPUT_BUFSIZE) {
		Debug.Log("GetInput[Assert]: " + gameObject.tag +
			      "InputFrame = " + playerInputFrame +
			      ", gameFrame = " + gameFrame);
		return;
	}
	
	if (charaIndex == 0) {
		playerInputBtn = playerInput.inputTigerBtn;
		playerInputAxis = playerInput.inputTigerAxis;
	} else if (charaIndex == 1) {
		playerInputBtn = playerInput.inputBunnyBtn;
		playerInputAxis = playerInput.inputBunnyAxis;
	}
	
	for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
		if (playerInputBtn[frameIndex * BTN_COUNT + btnNum]) {
			inputAccum[btnNum]++;
		} else {
			inputAccum[btnNum] = 0;
		}
	}
	inputAxis = playerInputAxis[frameIndex];
	*/
	
	// --- PlayerInputバッファから該当キャラへの入力バッファを取得 ---
	if (charaIndex == 0) {
		playerInputFrame = playerInput.inputTigerFrame;
		playerInputBtn = playerInput.inputTigerBtn;
		playerInputAxis = playerInput.inputTigerAxis;
	} else if (charaIndex == 1) {
		playerInputFrame = playerInput.inputBunnyFrame;
		playerInputBtn = playerInput.inputBunnyBtn;
		playerInputAxis = playerInput.inputBunnyAxis;
	}
	
	if (playerInputFrame - gameFrame >= INPUT_BUFSIZE) {
		Debug.Log("GetInput[Assert]: " + gameObject.tag +
			      "InputFrame = " + playerInputFrame +
			      ", gameFrame = " + gameFrame);
		return;
	}
	
	// --- ボタン入力継続フレーム数の算出と軸入力の取得 ---
	bufIndex = playerInputFrame % INPUT_BUFSIZE;
	for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
		if (playerInputBtn[bufIndex * BTN_COUNT + btnNum]) {
			inputAccum[btnNum]++;
		} else {
			inputAccum[btnNum] = 0;
		}
	}
	inputAxis = playerInputAxis[bufIndex];
}
