using UnityEngine;
using System.Collections;

public class StateWalk : MonoBehaviour, IState {
	
	protected float walkSpeed;			// 1フレームに歩きで移動する距離
	protected float walkLookAt;			// 歩き中の回頭性能

	// Cache of Components
	private CharaCtrlBase charaCtrl;

	protected virtual void Start () {
		animation["Walk"].speed = 1.0f;
		charaCtrl = GetComponent<CharaCtrlBase>();
	}
		
	public virtual void Do () {
		OnWalk();
	}

	protected virtual void OnWalk () {
		if (charaCtrl.input.GetInputBtn(PlayerInput.Btn.A) == 1 &&
		    charaCtrl.input.GetInputAxis().magnitude != 0) {
			charaCtrl.ChangeState((int)CharaCtrlBase.State.DASH);
			return;
		}
		
		if (charaCtrl.input.GetInputAxis().magnitude == 0) {
			animation.CrossFade("Idle", 0.1f);
			//animation["Idle"].wrapMode = WrapMode.Loop;
			
		} else {
			animation.CrossFade("Walk", 0.1f);
			// 移動
			charaCtrl.moveDirection = charaCtrl.input.GetInputAxis().normalized;
			charaCtrl.MoveOnField(charaCtrl.moveDirection * walkSpeed);
		}
		
		// 回頭
		charaCtrl.myLookAt = Quaternion.LookRotation(charaCtrl.enemy.position -
		                                   transform.position);
		transform.rotation = Quaternion.Slerp(transform.rotation,
		                                      charaCtrl.myLookAt,
		                                      walkLookAt);

	}
}
