using UnityEngine;
using System.Collections;

public class CharaInput : MonoBehaviour {

	public int[] inputAccum;		// ボタンが押され続けたフレーム数
	public Vector3 inputAxis;		// 軸入力

	int BTN_COUNT;
	int INPUT_BUFSIZE;

	// Use this for initialization
	void Start () {
		playerInput = GameObject.Find("GameController").GetComponent(PlayerInput);
		BTN_COUNT = playerInput.Btn.SENTINEL;
		INPUT_BUFSIZE = playerInput.INPUT_BUFSIZE;

		inputAccum = new int[BTN_COUNT];
		for (int i = 0; i < BTN_COUNT; i++) {
			inputAccum[i] = 0;
		}
		inputAxis = Vector3.zero;
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	void GetInput (int gameFrame)
	{
		int btnNum;
		int bufIndex;

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
