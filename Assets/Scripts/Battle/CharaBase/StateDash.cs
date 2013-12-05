using UnityEngine;
using System.Collections;

public class StateDash : MonoBehaviour, IState {

	protected float dashSpeed;
	protected float dashRot;

	protected int dashTime;
	protected int dashStunTime;
	protected int dashCancelTime;


	protected int dashCheckFrame = 0;	// ダッシュ開始時、ダッシュキャンセル時、ダッシュ硬直発生時に更新

	protected delegate void SubState();
	protected SubState subState;

	private int gameFrame;

	// Cache of Components
	private CharaCtrlBase charaCtrl;
	
	protected virtual void Start () {
		animation["Run"].speed = 1.0f;
		charaCtrl = GetComponent<CharaCtrlBase>();

		subState = OnDashStart;
	}

	public virtual void Do () {
		gameFrame = charaCtrl.battle.GameFrame;

		subState();
	}
	

	/// <summary>
	/// ダッシュ開始
	/// </summary>
	protected virtual void OnDashStart () {
		animation.CrossFade("Run", 0.1f);
		//audio.PlayOneShot(SEController.dashSE);

		dashCheckFrame = gameFrame;
		subState = OnDash;
	}

	/// <summary>
	/// ダッシュ中
	/// </summary>
	protected virtual void OnDash () {
		if (charaCtrl.input.GetInputBtn(PlayerInput.Btn.A) == 1) {
			// ダッシュキャンセル
			if (charaCtrl.input.GetInputAxis().magnitude == 0) {
				dashCheckFrame = gameFrame;
				subState = OnDashCancel;
				return;

			// ダッシュターン
			} else {
				charaCtrl.moveDirection = charaCtrl.input.GetInputAxis().normalized;
			}

		// 旋回
		} else {
			charaCtrl.moveDirection = (charaCtrl.moveDirection + charaCtrl.input.GetInputAxis() * dashRot).normalized;
		}

		transform.rotation = Quaternion.LookRotation(charaCtrl.moveDirection);
		charaCtrl.MoveOnField(charaCtrl.moveDirection * dashSpeed);

		// ダッシュ硬直判定
		if (gameFrame - dashCheckFrame > dashTime) {
			dashCheckFrame = gameFrame;
			subState = OnDashStun;
		}
	}

	/// <summary>
	/// ダッシュキャンセル
	/// </summary>
	protected virtual void OnDashCancel () {
		if (gameFrame - dashCheckFrame > dashCancelTime) {
			subState = OnDashEnd;
		}
		transform.LookAt(charaCtrl.enemy);
	}

	/// <summary>
	/// ダッシュ硬直
	/// </summary>
	protected virtual void OnDashStun () {
		// * todo: 硬直演出
		animation.CrossFade("Jump", 0.1f);
		transform.eulerAngles += new Vector3(0, 0.02f, 0);

		if (gameFrame - dashCheckFrame > dashStunTime) {
			subState = OnDashEnd;
		}
	}

	/// <summary>
	/// ダッシュ終了（WALKへ）
	/// </summary>
	protected virtual void OnDashEnd () {
		animation.CrossFade("Idle", 0.1f);

		subState = OnDashStart;
		charaCtrl.ChangeState((int)CharaCtrlBase.State.WALK);
	}
}
