using UnityEngine;
using System.Collections;

public class StateDash : CharaAState, IState {

	float dashSpeed = 0.33f;				// 1フレームに歩きで移動する距離
	float dashRot = 0.008f;			// 歩き中の回頭性能
	
	private CharacterController controller;

	delegate void SubState();
	SubState subState;

	void AttachState() {
		stateComponents[(int)CharaState.DASH] = this;
	}

	void Start () {
		animation["Run"].speed = 1.0f;
		controller = GetComponent<CharacterController>();
		subState = OnDash;
	}

	void CheckState() {
		Vector3 inputAxis = new Vector3(Input.GetAxis("Horizontal"),
		                            0,
		                            Input.GetAxis("Vertical"));

		
		if (Input.GetKey(KeyCode.A) == true  &&
			inputAxis.magnitude == 0) {
			subState = this.OnEndDash;
			Debug.Log ("ChangeState ondash->onenddash");
		}
		
	}
	
	public void Do () {
		CheckState();
		subState();
	}
	
	
	void OnDash () {
		// 移動
		animation.CrossFade("Run", 0.1f);
		transform.rotation = Quaternion.LookRotation(moveDirection);
		controller.Move(moveDirection * dashSpeed);
	}
	
	void OnEndDash () {
		//animation.CrossFade("Idle", 0.1);
		ChangeState(CharaState.WALK);
	}
}
