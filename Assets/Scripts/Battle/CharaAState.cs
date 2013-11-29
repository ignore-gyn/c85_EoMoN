using UnityEngine;
using System.Collections;

public interface IState {
	void Do();
}

public class CharaAState : MonoBehaviour {
	protected Vector3 moveDirection;		// 進行方向
	protected Quaternion myLookAt;		// 向き

	protected enum CharaState {
		//IDLE,			// 立ち
		WALK,			// 立ち・歩き
		DASH,			// ダッシュ
		BARRIER,		// バリア
		
		STUN,			// 硬直
		DOWN,			// ダウン
		//GOD,			// 無敵
		
		// 攻撃
		WALK_M,
		WALK_S,
		
		DASH_M,
		DASH_S,
		
		BARRIER_M,
		BARRIER_S,
		
		// 近接攻撃
		CLOSEATTACK_0,
		CLOSEATTACK_1,
		CLOSEATTACK_2,
		CLOSEATTACK_3_1,
		CLOSEATTACK_3_2,

		// 特殊攻撃
		SKILL_A,
		SKILL_B,
		SKILL_C,

		COUNT
	};

	protected static IState[] stateComponents = new IState[(int)CharaState.COUNT];
	static IState state;

	protected void ChangeState (CharaState s) {
		state = stateComponents[(int)s];
		if (state == null) {
			Debug.LogError(s + "script is not registered");
		}
	}

	void Start () {
		SendMessage("AttachState", null, SendMessageOptions.DontRequireReceiver);
		ChangeState(CharaState.WALK);
	}
	
	void Update () {
		state.Do();
	}
}
