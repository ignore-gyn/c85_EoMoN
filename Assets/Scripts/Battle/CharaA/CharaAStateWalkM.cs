using UnityEngine;
using System.Collections;

public class CharaAStateWalkM : MonoBehaviour, IState {

	//public static GameObject bulletAPrefab;

	private float walkSpeed;				// 1フレームに歩きで移動する距離
	private float walkLookAt;				// 歩き中の回頭性能

	private const int MaxBullet = 10;		// 弾数
	private const int ReloadTime = 80;		// 全弾射出後のリロード時間
	private const int ShotInterval = 10;	// 射出間隔
	
	private int lastShotFrame = 0;
	private int bulletCount = MaxBullet;
	

	// Cache of Components
	private CharaACtrl charaCtrl;
	
	private void Start () {
		animation["Walk"].speed = 1.0f;
		charaCtrl = GetComponent<CharaACtrl>();

		walkSpeed = 0.1f;
		walkLookAt = 0.03f;
	}
	
	public void Do () {
		OnWalkMShot();
	}
	
	private void OnWalkMShot () {
		if (charaCtrl.input.GetInputAxis().magnitude == 0) {
			animation.CrossFade("Idle", 0.1f);
		} else {
			animation.CrossFade("Walk", 0.1f);
			// 移動
			charaCtrl.moveDirection = charaCtrl.input.GetInputAxis().normalized;
			charaCtrl.MoveOnField(charaCtrl.moveDirection * walkSpeed);
		}

		// 回頭
		charaCtrl.myLookAt = Quaternion.LookRotation(charaCtrl.enemy.position -
		                                             transform.position);
		transform.rotation = Quaternion.Slerp(transform.rotation,
		                                      charaCtrl.myLookAt,
		                                      walkLookAt);

		if (charaCtrl.input.GetInputBtn(PlayerInput.Btn.M) == 0) {
			charaCtrl.ChangeState((int)CharaACtrl.State.WALK);
			return;
		} else {
			MakeBulletA();
		}
	}

	/// <summary>
	/// リロード中でなければ、射出間隔ShotInterval(Frame)ごとにBulletAを生成する。
	/// 弾を撃ちきると(bulletCountが0になる)リロードが発生し、
	/// ReloadTime(Frame)後に弾数がリセット、射出が可能になる。
	/// また、弾を撃ちきっていない状態でも、前回の射出からReloadTime(Frame)が経過している場合、
	/// 弾数がリセットされる。
	/// </summary>
	private void MakeBulletA () {
		int gameFrame = charaCtrl.battle.GameFrame;
		
		if (gameFrame - lastShotFrame > ReloadTime) {
			bulletCount = MaxBullet;
		}
		
		if ((gameFrame - lastShotFrame < ShotInterval) ||
		    (bulletCount <= 0)) {
			return;
		}
		
		GameObject bullet = Instantiate(Resources.Load("Prefabs/Bullet/BulletA"),
		                                new Vector3(transform.position.x, 0, transform.position.z),
		                                transform.rotation) as GameObject;
		// bullet.layer = 
		
		lastShotFrame = gameFrame;
		bulletCount--;
	}
}
