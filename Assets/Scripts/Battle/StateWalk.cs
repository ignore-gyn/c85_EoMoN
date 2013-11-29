using UnityEngine;
using System.Collections;

public class StateWalk : CharaAState, IState {
	
	float walkSpeed = 0.1f;				// 1フレームに歩きで移動する距離
	float walkLookAt = 0.03f;			// 歩き中の回頭性能

	private CharacterController controller;

	void AttachState() {
		stateComponents[(int)CharaState.WALK] = this;
	}

	void Start () {
		animation["Walk"].speed = 1.0f;
		controller = GetComponent<CharacterController>();
	}
		
	void CheckState() {
		if (Input.GetKey(KeyCode.A) == true) {
			ChangeState(CharaState.DASH);
			Debug.Log ("ChangeState WALK->DASH");
		}
	}
	
	public void Do () {
		Vector3 inputAxis = new Vector3(Input.GetAxis("Horizontal"),
		                    0,
		                    Input.GetAxis("Vertical"));



		if (inputAxis.magnitude == 0) {
			animation.CrossFade("Idle", 0.1f);
			//animation["Idle"].wrapMode = WrapMode.Loop;
		
		} else {
			animation.CrossFade("Walk", 0.1f);
			// 移動
			moveDirection = inputAxis.normalized;
			//MoveOnField(moveDirection * walkSpeed);
			controller.Move(moveDirection * walkSpeed);
		}

		CheckState ();
		// 回頭
		/*
		myLookAt = Quaternion.LookRotation(enemyTransform.position -
		                                   myTransform.position);
		myTransform.rotation = Quaternion.Slerp(myTransform.rotation,
		                                        myLookAt,
		                                        walkLookAt);
		*/
	}
}
