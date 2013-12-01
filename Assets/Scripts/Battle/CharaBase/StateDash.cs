using UnityEngine;
using System.Collections;

public class StateDash : MonoBehaviour, IState {

	protected float dashSpeed;
	protected float dashRot;

	protected int dashTime;
	protected int dashStunTime;
	protected int dashCancelTime;


	protected int elapsed;
	protected int dashStartFrame;

	protected delegate void SubState();
	protected SubState subState;

	// Cache of Components
	private CharaCtrlBase charaCtrl;
	
	protected virtual void Start () {
		animation["Run"].speed = 1.0f;
		charaCtrl = GetComponent<CharaCtrlBase>();

		subState = OnStartDash;
	}

	public virtual void Do () {
		subState();
		elapsed++;
	}
	

	/// <summary>
	/// ダッシュ開始
	/// </summary>
	protected virtual void OnStartDash () {
		animation.CrossFade("Run", 0.1f);
		//audio.PlayOneShot(SEController.dashSE);

		elapsed = 0;
		subState = OnDash;
	}

	/// <summary>
	/// ダッシュ中
	/// </summary>
	protected virtual void OnDash () {
		if (charaCtrl.input.GetInputBtn(PlayerInput.Btn.A) == 1) {
			// ダッシュキャンセル
			if (charaCtrl.input.GetInputAxis().magnitude == 0) {
				elapsed = 0;
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
		if (elapsed > dashTime) {
			elapsed = 0;
			subState = OnDashStun;
		}
	}

	/// <summary>
	/// ダッシュキャンセル
	/// </summary>
	protected virtual void OnDashCancel () {
		if (elapsed > dashCancelTime) {
			subState = OnEndDash;
		}
	}

	/// <summary>
	/// ダッシュ硬直
	/// </summary>
	protected virtual void OnDashStun () {
		// * todo: 硬直演出
		animation.CrossFade("Jump", 0.1f);
		transform.eulerAngles += new Vector3(0, 0.02f, 0);

		if (elapsed > dashStunTime) {
			subState = OnEndDash;
		}
	}

	/// <summary>
	/// ダッシュ終了（WALKへ）
	/// </summary>
	protected virtual void OnEndDash () {
		animation.CrossFade("Idle", 0.1f);
		subState = OnDash;
		charaCtrl.ChangeState(CharaCtrlBase.State.WALK);
	}
}
