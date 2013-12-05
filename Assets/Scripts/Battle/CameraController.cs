using UnityEngine;
using System.Collections;

public class CameraController : MonoBehaviour {

	private Transform target;

	// ターゲットまでの距離
	private float height = 10f;
	private float distance = 8f;

/*
	private float min = 10f;
	private float max = 60f;

	// Rotation
	private float rotateSpeed = 1f;

	// Zoom
	private float zoomStep = 30f;
	private float zoomSpeed = 5f;

	private float heightWanted = height;
	private float distanceWanted = distance;

	// Result
	private Vector3 zoomResult;
	private Quaternion rotateResult;
	private Vector3 targetPosition;
*/

	private void Start () {
		target = GameObject.FindWithTag("player1").transform;

		transform.position = new Vector3(target.position.x,
		                                 height,
		                                 target.position.z - distance);
		transform.rotation = target.rotation;
	}

	private void LateUpdate () {
		if (!target) {
			return;
		}

		transform.position = new Vector3(target.position.x,
		                                 height,
		                                 target.position.z - distance);
		transform.LookAt(target);
	}
}
