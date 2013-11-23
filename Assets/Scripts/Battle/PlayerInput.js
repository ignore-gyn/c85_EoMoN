#pragma strict

// *** 使用ボタン名 ***
enum Btn {
	A,
	M,
	S,
	F,
	G,
	COUNT,
};

var BTN_COUNT : int = Btn.COUNT;	// 使用ボタン数

/*** ボタン・軸入力バッファ(16(INPUT_BUFSIZE)フレーム分) ***/
var INPUT_BUFSIZE : int = 16;	// 過去何フレーム入力を保存するか/送信するか
/*
var inputFrame : int[];
var inputBtn : boolean[];
var inputAxis : Vector3[];
*/

// Frame : 入力済み(受信済み)フレームカウント(1から)
// Btn   : 各ボタン入力 (true or false)
// Axis  : 軸入力 (Vector3(Horizontal, 0, Vertical))

var inputTigerFrame : int;
var inputTigerBtn : boolean[];
var inputTigerAxis : Vector3[];

var inputBunnyFrame : int;
var inputBunnyBtn : boolean[];
var inputBunnyAxis : Vector3[];

private var gameFrame : int;

/*** ボタン・軸設定 ***/
var settingAxisHorizontal : String[];
var settingAxisVertical : String[];

// Host(ON), Guest(ON), 1P(OFF) ボタン設定
var settingTigerBtn = [KeyCode.A,
	                   KeyCode.S,
	                   KeyCode.D,
	                   KeyCode.W,
	                   KeyCode.E];

// 2P(OFF) ボタン設定
var settingBunnyBtn = [KeyCode.J,
	                   KeyCode.K,
	                   KeyCode.L,
	                   KeyCode.I,
	                   KeyCode.O];


/*** コンポーネント ***/
private var publicData : PublicData;
private var myIndex : int;
private var isOffline : boolean;

private var photonView : PhotonView;


/******************************************************************************/

function Awake ()
{
}

function Start ()
{
	// --- コンポーネントのキャッシュ ---
	publicData = GameObject.Find("DataKeeper").GetComponent(PublicData);
	myIndex = PublicData.myIndex;
	//otherIndex = (PublicData.myIndex) ? 0 : 1;
	isOffline = publicData.isOfflineMode;
	
	// --- Photon設定 ---
	photonView = GetComponent(PhotonView);
	// 同期インターバルの設定
	Debug.Log("Ping = " + PhotonNetwork.GetPing());
	PhotonNetwork.sendRate = 65;
	PhotonNetwork.sendRateOnSerialize = 65;
	
	
	// --- ボタン設定 ---
	settingAxisHorizontal = new String[2];
	settingAxisVertical = new String[2];

	// 各プレイヤーの入力ボタン・軸を設定
	settingAxisHorizontal[0] = "Horizontal";
	settingAxisVertical[0] = "Vertical";
	
	settingAxisHorizontal[1] = "Horizontal2";
	settingAxisVertical[1] = "Vertical2";
	
	
	// --- 入力バッファリセット ---
	inputTigerBtn = new boolean[BTN_COUNT * INPUT_BUFSIZE];
	inputTigerAxis = new Vector3[INPUT_BUFSIZE];
	
	inputBunnyBtn = new boolean[BTN_COUNT * INPUT_BUFSIZE];
	inputBunnyAxis = new Vector3[INPUT_BUFSIZE];
	
	inputTigerFrame = 0;
	inputBunnyFrame = 0;
	
	for (var i : int = 0; i < INPUT_BUFSIZE; i++) {
		for (var btnNum : int = 0; btnNum < BTN_COUNT; btnNum++) {
			inputTigerBtn[i * BTN_COUNT + btnNum] = false;
			inputBunnyBtn[i * BTN_COUNT + btnNum] = false;
		}
		inputTigerAxis[i] = Vector3.zero;
		inputBunnyAxis[i] = Vector3.zero;
	}
}

/*------------------------------------------------------------------------------
関数名	: UpdatePlayerInput (frame : int)
説明	: プレイヤーの入力を取得
引数	: frame = gameFrame
戻り値	: なし
------------------------------------------------------------------------------*/
function UpdatePlayerInput (frame : int)
{
	/*
	// gameFrameの更新
	if (gameFrame != frame+1) {
		// gameFrameが飛んでる
		Debug.Log("[UpdatePlayerInput]\n" +
			      "gameFrame = " + gameFrame +
			      ", prvFrame = " + frame);
		return;
	}
	*/
	
	gameFrame = frame;
	
	// Offline
	if (isOffline) {
		CheckTigerInput();
		CheckBunnyInput();
		
		if (gameFrame > inputTigerFrame ||
			gameFrame > inputBunnyFrame) {
			Debug.Log("UpdatePlayerInput[Assert]: " +
				      "gameFrame = " + gameFrame +
				      ", TigerFrame = " + inputTigerFrame +
			          ", BunnyFrame = " + inputBunnyFrame);
		}
		return;
		
	// Online
	} else {
		// 自分の入力を取得 & 送信
		if (myIndex == 0) {
			CheckTigerInput();
		} else if (myIndex == 1) {
			CheckBunnyInput();
		}
		
		// どちらかの入力が遅れている場合の処理
		while (true) {
			if (gameFrame <= inputTigerFrame &&
			    gameFrame <= inputBunnyFrame) {
				return;
			}
			
			yield;		// 相手の入力受信待ち
			
			// 自分の入力フレームが遅れている場合
			if (myIndex == 0) {
				if (gameFrame > inputTigerFrame) {
					CheckTigerInput();
				}
			} else if (myIndex == 1) {
				if (gameFrame > inputBunnyFrame) {
					CheckBunnyInput();
				}
			}
			
			// 入力を待ちすぎて、どちらかの入力が消失(復帰不可能)
			// 相手の入力待ち：自分の入力を取得しないので発生しないはず
			// 自分の入力待ち：相手の入力を受信しすぎてしまう可能性がある
			//  (自分の入力を待つという状況が発生する原因が分からないが)
			if (inputTigerFrame >= gameFrame + INPUT_BUFSIZE || 
				inputBunnyFrame >= gameFrame + INPUT_BUFSIZE) {
				Debug.Log("UpdatePlayerInput[Fatal]: Over Buffer\n" +
				          "gameFrame = " + gameFrame +
				          ", TigerFrame = " + inputTigerFrame +
			              ", BunnyFrame = " + inputBunnyFrame);
				return;
			}
		}
	}
}


// Host(ON), 1P(OFF):入力を調べる(ON/OFFのみ)
function CheckTigerInput ()
{
	var btnNum : int;
	var i : int;
	
	if (!isOffline && myIndex == 1) return;
	
	// 入力時のフレームカウント更新
	inputTigerFrame++;
	
	/*
	// ボタン入力バッファのシフト
	for (i = BTN_COUNT * (INPUT_BUFSIZE-1); i >= BTN_COUNT; i--) {
		inputTigerBtn[i] = inputTigerBtn[i-BTN_COUNT];
	}
	
	// ボタンの入力を調べる
	for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
		if (Input.GetKey(settingTigerBtn[btnNum])) {
			inputTigerBtn[btnNum] = true;
		} else {
			inputTigerBtn[btnNum] = false;
		}
	}
	
	// 軸入力バッファのシフト
	for (i = INPUT_BUFSIZE-1; i >= 1; i--) {
		inputTigerAxis[i] = inputTigerAxis[i-1];
	}
	
	// 軸の入力を調べる
	inputTigerAxis[0] = Vector3(Input.GetAxis(settingAxisHorizontal[0]),
		                        0,
		                        Input.GetAxis(settingAxisVertical[0]));
	*/
	
	
	i = inputTigerFrame % INPUT_BUFSIZE;
	
	// ボタンの入力を調べる
	for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
		if (Input.GetKey(settingTigerBtn[btnNum])) {
			inputTigerBtn[i * BTN_COUNT + btnNum] = true;
		} else {
			inputTigerBtn[i * BTN_COUNT + btnNum] = false;
		}
	}
	
	// 軸の入力を調べる
	inputTigerAxis[i] = Vector3(Input.GetAxis(settingAxisHorizontal[0]),
		                        0,
		                        Input.GetAxis(settingAxisVertical[0]));
	
	// Host：ゲストに入力情報を送信
	if (!isOffline) {
		photonView.RPC("SendHostInputRPC", PhotonTargets.All,
		               inputTigerFrame, inputTigerBtn, inputTigerAxis);
	}
}

// Guest(ON), 2P(OFF):入力を調べる(ON/OFFのみ)
function CheckBunnyInput ()
{
	var btnNum : int;
	var i : int;
	
	if (!isOffline && myIndex == 0) return;
	
	// 入力時のフレームカウント更新
	inputBunnyFrame++;
	
	/*
	// ボタン入力バッファのシフト
	for (i = BTN_COUNT * (INPUT_BUFSIZE-1); i >= BTN_COUNT; i--) {
		inputBunnyBtn[i] = inputBunnyBtn[i-BTN_COUNT];
	}
	
	// ボタンの入力を調べる
	if (isOffline) {
		for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
			if (Input.GetKey(settingBunnyBtn[btnNum])) {
				inputBunnyBtn[btnNum] = true;
			} else {
				inputBunnyBtn[btnNum] = false;
			}
		}
	} else {
		for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
			if (Input.GetKey(settingTigerBtn[btnNum])) {
				inputBunnyBtn[btnNum] = true;
			} else {
				inputBunnyBtn[btnNum] = false;
			}
		}
	}
	
	// 軸入力バッファのシフト
	for (i = INPUT_BUFSIZE-1; i >= 1; i--) {
		inputBunnyAxis[i] = inputBunnyAxis[i-1];
	}
	
	// 軸の入力を調べる
	i = (isOffline) ? 1 : 0;
	inputBunnyAxis[0] = Vector3(Input.GetAxis(settingAxisHorizontal[i]),
		                        0,
		                        Input.GetAxis(settingAxisVertical[i]));
	*/
	
	i = inputBunnyFrame % INPUT_BUFSIZE;
	// ボタンの入力を調べる
	if (isOffline) {
		for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
			if (Input.GetKey(settingBunnyBtn[btnNum])) {
				inputBunnyBtn[i * BTN_COUNT + btnNum] = true;
			} else {
				inputBunnyBtn[i * BTN_COUNT + btnNum] = false;
			}
		}
	} else {
		for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
			if (Input.GetKey(settingTigerBtn[btnNum])) {
				inputBunnyBtn[i * BTN_COUNT + btnNum] = true;
			} else {
				inputBunnyBtn[i * BTN_COUNT + btnNum] = false;
			}
		}
	}
	
	// 軸の入力を調べる
	btnNum = (isOffline) ? 1 : 0;
	inputBunnyAxis[i] = Vector3(Input.GetAxis(settingAxisHorizontal[btnNum]),
		                        0,
		                        Input.GetAxis(settingAxisVertical[btnNum]));
	
	// Guest：ホストに入力情報を送信
	if (!isOffline) {
		photonView.RPC("SendGuestInputRPC", PhotonTargets.All,
		               inputBunnyFrame, inputBunnyBtn, inputBunnyAxis);
	}
}

@RPC
// Guest：入力過去10フレーム分をホストに送る
function SendGuestInputRPC (inputFrame : int,
	                        inputBtn : boolean[], inputAxis : Vector3[])
{
// 5 + (5+1*80) + (5+12*16) = 287

	var i : int;

	// 古いフレームの入力の場合または
	// 現在のgameFrameの入力を上書きしてしまう場合は送受信しない
	if (inputBunnyFrame >= inputFrame ||
	    inputFrame - gameFrame >= INPUT_BUFSIZE) {
		return;
	}
	
	// ボタン入力バッファ更新
	for (i = 0; i < BTN_COUNT * INPUT_BUFSIZE; i++) {
		inputBunnyBtn[i] = inputBtn[i];
	}
	
	// 軸入力バッファ更新
	for (i = 0; i < INPUT_BUFSIZE; i++) {
		inputBunnyAxis[i] = inputAxis[i];
	}
	
	// 入力時のフレームカウント更新
	inputBunnyFrame = inputFrame;
}

@RPC
// Host：入力過去10フレーム分をゲストに送る
function SendHostInputRPC (inputFrame : int,
	                       inputBtn : boolean[], inputAxis : Vector3[])
{
	var i : int;

	// 古いフレームの入力の場合または
	// 現在のgameFrameの入力を上書きしてしまう場合は送受信しない
	if (inputTigerFrame >= inputFrame ||
	    inputFrame - gameFrame >= INPUT_BUFSIZE) {
		return;
	}
	
	// ボタン入力バッファ更新
	for (i = 0; i < BTN_COUNT * INPUT_BUFSIZE; i++) {
		inputTigerBtn[i] = inputBtn[i];
	}
	
	// 軸入力バッファ更新
	for (i = 0; i < INPUT_BUFSIZE; i++) {
		inputTigerAxis[i] = inputAxis[i];
	}
	
	// 入力時のフレームカウント更新
	inputTigerFrame = inputFrame;
}
