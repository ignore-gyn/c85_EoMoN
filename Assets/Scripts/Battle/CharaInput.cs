using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class CharaInput : MonoBehaviour {

	private int[] inputAccum;		// ボタンが押され続けたフレーム数
	private Vector3 inputAxis;		// 軸入力

	private PlayerInput playerInput;

	private int btnCount;
	private int inputBufSize;

	private BattleController battleController;
	private PlayerInputController playerInputController;

	void Start () {
		battleController = GameObject.Find("Root").GetComponent<BattleController>();
		playerInputController = GameObject.Find("Root").GetComponent<PlayerInputController>();
		btnCount = 5;
		inputBufSize = 16;

		inputAccum = Enumerable.Repeat<int>(0, btnCount).ToArray();
		inputAxis = Vector3.zero;

//		if ((charaIndex == 1 && gameObject.tag == "player1") ||
//		    (charaIndex == 2 && gameObject.tag == "player2")) {
		if (gameObject.tag == "player1") {
			playerInput = playerInputController.myInput;
		} else {
			playerInput = playerInputController.otherInput;
		}
	}

	/// <summary>
	/// ボタン入力継続フレーム数の算出と軸入力の設定
	/// 
	/// </summary>
	/// <param name="gameFrame">Game frame.</param>
	public void SetInput () {
		/*if (playerInput.inputFrame - gameFrame >= inputBufSize) {
			Debug.Log("GetInput: " + gameObject.tag +
			          "InputFrame = " + playerInput.inputFrame +
			          ", gameFrame = " + gameFrame);
			return;
		}*/

		int bufIndex = battleController.GameFrame % inputBufSize;
		for (int btnNum = 0; btnNum < btnCount; btnNum++) {
			if (playerInput.GetInputBtn[bufIndex * btnCount + btnNum]) {
				inputAccum[btnNum]++;
			} else {
				inputAccum[btnNum] = 0;
			}
		}
		inputAxis = playerInput.GetInputAxis[bufIndex];
	}

	public int GetInputBtn(PlayerInput.Btn btn) {
		return inputAccum[(int)btn];
	}

	public Vector3 GetInputAxis() {
		return inputAxis;
	}
}
