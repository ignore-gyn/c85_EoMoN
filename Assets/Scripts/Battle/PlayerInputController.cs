using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class PlayerInputController : MonoBehaviour {

	// Host(ON), Guest(ON), 1P(OFF)
	Dictionary<PlayerInput.Btn, KeyCode> settingMyBtn = new Dictionary<PlayerInput.Btn, KeyCode>()
	{
		{PlayerInput.Btn.A, KeyCode.A},
		{PlayerInput.Btn.M, KeyCode.S},
		{PlayerInput.Btn.S, KeyCode.D},
		{PlayerInput.Btn.F, KeyCode.W},
		{PlayerInput.Btn.G, KeyCode.E}
	};

	string settingMyAxisHorizontal = "Horizontal";
	string settingMyAxisVertical = "Vertical";

	// 2P(OFF)
	Dictionary<PlayerInput.Btn, KeyCode> settingOtherBtn = new Dictionary<PlayerInput.Btn, KeyCode>()
	{
		{PlayerInput.Btn.A, KeyCode.J},
		{PlayerInput.Btn.M, KeyCode.K},
		{PlayerInput.Btn.S, KeyCode.L},
		{PlayerInput.Btn.F, KeyCode.I},
		{PlayerInput.Btn.G, KeyCode.O}
	};

	string settingOtherAxisHorizontal = "Horizontal2";
	string settingOtherAxisVertical = "Vertical2";

	public PlayerInput myInput;
	public PlayerInput otherInput;

	BattleController battleController;

	void Awake () {
		battleController = GetComponent<BattleController>();
		myInput = gameObject.AddComponent("PlayerInput") as PlayerInput;
		otherInput = gameObject.AddComponent("PlayerInput") as PlayerInput;
	}
	
	//// <summary>
	/// 入力バッファの更新、更新可否判定（受信フレームの確認）
	/// </summary>
	public bool UpdatePlayerInput () {
		/*if ((otherInput.InputFrame < battleController.GameFrame) ||
		    (myInput.InputFrame < battleController.GameFrame)) {
			return false;
		}*/

		CheckMyInput();
		CheckOtherInput();
		return true;
	}
		
	/// <summary>
	/// ボタン・軸入力の取得
	/// </summary>
	void CheckMyInput () {
		myInput.InputFrame = battleController.GameFrame;
		foreach (PlayerInput.Btn btn in settingMyBtn.Keys) {
			myInput.SetInputBtn(btn, Input.GetKey(settingMyBtn[btn]));
		}
		
		myInput.SetInputAxis(new Vector3(Input.GetAxis(settingMyAxisHorizontal),
		                                 0,
		                                 Input.GetAxis(settingMyAxisVertical)));

		/*// Host：ゲストに入力情報を送信
		if (!isOffline) {
			photonView.RPC("SendInputRPC", PhotonTargets.All,
			               myInput.inputFrame, myInput.inputBtn, myInput.inputAxis);
		}*/
	}

	/// <summary>
	/// 2P側のボタン・軸入力の取得
	/// * オンライン対応までの暫定実装
	/// </summary>
	void CheckOtherInput () {
		otherInput.InputFrame = battleController.GameFrame;
		foreach (PlayerInput.Btn btn in settingOtherBtn.Keys) {
			otherInput.SetInputBtn(btn, Input.GetKey(settingOtherBtn[btn]));
		}
		
		otherInput.SetInputAxis(new Vector3(Input.GetAxis(settingOtherAxisHorizontal),
		                                    0,
		                                    Input.GetAxis(settingOtherAxisVertical)));
		
		/*// Guest：ホストに入力情報を送信
		if (!isOffline) {
			photonView.RPC("SendInputRPC", PhotonTargets.All,
			               otherInput.inputFrame, otherInput.inputBtn, otherInput.inputAxis);
		}*/
	}

	/*/// <summary>
	/// Host：入力過去10フレーム分をゲストに送る
	/// </summary>
	[RPC]
	void SendInputRPC (int inputFrame,
		                  bool[] inputBtn, Vector3[] inputAxis) {
		int i;
		
		inputOtherFrame = inputFrame;
		
		// 古いフレームの入力の場合または
		// 現在のgameFrameの入力を上書きしてしまう場合は送受信しない
		if (otherInput.inputFrame >= inputFrame ||
		    inputFrame - gameFrame >= INPUT_BUFSIZE) {
			return;
		}
		
		//for (i = 0; i < btnCount * INPUT_BUFSIZE; i++) {
		//	inputOtherBtn[i] = input.inputBtn[i];
		//}
		input.inputBtn.CopyTo(otherInput.inputBtn);
		
		//for (i = 0; i < INPUT_BUFSIZE; i++) {
		//	inputOtherAxis[i] = inputAxis[i];
		//}
		input.inputAxis.CopyTo(otherInput.inputAxis);
	}*/
}
