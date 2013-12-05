using UnityEngine;
using System.Collections;

public interface IState {
	void Do();
}

public abstract class CharaCtrlBase : MonoBehaviour {
	public enum State {
		//IDLE,			// 立ち
		WALK,			// 立ち・歩き
		DASH,			// ダッシュ
		BARRIER,		// バリア
		
		STUN,			// 硬直
		DOWN,			// ダウン
		//GOD,			// 無敵
	}

	protected IState[] stateComponents;
	protected IState currentState;

	// Character Parameter
	public Vector3 moveDirection;	// 進行方向
	public Quaternion myLookAt;		// 向き
	
	// Cache of Components
	public BattleController battle;
	public CharacterController controller;
	public CharaInput input;
	public Transform enemy;
	private float fieldScale;
	
	protected virtual void Start () {
		CacheComponents();
		RegisterState();
		
		ChangeState((int)State.WALK);
	}

	/// <summary>
	/// Stateとスクリプトの登録
	/// </summary>
	protected abstract void RegisterState ();
	
	/// <summary>
	/// コンポーネントのキャッシュ
	/// </summary>
	protected virtual void CacheComponents () {
		battle = GameObject.Find("Root").GetComponent<BattleController>();
		controller = GetComponent<CharacterController>();
		input = GetComponent<CharaInput>();
		if (gameObject.tag == "player1") {
			enemy = GameObject.FindWithTag("player2").transform;
		} else {
			enemy = GameObject.FindWithTag("player1").transform;
		}
		fieldScale = Mathf.Pow(GameObject.Find("Ground").transform.localScale.x * 0.5f * 0.9f, 2);
	}

	/// <summary>
	/// 毎gameFrameごとのキャラ入力バッファの更新とState別の振る舞い
	/// </summary>
	public virtual void UpdateDo () {
		input.SetInput();
		currentState.Do();
	}
	
	/// <summary>
	/// Stateの変更
	/// </summary>
	/// <param name="s">次のState</param>
	public virtual void ChangeState (int s) {
		currentState = stateComponents[s];
		if (currentState == null) {
			Debug.LogError(s + "script is not registered");
		}
	}
	
	/// <summary>
	/// キャラの移動可否判定（フィールドから飛び出さないか）
	/// </summary>
	/// <param name="moveDistance">現在位置からの移動ベクトル</param>
	public void MoveOnField (Vector3 moveVector) {
		if ((transform.position + moveVector).sqrMagnitude < fieldScale) {
			controller.Move(moveVector);
		}
	}
}

