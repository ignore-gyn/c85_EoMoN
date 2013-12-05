using UnityEngine;
using System.Collections;

public class CharaACtrl : CharaCtrlBase {
	public new enum State {
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
	};
	
	protected override void Start () {
		base.Start();
	}

	/// <summary>
	/// 毎gameFrameごとのキャラ入力バッファの更新とState別の振る舞い
	/// </summary>
	public override void UpdateDo () {
		base.UpdateDo();
	}

	/// <summary>
	/// Stateとスクリプトの登録
	/// </summary>
	protected override void RegisterState () {
		stateComponents = new IState[(int)20];

		stateComponents[(int)State.WALK] = gameObject.AddComponent("CharaAStateWalk") as IState;
		stateComponents[(int)State.DASH] = gameObject.AddComponent("CharaAStateDash") as IState;
		stateComponents[(int)State.WALK_M] = gameObject.AddComponent("CharaAStateWalkM") as IState;
		stateComponents[(int)State.DASH_M] = gameObject.AddComponent("CharaAStateDashM") as IState;
	}


	/// <summary>
	/// コンポーネントのキャッシュ
	/// </summary>
	protected override void CacheComponents () {
		base.CacheComponents();
	}
	
}
