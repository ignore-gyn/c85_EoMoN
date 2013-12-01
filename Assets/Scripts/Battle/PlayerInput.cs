using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

///<summary>
/// ゲームシーン中の以下の入力パラーメータを格納
/// Frame : 入力済み(受信済み)フレームカウント(1から)
/// Btn   : 各ボタン入力 (true or false)
/// Axis  : 軸入力 (Vector3(Horizontal, 0, Vertical))
/// </summary>
public class PlayerInput : MonoBehaviour {
	public enum Btn {
		A,
		M,
		S,
		F,
		G,
	};
	
	public const int INPUT_BUFSIZE = 16;	// 過去何フレーム入力を保存するか/送信するか
	public int btnCount = Enum.GetNames(typeof(Btn)).Length;

	private int inputFrame;
	private bool[] inputBtn;
	private Vector3[] inputAxis;
	
	private int frameIndex;

	void Awake () {
		inputFrame = 0;
		inputBtn = Enumerable.Repeat<bool>(false, btnCount * INPUT_BUFSIZE).ToArray();
		inputAxis = Enumerable.Repeat<Vector3>(Vector3.zero, INPUT_BUFSIZE).ToArray();
	}

	public int InputFrame {
		get { return inputFrame; }
		set { inputFrame = value; frameIndex = value % INPUT_BUFSIZE; }
	}

	public void SetInputBtn(Btn btn, bool input) {
		inputBtn[frameIndex * btnCount + (int)btn] = input;
	}
	public bool[] GetInputBtn {
		get { return inputBtn; }
	}

	public void SetInputAxis(Vector3 axis) {
		inputAxis[frameIndex] = axis;
	}
	public Vector3[] GetInputAxis {
		get { return inputAxis; }
	}
}
