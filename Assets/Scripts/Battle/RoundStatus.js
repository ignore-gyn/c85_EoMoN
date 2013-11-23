#pragma strict

private var isGameStart : int = -1;		// -1:初期化中, 0:開始待ち, 1:ゲーム中

/*** ラウンドタイマー ***/
var roundLength : int = 5400;		// 1ラウンドの長さ(90sec)
var gameFrame : int = -3;			// 経過フレーム

/*** キャラオブジェクト ***/
private var tiger : GameObject;
private var bunny : GameObject;

/*** コンポーネント ***/
//private var punRoomManager : PunRoomManager;
private var publicData : PublicData;
private var photonView : PhotonView;
private var playerInput : PlayerInput;
private var tigerCharaAction : CharaAction;
private var bunnyCharaAction : CharaAction;

/*****************************************************************/

function Start ()
{
	// --- コンポーネントのキャッシュ ---
	publicData = GameObject.Find("DataKeeper").GetComponent(PublicData);
	photonView = GetComponent(PhotonView);
	PhotonNetwork.isMessageQueueRunning = true;
	
	playerInput = GetComponent(PlayerInput);
	
	// --- 使用キャラオブジェクト生成 ---
	createCharacter();
	
	// --- ゲーム開始通知(isGameStart = 0)処理 ---
	var flagSend : boolean = false;
	var timeout : int = 5;		// 5秒でタイムアウト(ゲーム開始通知再送信)
	
	while (isGameStart == -1) {
		yield;
		
		// 2キャラのオブジェクトがそろうまで待機
		if (tiger == null || bunny == null) continue;
		
		if (publicData.isOfflineMode) {
			isGameStart = 0;
			break;
		}
		
		// Guest:ホストに準備完了を通知
		if (!PhotonNetwork.isMasterClient && !flagSend) {
			photonView.RPC("SendGameStart", PhotonTargets.Others);
			flagSend = true;
		}
		
		// Host:ゲストの準備完了通知を受け取るまで待機
		// Guest:ホストのゲーム開始通知を受け取るまで待機
		
		timeout--;
		// ゲーム開始通知再送信
		if (timeout <= 0) {
			timeout = 5;
			flagSend = false;
		}
		
		continue;
	}
	
	// Host:ゲストにゲーム開始を通知
	if (!publicData.isOfflineMode && PhotonNetwork.isMasterClient) {
		photonView.RPC("SendGameStart", PhotonTargets.Others);
		// Guestへのゲーム開始通知の到達予測時間分待機
		// PING測定して適切な値を出す
		for (var i : int = 0; i <= 3; i++) {
			yield;
		}
	}
	
	isGameStart = 1;
	
	/***********************************************************
		ゲーム開始
	************************************************************/
	while (true) {
		// --- ゲーム経過時間カウントアップ ---
		yield UpdateGame();
		gameFrame++;
		
		// --- ゲーム終了判定 ---
		if (gameFrame >= roundLength) {
			EndGame();
			break;
		}
	}
}


/***********************************************************
	メインゲームフロー
************************************************************/
function UpdateGame ()
{
	yield playerInput.UpdatePlayerInput(gameFrame);
	
	if (playerInput.inputTigerFrame < gameFrame || 
		playerInput.inputBunnyFrame < gameFrame) {
		Debug.LogError("[UpdateGame] Unexpected InputFrame\n" +
			           "gameFrame = " + gameFrame +
			           ", TigerFrame = " + playerInput.inputTigerFrame +
		               ", BunnyFrame = " + playerInput.inputBunnyFrame);
		return;
	}
	
	if (gameFrame > 0) {
		tigerCharaAction.UpdateCharaAction(gameFrame);
		bunnyCharaAction.UpdateCharaAction(gameFrame);
	}
}

/***********************************************************
	ゲーム終了処理
************************************************************/
function EndGame ()
{
	BroadcastMessage("TimeUp",
			         SendMessageOptions.DontRequireReceiver);
	
	Debug.Log("TimeUp [gameFrame = " + gameFrame + "]\n" + 
	          "Tiger : inputFrame = " + GetComponent(PlayerInput).inputTigerFrame +
	                   ", position = (" + tiger.transform.position.x + ", " +
	                                      tiger.transform.position.y + ", " +
	                                      tiger.transform.position.z + ")" +
	                   ", state = " + tiger.GetComponent(CharaStateCtrl).stateBuf[0] +
	          "\nBunny : inputFrame = " + GetComponent(PlayerInput).inputBunnyFrame +
	                   ", position = (" + bunny.transform.position.x + ", " +
	                                      bunny.transform.position.y + ", " +
	                                      bunny.transform.position.z + ")" +
	                   ", state = " + bunny.GetComponent(CharaStateCtrl).stateBuf[0]);

	// GameObject.FindWithTag("MainCamera").SendMessage("TimeUp");
	//enabled = false;
}

/***********************************************************
	ゲーム開始時キャラ生成
************************************************************/
function createCharacter ()
{
	var charaInitX : int = 10;
	
	// 1Pキャラ
	tiger = Instantiate(publicData.playerChara[0],
	                    Vector3(-charaInitX, 0, 0),
	                    Quaternion.Euler(0, 90, 0));
	tiger.tag = "Tiger";
	tigerCharaAction = tiger.GetComponent(CharaAction);
	
	// 2Pキャラ
	bunny = Instantiate(publicData.playerChara[1],
	                    Vector3(charaInitX, 0, 0),
	                    Quaternion.Euler(0, -90, 0));
	bunny.tag = "Bunny";
	bunnyCharaAction = bunny.GetComponent(CharaAction);
	
	GetComponent(UICtrl).enabled = true;
}


/***********************************************************
	ゲーム開始通知
************************************************************/
@RPC
function SendGameStart ()
{
	isGameStart = 0;
}
