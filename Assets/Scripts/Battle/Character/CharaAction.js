#pragma strict

/********************************************
�L�����̏�Ԃ���A
�L�����̈ړ��A�����]���A�A�j���[�V�����̍Đ���
���䂷��B�܂��A���o�X�N���v�g���Ăяo���B

���ԃp�����[�^�͈ȉ��̂悤�Ɉ����B
 startTime < time <= endTime
 
stateElapsed��1����B
stateElapsed = 0�͎��̏�ԑJ�ڑO�̍ŏI�t���[��
********************************************/


/*** �ړ��\�͒l ***/
private var moveDirection : Vector3;	// �i�s����
private var myLookAt : Quaternion;		// ����

// ���񐫔\�F�ړ������̕␳�\�́i�i�s�������Ȃ��鑬�x�j
// �񓪐��\�F�L�����̌����̕␳�\�́i�G�̕��Ɍ������鑬�x�j

var walkSpeed : float = 0.1;			// 1�t���[���ɕ����ňړ����鋗��
var walkLookAt : float = 0.03;			// �������̉񓪐��\

var dashSpeed : float = 0.33;			// 1�t���[���Ƀ_�b�V���ňړ����鋗��
var dashRot : float = 0.008;			// �_�b�V�����̐��񐫔\


var barrRot : float = 0.06;				// �o���A���̐��񐫔\
var barrMaxDeg : float = 50;			// �o���A�ő����p�x

var dashTime : int = 120;				// �_�b�V���ő厞��
var dashStunTime : int = 45;			// �_�b�V���d������
var dashCancelTime : int = 2;			// �_�b�V���L�����Z������


/*** �U���\�͒l ***/
var walkM_interval : int = 10;			// �ˏo�Ԋu
var walkM_bulletNum : int = 10;			// �ő�e��


var dashM_LookAt : float = 0.01;		// �_�b�V��M���̉񓪐��\
var dashM_interval : int = 10;			// �ˏo�Ԋu
var dashM_bulletNum : int = 5;			// �e��

var closeAtkRange : int = 400;			// �ߐڍU�����������W2��(20*20)
var closeAtkTime_0 : int;
var closeAtkTime_1 : int = 50;			// �ߐڍU��1�i�ڎ���
var closeAtkTime_2 : int = 50;			// �ߐڍU��2�i�ڎ���
var closeAtkTime_3_1 : int = 100;		// �ߐڍU��3-1�i�ڎ���
var closeAtkTime_3_2 : int;				// �ߐڍU��3-2�i�ڎ���


/*** �o���A�I�u�W�F�N�g ***/
var barrPrfb : GameObject;
private var barr : GameObject;

/*** �L�����I�u�W�F�N�g�R���|�[�l���g ***/
private var publicData : PublicData;
private var controller : CharacterController;
private var charaStatus : CharaStatus;

private var charaInput : CharaInput;
private var inputAxis : Vector3;	// �v���C���[�̎�����

private var charaStateCtrl : CharaStateCtrl;
private var state : int;
private var elapsed : int;

private var seCtrl : SECtrl;

var enemy : GameObject;

var myTransform : Transform;
var enemyTransform : Transform;

/*** �t�B�[���h��� ***/
private var field : GameObject;
private var fieldScale : float;		// �t�B�[���h���a��2��


/*** �G�t�F�N�g ***/



/******************************************************************************/

function Awake ()
{
}

function Start ()
{
	// �A�j���[�V�����Đ��ݒ�
	animation["Walk"].speed = 1.0;
	animation["Jump"].speed = 2.0;	// �_�b�V���d��
	
	// �R���|�[�l���g���L���b�V��
	publicData = GameObject.Find("DataKeeper").GetComponent(PublicData);
	seCtrl = GameObject.Find("GameController").GetComponent(SECtrl);
	controller  = GetComponent(CharacterController);
	
	charaStatus = GetComponent(CharaStatus);
	charaStateCtrl = GetComponent(CharaStateCtrl);
	charaInput = GetComponent(CharaInput);
	
	if (gameObject.tag == "Tiger") {
		enemy = GameObject.FindWithTag("Bunny");
	} else {
		enemy = GameObject.FindWithTag("Tiger");
	}
	enemyTransform = enemy.transform;
	myTransform = transform;
	
	// �t�B�[���h�T�C�Y�擾
	field = GameObject.Find("Stage/Field");
	fieldScale = Mathf.Pow(field.transform.localScale.x * 0.5 * 0.9, 2);
}

function Update ()
{
}

function UpdateCharaAction (gameFrame : int)
{
	if (gameFrame <= 0) return;
	
	// ���݂�state���擾
	charaStateCtrl.CheckState(gameFrame);
	state = charaStateCtrl.GetState();
	elapsed = charaStateCtrl.GetElapsed();
	
	// �����͂��擾
	inputAxis = charaInput.inputAxis;
	
	// state�ʂ̏���
	if      (state == CharaState.WALK)   Walk();
	else if (state == CharaState.DASH)   Dash();
	else if (state == CharaState.BARR)   Barr();
	
	//else if (state == CharaState.STUN)   Stun();
	//else if (state == CharaState.DOWN)   Down();
	
	else if (state == CharaState.WALK_M) Walk_M();
	//else if (state == CharaState.WALK_S) Walk_S();
	
	else if (state == CharaState.DASH_M) Dash_M();
	//else if (state == CharaState.DASH_S) Dash_S();
	
	//else if (state == CharaState.BARR_M) Barr_M();
	//else if (state == CharaState.BARR_S) Barr_S();
	
	//else if (state == CharaState.CLOSEATK_0) CloseAtk_0();
	else if (state == CharaState.CLOSEATK_1) CloseAtk_1();
	else if (state == CharaState.CLOSEATK_2) CloseAtk_2();
	else if (state == CharaState.CLOSEATK_3_1) CloseAtk_3_1();
	//else if (state == CharaState.CLOSEATK_3_2) CloseAtk_3_2();
	
	// ���G��ԏ���
	if (charaStateCtrl.isGod > 0) God();
}

/***********************************************************
// �G�܂ł̉�]�p�̎Z�o
myLookAt = Quaternion.LookRotation(enemyTransform.position - myTransform.position);

// �G�̕�������������
myTransform.LookAt(enemyTransform);

// �i�s����(moveDirection)����������
// myTransform.eulerAngles = moveDirection; �Ȃ��������܂������Ȃ�??
myTransform.rotation = Quaternion.LookRotation(moveDirection);
************************************************************/


/***********************************************************
	�����E����
************************************************************/

// ������
function Walk ()
{
	if (inputAxis.magnitude == 0) {
		animation.CrossFade("Idle", 0.1);
		//animation["Idle"].wrapMode = WrapMode.Loop;
	
	} else {
		animation.CrossFade("Walk", 0.1);
		// �ړ�
		moveDirection = inputAxis.normalized;
		MoveOnField(moveDirection * walkSpeed);
	}
	
	// ��
	myLookAt = Quaternion.LookRotation(enemyTransform.position -
	                                   myTransform.position);
	myTransform.rotation = Quaternion.Slerp(myTransform.rotation,
	                                        myLookAt,
	                                        walkLookAt);
}

function Walk_M ()
{
	// �A�ˊԊu 10, �e�� 10
	if (elapsed > walkM_interval * walkM_bulletNum + 2) {
		Debug.Log("Walk_M[Assert] : Over Heat");
	
	} else if (elapsed % walkM_interval == 1) {
		audio.PlayOneShot(seCtrl.fireSE);
		GetComponent(CharaAShotMaker).makeBulletA();
	}
	
	Walk();
}


/***********************************************************
	�_�b�V��

�_�b�V���L�����Z������ : -dashCancelTime <= time <= 0
�_�b�V���ړ��ő厞�� : 0 < time <= dashTime
�_�b�V���d������ : dashTime < time <= dashTime + dashStunTime
************************************************************/

function Dash () {
	
	// �_�b�V���L�����Z��
	if (elapsed == -dashCancelTime) {
		animation.CrossFade("Idle", 1);
	
		myTransform.LookAt(enemyTransform);
		return;
	
	} else if (elapsed <= 0) {
		animation.CrossFade("Idle", 1);
		return;
		
	// �_�b�V���d���I��
	} else if (elapsed == dashTime + dashStunTime) {
		myTransform.LookAt(enemyTransform);
		return;
		
	// �_�b�V���d��
	} else if (elapsed > dashTime) {
		effectDashStun();
		return;
	
	// �_�b�V���J�n
	} else if (elapsed == 1) {
		audio.PlayOneShot(seCtrl.dashSE);
		moveDirection = inputAxis.normalized;
	
	// �_�b�V����
	} else {
		// �_�b�V���^�[��
		if (charaInput.inputAccum[Btn.A] == 1) {
			moveDirection = inputAxis.normalized;
		
		// ����
		} else {
			moveDirection = (moveDirection + inputAxis * dashRot).normalized;
		}
	}
	
	// �ړ�
	animation.CrossFade("Run", 0.1);
	myTransform.rotation = Quaternion.LookRotation(moveDirection);
	MoveOnField(moveDirection * dashSpeed);
}

// �_�b�V���d�����o
function effectDashStun () {
	// �d���J�n
	if (elapsed == dashTime+1) {
		animation.CrossFade("Jump", 0);
	
	// �d����
	} else {
		// ���o�Ƃ��ĉ�]����
		myTransform.eulerAngles += Vector3(0, 0.02*(dashTime + dashStunTime - elapsed)*(dashTime + dashStunTime - elapsed), 0);
	}
}

// �_�b�V��M�U��
function Dash_M ()
{
	if (elapsed > dashM_interval * dashM_bulletNum + 2) {
		Debug.Log("Dash_M[Assert] : Over Heat");
	
	} else if (elapsed % dashM_interval == 1) {
		audio.PlayOneShot(seCtrl.fireSE);
		GetComponent(CharaAShotMaker).makeBulletB();
	}
	
	// �ړ�
	animation.CrossFade("Run", 0.1);
	
	// ��
	myLookAt = Quaternion.LookRotation(enemyTransform.position -
	                                   myTransform.position);
	myTransform.rotation = Quaternion.Slerp(myTransform.rotation,
	                                        myLookAt,
	                                        dashM_LookAt);
	//moveDirection : Dash()��������p��
	MoveOnField(moveDirection * dashSpeed);
}

/***********************************************************
	�o���A
************************************************************/

// �o���A�W�J
function makeBarr () {
	if (barr != null) return;
	barr = Instantiate(barrPrfb,
                          Vector3(myTransform.position.x, 2.5, myTransform.position.z),
                          myTransform.rotation);
    barr.transform.parent = myTransform;
}

// �o���A����
function Barr () {
	
	if (elapsed == 1) {
		makeBarr();
		return;
	}
	
	myLookAt = Quaternion.LookRotation(enemyTransform.position - myTransform.position);
	if (inputAxis.magnitude == 0) {
		// �o���A���̉񓪐��\ = �������̉񓪐��\
		myTransform.rotation = Quaternion.Slerp(myTransform.rotation,
	                                            myLookAt,
	                                            walkLookAt);
	} else {
		// ����(���̏�Ō�����ς���)
		myLookAt *= Quaternion.AngleAxis(inputAxis.x * barrMaxDeg, Vector3.up);
		myTransform.rotation = Quaternion.Slerp(myTransform.rotation,
		                                        myLookAt,
		                                        barrRot);
	}
}

/***********************************************************
	�ߐڍU��

�_�b�V���L�����Z������ : -dashCancelTime <= time <= 0
�_�b�V���ړ��ő厞�� : 0 < time <= dashTime
�_�b�V���d������ : dashTime < time <= dashTime + dashStunTime
************************************************************/
function CloseAtk_0 ()
{
	
}

function CloseAtk_1 ()
{
	if (elapsed == 1) {
		animation["Attack3-1"].speed = 1.2;
		//animation.wrapMode = WrapMode.ClampForever;
		animation.Play("Attack3-1");
	}
}

function CloseAtk_2 ()
{
	if (elapsed == 1) {
		// �ړ�
		//moveDirection = inputAxis.normalized;
		MoveOnField(moveDirection * 3);
		
		animation["Attack3-2"].speed = 1.2;
		animation.Play("Attack3-2");
	}
}

function CloseAtk_3_1 ()
{
	if (elapsed == 1) {
		animation.Play("Attack2");
	}
}

function CloseAtk_3_2 ()
{
	
}


/*------------------------------------------------------------------------------
�֐���	: God ()
����	: ���G���(isGod > 0)�̎��A�L������_�ł�����
����	: �Ȃ�
�߂�l	: �Ȃ�
------------------------------------------------------------------------------*/
function God ()
{
	var isGod : int = charaStateCtrl.isGod;
	
	if (isGod <= 0) {
		Debug.LogError("God : isGod = " + isGod);
		return;
	}
	
	// 2�t���[���Ԋu�_��
	// isGod = 1 �̎��� gameObject.renderer.enabled = true �ɂ��邱�Ƃɒ���
	if (isGod % 3 <= 1) {
		gameObject.renderer.enabled = true;
	} else {
		gameObject.renderer.enabled = false;
	}
}

/***********************************************************
	�ړ��\����
************************************************************/

// �ړ��悪�t�B�[���h���Ȃ�ړ�����
function MoveOnField (dest : Vector3) {
	if ((myTransform.position + dest).sqrMagnitude < fieldScale) {
		//myTransform.position += dest;
		controller.Move(dest);
	}
}

