using UnityEngine;
using System.Collections;

public class CharaAStateDashM : MonoBehaviour, IState {

	//public static GameObject bulletAPrefab;

	private float dashSpeed = 0.33f;
	private float dashRot = 0.008f;
	
	private const int MaxBullet = 10;		// 弾数
	private const int ReloadTime = 80;		// 全弾射出後のリロード時間
	private const int ShotInterval = 5;		// 射出間隔
	
	private int lastShotFrame = 0;
	private int bulletCount = MaxBullet;
	

	// Cache of Components
	private CharaACtrl charaCtrl;
	
	private void Start () {
		animation["Walk"].speed = 1.0f;
		charaCtrl = GetComponent<CharaACtrl>();

		dashSpeed = 0.33f;
		dashRot = 0.008f;
	}

	public void Do () {
		OnDashMShot();
	}

	/// <summary>
	/// 全弾射出しきるまでダッシュ状態を保持する。
	/// ただし、射出中はダッシュキャンセル、ダッシュターン、旋回はできない。
	///	射出完了後にDASH Stateに移行するが、このときdashTimeが経過していた場合、
	///	ダッシュ硬直が発生する。
	/// todo:弾のリロード情報などを共通化する場合、パラメータを外に出す。
	/// </summary>
	protected virtual void OnDashMShot () {
		transform.rotation = Quaternion.LookRotation(charaCtrl.moveDirection);
		charaCtrl.MoveOnField(charaCtrl.moveDirection * dashSpeed);

		MakeBulletA();
		if (bulletCount <= 0) {
			charaCtrl.ChangeState((int)CharaACtrl.State.DASH);
		}
	}

	private void MakeBulletA () {
		int gameFrame = charaCtrl.battle.GameFrame;
		
		if (gameFrame - lastShotFrame > ReloadTime) {
			bulletCount = MaxBullet;
		}
		
		if ((gameFrame - lastShotFrame < ShotInterval) ||
		    (bulletCount <= 0)) {
			return;
		}
		
		GameObject bullet = Instantiate(Resources.Load("Prefabs/Bullet/BulletDashA"),
		                                new Vector3(transform.position.x, 0, transform.position.z),
		                                transform.rotation) as GameObject;
		
		// bullet.layer = 
		
		lastShotFrame = gameFrame;
		bulletCount--;
	}
}
