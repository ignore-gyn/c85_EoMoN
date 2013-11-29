using UnityEngine;
using System.Collections;


/// <summary>
/// BattleController
/// ref:RoundStatus.js
/// </summary>
public class BattleController : MonoBehaviour {
	public GameObject prefabPlayer1;
	
	void Start () {
		CreateCharacter ();
	}

	void Update () {

	}

	void OnRoundStart () {

	}

	void OnRoundEnd () {

	}
	
	/// <summary>
	/// ゲーム開始時キャラ生成
	/// </summary>
	void CreateCharacter ()	{
		int charaInitPosX = 10;
		GameObject player1;

		// 1Pキャラ
		player1 = Instantiate(prefabPlayer1,
		                      new Vector3(-charaInitPosX, 0, 0),
		                      Quaternion.Euler(0, 90, 0)) as GameObject;
		player1.transform.parent = transform;
		player1.tag = "player1";
		
		//playerOneCharaAction = onePlayer.GetComponent(CharaAction);
		
		// 2Pキャラ
		/*playerTwo = Instantiate(publicData.playerChara[1],
		                    Vector3(charaInitPosX, 0, 0),
		                    Quaternion.Euler(0, -90, 0));
		playerTwo.tag = "playerTwo";*/
		//playerTwoCharaAction = playerTwo.GetComponent(CharaAction);
		
		//GetComponent(UICtrl).enabled = true;
	}
}