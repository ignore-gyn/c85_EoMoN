using UnityEngine;
using System.Collections;

public class CharaAStateWalk : StateWalk {

	// Cache of Components
	private CharaACtrl charaCtrl;

	protected override void Start () {
		base.Start();
		charaCtrl = GetComponent<CharaACtrl>();

		walkSpeed = 0.1f;
		walkLookAt = 0.03f;
	}

	protected override void OnWalk () {
		if (charaCtrl.input.GetInputBtn(PlayerInput.Btn.M) == 1) {
			charaCtrl.ChangeState((int)CharaACtrl.State.WALK_M);
			return;
		}

		base.OnWalk();
	}
}
