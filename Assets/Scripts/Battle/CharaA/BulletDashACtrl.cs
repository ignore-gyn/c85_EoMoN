using UnityEngine;
using System.Collections;

public class BulletDashACtrl : MonoBehaviour {
	
	private const float bulletPower = 10.0f;
	private const float bulletSpeed = 1.0f;
	
	private float fieldScale;

	private void Start () {
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
