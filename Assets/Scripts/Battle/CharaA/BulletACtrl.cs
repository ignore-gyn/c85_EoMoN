using UnityEngine;
using System.Collections;

public class BulletACtrl : MonoBehaviour {
	
	private float bulletPower = 10.0f;
	private float bulletSpeed = 0.5f;
	
	private float fieldScale;

	private void Start () {
		bulletSpeed = 0.2f;

		fieldScale = Mathf.Pow(GameObject.Find("Ground").transform.localScale.x * 0.5f * 1.0f, 2);
	}

	private void Update () {
		transform.position += transform.forward.normalized * bulletSpeed;

		if (transform.position.sqrMagnitude > fieldScale) {
			Destroy(gameObject);
		}
	}

	private void OnTriggerEnter () {
		
	}
}
