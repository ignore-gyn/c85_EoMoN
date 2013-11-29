using UnityEngine;
using System.Collections;

public class PlayerInput : MonoBehaviour {
	public enum Btn {
		A,
		M,
		S,
		F,
		G,
		SENTINEL,
	};
	
	// Host(ON), Guest(ON), 1P(OFF)
	KeyCode[] settingMyBtn = new KeyCode[KeyCode.A,
	                                          KeyCode.S,
	                                          KeyCode.D,
	                                          KeyCode.W,
	                                          KeyCode.E];

	string settingMyAxisHorizontal = "Horizontal";
	string settingMyAxisVertical = "Vertical";

	/*// 2P(OFF) ボタン設定
	KeyCode[] settingOtherBtn = new KeyCode[KeyCode.J,
	                                          KeyCode.K,
	                                          KeyCode.L,
	                                          KeyCode.I,
	                                          KeyCode.O];

	string settingOtherAxisHorizontal = "Horizontal2";
	string settingOtherAxisVertical = "Vertical2";
	*/


	/*** ボタン・軸入力バッファ(16(INPUT_BUFSIZE)フレーム分) ***/
	const int INPUT_BUFSIZE = 16;	// 過去何フレーム入力を保存するか/送信するか

	// Frame : 入力済み(受信済み)フレームカウント(1から)
	// Btn   : 各ボタン入力 (true or false)
	// Axis  : 軸入力 (Vector3(Horizontal, 0, Vertical))
	
	public int inputMyFrame;
	public bool[] inputMyBtn;
	public Vector3[] inputMyAxis;
	
	public int inputOtherFrame;
	public bool[] inputOtherBtn;
	public Vector3[] inputOtherAxis;

	int gameFrame;

	/// <summary>
	/// 入力バッファの初期化
	/// </summary>
	void Start () {
		inputMyBtn = new bool[Btn.SENTINEL * INPUT_BUFSIZE];
		inputMyAxis = new Vector3[INPUT_BUFSIZE];
		
		inputOtherBtn = new bool[Btn.SENTINEL * INPUT_BUFSIZE];
		inputOtherAxis = new Vector3[INPUT_BUFSIZE];
		
		inputMyFrame = 0;
		inputOtherFrame = 0;
		

		for (int i = 0; i < Btn.SENTINEL * INPUT_BUFSIZE; i++) {
			inputMyBtn[i * Btn.SENTINEL + btnNum] = false;
			inputOtherBtn[i * Btn.SENTINEL + btnNum] = false;
		}

		for (int i = 0; i < INPUT_BUFSIZE; i++) {
			inputMyAxis[i] = Vector3.zero;
			inputOtherAxis[i] = Vector3.zero;
		}
	}
	
	/*//// <summary>
	/// ボタン・軸入力の取得
	/// </summary>
	void UpdatePlayerInput () {
	
	}*/

	/// <summary>
	/// ボタン・軸入力の取得
	/// </summary>
	void CheckInput () {
		int btnNum;
		int i = inputMyFrame % INPUT_BUFSIZE;

		for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
			if (Input.GetKey(settingMyBtn[btnNum])) {
				inputMyBtn[i * BTN_COUNT + btnNum] = true;
			} else {
				inputMyBtn[i * BTN_COUNT + btnNum] = false;
			}
		}

		inputMyAxis[i] = Vector3(Input.GetAxis(settingMyAxisHorizontal),
		                         0,
		                         Input.GetAxis(settingMyAxisVertical));
		
		/*// Host：ゲストに入力情報を送信
		if (!isOffline) {
			photonView.RPC("SendInputRPC", PhotonTargets.All,
			               inputMyFrame, inputMyBtn, inputMyAxis);
		}*/
	}

	/*/// <summary>
	/// Host：入力過去10フレーム分をゲストに送る
	/// </summary>
	@RPC
	void SendInputRPC (int inputFrame : int,
		               bool[] inputBtn, Vector3[] inputAxis)
	{
		int i;
		
		// 古いフレームの入力の場合または
		// 現在のgameFrameの入力を上書きしてしまう場合は送受信しない
		if (inputOtherFrame >= inputFrame ||
		    inputFrame - gameFrame >= INPUT_BUFSIZE) {
			return;
		}

		for (i = 0; i < BTN_COUNT * INPUT_BUFSIZE; i++) {
			inputOtherBtn[i] = inputBtn[i];
		}

		for (i = 0; i < INPUT_BUFSIZE; i++) {
			inputOtherAxis[i] = inputAxis[i];
		}

		inputOtherFrame = inputFrame;
	}*/
}
