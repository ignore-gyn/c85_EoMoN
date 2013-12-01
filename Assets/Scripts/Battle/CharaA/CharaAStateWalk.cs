using UnityEngine;
using System.Collections;

public class CharaAStateWalk : StateWalk {

	protected override void Start () {
		base.Start();

		walkSpeed = 0.1f;
		walkLookAt = 0.03f;
	}
}
