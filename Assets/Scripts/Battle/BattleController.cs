using UnityEngine;
using System.Collections;

/// <summary>
/// BattleController
/// </summary>
public class BattleController : MonoBehaviour {
	void Start () {

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
	void createCharacter ()	{
		int charaInitPosX = 10;
		
		// 1Pキャラ
		playerOne = Instantiate(publicData.playerChara[0],
		                    Vector3(-charaInitPosX, 0, 0),
		                    Quaternion.Euler(0, 90, 0));
		playerOne.tag = "playerOne";
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