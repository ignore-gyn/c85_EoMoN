using UnityEngine;
using System.Collections;


/// <summary>
/// BattleController
/// ref:RoundStatus.js
/// </summary>
public class BattleController : MonoBehaviour {
	public GameObject prefabPlayer1;
	public GameObject prefabPlayer2;

	private int gameFrame = 0;

	private PlayerInputController playerInputController;
	private CharaACtrl player1Ctrl;
	private CharaACtrl player2Ctrl;

	void Start () {
		playerInputController = GetComponent<PlayerInputController>();
		CreateCharacter();
	}

	void Update () {
		if (!playerInputController.UpdatePlayerInput()) return;
		gameFrame++;

		player1Ctrl.UpdateDo();
		player2Ctrl.UpdateDo();
	}

	void OnRoundStart () {

	}

	void OnRoundEnd () {

	}
	
	/// <summary>
	/// ゲーム開始時キャラ生成、MainCameraを1Pキャラに追随させる
	/// </summary>
	void CreateCharacter ()	{
		int charaInitPosX = 10;

		// 1Pキャラ
		GameObject player1 = Instantiate(prefabPlayer1,
		                  			     new Vector3(-charaInitPosX, 0, 0),
		                      			 Quaternion.Euler(0, 90, 0)) as GameObject;
		player1.transform.parent = transform;
		player1.tag = "player1";
		
		player1Ctrl = player1.GetComponent<CharaACtrl>();

		// MainCamera
		GameObject mainCamera = GameObject.FindWithTag("MainCamera");
		mainCamera.transform.parent = player1.transform;
		mainCamera.AddComponent("CameraController");

		// 2Pキャラ
		GameObject player2 = Instantiate(prefabPlayer2,
		                      			 new Vector3(charaInitPosX, 0, 0),
		                      			 Quaternion.Euler(0, -90, 0)) as GameObject;
		player2.transform.parent = transform;
		player2.tag = "player2";
		
		player2Ctrl = player2.GetComponent<CharaACtrl>();

		//GetComponent(UICtrl).enabled = true;
	}

	public int GameFrame {
		get { return gameFrame; }
	}
}