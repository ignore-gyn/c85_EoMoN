using UnityEngine;
using System.Collections;

public class CharaAStateDash : StateDash {
	
	protected override void Start () {
		base.Start();

		dashSpeed = 0.33f;
		dashRot = 0.008f;
		
		dashTime = 120;
		dashStunTime = 45;
		dashCancelTime = 2;
	}
}
