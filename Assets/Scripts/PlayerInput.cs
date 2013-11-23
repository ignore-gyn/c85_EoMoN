using UnityEngine;
using System.Collections;

public class PlayerInput : MonoBehaviour {

	// �g�p�{�^����
	enum Btn {
		A,
		M,
		S,
		F,
		G,
		COUNT,
	};
	
	
	int BTN_COUNT = Btn.COUNT;	// �g�p�{�^����

	/*** �{�^���E�����̓o�b�t�@ ***/
	const int INPUT_BUFSIZE = 16;	// �ߋ����t���[�����͂�ۑ����邩/���M���邩
	
	// Frame : ���͍ς�(��M�ς�)�t���[���J�E���g(1����)
	// Btn   : �e�{�^������ (true or false)
	// Axis  : ������ (Vector3(Horizontal, 0, Vertical))

	var inputTigerFrame : int;
	var inputTigerBtn : boolean[];
	var inputTigerAxis : Vector3[];

	var inputBunnyFrame : int;
	var inputBunnyBtn : boolean[];
	var inputBunnyAxis : Vector3[];

	private var gameFrame : int;

	/*** �{�^���E���ݒ� ***/
	var settingAxisHorizontal : String[];
	var settingAxisVertical : String[];

	// Host(ON), Guest(ON), 1P(OFF) �{�^���ݒ�
	var settingTigerBtn = [KeyCode.A,
		                   KeyCode.S,
		                   KeyCode.D,
		                   KeyCode.W,
		                   KeyCode.E];

	// 2P(OFF) �{�^���ݒ�
	var settingBunnyBtn = [KeyCode.J,
		                   KeyCode.K,
		                   KeyCode.L,
		                   KeyCode.I,
		                   KeyCode.O];


	/*** �R���|�[�l���g ***/
	private var publicData : PublicData;
	private var myIndex : int;
	private var isOffline : boolean;

	private var photonView : PhotonView;


	/******************************************************************************/

	function Awake ()
	{
	}

	function Start ()
	{
		// --- �R���|�[�l���g�̃L���b�V�� ---
		publicData = GameObject.Find("DataKeeper").GetComponent(PublicData);
		myIndex = PublicData.myIndex;
		//otherIndex = (PublicData.myIndex) ? 0 : 1;
		isOffline = publicData.isOfflineMode;
		
		// --- Photon�ݒ� ---
		photonView = GetComponent(PhotonView);
		// �����C���^�[�o���̐ݒ�
		Debug.Log("Ping = " + PhotonNetwork.GetPing());
		PhotonNetwork.sendRate = 65;
		PhotonNetwork.sendRateOnSerialize = 65;
		
		
		// --- �{�^���ݒ� ---
		settingAxisHorizontal = new String[2];
		settingAxisVertical = new String[2];

		// �e�v���C���[�̓��̓{�^���E����ݒ�
		settingAxisHorizontal[0] = "Horizontal";
		settingAxisVertical[0] = "Vertical";
		
		settingAxisHorizontal[1] = "Horizontal2";
		settingAxisVertical[1] = "Vertical2";
		
		
		// --- ���̓o�b�t�@���Z�b�g ---
		inputTigerBtn = new boolean[BTN_COUNT * INPUT_BUFSIZE];
		inputTigerAxis = new Vector3[INPUT_BUFSIZE];
		
		inputBunnyBtn = new boolean[BTN_COUNT * INPUT_BUFSIZE];
		inputBunnyAxis = new Vector3[INPUT_BUFSIZE];
		
		inputTigerFrame = 0;
		inputBunnyFrame = 0;
		
		for (var i : int = 0; i < INPUT_BUFSIZE; i++) {
			for (var btnNum : int = 0; btnNum < BTN_COUNT; btnNum++) {
				inputTigerBtn[i * BTN_COUNT + btnNum] = false;
				inputBunnyBtn[i * BTN_COUNT + btnNum] = false;
			}
			inputTigerAxis[i] = Vector3.zero;
			inputBunnyAxis[i] = Vector3.zero;
		}
	}

	/*------------------------------------------------------------------------------
	�֐���	: UpdatePlayerInput (frame : int)
	����	: �v���C���[�̓��͂��擾
	����	: frame = gameFrame
	�߂�l	: �Ȃ�
	------------------------------------------------------------------------------*/
	function UpdatePlayerInput (frame : int)
	{
		/*
		// gameFrame�̍X�V
		if (gameFrame != frame+1) {
			// gameFrame�����ł�
			Debug.Log("[UpdatePlayerInput]\n" +
				      "gameFrame = " + gameFrame +
				      ", prvFrame = " + frame);
			return;
		}
		*/
		
		gameFrame = frame;
		
		// Offline
		if (isOffline) {
			CheckTigerInput();
			CheckBunnyInput();
			
			if (gameFrame > inputTigerFrame ||
				gameFrame > inputBunnyFrame) {
				Debug.Log("UpdatePlayerInput[Assert]: " +
					      "gameFrame = " + gameFrame +
					      ", TigerFrame = " + inputTigerFrame +
				          ", BunnyFrame = " + inputBunnyFrame);
			}
			return;
			
		// Online
		} else {
			// �����̓��͂��擾 & ���M
			if (myIndex == 0) {
				CheckTigerInput();
			} else if (myIndex == 1) {
				CheckBunnyInput();
			}
			
			// �ǂ��炩�̓��͂��x��Ă���ꍇ�̏���
			while (true) {
				if (gameFrame <= inputTigerFrame &&
				    gameFrame <= inputBunnyFrame) {
					return;
				}
				
				yield;		// ����̓��͎�M�҂�
				
				// �����̓��̓t���[�����x��Ă���ꍇ
				if (myIndex == 0) {
					if (gameFrame > inputTigerFrame) {
						CheckTigerInput();
					}
				} else if (myIndex == 1) {
					if (gameFrame > inputBunnyFrame) {
						CheckBunnyInput();
					}
				}
				
				// ���͂�҂������āA�ǂ��炩�̓��͂�����(���A�s�\)
				// ����̓��͑҂��F�����̓��͂��擾���Ȃ��̂Ŕ������Ȃ��͂�
				// �����̓��͑҂��F����̓��͂���M�������Ă��܂��\��������
				//  (�����̓��͂�҂Ƃ����󋵂��������錴����������Ȃ���)
				if (inputTigerFrame >= gameFrame + INPUT_BUFSIZE || 
					inputBunnyFrame >= gameFrame + INPUT_BUFSIZE) {
					Debug.Log("UpdatePlayerInput[Fatal]: Over Buffer\n" +
					          "gameFrame = " + gameFrame +
					          ", TigerFrame = " + inputTigerFrame +
				              ", BunnyFrame = " + inputBunnyFrame);
					return;
				}
			}
		}
	}


	// Host(ON), 1P(OFF):���͂𒲂ׂ�(ON/OFF�̂�)
	function CheckTigerInput ()
	{
		var btnNum : int;
		var i : int;
		
		if (!isOffline && myIndex == 1) return;
		
		// ���͎��̃t���[���J�E���g�X�V
		inputTigerFrame++;
		
		/*
		// �{�^�����̓o�b�t�@�̃V�t�g
		for (i = BTN_COUNT * (INPUT_BUFSIZE-1); i >= BTN_COUNT; i--) {
			inputTigerBtn[i] = inputTigerBtn[i-BTN_COUNT];
		}
		
		// �{�^���̓��͂𒲂ׂ�
		for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
			if (Input.GetKey(settingTigerBtn[btnNum])) {
				inputTigerBtn[btnNum] = true;
			} else {
				inputTigerBtn[btnNum] = false;
			}
		}
		
		// �����̓o�b�t�@�̃V�t�g
		for (i = INPUT_BUFSIZE-1; i >= 1; i--) {
			inputTigerAxis[i] = inputTigerAxis[i-1];
		}
		
		// ���̓��͂𒲂ׂ�
		inputTigerAxis[0] = Vector3(Input.GetAxis(settingAxisHorizontal[0]),
			                        0,
			                        Input.GetAxis(settingAxisVertical[0]));
		*/
		
		
		i = inputTigerFrame % INPUT_BUFSIZE;
		
		// �{�^���̓��͂𒲂ׂ�
		for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
			if (Input.GetKey(settingTigerBtn[btnNum])) {
				inputTigerBtn[i * BTN_COUNT + btnNum] = true;
			} else {
				inputTigerBtn[i * BTN_COUNT + btnNum] = false;
			}
		}
		
		// ���̓��͂𒲂ׂ�
		inputTigerAxis[i] = Vector3(Input.GetAxis(settingAxisHorizontal[0]),
			                        0,
			                        Input.GetAxis(settingAxisVertical[0]));
		
		// Host�F�Q�X�g�ɓ��͏��𑗐M
		if (!isOffline) {
			photonView.RPC("SendHostInputRPC", PhotonTargets.All,
			               inputTigerFrame, inputTigerBtn, inputTigerAxis);
		}
	}

	// Guest(ON), 2P(OFF):���͂𒲂ׂ�(ON/OFF�̂�)
	function CheckBunnyInput ()
	{
		var btnNum : int;
		var i : int;
		
		if (!isOffline && myIndex == 0) return;
		
		// ���͎��̃t���[���J�E���g�X�V
		inputBunnyFrame++;
		
		/*
		// �{�^�����̓o�b�t�@�̃V�t�g
		for (i = BTN_COUNT * (INPUT_BUFSIZE-1); i >= BTN_COUNT; i--) {
			inputBunnyBtn[i] = inputBunnyBtn[i-BTN_COUNT];
		}
		
		// �{�^���̓��͂𒲂ׂ�
		if (isOffline) {
			for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
				if (Input.GetKey(settingBunnyBtn[btnNum])) {
					inputBunnyBtn[btnNum] = true;
				} else {
					inputBunnyBtn[btnNum] = false;
				}
			}
		} else {
			for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
				if (Input.GetKey(settingTigerBtn[btnNum])) {
					inputBunnyBtn[btnNum] = true;
				} else {
					inputBunnyBtn[btnNum] = false;
				}
			}
		}
		
		// �����̓o�b�t�@�̃V�t�g
		for (i = INPUT_BUFSIZE-1; i >= 1; i--) {
			inputBunnyAxis[i] = inputBunnyAxis[i-1];
		}
		
		// ���̓��͂𒲂ׂ�
		i = (isOffline) ? 1 : 0;
		inputBunnyAxis[0] = Vector3(Input.GetAxis(settingAxisHorizontal[i]),
			                        0,
			                        Input.GetAxis(settingAxisVertical[i]));
		*/
		
		i = inputBunnyFrame % INPUT_BUFSIZE;
		// �{�^���̓��͂𒲂ׂ�
		if (isOffline) {
			for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
				if (Input.GetKey(settingBunnyBtn[btnNum])) {
					inputBunnyBtn[i * BTN_COUNT + btnNum] = true;
				} else {
					inputBunnyBtn[i * BTN_COUNT + btnNum] = false;
				}
			}
		} else {
			for (btnNum = 0; btnNum < BTN_COUNT; btnNum++) {
				if (Input.GetKey(settingTigerBtn[btnNum])) {
					inputBunnyBtn[i * BTN_COUNT + btnNum] = true;
				} else {
					inputBunnyBtn[i * BTN_COUNT + btnNum] = false;
				}
			}
		}
		
		// ���̓��͂𒲂ׂ�
		btnNum = (isOffline) ? 1 : 0;
		inputBunnyAxis[i] = Vector3(Input.GetAxis(settingAxisHorizontal[btnNum]),
			                        0,
			                        Input.GetAxis(settingAxisVertical[btnNum]));
		
		// Guest�F�z�X�g�ɓ��͏��𑗐M
		if (!isOffline) {
			photonView.RPC("SendGuestInputRPC", PhotonTargets.All,
			               inputBunnyFrame, inputBunnyBtn, inputBunnyAxis);
		}
	}

	@RPC
	// Guest�F���͉ߋ�10�t���[�������z�X�g�ɑ���
	function SendGuestInputRPC (inputFrame : int,
		                        inputBtn : boolean[], inputAxis : Vector3[])
	{
	// 5 + (5+1*80) + (5+12*16) = 287

		var i : int;

		// �Â��t���[���̓��͂̏ꍇ�܂���
		// ���݂�gameFrame�̓��͂��㏑�����Ă��܂��ꍇ�͑���M���Ȃ�
		if (inputBunnyFrame >= inputFrame ||
		    inputFrame - gameFrame >= INPUT_BUFSIZE) {
			return;
		}
		
		// �{�^�����̓o�b�t�@�X�V
		for (i = 0; i < BTN_COUNT * INPUT_BUFSIZE; i++) {
			inputBunnyBtn[i] = inputBtn[i];
		}
		
		// �����̓o�b�t�@�X�V
		for (i = 0; i < INPUT_BUFSIZE; i++) {
			inputBunnyAxis[i] = inputAxis[i];
		}
		
		// ���͎��̃t���[���J�E���g�X�V
		inputBunnyFrame = inputFrame;
	}

	@RPC
	// Host�F���͉ߋ�10�t���[�������Q�X�g�ɑ���
	function SendHostInputRPC (inputFrame : int,
		                       inputBtn : boolean[], inputAxis : Vector3[])
	{
		var i : int;

		// �Â��t���[���̓��͂̏ꍇ�܂���
		// ���݂�gameFrame�̓��͂��㏑�����Ă��܂��ꍇ�͑���M���Ȃ�
		if (inputTigerFrame >= inputFrame ||
		    inputFrame - gameFrame >= INPUT_BUFSIZE) {
			return;
		}
		
		// �{�^�����̓o�b�t�@�X�V
		for (i = 0; i < BTN_COUNT * INPUT_BUFSIZE; i++) {
			inputTigerBtn[i] = inputBtn[i];
		}
		
		// �����̓o�b�t�@�X�V
		for (i = 0; i < INPUT_BUFSIZE; i++) {
			inputTigerAxis[i] = inputAxis[i];
		}
		
		// ���͎��̃t���[���J�E���g�X�V
		inputTigerFrame = inputFrame;
	}



	void Start () {
	
	}
	
	void Update () {
	
	}
}
