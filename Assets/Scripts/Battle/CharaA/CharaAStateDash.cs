using UnityEngine;
using System.Collections;

public class CharaAStateDash : StateDash {

	// Cache of Components
	private CharaACtrl charaCtrl;

	protected override void Start () {
		charaCtrl = GetComponent<CharaACtrl>();
		base.Start();

		dashSpeed = 0.33f;
		dashRot = 0.008f;
		
		dashTime = 120;
		dashStunTime = 45;
		dashCancelTime = 2;
	}

	protected override void OnDash () {
		if (charaCtrl.input.GetInputBtn(PlayerInput.Btn.M) == 1) {
			charaCtrl.ChangeState((int)CharaACtrl.State.DASH_M);
			return;
		}
		
		base.OnDash();
	}
}
