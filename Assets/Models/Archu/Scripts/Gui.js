#pragma strict

function Start () {
	animation.CrossFade("Idle");
}

function Update () {

}

function OnGUI () {
	//動作
	if(GUILayout.Button("Idle")){
        animation.CrossFade("Idle");
    }
	if(GUILayout.Button("Idle2")){
        animation.CrossFade("Idle2");
    }
	if(GUILayout.Button("Walk")){
        animation.CrossFade("Walk");
    }
	if(GUILayout.Button("Run")){
        animation.CrossFade("Run");
    }
	if(GUILayout.Button("Jump")){
        animation.CrossFade("Jump");
    }
	if(GUILayout.Button("Attack1")){
        animation.CrossFade("Attack1");
    }
	if(GUILayout.Button("Attack2")){
        animation.CrossFade("Attack2");
    }
	if(GUILayout.Button("Attack3-1")){
        animation.CrossFade("Attack3-1");
    }
	if(GUILayout.Button("Attack3-2")){
        animation.CrossFade("Attack3-2");
    }
	if(GUILayout.Button("Attack3-3")){
        animation.CrossFade("Attack3-3");
    }
	if(GUILayout.Button("Attack4")){
        animation.CrossFade("Attack4");
    }
	if(GUILayout.Button("Wound")){
        animation.CrossFade("Wound");
    }
	if(GUILayout.Button("Stun")){
        animation.CrossFade("Stun");
    }
	if(GUILayout.Button("HitAway")){
        animation.CrossFade("HitAway");
    }
	if(GUILayout.Button("HitAwayUp")){
        animation.CrossFade("HitAwayUp");
    }
	if(GUILayout.Button("Death")){
        animation.CrossFade("Death");
    }
	if(GUILayout.Button("Magic")){
        animation.CrossFade("Magic");
    }
	if(GUILayout.Button("Fire")){
        animation.CrossFade("Fire");
    }
}
